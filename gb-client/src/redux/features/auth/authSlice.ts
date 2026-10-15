import { createSlice } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../../store";
import { API_BASE_URL } from "../../../config/api";
import { clearCart } from "../cart/cartSlice";

export type TUser = {
  id: string;
  email: string;
  role: string;
  name: string;
  iat: number;
  exp: number;
};

type TAuthState = {
  user: null | object;
  token: null | string;
};

const initialState: TAuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setUser,logout } = authSlice.actions;
export default authSlice.reducer;

// Full sign-out: tells the API to drop the refresh cookie (best effort), then
// clears the session and the cart so the next person on this device starts
// clean.
export const signOut = () => (dispatch: AppDispatch) => {
  fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
  dispatch(logout());
  dispatch(clearCart());
};

export const useCurrentToken = (state: RootState) => state.auth.token;
export const selectCurrentUser = (state: RootState) => state.auth.user;
