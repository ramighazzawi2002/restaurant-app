import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "./cartSlice";

export interface Order {
  id: string;
  items: CartItem[];
  orderType: "Dine-in" | "Takeaway" | "Delivery";
  status:
    | "Received"
    | "In Preparation"
    | "Ready"
    | "Out for Delivery"
    | "Delivered"
    | "Cancelled";
  total: number;
  subtotal: number;
  discount: number;
  deliveryAddress?: string;
  paymentMethod: "card" | "cash";
  date: string;
  rating?: number;
  feedback?: string;
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{ orderId: string; status: Order["status"] }>
    ) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
      }
    },
    addOrderRating: (
      state,
      action: PayloadAction<{
        orderId: string;
        rating: number;
        feedback?: string;
      }>
    ) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.rating = action.payload.rating;
        order.feedback = action.payload.feedback;
      }
    },
  },
});

export const { addOrder, updateOrderStatus, addOrderRating } =
  ordersSlice.actions;

export default ordersSlice.reducer;
