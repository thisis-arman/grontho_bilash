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
    }),
    getOrderByUserId: builder.query({
      query: (userId) => (
        console.log(userId, "get books by email"),
        {
          url: `/orders/orderbyuserid/${userId}`,
          method: "GET",
        }
      ),

      // providesTags: ["Books"],
    }),
    createOrder: builder.mutation({
      query: (data) => {
        return {
          url: "/orders/create-order",
          method: "POST",
          body: data,
        };
      },
    }),
  }),
});

export const { useGetOrdersQuery, useCreateOrderMutation,useGetOrderByUserIdQuery } = orderApi;
