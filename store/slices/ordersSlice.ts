import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Order {
  id: string;
  items: {
    id: number;
    menuItemId: number;
    name: string;
    quantity: number;
  }[];
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
  deliveryPrice?: number;
  paymentMethod: "card" | "cash";
  date: string;
  menuItemsRatings?: {
    menuItemId: number;
    rating: number;
    review?: string;
  }[];
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
    addMenuItemRating: (
      state,
      action: PayloadAction<{
        orderId: string;
        menuItemId: number;
        rating: number;
        review?: string;
      }>
    ) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        if (!order.menuItemsRatings) {
          order.menuItemsRatings = [];
        }

        const existingRating = order.menuItemsRatings.find(
          (r) => r.menuItemId === action.payload.menuItemId
        );

        if (existingRating) {
          existingRating.rating = action.payload.rating;
          existingRating.review = action.payload.review;
        } else {
          order.menuItemsRatings.push({
            menuItemId: action.payload.menuItemId,
            rating: action.payload.rating,
            review: action.payload.review,
          });
        }
      }
    },
  },
});

export const {
  addOrder,
  updateOrderStatus,
  addOrderRating,
  addMenuItemRating,
} = ordersSlice.actions;

export default ordersSlice.reducer;
