import { baseApi } from "../../api/baseApi";

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
        console.log(email ,"get books by email"),
        {
        url: `/books/${email}`,
        method: "GET",
      }),
    }),

    // Get a book by ID
    getBookById: builder.query({
      query: (id) => ({
        url: `/books/${id}`,
        method: "GET",
      }),
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
  useGetBooksByEmailQuery
} = bookApi;
