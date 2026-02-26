import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

const productionUrl  ='https://grontho-bilash-server.vercel.app';
const baseQuery = fetchBaseQuery({
  baseUrl: `${window.origin=='http://localhost:5173'?'http://localhost:5000':productionUrl}/api/v1`,
  credentials: "include", 
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("Authorization", `${token}`); 
    }
    headers.set("Content-Type", "application/json"); 
    return headers; 
  },
});


const baseQueryWithRefreshToken = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    return result;
}


export const baseApi = createApi({
    reducerPath: "baseApi",
    baseQuery: baseQueryWithRefreshToken,
    tagTypes: ["Books", "Users", "Orders"], 
    endpoints: () => ({})
});
