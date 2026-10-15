import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";
import type { RootState } from "../store";
import { logout, setUser } from "../features/auth/authSlice";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "../../config/api";


const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
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


// A 401 on a request that carried a token means the session expired (or the
// account was blocked): clear it so PrivateRoute sends the user to /login
// instead of leaving them on a dashboard where every request fails.
const baseQueryWithSessionCheck: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const hadToken = !!(api.getState() as RootState).auth.token;
    let result = await baseQuery(args, api, extraOptions);

    if (hadToken && result.error?.status === 401) {
        // The access token has expired: try once to get a new one with the
        // refresh cookie, then repeat the original request.
        const refreshed = await fetchBaseQuery({ baseUrl: API_BASE_URL, credentials: "include" })(
            { url: "/auth/refresh-token", method: "POST" },
            api,
            extraOptions
        );
        const accessToken = (refreshed.data as { data?: { accessToken?: string } } | undefined)?.data?.accessToken;

        if (accessToken) {
            api.dispatch(setUser({ user: jwtDecode(accessToken), token: accessToken }));
            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(logout());
            toast.error("Your session has expired. Please log in again.", { id: "session-expired" });
        }
    }
    return result;
}


export const baseApi = createApi({
    reducerPath: "baseApi",
    baseQuery: baseQueryWithSessionCheck,
    tagTypes: ["Books", "Users", "Orders", "Blogs", "Suggestions"],
    endpoints: () => ({})
});
