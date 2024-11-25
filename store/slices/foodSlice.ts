import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MenuItem, Category } from "../../services/api/food";

interface FoodState {
  categories: Category[];
  menuItems: MenuItem[];
  filteredItems: MenuItem[];
  selectedCategory: string | null;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

const initialState: FoodState = {
  categories: [],
  menuItems: [],
  filteredItems: [],
  selectedCategory: null,
  searchQuery: "",
  loading: false,
  error: null,
};

const foodSlice = createSlice({
  name: "food",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setMenuItems: (state, action: PayloadAction<MenuItem[]>) => {
      state.menuItems = action.payload;
      state.filteredItems = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
      state.filteredItems = state.menuItems.filter(
        (item) =>
          (!action.payload || item.category === action.payload) &&
          (state.searchQuery === "" ||
            item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            item.description
              .toLowerCase()
              .includes(state.searchQuery.toLowerCase()))
      );
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredItems = state.menuItems.filter(
        (item) =>
          (!state.selectedCategory ||
            item.category === state.selectedCategory) &&
          (action.payload === "" ||
            item.name.toLowerCase().includes(action.payload.toLowerCase()) ||
            item.description
              .toLowerCase()
              .includes(action.payload.toLowerCase()))
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCategories,
  setMenuItems,
  setSelectedCategory,
  setSearchQuery,
  setLoading,
  setError,
} = foodSlice.actions;

export default foodSlice.reducer;
