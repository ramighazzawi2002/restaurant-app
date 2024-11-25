import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserProfile {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  defaultPaymentMethod?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserProfile>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    logoutAndClearData: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { login, updateUserProfile, logoutAndClearData } =
  authSlice.actions;
export default authSlice.reducer;
