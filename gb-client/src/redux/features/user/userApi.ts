import { baseApi } from "../../api/baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => {
        return {
          url: `/users`,
          method: "GET",
        };
      },
    }),
    createUser: builder.mutation({
      query: (userInfo) => {
        return {
          url: "/users/register",
          method: "POST",
          body: userInfo,
        };
      },
    }),
  }),
});

export const { useCreateUserMutation,useGetUsersQuery} = userApi;
