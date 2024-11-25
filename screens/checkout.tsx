import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  clearCart,
  setDeliveryAddress,
  setOrderType,
} from "../store/slices/cartSlice";
import { useNavigation } from "@react-navigation/native";
import { addOrder } from "../store/slices/ordersSlice";

const CheckoutScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { items, subtotal, discount, total, orderType, deliveryAddress } =
    useSelector((state: RootState) => state.cart);
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [address, setAddress] = useState(deliveryAddress || "");

  const handlePlaceOrder = () => {
    if (orderType === "Delivery" && !address) {
      Alert.alert("Error", "Please enter delivery address");
      return;
    }

    // Create new order
    const newOrder = {
      id: Date.now().toString(),
      items,
      orderType,
      status: "Received",
      total,
      subtotal,
      discount,
      deliveryAddress: address,
      paymentMethod: selectedPayment,
      date: new Date().toISOString(),
    };

    dispatch(addOrder(newOrder));
    dispatch(clearCart());

    Alert.alert("Order Placed", "Your order has been successfully placed!", [
      {
        text: "View Orders",
        onPress: () => navigation.navigate("Orders"),
      },
      {
        text: "Back to Home",
        onPress: () => navigation.navigate("Home"),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Order Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Type</Text>
          <View style={styles.orderTypes}>
            {["Dine-in", "Takeaway", "Delivery"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.orderTypeButton,
                  orderType === type && styles.selectedOrderType,
                ]}
                onPress={() => dispatch(setOrderType(type))}
              >
                <Text
                  style={[
                    styles.orderTypeText,
                    orderType === type && styles.selectedOrderTypeText,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Delivery Address (if delivery selected) */}
        {orderType === "Delivery" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your delivery address"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                dispatch(setDeliveryAddress(text));
              }}
              multiline
            />
          </View>
        )}

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === "card" && styles.selectedPayment,
            ]}
            onPress={() => setSelectedPayment("card")}
          >
            <Ionicons name="card-outline" size={24} color="#333" />
            <Text style={styles.paymentText}>Credit/Debit Card</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === "cash" && styles.selectedPayment,
            ]}
            onPress={() => setSelectedPayment("cash")}
          >
            <Ionicons name="cash-outline" size={24} color="#333" />
            <Text style={styles.paymentText}>Cash on Delivery</Text>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.summaryItem}>
              <Text style={styles.summaryItemName}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.summaryItemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, styles.discountText]}>
                -${discount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderButtonText}>
            Place Order - ${total.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  orderTypes: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderTypeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  selectedOrderType: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  orderTypeText: {
    color: "#333",
    fontWeight: "500",
  },
  selectedOrderTypeText: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPayment: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF15",
  },
  paymentText: {
    marginLeft: 12,
    fontSize: 16,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryItemName: {
    flex: 1,
  },
  summaryItemPrice: {
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    color: "#666",
  },
  summaryValue: {
    fontWeight: "600",
  },
  discountText: {
    color: "#4CAF50",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  placeOrderButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
  },
  placeOrderButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CheckoutScreen;
