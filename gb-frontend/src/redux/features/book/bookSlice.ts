import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the types for book and initial state
export type TBook = {
  user: string;
  bookId: string;
  bookTitle: string;
  price: number;
  description: string;
  condition: "fresh" | "used";
  level: "ssc" | "hsc" | "bachelor" | "master";
  isPublished: boolean;
  isContactNoHidden: boolean;
  isNegotiable: boolean;
  images: string[];
  publicationYear: number;
  transactionDate?: Date;
  location: string;
  deliveryOption: "pickup" | "shipping";
  shippingCost?: number;
};

type TInitialState = {
  books: TBook[];
  selectedBook?: TBook | null;
};

const initialState: TInitialState = {
  books: [],
  selectedBook: null,
};

// Create a slice with reducers for CRUD operations
const bookSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    // GET all books
    setBooks: (state, action: PayloadAction<TBook[]>) => {
      state.books = action.payload;
    },

    // POST a new book
    createBook: (state, action: PayloadAction<TBook>) => {
      state.books.push(action.payload);
    },

    // DELETE a book by its ID
    deleteBook: (state, action: PayloadAction<string>) => {
      state.books = state.books.filter(
        (book) => book.bookId !== action.payload
      );
    },

    // UPDATE a book's details by its ID
    updateBook: (
      state,
      action: PayloadAction<{ bookId: string; updatedData: Partial<TBook> }>
    ) => {
      const { bookId, updatedData } = action.payload;
      const bookIndex = state.books.findIndex((book) => book.bookId === bookId);
      if (bookIndex >= 0) {
        state.books[bookIndex] = {
          ...state.books[bookIndex],
          ...updatedData,
        };
      }
    },

    // FIND a book by its ID and set it to selectedBook
    findById: (state, action: PayloadAction<string>) => {
      state.selectedBook =
        state.books.find((book) => book.bookId === action.payload) || null;
    },
  },
});

// Export the actions and reducer
export const { setBooks, createBook, deleteBook, updateBook, findById } =
  bookSlice.actions;
export default bookSlice.reducer;
