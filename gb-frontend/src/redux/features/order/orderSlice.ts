import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TOrder = {
  name: string;
  email: string;
  contactNo: string;
  password: string;
};

type TInitialState = {
  order: TOrder[];
};

const initialState: TInitialState = {
  order: [],
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    createOrder: (state, action: PayloadAction<TOrder>) => {
      state.order.push(action.payload);
    },
    // Retrieve all order
    getOrders: (state) => {
      return state;
    },


  },
});

export const { createOrder, getOrders } =
  orderSlice.actions;
export default orderSlice.reducer;
