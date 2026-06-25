import { ObjectId } from 'mongodb';
import { OrderCounterModel, OrderModel } from "./order.model";
import mongoose, { Mongoose, Types } from "mongoose";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { ShippingArea, TOrder } from "./order.interface";
import { orderValidations } from "./order.validation";
import { User } from "../user/user.model";
import { z } from 'zod';
import { ProductModel } from '../book/product.model';



// The shape of ONE cart line item as it arrives over HTTP — every
// id is a plain string here (ObjectIds don't exist on the wire).
// This is inferred straight from the zod schema so the two can
// never drift out of sync with each other.
type CheckoutBookItem = z.infer<
  typeof orderValidations.createOrderSchema
>["books"][number];

// ─────────────────────────────────────────────────────────────
// Shipping rate table.
//
// The frontend currently sends one shippingCost for the whole
// cart, computed from a single shippingArea. That only produces
// a correct charge when every item in the cart ships from the
// same seller. Since carts can mix sellers, and each seller's
// books ship as a separate physical parcel from a separate
// location, shipping must be charged ONCE PER SELLER-GROUP, not
// once per cart. The client's shippingCost is therefore ignored
// here entirely — only shippingArea (which describes the buyer's
// delivery destination, not the seller's origin) is taken from
// the request; the actual cost is computed per group below.
//
// Update these to match your real rates if they differ.
// ─────────────────────────────────────────────────────────────

const SHIPPING_RATES: Record<ShippingArea, number> = {
  inside: 70,
  outside: 130,
};

// ─────────────────────────────────────────────────────────────
// Raw checkout payload shape (validated by createOrderSchema in
// the controller before this function is ever called).
// ─────────────────────────────────────────────────────────────

// Raw checkout payload shape (validated by createOrderSchema in
// the controller before this function is ever called) — inferred
// directly from the zod schema, see CheckoutBookItem above.
type CheckoutPayload = z.infer<typeof orderValidations.createOrderSchema>;

// ─────────────────────────────────────────────────────────────
// Order ID generation — atomic, race-free (unchanged approach
// from before; still required regardless of order shape).
// ─────────────────────────────────────────────────────────────

const generateOrderId = async (
  session: mongoose.ClientSession
): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const periodKey = `${year}${month}`;

  const counter = await OrderCounterModel.findOneAndUpdate(
    { _id: periodKey },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );

  const sequence = String(counter.seq).padStart(4, "0");
  return `ORD${periodKey}${sequence}`;

};

// ─────────────────────────────────────────────────────────────
// Stock decrement for a single line item — atomic, oversell-safe.
// Same guard as before: the filter and the decrement happen as
// one DB operation, so concurrent buyers can never both succeed
// for the last copy.
// ─────────────────────────────────────────────────────────────

const decrementStockForItem = async (
  item: CheckoutBookItem,
  session: mongoose.ClientSession
) => {
  const product = await ProductModel.findById(item.book).session(session);
  if (!product) {
    throw new AppError(404, `Product "${item.bookTitle}" no longer exists`);
  }
  if (product.isDeleted || !product.isPublished) {
    throw new AppError(400, `"${item.bookTitle}" is no longer available`);
  }
  if (product.productType === "Digital") {
    return; // not quantity-limited
  }


  const updated = await ProductModel.findOneAndUpdate(
    {
      _id: item.book,
      "inventory.quantity": { $gte: item.quantity },
    },
    {
      $inc: {
        "inventory.quantity": -item.quantity,
        "inventory.soldCount": item.quantity,
      },
    },
    { new: true, session }
  );

  if (!updated) {
    throw new Error("Insufficient stock");
  }

  if (updated.inventory.quantity === 0) {
    updated.stockStatus = "Out of Stock";
    await updated.save({ session });
  }
}
  // ─────────────────────────────────────────────────────────────
  // Group cart items by seller. Map key is the seller's ObjectId
  // as a string (Mongo ObjectIds aren't directly usable as Map
  // keys by reference equality, so we key on the string form).
  // ─────────────────────────────────────────────────────────────

  const groupBooksBySeller = (
    books: CheckoutBookItem[]
  ): Map<string, CheckoutBookItem[]> => {
    const groups = new Map<string, CheckoutBookItem[]>();
    for (const item of books) {
      const sellerKey = item.seller.toString();
      const existing = groups.get(sellerKey);
      if (existing) {
        existing.push(item);
      } else {
        groups.set(sellerKey, [item]);
      }
    }
    return groups;
  };

  // ─────────────────────────────────────────────────────────────
  // Create Order(s)
  //
  // A single checkout can produce MULTIPLE Order documents — one
  // per seller in the cart — because each seller's books ship as a
  // separate parcel with its own shipping cost. All resulting
  // orders are created inside ONE transaction: if any seller's
  // stock can't cover the requested quantity, the ENTIRE checkout
  // fails and rolls back, per your requirement (no partial orders,
  // no silently dropped items).
  //
  // REQUIRES a replica set / MongoDB Atlas connection for
  // transactions — see the note at the bottom of this file if
  // you're on standalone Mongo.
  // ─────────────────────────────────────────────────────────────

  const createOrder = async (payload: CheckoutPayload): Promise<TOrder[]> => {
    const sellerGroups = groupBooksBySeller(payload.books);
    const shippingRate = SHIPPING_RATES[payload.shippingArea];

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // 1. Reserve stock for EVERY line item across ALL seller groups
      //    first. If any single item fails, the whole transaction
      //    aborts before any order document is created — so a cart
      //    with 3 sellers where only the 3rd is out of stock never
      //    creates orders 1 and 2 either.
      for (const [, items] of sellerGroups) {
        for (const item of items) {
          await decrementStockForItem(item, session);
        }
      }

      // 2. Build and validate one order document per seller group.
      const createdOrders: TOrder[] = [];

      for (const [, items] of sellerGroups) {
        const lineItemsTotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const shippingCost = shippingRate;
        const totalAmount = lineItemsTotal + shippingCost;

        const orderId = await generateOrderId(session);

        // Validate the string-shaped order doc first — zod's schema
        // expects string ids, matching how the data exists at this
        // point (still derived from the original HTTP payload).
        const orderDocForValidation = {
          orderId,
          books: items,
          buyer: payload.buyer,
          phoneNumber: payload.phoneNumber,
          email: payload.email,
          deliveryAddress: payload.deliveryAddress,
          shippingArea: payload.shippingArea,
          shippingCost,
          totalAmount,
          paymentMethod: payload.paymentMethod,
          transactionId:
            payload.paymentMethod === "bkash" ? payload.transactionId! : "N/A",
          comment: payload.comment,
        };
        const validated = orderValidations.internalOrderDocumentSchema.parse(
          orderDocForValidation
        );

        // Only AFTER validation passes do we convert string ids into
        // real Types.ObjectId instances for the Mongoose insert below.
        const mongooseReadyOrder = {
          ...validated,
          books: validated.books.map((item) => ({
            ...item,
            book: new Types.ObjectId(item.book),
            seller: new Types.ObjectId(item.seller),
          })),
          buyer: new Types.ObjectId(validated.buyer),
        };
        createdOrders.push(mongooseReadyOrder as unknown as TOrder);
      }

      // 3. Insert all orders together in this transaction.
      const inserted = await OrderModel.create(createdOrders, { session });

      await session.commitTransaction();

      // Optional: trigger SMS/email here — once per resulting order,
      // since each is a distinct shipment the buyer needs separate
      // confirmation for. Always AFTER commitTransaction.

      return inserted;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  };



  // Service to get an order by ID
  const getOrderById = async (orderId: string) => {
    console.log("order id", { orderId });
    if (!Types.ObjectId.isValid(orderId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid order ID");
    }

    const order = await OrderModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(orderId) } },
      {
        $lookup: {
          from: "products",
          let: { bookIds: "$books.book" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$bookIds"] } } },
            { $project: { title: 1, price: 1, _id: 1, productType: 1, digitalDetails: 1 } }
          ],
          as: "book_details"
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "books.book",
          foreignField: "_id",
          as: "product_details",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "buyer",
          foreignField: "_id",
          as: "bought_by",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "seller",
          foreignField: "_id",
          as: "sold_by",
        },
      },
    ]);

    if (!order) {
      throw new AppError(httpStatus.NOT_FOUND, "Order not found");
    }

    return order;
  };

  const getOrdersFromDB = async () => {
    const orders = await OrderModel.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "buyer",
          foreignField: "_id",
          as: "bought_by",
        },
      },
    ]);
    return orders;
  };

  // Update an order by ID
  const updateOrderById = async (
    orderId: string,
    updateData: Partial<TOrder>
  ) => {

    console.log({ orderId, updateData });
    if (!Types.ObjectId.isValid(orderId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid order ID");
    }

    const validatedData = orderValidations.updateOrderSchema.parse(updateData);

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      validatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedOrder) {
      throw new AppError(httpStatus.NOT_FOUND, "Order not found");
    }

    return updatedOrder;
  };

  // Service to delete an order by ID
  const deleteOrderById = async (orderId: string) => {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid order ID");
    }

    const deletedOrder = await OrderModel.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      throw new AppError(httpStatus.NOT_FOUND, "Order not found");
    }

    return deletedOrder;
  };

  const getOrdersByUserId = async (userId: string) => {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid user ID");
    }

    const isValid = await User.findOne({ _id: userId });
    if (!isValid) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const orders = await OrderModel.find({ buyer: userId }).populate("buyer").populate("books.book");

    return orders;
  };

  export const orderServices = {
    createOrder,
    getOrderById,
    updateOrderById,
    deleteOrderById,
    getOrdersFromDB,
    getOrdersByUserId,
  };
