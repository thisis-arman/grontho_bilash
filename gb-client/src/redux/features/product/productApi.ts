import { baseApi } from "../../api/baseApi";

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => {
        return {
          url: `/books`,
          method: "GET",
        };
      },
    }),
    createUser: builder.mutation({
      query: (userInfo) => {
        return {
          url: "/books/add-product",
          method: "POST",
          body: userInfo,
        };
      },
    }),
  }),
});

export const { useCreateUserMutation, useGetUsersQuery } = productApi;
