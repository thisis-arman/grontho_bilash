import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TUser = {
  name: string;
  email: string;
  contactNo: string;
  password: string;
};

type TInitialState = {
  users: TUser[];
  selectedUser: TUser | null;
};
const initialState: TInitialState = {
  users: [],
  selectedUser: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    createUser: (state, action: PayloadAction<TUser>) => {
      state.users.push(action.payload);
    },
    // Retrieve all users
    getUser: (state) => {
      return state;
    },
    getUserByEmail: (state, action: PayloadAction<string>) => {
      const email = action.payload;
      state.selectedUser =
        state.users.find((user) => user.email === email) || null;
    },
    // Remove user by email
    removeUser: (state, action: PayloadAction<string>) => {
      const email = action.payload;
      state.users = state.users.filter((user) => user.email !== email);
    },
  },
});

export const { createUser, getUser, getUserByEmail, removeUser } =
  userSlice.actions;
export default userSlice.reducer;
