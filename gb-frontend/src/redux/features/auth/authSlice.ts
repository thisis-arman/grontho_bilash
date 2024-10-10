import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TAuth = {
  email: string;
  password: string;
};

type TInitialState = {
  users: TAuth[];
};

const initialState: TInitialState = {
  users: [
    { email: "test@example.com", password: "12345" }, // Example user
  ],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<TAuth>) => {
      const { email, password } = action.payload;

      // Check if user exists in users array
      const userExists = state.users.some(
        (u) => u.email === email && u.password === password
      );

      if (!userExists) {
        console.log("Login failed: Invalid email or password");
      } else {
        console.log("Login successful");
      }
    },
  },
});

export const { loginUser } = authSlice.actions;
export default authSlice.reducer;
