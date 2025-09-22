import { baseApi } from "../../api/baseApi";

export const otpApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOtp: builder.mutation({
      query: (email) => {
        console.log(email,"from otp api");
        return {
          url: "/otp/sent-otp",
          method: "POST",
          body: email,
        };
      },
    }),
    verifyOtp: builder.mutation({
      query: (data) => {
        return {
          url: "/otp/verify-otp",
          method: "POST",
          body:data
        };
      },
    }),
  }),
});

export const { useCreateOtpMutation,useVerifyOtpMutation } = otpApi;