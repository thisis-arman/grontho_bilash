import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { TBook } from "./book.interface";
import { BookModel } from "./book.model";
import { Document } from "mongoose";
import { ObjectId } from "mongodb";

const listABookIntoDb = async (bookInfo: TBook): Promise<Document> => {
  console.log(bookInfo);
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
    // console.log(latestProduct[0]["bookId"]);
    const recentProductId = latestProduct[0]["bookId"];
    const newProductId = recentProductId.substring(4);
    let productId = `book${parseInt(newProductId) + 1}`;
    return productId;
  };
  const bookId = await generateProductId();
  console.log({bookId});
  // Log the bookId and other book information
  // console.log({ bookId, ...bookInfo });

  // Create and save the new book record
  const book = await BookModel.create({ bookId,...bookInfo });

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

const getBooksFromDb = async () => {
  const allBooks = await BookModel.find({
    isDeleted: false,
    // isPublished: true,
  });

  console.log(allBooks); // Logs only non-deleted and published books
  return allBooks;


};

const searchBooksByTitle = async (searchTerm: string): Promise<Document[]> => {
  try {
    const books = await BookModel.aggregate([
      {
        $match: {
          bookTitle: { $regex: searchTerm, $options: "i" }, // Case-insensitive regex match
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
  getProductsByCategoriesFromDB,
  searchBooksByTitle,
};
