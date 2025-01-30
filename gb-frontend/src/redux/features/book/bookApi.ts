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
      providesTags: ["Books"],
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

      providesTags: ["Books"],
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
      invalidatesTags: ["Books"],
    }),

    deleteBook: builder.mutation({
      query: (id) => {
        console.log(id, "delete book");
        return {
          url: `/books/${id}`,
          method: "PATCH",
        };
      },
      invalidatesTags: ["Books"],
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
