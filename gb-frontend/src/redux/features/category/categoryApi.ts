import { baseApi } from "@/redux/api/baseApi";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => {
        return {
          url: `/level`,
          method: "GET",
        };
      },
    }),
    createCategory: builder.mutation({
      query: (data) => {
        return {
            url: "/level/create-level",
            method: "POST",
            body: data
        };
      },
    }),
    createFaculty: builder.mutation({
      query: (data) => {
        return {
            url: "/level/create-faculty",
            method: "POST",
            body: data
        };
      },
    }),
    createDepartment: builder.mutation({
      query: (data) => {
        return {
            url: "/level/create-department",
            method: "POST",
            body: data
        };
      },
    }),
  }),
});
