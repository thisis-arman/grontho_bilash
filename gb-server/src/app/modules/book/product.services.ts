import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { TBook } from "./book.interface";
import { BookModel } from "./book.model";
import { Document, Types } from "mongoose";
import { isAdminRole } from "../../middlewares/auth";
import { ObjectId } from "mongodb";
import { ProductModel } from "./product.model";
import slugify from "slugify";
import { IProduct } from "./product.interface";
import { buildTextFilter } from "../../utils/searchText";
import { alertService } from "../alerts/alert.service";
import { PRODUCT_SEARCH_FIELDS } from "../search/search.service";
import { prepareDigitalDetails } from "../../utils/digitalFile";

export interface ProductQuery {
  page?: number | string;
  limit?: number | string;
  productType?: "Physical" | "Digital";
  category?: string;
  condition?: string;
  sortBy?: "createdAt" | "price" | "viewCount" | "title";
  sortOrder?: "asc" | "desc";
  search?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
}

type TRequester = { id?: string; email?: string; role?: string };

// Loads a product and makes sure the requester owns it (or is an admin).
const getOwnedProduct = async (productId: string, requester: TRequester) => {
  if (!Types.ObjectId.isValid(productId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid product ID");
  }
  const product = await ProductModel.findOne({
    _id: productId,
    isDeleted: false,
  });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }
  if (
    !isAdminRole(requester.role) &&
    String(product.seller) !== String(requester.id)
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only manage your own listings"
    );
  }
  return product;
};

const createProductIntoDB = async (payload: IProduct) => {
  if (!payload.title || !payload.productType || !payload.category) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Title, product type and category are required"
    );
  }

  // 1. Different sellers routinely list the same textbook, so only block a
  //    seller from double-posting their own active listing.
  const isProductExist = await ProductModel.findOne({
    title: payload.title,
    seller: payload.seller,
    isDeleted: false,
  });
  if (isProductExist) {
    throw new AppError(httpStatus.CONFLICT, "You have already listed a product with this title!");
  }

  // 2. Generate SEO-friendly Slug
  // Example: "Introduction to Algorithms" -> "introduction-to-algorithms-1710245"
  const baseSlug = slugify(payload.title, { lower: true, strict: true });
  payload.slug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;

  // 3. Generate Professional SKU
  // Example: GB-PHYS-BOOKS-8832
  const shortType = payload.productType.substring(0, 1).toUpperCase();
  const shortCat = payload.category.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  payload.sku = `GB-${shortType}${shortCat}-${randomNum}`;

  // 4. Data Consistency Logic
  if (payload.productType === 'Digital') {
    payload.fulfillmentOptions = {
      allowPickup: false,
      allowShipping: false,
      isDigitalDelivery: true,
    };
    payload.condition = "Digital Content";
    payload.digitalDetails = await prepareDigitalDetails(payload.digitalDetails, String(payload.seller));
  } else {
    delete payload.digitalDetails;
  }

  // 5. Create Product
  const result = await ProductModel.create(payload);

  // 6. Tell students who asked to be notified about this book.
  await alertService.notifyForListing(result);
  return result;
};

const listABookIntoDb = async (bookInfo: TBook): Promise<Document> => {
  //console.log(bookInfo);
  // find the recent documents
  const findLatestProduct = async () => {
    const latestProduct = await BookModel.aggregate([
      { $project: { bookId: 1 } },
    ])
      .sort({ bookId: -1 })
      .limit(1)
      .exec();
    return latestProduct;
  };
  const generateProductId = async () => {
    const latestProduct = await findLatestProduct();
    // //console.log(latestProduct[0]["bookId"]);
    const recentProductId = latestProduct[0]["bookId"];
    const newProductId = recentProductId.substring(4);
    let productId = `book${parseInt(newProductId) + 1}`;
    return productId;
  };
  const bookId = await generateProductId();
  //console.log({ bookId });
  // Log the bookId and other book information
  // //console.log({ bookId, ...bookInfo });

  // Create and save the new book record
  const book = await BookModel.create({ bookId, ...bookInfo });

  return book;
};

// Service to get a specific book by its ID
const getBookFromDb = async (_id: string): Promise<Document | null> => {
  const book = await BookModel.findById({ _id });
  if (!book) {
    throw new Error("Book not found");
  }
  return book;
};




// Maps public/API field names -> actual Mongo document paths.
// Extend this if you add more sortable fields — never interpolate
// req.query.sortBy directly into the sort object.
const SORT_FIELD_MAP: Record<string, string> = {
  createdAt: "createdAt",
  price: "price.basePrice",
  viewCount: "viewCount",
  title: "title",
};

const MAX_LIMIT = 48;
const DEFAULT_LIMIT = 12;

const getAllProductsFromDb = async (query: ProductQuery) => {
  const {
    page = 1,
    limit = DEFAULT_LIMIT,
    productType,
    category,
    condition,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
    minPrice,
    maxPrice,
  } = query;

  const filter: Record<string, unknown> = {
    isDeleted: false,
    isPublished: true,
    stockStatus: { $ne: "Out of Stock" },
  };

  if (productType) filter.productType = productType;
  if (category) filter.category = String(category);
  if (condition) filter.condition = String(condition);

  if (minPrice || maxPrice) {
    filter["price.basePrice"] = {
      ...(minPrice ? { $gte: Number(minPrice) } : {}),
      ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
    };
  }

  // Partial, case-insensitive matching ("acc" finds "Accounting"), which a
  // $text index cannot do. Input is escaped so it is never run as a regex.
  // Every word, in any order, with Bangla/English equivalents
  // (utils/searchText.ts) — the same matching as the search suggestions.
  const textFilter = buildTextFilter(search, PRODUCT_SEARCH_FIELDS);
  if (textFilter) Object.assign(filter, textFilter);

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, Number(limit) || DEFAULT_LIMIT));
  const skip = (pageNum - 1) * limitNum;

  const sortField = SORT_FIELD_MAP[sortBy as string] ?? SORT_FIELD_MAP.createdAt;
  const sortDir = sortOrder === "asc" ? 1 : -1;

  // _id tie-break keeps page ordering stable when many docs share
  // the same sort value (e.g. same createdAt second, or same price).
  // Without this, skip/limit pagination can show duplicates or skip
  // items when two documents tie on the primary sort key.
  const sort: Record<string, 1 | -1> = { [sortField]: sortDir, _id: -1 };

  const [data, total] = await Promise.all([
    ProductModel.find(filter)
      .populate("seller", "name")
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    ProductModel.countDocuments(filter),
  ]);

  return {
    data,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    },
  };
};

export { getAllProductsFromDb };

// What the shop's filters can offer: categories with live counts and the
// price range of everything currently for sale.
const getShopFacetsFromDb = async () => {
  const forSale = { isDeleted: false, isPublished: true, stockStatus: { $ne: "Out of Stock" } };
  const [categories, prices, types] = await Promise.all([
    ProductModel.aggregate([
      { $match: forSale },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
    ProductModel.aggregate([
      { $match: forSale },
      { $group: { _id: null, min: { $min: "$price.basePrice" }, max: { $max: "$price.basePrice" } } },
    ]),
    ProductModel.aggregate([
      { $match: forSale },
      { $group: { _id: "$productType", count: { $sum: 1 } } },
    ]),
  ]);

  return {
    categories: categories.map((c) => ({ name: c._id, count: c.count })),
    types: types.map((t) => ({ name: t._id, count: t.count })),
    minPrice: prices[0]?.min ?? 0,
    maxPrice: prices[0]?.max ?? 0,
  };
};

// Admin view of the catalogue: unlike the public list it includes drafts
// and out-of-stock listings, so they can be moderated.
const getProductsForAdminFromDb = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = { isDeleted: false };

  if (query.productType === "Physical" || query.productType === "Digital") {
    filter.productType = query.productType;
  }
  if (query.status === "published") filter.isPublished = true;
  if (query.status === "draft") filter.isPublished = false;

  const search = String(query.search ?? "").trim();
  if (search) {
    const pattern = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: pattern, $options: "i" } },
      { sku: { $regex: pattern, $options: "i" } },
      { category: { $regex: pattern, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, Number(query.page) || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));

  const [data, total, published, physical] = await Promise.all([
    ProductModel.find(filter)
      .populate("seller", "name email contactNo")
      .sort({ createdAt: -1, _id: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    ProductModel.countDocuments(filter),
    ProductModel.countDocuments({ isDeleted: false, isPublished: true }),
    ProductModel.countDocuments({ isDeleted: false, productType: "Physical" }),
  ]);
  const all = await ProductModel.countDocuments({ isDeleted: false });

  return {
    data,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    },
    // Catalogue-wide counts for the summary cards (not affected by filters).
    summary: { all, published, drafts: all - published, physical, digital: all - physical },
  };
};

const getProductBySlugFromDb = async (slug: string): Promise<Document> => {
  const product = await ProductModel.findOneAndUpdate(
    { slug, isDeleted: false, isPublished: true },
    { $inc: { viewCount: 1 } },              // auto-increment views on fetch
    { new: true }
  );

  if (!product) throw new AppError(httpStatus.NOT_FOUND, "Product not found");

  // A seller who ticked "hide my contact" must not have their phone number
  // sent to the browser at all; hiding it in the UI is not enough.
  await product.populate(
    "seller",
    product.isContactHidden ? "name" : "name contactNo"
  );
  return product;
};
const getBooksFromDb = async () => {
  const allBooks = await BookModel.find({
    isDeleted: false,
    // isPublished: true,
  });

  //console.log(allBooks); // Logs only non-deleted and published books
  return allBooks;


};

const searchBooksByTitle = async (searchTerm: string): Promise<Document[]> => {
  try {
    const books = await BookModel.aggregate([
      {
        $match: {
          // Escaped: user input must not be interpreted as a regex.
          bookTitle: {
            $regex: searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            $options: "i",
          },
        },
      },
      {
        $project: {
          _id: 1,
          bookId: 1,
          booktitle: 1, // Add any other fields you need
        },
      },
      {
        $limit: 10, // Optional: limit results to 10 for faster response time
      },
    ]);

    return books;
  } catch (error) {
    console.error("Error searching books:", error);
    throw new Error("Failed to search books");
  }
};


const getBooksByEmailFromDB = async (email: string) => {
  //console.log(email);
  const user = await User.isUserExistsByEmail(email);
  //console.log(user);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "user is not found");
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "user is Deleted");
  }

  // Correct the query format here
  const books = await ProductModel.find({ seller: user?._id, isDeleted: false, }).populate("seller", "name email contactNo ");
  //console.log("booooooks_____", books);

  return books;
};

const deleteBookFromDb = async (
  bookId: string,
  requester: TRequester
): Promise<Document | null> => {
  await getOwnedProduct(bookId, requester);
  const book = await ProductModel.findByIdAndUpdate(
    bookId,
    { isDeleted: true },
    { new: true }
  );
  if (!book) {
    throw new Error("Book not found for deletion");
  }
  return book;
};

const getProductsByCategoriesFromDB = async () => {
  const book = await BookModel.find();
  const books = await BookModel.aggregate([
    // {
    //   $group: {
    //     id: `${book.level}`,
    //     listOfBooks:
    //   }
    // }
  ]);
  return books;
};

// Top-level fields a seller may edit. Nested objects are flattened to
// dotted paths below so a partial update never wipes sibling fields.
const UPDATABLE_PRODUCT_FIELDS = [
  "title",
  "category",
  "subcategory",
  "productType",
  "condition",
  "description",
  "images",
  "location",
  "stockStatus",
  "isPublished",
  "isContactHidden",
];
const UPDATABLE_NESTED_FIELDS: Record<string, string[]> = {
  price: ["basePrice", "discountPrice", "isNegotiable"],
  bookMetadata: [
    "author",
    "publisher",
    "publicationYear",
    "isbn",
    "edition",
    "language",
  ],
  inventory: ["quantity"],
  fulfillmentOptions: ["allowPickup", "allowShipping"],
  academicMetadata: ["level", "faculty", "department", "curriculum", "program", "departmentName", "year", "courseCode", "courseTitle"],
  // The file and link go through prepareDigitalDetails (see below).
  digitalDetails: ["fileType", "fileSize"],
};

const updateProductIntoDb = async (
  bookId: string,
  payload: Record<string, any>,
  requester: TRequester
) => {
  const existing = await getOwnedProduct(bookId, requester);

  const modifiedData: Record<string, unknown> = {};

  for (const key of UPDATABLE_PRODUCT_FIELDS) {
    if (payload[key] !== undefined) modifiedData[key] = payload[key];
  }
  for (const [parent, children] of Object.entries(UPDATABLE_NESTED_FIELDS)) {
    for (const child of children) {
      // Accept both { price: { basePrice } } and { "price.basePrice": ... }.
      const value = payload[parent]?.[child] ?? payload[`${parent}.${child}`];
      if (value !== undefined) modifiedData[`${parent}.${child}`] = value;
    }
  }

  // A new file or link for a digital listing is checked like on create.
  const digital = payload.digitalDetails;
  if (existing.productType === "Digital" && (digital?.file?.publicId || digital?.downloadUrl)) {
    const prepared = await prepareDigitalDetails(digital, String(existing.seller));
    for (const [key, value] of Object.entries(prepared)) {
      if (value !== undefined) modifiedData[`digitalDetails.${key}`] = value;
    }
  }

  if (Object.keys(modifiedData).length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "No valid fields to update");
  }

  // findByIdAndUpdate skips the pre("save") hook that keeps stockStatus in
  // step with quantity, so mirror it here.
  const quantity = modifiedData["inventory.quantity"];
  if (quantity !== undefined && modifiedData.stockStatus === undefined) {
    modifiedData.stockStatus = Number(quantity) > 0 ? "In Stock" : "Out of Stock";
  }

  const result = await ProductModel.findByIdAndUpdate(
    bookId,
    { $set: modifiedData },
    {
      new: true,
      runValidators: true,
    }
  );

  // A listing that just went live may be what someone asked to be told about.
  if (result && result.isPublished && !existing.isPublished) {
    await alertService.notifyForListing(result);
  }

  return result;
};

export const bookServices = {
  listABookIntoDb,
  getBookFromDb,
  getBooksFromDb,
  deleteBookFromDb, updateProductIntoDb,
  getBooksByEmailFromDB,
  getProductsByCategoriesFromDB,
  searchBooksByTitle,
  createProductIntoDB,
  getAllProductsFromDb,
  getShopFacetsFromDb,
  getProductsForAdminFromDb,
  getProductBySlugFromDb
};
