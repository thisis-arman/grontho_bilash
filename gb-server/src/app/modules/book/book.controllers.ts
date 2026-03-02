import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { bookServices } from "./book.services";
import httpStatus from "http-status";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  // Extract user ID from auth middleware (seller)
  const user = req.user;

  const productData = {
    ...req.body,
    seller: '67ec9a1f0dbed76c63bb41f2', // Ensure the logged-in user is the seller
  };

  const result = await bookServices.createProductIntoDB(productData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product listed successfully! It is now pending review.",
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
  const result = await bookServices.getAllProductsFromDb(req.query);
  sendResponse(res, { statusCode: 200, success: true, message: "Products fetched successfully", data: result });
});

const getBooksByEmail = catchAsync(async (req, res) => {
  const email = req.params.email;
  console.log(email);
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
  console.log(req.params);
  const bookId = req.params.id;
  console.log({ bookId });
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
  const result = await bookServices.searchBooksByTitle(req.body);
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
  const result = await bookServices.deleteBookFromDb(bookId);
  sendResponse(res, {
    statusCode: 200,
    message: "Book deleted successfully",
    success: true,
    data: result,
  });
});

// Controller to dynamically update a book
const updateBook = catchAsync(async (req: Request, res: Response) => {
  const bookId = req.params.id;
  const updateData = req.body;
  const result = await bookServices.updateBookIntoDb(bookId, updateData);
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
  getProductBySlug
};
