import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

const productionUrl  ='https://grontho-bilash-server.vercel.app';
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || /^(192\.168\.|10\.|172\.)/.test(window.location.hostname);
const baseUrl = isLocal ? `http://${window.location.hostname}:5000/api/v1` : `${productionUrl}/api/v1`;

const baseQuery = fetchBaseQuery({
  baseUrl,
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
