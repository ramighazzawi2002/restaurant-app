import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Order } from "./ordersSlice";

interface RecommendedItem {
  menuItemId: number;
  name: string;
  score: number;
  lastOrdered: string;
  timesOrdered: number;
  averageRating: number;
}

interface RecommendationsState {
  recommendations: RecommendedItem[];
  loading: boolean;
  error: string | null;
}

const initialState: RecommendationsState = {
  recommendations: [],
  loading: false,
  error: null,
};

const recommendationsSlice = createSlice({
  name: "recommendations",
  initialState,
  reducers: {
    setRecommendations: (state, action: PayloadAction<RecommendedItem[]>) => {
      state.recommendations = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setRecommendations, setLoading, setError } =
  recommendationsSlice.actions;
export default recommendationsSlice.reducer;
