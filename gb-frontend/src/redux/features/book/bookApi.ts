import { TBook } from "../../../pages/books/products";
import { baseApi } from "../../api/baseApi";
// import { TBook } from "./bookSlice";

export const bookApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new book
    createBook: builder.mutation({
      query: (data) => ({
        url: "/books/create-book",
        method: "POST",
        body: data,
      }),
    }),

    // Get all books
    getBooks: builder.query({
      query: () => ({
        url: "/books",
        method: "GET",
      }),
    }),
    // Get all books
    getBooksByEmail: builder.query({
      query: (email) => (
        console.log(email, "get books by email"),
        {
          url: `/books/${email}`,
          method: "GET",
        }
      ),
    }),

    getBookById: builder.query({
      query: (id) => `/books/book/${id}`, // Simplified query syntax
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: TBook;
      }) => {
        return response.data; // Extract only the relevant `data` field
      },
    }),

    // Update a book by ID
    updateBook: builder.mutation({
      query: ({ id, data }) => ({
        url: `/books/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    // Delete a book by ID
    deleteBook: builder.mutation({
      query: (id) => ({
        url: `/books/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

// Export the auto-generated hooks for the endpoints
export const {
  useCreateBookMutation,
  useGetBooksQuery,
  useGetBookByIdQuery,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useGetBooksByEmailQuery,
} = bookApi;
