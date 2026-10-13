import { baseApi } from "../../api/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => {
        //console.log(credentials, "from login ");
        return {
          url: "/auth/login",
          method: "POST",
          body: credentials,
        };
      },
    }),
    forgotPassword: builder.mutation({
      query: (data: { email: string }) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data: { email: string; otp: string; newPassword: string }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
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

export const {
  useLoginMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
