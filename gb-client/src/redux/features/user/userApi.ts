import { baseApi } from "../../api/baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: (email) => {
        return {
          url: `/users/get-me/${email}`,
          method: "GET",
        };
      },
    }),
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
    updateUserInfo:builder.mutation({
      query:({id,userInfo})=>{
        return {
          url:`users/update-user/${id}`,
          method:"POST",
          body:userInfo
        }
      }
    })
  }),
});

export const { useCreateUserMutation,useGetUsersQuery,useUpdateUserInfoMutation,useGetMeQuery} = userApi;
