import { baseApi } from "../../api/baseApi";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: () => {
        return {
          url: `/orders`,
          method: "GET",
        };
      },
      providesTags: ["Orders"],
    }),
    // Orders that include the logged-in seller's listings.
    getMySales: builder.query({
      query: () => ({ url: `/orders/my-sales`, method: "GET" }),
      providesTags: ["Orders"],
    }),
    getOrderByUserId: builder.query({
      query: (userId) => (
        //console.log(userId, "get books by email"),
        {
          url: `/orders/orderbyuserid/${userId}`,
          method: "GET",
        }
      ),
      providesTags: ["Orders"],
    }),
    // Server-priced bag: current prices, stock problems, delivery per
    // parcel. A POST because the bag is sent in the body.
    getCartQuote: builder.query({
      query: (body: { books: { book: string; quantity: number }[]; shippingArea: "inside" | "outside" }) => ({
        url: "/orders/quote",
        method: "POST",
        body,
      }),
      keepUnusedDataFor: 0,
    }),
    createOrder: builder.mutation({
      query: (data) => {
        return {
          url: "/orders/create-order",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["Orders", "Books"],
    }),
    updateOrder: builder.mutation({
      query: ({ id, data }) => ({
        url: `/orders/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Orders"],
    }),
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetMySalesQuery,
  useCreateOrderMutation,
  useGetCartQuoteQuery,
  useGetOrderByUserIdQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = orderApi;
