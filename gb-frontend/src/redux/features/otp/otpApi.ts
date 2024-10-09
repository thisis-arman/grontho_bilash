import { baseApi } from "../../api/baseApi";

export const otpApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOtps: builder.mutation({
      query: (email) => {
        return {
          url: "/otps/sent-otp",
          method: "POST",
          body: email,
        };
      },
    }),
    verifyOtp: builder.query({
      query: () => {
        return {
          url: "/otps/verify-otp",
          method: "GET",
        };
      },
    }),
  }),
});
