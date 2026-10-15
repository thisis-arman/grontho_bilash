import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// What the bag remembers about each item. Price, title and image are a
// snapshot from when it was added; the bag page refreshes them from the
// server's quote, and the server always charges its own current price.
export type CartItem = {
  book: string;
  seller?: string;
  quantity: number;
  bookTitle: string;
  price: number;
  productImage: string;
  productType?: "Physical" | "Digital";
  slug?: string;
  // Copies available when last checked (physical items only).
  maxQuantity?: number;
};

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const MAX_PER_LINE = 100;

const clamp = (item: CartItem, quantity: number) =>
  Math.max(1, Math.min(quantity, item.productType === "Digital" ? 1 : item.maxQuantity ?? MAX_PER_LINE, MAX_PER_LINE));

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Adds one copy, or one more copy if it is already in the bag.
    addToCart: (state, action: PayloadAction<Omit<CartItem, "quantity"> & { quantity?: number }>) => {
      const existing = state.items.find((item) => item.book === action.payload.book);
      if (existing) {
        Object.assign(existing, { ...action.payload, quantity: existing.quantity });
        existing.quantity = clamp(existing, existing.quantity + (action.payload.quantity ?? 1));
      } else {
        const item = { ...action.payload, quantity: 1 } as CartItem;
        item.quantity = clamp(item, action.payload.quantity ?? 1);
        state.items.push(item);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.book !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find((i) => i.book === action.payload.productId);
      if (item) item.quantity = clamp(item, action.payload.quantity);
    },
    // Applies fresh product data from the server quote.
    syncCartItems: (
      state,
      action: PayloadAction<{ book: string; changes: Partial<Omit<CartItem, "book">> }[]>
    ) => {
      for (const { book, changes } of action.payload) {
        const item = state.items.find((i) => i.book === book);
        if (!item) continue;
        Object.assign(item, changes);
        item.quantity = clamp(item, item.quantity);
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const getProductsFromCart = (state: { cart: CartState }) => state.cart.items;

export const cartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const { addToCart, removeFromCart, updateQuantity, syncCartItems, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
