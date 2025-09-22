import { baseApi } from "../../api/baseApi";

export const cartApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        saveCartToDB: builder.mutation({
            query: (cartItems) => ({
                url: "/cart/save",
                method: "POST",
                body: cartItems,
            }),
        }),
        fetchCart: builder.query({
            query: () => "/cart",
        }),
        deleteCartItem: builder.mutation({
            query: (id) => ({
                url: `/cart/${id}`,
                method: "DELETE",
            }),
        }),
        updateCartItemInDB: builder.mutation({
            query: ({ id, updatedItem }) => ({
                url: `/cart/${id}`,
                method: "PUT",
                body: updatedItem,
            }),
        }),
    }),
});

export const {
    useSaveCartToDBMutation,
    useFetchCartQuery,
    useDeleteCartItemMutation,
    useUpdateCartItemInDBMutation,
} = cartApi;
