import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TOtp = {
  email: string;
  otp: number;
  expiresAt: string;
  verified: boolean;
  _id: string;
};

type TInitialState = {
  otps: TOtp[];
};

const initialState: TInitialState = {
  otps: [],
};

const otpSlice = createSlice({
  name: "otp",
  initialState,
  reducers: {
    createOtp: (state, action: PayloadAction<TOtp>) => {
      state.otps.push(action.payload);
    },
    // Retrieve all users
    getOtps: (state) => {
      return state;
    },
  },
});


export const { createOtp, getOtps } = otpSlice.actions;
export default otpSlice.reducer;