import { configureStore } from "@reduxjs/toolkit";
import foodReducer from "./slices/foodSlice";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import ordersReducer from "./slices/ordersSlice";
import favoritesReducer from "./slices/favoritesSlice";
import recommendationsReducer from "./slices/recommendationsSlice";

export const store = configureStore({
  reducer: {
    food: foodReducer,
    cart: cartReducer,
    auth: authReducer,
    orders: ordersReducer,
    favorites: favoritesReducer,
    recommendations: recommendationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
