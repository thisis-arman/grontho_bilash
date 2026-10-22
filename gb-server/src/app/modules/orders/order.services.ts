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
import { sendEmailAboutOrderDetailtoSystemAdmin } from './order.utils';
import { USER_ROLE } from '../user/user.interface';
import { randomUUID } from 'crypto';
import { quoteCart, REQUIRE_ADVANCE_DELIVERY_CHARGE, SHIPPING_RATES } from './order.quote';
import { sendOrderConfirmationToBuyer } from './order.utils';
import { notifyOrderStatus } from '../../utils/whatsapp';
import { isAdminRole } from '../../middlewares/auth';

type TRequester = { id?: string; email?: string; role?: string };

const SAFE_USER_FIELDS = "name email contactNo";



// The shape of ONE cart line item as it arrives over HTTP — every
// id is a plain string here (ObjectIds don't exist on the wire).
// This is inferred straight from the zod schema so the two can
// never drift out of sync with each other.
type CheckoutBookItem = z.infer<
  typeof orderValidations.createOrderSchema
>["books"][number];

// A line item after it has been re-read from the database.
type TrustedLineItem = {
  book: string;
  bookTitle: string;
  productImage: string;
  seller: string;
  price: number;
  quantity: number;
};

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

// Rates and the advance-payment rule live in order.quote.ts so the bag
// page's quote and the real order always agree.

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
  buyerId: string,
  session: mongoose.ClientSession
): Promise<TrustedLineItem> => {
  const product = await ProductModel.findById(item.book).session(session);
  if (!product) {
    throw new AppError(404, "A product in your cart no longer exists");
  }
  if (product.isDeleted || !product.isPublished) {
    throw new AppError(400, `"${product.title}" is no longer available`);
  }
  if (String(product.seller) === String(buyerId)) {
    throw new AppError(400, `You cannot order your own listing "${product.title}"`);
  }

  // Everything that affects money or routing comes from the database,
  // never from the cart the browser sent.
  const lineItem: TrustedLineItem = {
    book: String(product._id),
    bookTitle: product.title,
    productImage: product.images[0],
    seller: String(product.seller),
    price: product.price.basePrice,
    quantity: item.quantity,
  };

  if (product.productType === "Digital") {
    // No stock to reserve, and one copy per buyer is all that makes sense.
    return { ...lineItem, quantity: 1 };
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
    throw new AppError(400, `"${product.title}" does not have enough stock left`);
  }

  if (updated.inventory.quantity === 0) {
    updated.stockStatus = "Out of Stock";
    await updated.save({ session });
  }

  return lineItem;
}

// Puts a cancelled order's copies back on the shelf.
const restockOrderItems = async (
  order: Pick<TOrder, "books">,
  session?: mongoose.ClientSession
) => {
  for (const item of order.books) {
    await ProductModel.updateOne(
      { _id: item.book, productType: "Physical" },
      [
        {
          $set: {
            "inventory.quantity": { $add: ["$inventory.quantity", item.quantity] },
            "inventory.soldCount": {
              $max: [0, { $subtract: ["$inventory.soldCount", item.quantity] }],
            },
            stockStatus: {
              $cond: [{ $eq: ["$stockStatus", "Out of Stock"] }, "In Stock", "$stockStatus"],
            },
          },
        },
      ],
      { session }
    );
  }
};

const ACTIVE_ORDER_STATUSES = ["pending", "confirmed"];
// ─────────────────────────────────────────────────────────────
// Group cart items by seller. Map key is the seller's ObjectId
// as a string (Mongo ObjectIds aren't directly usable as Map
// keys by reference equality, so we key on the string form).
// ─────────────────────────────────────────────────────────────

const groupBooksBySeller = (
  books: TrustedLineItem[]
): Map<string, TrustedLineItem[]> => {
  const groups = new Map<string, TrustedLineItem[]>();
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

const createOrder = async (
  payload: CheckoutPayload,
  requester: TRequester
): Promise<TOrder[]> => {
  const buyerId = String(requester.id);
  const shippingRate = SHIPPING_RATES[payload.shippingArea];

  // The same product may appear on several cart lines; merge them so stock
  // is checked against the real total.
  const mergedCart = new Map<string, CheckoutBookItem>();
  for (const item of payload.books) {
    const existing = mergedCart.get(item.book);
    if (existing) existing.quantity += item.quantity;
    else mergedCart.set(item.book, { ...item });
  }

  // Payment rules that depend on what is being shipped.
  const products = await ProductModel.find(
    { _id: { $in: [...mergedCart.keys()].filter((id) => Types.ObjectId.isValid(id)) } },
    { productType: 1 }
  );
  const hasPhysical = products.some((p) => p.productType === "Physical");
  if (payload.paymentMethod === "cod" && !hasPhysical) {
    throw new AppError(httpStatus.BAD_REQUEST, "Digital items have no delivery, so please pay by bKash.");
  }
  if (payload.paymentMethod === "cod" && REQUIRE_ADVANCE_DELIVERY_CHARGE && !payload.transactionId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Send the delivery charge by bKash first and enter its transaction ID."
    );
  }
  // One bKash payment can only confirm one checkout.
  if (
    payload.transactionId &&
    (await OrderModel.exists({ transactionId: payload.transactionId, orderStatus: { $ne: "cancelled" } }))
  ) {
    throw new AppError(
      httpStatus.CONFLICT,
      "This bKash transaction ID has already been used for another order."
    );
  }

  const checkoutId = randomUUID();
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Reserve stock for EVERY line item across ALL seller groups
    //    first. If any single item fails, the whole transaction
    //    aborts before any order document is created — so a cart
    //    with 3 sellers where only the 3rd is out of stock never
    //    creates orders 1 and 2 either.
    const trustedItems: TrustedLineItem[] = [];
    for (const item of mergedCart.values()) {
      trustedItems.push(await decrementStockForItem(item, buyerId, session));
    }
    const sellerGroups = groupBooksBySeller(trustedItems);

    const digitalIds = new Set(
      (
        await ProductModel.find(
          { _id: { $in: trustedItems.map((i) => i.book) }, productType: "Digital" },
          { _id: 1 }
        ).session(session)
      ).map((doc) => String(doc._id))
    );

    // 2. Build and validate one order document per seller group.
    const createdOrders: TOrder[] = [];

    for (const [, items] of sellerGroups) {
      const lineItemsTotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      // Digital-only parcels have nothing to ship.
      const shippingCost = items.every((i) => digitalIds.has(i.book))
        ? 0
        : shippingRate;
      const totalAmount = lineItemsTotal + shippingCost;

      const orderId = await generateOrderId(session);

      // Validate the string-shaped order doc first — zod's schema
      // expects string ids, matching how the data exists at this
      // point (still derived from the original HTTP payload).
      const orderDocForValidation = {
        orderId,
        checkoutId,
        books: items,
        buyer: buyerId,
        recipientName: payload.recipientName,
        phoneNumber: payload.phoneNumber,
        email: payload.email,
        deliveryAddress: payload.deliveryAddress,
        shippingArea: payload.shippingArea,
        shippingCost,
        totalAmount,
        paymentMethod: payload.paymentMethod,
        transactionId: payload.transactionId ?? "N/A",
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
    const inserted = await OrderModel.create(createdOrders, {
      session,
      ordered: true,
    });

    await session.commitTransaction();

    // Notification is best-effort: the order is already committed, so a mail
    // problem must not turn a successful checkout into an error (which would
    // also hit abortTransaction on an already-committed session).
    try {
      const allAdmins = await User.find({
        role: { $in: [USER_ROLE.admin, USER_ROLE.superAdmin] },
        isDeleted: false,
      });
      const adminEmails = allAdmins.map((admin) => admin.email);

      if (adminEmails.length) {
        for (const order of createdOrders) {
          await sendEmailAboutOrderDetailtoSystemAdmin(adminEmails, order);
        }
      }
      await sendOrderConfirmationToBuyer(payload.email, createdOrders);
    } catch (mailError) {
      console.error("Order notification failed:", mailError);
    }
    // WhatsApp "order received" (only when the WhatsApp API is configured).
    await Promise.allSettled(createdOrders.map((order) => notifyOrderStatus(order)));


    // Optional: trigger SMS/email here — once per resulting order,
    // since each is a distinct shipment the buyer needs separate
    // confirmation for. Always AFTER commitTransaction.

    return inserted;
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};



// Loads an order and checks the requester may see it: the buyer, a seller
// with a book in it, or an admin.
const getAccessibleOrder = async (orderId: string, requester: TRequester) => {
  if (!Types.ObjectId.isValid(orderId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid order ID");
  }

  const order = await OrderModel.findOne({ _id: orderId, isDeleted: false });
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const isBuyer = String(order.buyer) === String(requester.id);
  const isSeller = order.books.some(
    (item) => String(item.seller) === String(requester.id)
  );
  if (!isBuyer && !isSeller && !isAdminRole(requester.role)) {
    throw new AppError(httpStatus.FORBIDDEN, "You cannot access this order");
  }

  return { order, isBuyer };
};

// Service to get an order by ID
const getOrderById = async (orderId: string, requester: TRequester) => {
  const { order } = await getAccessibleOrder(orderId, requester);
  await order.populate("buyer", SAFE_USER_FIELDS);
  await order.populate("books.book", "title slug images price productType");
  return order;
};

const getOrdersFromDB = async () => {
  const orders = await OrderModel.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "buyer",
        foreignField: "_id",
        // $lookup returns raw documents, so strip everything but the
        // contact fields here (password hashes must never be sent).
        pipeline: [{ $project: { name: 1, email: 1, contactNo: 1 } }],
        as: "bought_by",
      },
    },
  ]);
  return orders;
};

// Update an order by ID
const updateOrderById = async (
  orderId: string,
  updateData: Partial<TOrder>,
  requester: TRequester
) => {
  const { order, isBuyer } = await getAccessibleOrder(orderId, requester);
  const isAdmin = isAdminRole(requester.role);

  const validatedData = orderValidations.updateOrderSchema.parse(updateData);

  if (!isAdmin) {
    if (!isBuyer) {
      throw new AppError(httpStatus.FORBIDDEN, "You cannot change this order");
    }
    if (order.orderStatus !== "pending" || order.paymentStatus === "paid") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This order can no longer be changed. Please contact support."
      );
    }
    // A buyer may fix delivery details or cancel; nothing else.
    if (
      validatedData.paymentStatus !== undefined ||
      (validatedData.orderStatus !== undefined &&
        validatedData.orderStatus !== "cancelled")
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to change the order or payment status"
      );
    }
  }

  const isCancelling =
    validatedData.orderStatus === "cancelled" &&
    order.orderStatus !== "cancelled";
  const isReopening =
    order.orderStatus === "cancelled" &&
    validatedData.orderStatus !== undefined &&
    validatedData.orderStatus !== "cancelled";
  if (isReopening) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A cancelled order cannot be reopened. Please place a new order."
    );
  }

  const updatedOrder = await OrderModel.findByIdAndUpdate(
    orderId,
    validatedData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (isCancelling) {
    await restockOrderItems(order);
  }

  // Tell the buyer on WhatsApp when the status actually changed.
  if (updatedOrder && validatedData.orderStatus && validatedData.orderStatus !== order.orderStatus) {
    await notifyOrderStatus(updatedOrder);
  }

  return updatedOrder;
};

// "Deleting" an order cancels it. A buyer can cancel their own order while
// it is still pending; an admin can remove any order from the list.
const deleteOrderById = async (orderId: string, requester: TRequester) => {
  const { order, isBuyer } = await getAccessibleOrder(orderId, requester);
  const isAdmin = isAdminRole(requester.role);

  if (!isAdmin) {
    if (!isBuyer) {
      throw new AppError(httpStatus.FORBIDDEN, "You cannot cancel this order");
    }
    if (order.orderStatus !== "pending" || order.paymentStatus === "paid") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This order can no longer be cancelled. Please contact support."
      );
    }
  }

  const wasActive = ACTIVE_ORDER_STATUSES.includes(order.orderStatus);

  const deletedOrder = await OrderModel.findByIdAndUpdate(
    orderId,
    {
      ...(wasActive ? { orderStatus: "cancelled" } : {}),
      // Admin removal hides the order; a buyer's cancellation stays visible
      // to both sides as "cancelled".
      ...(isAdmin ? { isDeleted: true } : {}),
    },
    { new: true }
  );

  if (wasActive) {
    await restockOrderItems(order);
  }

  return deletedOrder;
};

const getOrdersByUserId = async (userId: string, requester: TRequester) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid user ID");
  }

  if (String(userId) !== String(requester.id) && !isAdminRole(requester.role)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only view your own orders"
    );
  }

  const orders = await OrderModel.find({ buyer: userId, isDeleted: false })
    .sort({ createdAt: -1 })
    .populate("buyer", SAFE_USER_FIELDS)
    .populate("books.book");

  return orders;
};

// Orders that contain the seller's listings. Only that seller's own line
// items are returned, and no buyer contact details: delivery is handled by
// the platform, so a seller does not need them.
const getSalesBySeller = async (sellerId: string) => {
  const orders = await OrderModel.find({
    "books.seller": sellerId,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .lean<(TOrder & { _id: Types.ObjectId; createdAt: Date })[]>();

  return orders.map((order) => {
    const items = order.books.filter(
      (item) => String(item.seller) === String(sellerId)
    );
    return {
      _id: order._id,
      orderId: order.orderId,
      createdAt: order.createdAt,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      items,
      itemsTotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };
  });
};

const getQuote = (payload: z.infer<typeof orderValidations.quoteSchema>, buyerId?: string) =>
  quoteCart(payload.books, payload.shippingArea, buyerId);

export const orderServices = {
  getQuote,
  getSalesBySeller,
  createOrder,
  getOrderById,
  updateOrderById,
  deleteOrderById,
  getOrdersFromDB,
  getOrdersByUserId,
};
