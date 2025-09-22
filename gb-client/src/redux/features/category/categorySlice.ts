import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TCategory = {
  levelId: string;
  levelName: string;
  faculties: [];
};

type TInitialState = {
  category: TCategory[];
};
const initialState: TInitialState = {
  category: [],
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    createCategory: (state, action: PayloadAction<TCategory>) => {
      state.category.push(action.payload);
    },
    createFaculty: (state, action: PayloadAction<TCategory>) => {
      state.category.push(action.payload);
    },
    getCategories: (state) => {
      return state;
    },
  },
});

export const { createCategory,getCategories } = categorySlice.actions;
export default categorySlice.reducer;
