import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: number;
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedAddons?: string[];
  specialInstructions?: string;
  image: string;
}

interface PromoCode {
  code: string;
  discount: number;
  type: "percentage" | "fixed";
}

interface CartState {
  items: CartItem[];
  orderType: "Dine-in" | "Takeaway" | "Delivery";
  promoCode?: PromoCode;
  deliveryAddress?: string;
  subtotal: number;
  discount: number;
  total: number;
}

const initialState: CartState = {
  items: [],
  orderType: "Dine-in",
  subtotal: 0,
  discount: 0,
  total: 0,
};

// Mock promo codes
const availablePromoCodes: { [key: string]: PromoCode } = {
  WELCOME10: { code: "WELCOME10", discount: 10, type: "percentage" },
  SAVE20: { code: "SAVE20", discount: 20, type: "fixed" },
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      state.items.push(action.payload);
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    setOrderType: (
      state,
      action: PayloadAction<"Dine-in" | "Takeaway" | "Delivery">
    ) => {
      state.orderType = action.payload;
    },
    applyPromoCode: (state, action: PayloadAction<string>) => {
      const promoCode = availablePromoCodes[action.payload.toUpperCase()];
      if (promoCode) {
        state.promoCode = promoCode;
        if (promoCode.type === "percentage") {
          state.discount = (state.subtotal * promoCode.discount) / 100;
        } else {
          state.discount = promoCode.discount;
        }
        state.total = state.subtotal - state.discount;
      }
    },
    removePromoCode: (state) => {
      state.promoCode = undefined;
      state.discount = 0;
      state.total = state.subtotal;
    },
    updateCartTotals: (state) => {
      state.subtotal = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      if (state.promoCode) {
        if (state.promoCode.type === "percentage") {
          state.discount = (state.subtotal * state.promoCode.discount) / 100;
        } else {
          state.discount = state.promoCode.discount;
        }
      }
      state.total = state.subtotal - state.discount;
    },
    setDeliveryAddress: (state, action: PayloadAction<string>) => {
      state.deliveryAddress = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.promoCode = undefined;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  setOrderType,
  applyPromoCode,
  removePromoCode,
  updateCartTotals,
  setDeliveryAddress,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
