import { TBook } from "../../../pages/books/books";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface CartItem extends TBook {
    quantity: number;
}

interface CartState {
    items: CartItem[];
}

const initialState: CartState = {
    items: [],
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<TBook>) => {
            const existingItem = state.items.find((item) => item._id === action.payload._id);
            if (existingItem) {
                // If the item exists, increase its quantity
                existingItem.quantity += 1;
            } else {
                // If the item does not exist, add it with quantity 1
                state.items.push({ ...action.payload, quantity: 1 });
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item._id !== action.payload);
        },
        updateCartItem: (state, action: PayloadAction<CartItem>) => {
            const index = state.items.findIndex((item) => item._id === action.payload._id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        clearCart: (state) => {
            state.items = [];
        },
    },
});

// Selector to get all items in the cart
export const getProductsFromCart = (state: { cart: CartState }) => state.cart.items;

// Individual cart actions
export const { addToCart, removeFromCart, updateCartItem, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
