import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const baseApi = createApi({
    reducerPath: "baseApi",
    tagTypes: ['products'],
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000/" }),

    endpoints: () => ({})
})