import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { TBook } from "./book.interface";
import { BookModel } from "./book.model";
import { Document } from "mongoose";
import { ObjectId } from "mongodb";

// Service to list a book into the database
const listABookIntoDb = async (bookInfo: TBook): Promise<Document> => {
  const latestBook = await BookModel.findOne().sort({ _id: -1 }).exec();
  const latestBookId = latestBook?.bookId as string;
  let bookId = "";
  if (latestBookId) {
    const digit = latestBookId.substring(4);
    const increment = parseInt(digit) + 1;
    bookId = `book${increment}`;
  }
  const book = await BookModel.create({ bookId, ...bookInfo });
  return book;
};

// Service to get a specific book by its ID
const getBookFromDb = async (bookId: string): Promise<Document | null> => {
  const book = await BookModel.findById(bookId);
  if (!book) {
    throw new Error("Book not found");
  }
  return book;
};

const getBooksFromDb = async (): Promise<Document[]> => {
  const books = await BookModel.find();
  // TODO: check if the book is deleted or isPublished false or not ?
  // if(books)
  return books;
};
const getBooksByEmailFromDB = async (email: string) => {
  console.log(email);
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "user is not found");
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "user is Deleted");
  }

  // Correct the query format here
  const books = await BookModel.find({ user: user._id });
  console.log(books);

  return books;
};

// Service to soft delete a book (set a flag instead of actually deleting)
const deleteBookFromDb = async (bookId: string): Promise<Document | null> => {
  const book = await BookModel.findByIdAndUpdate(
    bookId,
    { isDeleted: true }, // Soft delete by setting an "isDeleted" flag
    { new: true }
  );
  if (!book) {
    throw new Error("Book not found for deletion");
  }
  return book;
};

// Dynamic update service for books
const updateBookIntoDb = async (
  bookId: string,
  updateData: Partial<TBook>
): Promise<Document | null> => {
  const book = await BookModel.findByIdAndUpdate(bookId, updateData, {
    new: true, // Return the updated document
    runValidators: true, // Ensure validation is run on the updated data
  });
  if (!book) {
    throw new Error("Book not found for update");
  }
  return book;
};

export const bookServices = {
  listABookIntoDb,
  getBookFromDb,
  getBooksFromDb,
  deleteBookFromDb,
  updateBookIntoDb,
  getBooksByEmailFromDB,
};
