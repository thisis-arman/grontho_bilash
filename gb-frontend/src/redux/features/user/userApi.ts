import { baseApi } from "../../api/baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCarts: builder.query({
      query: () => {
        return {
          url: `/users?`,
          method: "GET",
        };
      },
    }),
  }),
});
