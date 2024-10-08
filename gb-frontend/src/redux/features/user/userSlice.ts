import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TUser = {
  name: string;
  email: string;
  contactNo: string;
  password: string;
};

const initialState: TUser = {
  name: "",
  email: "",
  contactNo: "",
  password: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
           createUser: (state, action: PayloadAction<TUser>) => {
      // This reducer handles creating a user
      // 'action.payload' contains the new user data
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.contactNo = action.payload.contactNo;
      state.password = action.payload.password;
    
    },
  },
});
