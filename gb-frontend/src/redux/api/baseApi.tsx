import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

const baseQuery = fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1",
    credentials: "include",
    prepareHeaders(headers, { getState }) {
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set('Authorization',`${token}`)
        }
    },
})

const baseQueryWithRefreshToken = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    return result;
}


export const baseApi = createApi({
    reducerPath: "baseApi",
    baseQuery: baseQueryWithRefreshToken,
    tagTypes: ["Books", "Users", "Orders"], // Define tag types here
    endpoints: () => ({})
});
