import { baseApi } from "../../api/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => {
        console.log(credentials, "from login ");
        return {
          url: "/auth/login",
          method: "POST",
          body: credentials,
        };
      },
    }),
    changePassword: builder.mutation({
      query: (data) => {
        return {
          url: "/auth/change-password",
          method: "POST",
          body: data,
        };
      },
    }),
  }),
});

export const { useLoginMutation, useChangePasswordMutation } = authApi;
