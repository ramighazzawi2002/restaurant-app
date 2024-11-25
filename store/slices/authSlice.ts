import { createSlice } from "@reduxjs/toolkit";
import { clearCart } from "./cartSlice";
import { clearFavorites } from "./favoritesSlice";

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { login, logout } = authSlice.actions;

// Thunk to handle logout and clear related data
export const logoutAndClearData = () => (dispatch) => {
  dispatch(logout());
  dispatch(clearCart());
  dispatch(clearFavorites());
};

export default authSlice.reducer;
