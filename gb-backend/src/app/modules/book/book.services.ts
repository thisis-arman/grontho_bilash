import { TBook } from "./book.interface";
import { BookModel } from "./book.model";
import { Document } from "mongoose";

// Service to list a book into the database
const listABookIntoDb = async (bookInfo: TBook): Promise<Document> => {
  const book = await BookModel.create(bookInfo);
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
};
