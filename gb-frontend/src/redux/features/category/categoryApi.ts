import { baseApi } from "../../api/baseApi";


export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => {
        return {
          url: `/levels`,
          method: "GET",
        };
      },
    }),
    createCategory: builder.mutation({
      query: (data) => {
        return {
          url: "/level/create-level",
          method: "POST",
          body: data,
        };
      },
    }),
    createFaculty: builder.mutation({
      query: (data) => {
        return {
          url: "/level/create-faculty",
          method: "POST",
          body: data,
        };
      },
    }),
    createDepartment: builder.mutation({
      query: (data) => {
        return {
          url: "/level/create-department",
          method: "POST",
          body: data,
        };
      },
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useCreateDepartmentMutation,
  useCreateFacultyMutation,
} = categoryApi;
