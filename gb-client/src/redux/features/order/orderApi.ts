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
      providesTags: ["Orders"],
    }),
    createOrder: builder.mutation({
      query: (data) => {
        return {
          url: "/orders/create-order",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["Orders"],
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
  useCreateOrderMutation,
  useGetOrderByUserIdQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = orderApi;
