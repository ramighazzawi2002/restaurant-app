import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MenuItem } from "../../services/api/food";

interface FavoritesState {
  items: MenuItem[];
}

const initialState: FavoritesState = {
  items: [],
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<MenuItem>) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index === -1) {
        state.items.push(action.payload);
      } else {
        state.items.splice(index, 1);
      }
    },
    clearFavorites: (state) => {
      state.items = [];
    },
  },
});

export const { toggleFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
