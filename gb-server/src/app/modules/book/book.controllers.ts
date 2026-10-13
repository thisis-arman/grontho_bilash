import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import { isAdminRole } from "../../middlewares/auth";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { bookServices } from "./product.services";
import httpStatus from "http-status";
import { pick } from "../../utils/pick";
import { IProduct } from "./product.interface";

// Everything else on the Product schema (seller, sku, slug, viewCount,
// soldCount, isDeleted, ...) is set by the server, never by the request.
const CREATABLE_PRODUCT_FIELDS = [
  "title",
  "productType",
  "category",
  "subcategory",
  "academicMetadata",
  "price",
  "inventory",
  "condition",
  "description",
  "images",
  "stockStatus",
  "fulfillmentOptions",
  "digitalDetails",
  "bookMetadata",
  "isPublished",
  "isContactHidden",
  "location",
];

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const productData = {
    ...pick(req.body, CREATABLE_PRODUCT_FIELDS),
    seller: user?.id
  } as unknown as IProduct;

  const result = await bookServices.createProductIntoDB(productData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product listed successfully!",
    data: result,
  });
});

// Controller to list a book
const listABook = catchAsync(async (req: Request, res: Response) => {
  const result = await bookServices.listABookIntoDb(req.body);
  sendResponse(res, {
    statusCode: 200,
    message: "Book added successfully",
    success: true,
    data: result,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await bookServices.getAllProductsFromDb({ ...req.query });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Products fetched successfully",
    data: result
  });
});

const getProductsForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await bookServices.getProductsForAdminFromDb({ ...req.query });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Products fetched successfully",
    data: result
  });
});

const getBooksByEmail = catchAsync(async (req, res) => {
  const email = req.params.email;
  if (email !== req.user.email && !isAdminRole(req.user.role)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only view your own listings"
    );
  }
  const result = await bookServices.getBooksByEmailFromDB(email);
  sendResponse(res, {
    statusCode: 200,
    message: "Book fetched successfully",
    success: true,
    data: result,
  });


})

const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await bookServices.getProductBySlugFromDb(req.params.slug);
  sendResponse(res, { statusCode: 200, success: true, message: "Product fetched successfully", data: result });
});

const getProductsByCategories = catchAsync(async (req, res) => {
  const result = await bookServices.getProductsByCategoriesFromDB();
  sendResponse(res, {
    statusCode: 200,
    message: "Book fetched successfully",
    success: true,
    data: result,
  });
})

// Controller to get a single book by its ID
const getBook = catchAsync(async (req: Request, res: Response) => {
  //console.log(req.params);
  const bookId = req.params.id;
  //console.log({ bookId });
  const result = await bookServices.getBookFromDb(bookId);
  sendResponse(res, {
    statusCode: 200,
    message: "Book fetched successfully",
    success: true,
    data: result,
  });
});

// Controller to get all books
const getBooks = catchAsync(async (req: Request, res: Response) => {
  const result = await bookServices.getBooksFromDb();
  sendResponse(res, {
    statusCode: 200,
    message: "Books fetched successfully",
    success: true,
    data: result,
  });
});
// Controller to get all books
const searchBooks = catchAsync(async (req: Request, res: Response) => {
  const result = await bookServices.searchBooksByTitle(
    String(req.body?.searchTerm ?? req.body?.title ?? "")
  );
  sendResponse(res, {
    statusCode: 200,
    message: "Books searched successfully",
    success: true,
    data: result,
  });
});

// Controller to soft delete a book
const deleteBook = catchAsync(async (req: Request, res: Response) => {
  const bookId = req.params.id;
  const result = await bookServices.deleteBookFromDb(bookId, req.user);
  sendResponse(res, {
    statusCode: 200,
    message: "Book deleted successfully",
    success: true,
    data: result,
  });
});

// Controller to dynamically update a book
const updateBook = catchAsync(async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const updateData = req.body;
  const result = await bookServices.updateProductIntoDb(
    bookId,
    updateData,
    req.user
  );
  sendResponse(res, {
    statusCode: 200,
    message: "Book updated successfully",
    success: true,
    data: result,
  });
});

export const bookController = {
  listABook,
  getBook,
  getBooks,
  deleteBook,
  updateBook,
  getBooksByEmail,
  getProductsByCategories,
  searchBooks,
  createProduct,
  getAllProducts,
  getProductsForAdmin,
  getProductBySlug
};
