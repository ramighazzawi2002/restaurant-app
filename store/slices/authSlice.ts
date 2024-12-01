import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  defaultPaymentMethod?: string;
  savedCards?: SavedCard[];
}

interface SavedCard {
  id?: string;
  cardNumber: string;
  expiryDate: string;
  last4: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  savedUserData: {
    [email: string]: {
      address?: string;
      savedCards?: SavedCard[];
      defaultPaymentMethod?: string;
    };
  };
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  savedUserData: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserProfile>) => {
      state.isAuthenticated = true;
      state.user = {
        ...action.payload,
        ...state.savedUserData[action.payload.email],
      };
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (!state.savedUserData[state.user.email]) {
          state.savedUserData[state.user.email] = {};
        }
        state.savedUserData[state.user.email] = {
          ...state.savedUserData[state.user.email],
          address:
            action.payload.address ||
            state.savedUserData[state.user.email]?.address,
          defaultPaymentMethod:
            action.payload.defaultPaymentMethod ||
            state.savedUserData[state.user.email]?.defaultPaymentMethod,
        };
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
    savePaymentMethod: (state, action: PayloadAction<SavedCard>) => {
      if (state.user) {
        if (!state.user.savedCards) {
          state.user.savedCards = [];
        }
        state.user.savedCards.push(action.payload);
        if (!state.savedUserData[state.user.email]) {
          state.savedUserData[state.user.email] = {};
        }
        if (!state.savedUserData[state.user.email].savedCards) {
          state.savedUserData[state.user.email].savedCards = [];
        }
        state.savedUserData[state.user.email].savedCards?.push(action.payload);
      }
    },
  },
});

export const { login, updateUserProfile, logout, savePaymentMethod } =
  authSlice.actions;
export default authSlice.reducer;
