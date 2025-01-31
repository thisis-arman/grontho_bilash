// import { TBook } from "../../../pages/books/products";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";



export type CartItem = {
    book: string;
    quantity: number;
    bookTitle: string;
    price: number;
    deliveryOption: string,
    isNegotiable: boolean,
    productImage: string,
    shippingCost: number
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
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const existingItem = state.items.find((item) => item.book === action.payload.book);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.items.push({ ...action.payload, quantity: 1 });
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.book !== action.payload);
        },
        updateCartItem: (state, action: PayloadAction<CartItem>) => {
            const index = state.items.findIndex((item) => item.book === action.payload.book);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        updateQuantity: (state, action) => {
            const { productId, quantity } = action.payload;
            const product = state.items.find((item) => item.book === productId);
            if (product) {
                product.quantity = quantity;
            }
        },


        clearCart: (state) => {
            state.items = [];
        },
    },
});

// Selector to get all items in the cart
export const getProductsFromCart = (state: { cart: CartState }) => state.cart.items;

export const { addToCart, removeFromCart, updateCartItem, clearCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
