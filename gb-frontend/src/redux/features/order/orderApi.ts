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

export const { useGetOrdersQuery, useCreateOrderMutation } = orderApi;
