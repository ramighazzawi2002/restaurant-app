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
import {
  savePaymentMethod,
  updateUserProfile,
} from "../store/slices/authSlice";

const CheckoutScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { items, subtotal, discount, total, orderType, deliveryAddress } =
    useSelector((state: RootState) => state.cart);
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [address, setAddress] = useState(deliveryAddress || "");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const savedCards = useSelector(
    (state: RootState) => state.auth.user?.savedCards || []
  );
  const [selectedSavedCard, setSelectedSavedCard] = useState(null);
  const [saveDeliveryInfo, setSaveDeliveryInfo] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const DELIVERY_FEE = 5.99;

  React.useEffect(() => {
    if (user?.address) {
      setAddress(user.address);
    }
  }, [user]);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleSavedCardSelect = (card) => {
    setSelectedSavedCard(card);
    setCardNumber(`•••• •••• •••• ${card.last4}`);
    setExpiryDate(card.expiryDate);
    setCvc("");
  };

  const handleOrderTypeChange = (type: "Dine-in" | "Takeaway" | "Delivery") => {
    dispatch(setOrderType(type));
    if (type === "Delivery" && user?.address) {
      setAddress(user.address);
    }
  };

  const handlePlaceOrder = () => {
    if (orderType === "Delivery") {
      if (!address) {
        Alert.alert("Error", "Please enter delivery address");
        return;
      }

      if (saveDeliveryInfo) {
        dispatch(updateUserProfile({ address }));
      }
    }

    if (selectedPayment === "card") {
      if (!selectedSavedCard) {
        if (!cardNumber || !expiryDate || !cvc) {
          Alert.alert("Error", "Please enter all card details");
          return;
        }

        if (saveCard) {
          dispatch(
            savePaymentMethod({
              cardNumber: cardNumber.replace(/\s/g, ""),
              expiryDate,
              last4: cardNumber.slice(-4),
            })
          );
        }
      }
    }

    const newOrder = {
      id: Date.now().toString(),
      items,
      orderType,
      status: "Received",
      total: orderType === "Delivery" ? total + DELIVERY_FEE : total,
      subtotal,
      discount,
      deliveryAddress: address,
      deliveryPrice: orderType === "Delivery" ? DELIVERY_FEE : 0,
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
                onPress={() => handleOrderTypeChange(type)}
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
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setSaveDeliveryInfo(!saveDeliveryInfo)}
              >
                {saveDeliveryInfo && (
                  <Ionicons name="checkmark" size={16} color="#007AFF" />
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>
                Save this address for future orders
              </Text>
            </View>
            <Text style={styles.deliveryFee}>
              Delivery Fee: ${DELIVERY_FEE.toFixed(2)}
            </Text>
          </View>
        )}

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          {/* Card Payment Option */}
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

          {/* Saved Cards */}
          {selectedPayment === "card" && savedCards.length > 0 && (
            <View style={styles.savedCards}>
              <Text style={styles.subsectionTitle}>Saved Cards</Text>
              {savedCards.map((card, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.savedCard,
                    selectedSavedCard?.last4 === card.last4 &&
                      styles.selectedSavedCard,
                  ]}
                  onPress={() => handleSavedCardSelect(card)}
                >
                  <View style={styles.cardInfo}>
                    <Ionicons name="card-outline" size={20} color="#007AFF" />
                    <Text style={styles.savedCardText}>
                      •••• •••• •••• {card.last4}
                    </Text>
                    <Text style={styles.cardExpiry}>
                      Expires {card.expiryDate}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.newCardButton}
                onPress={() => {
                  setSelectedSavedCard(null);
                  setCardNumber("");
                  setExpiryDate("");
                  setCvc("");
                }}
              >
                <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                <Text style={styles.newCardText}>Use a new card</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Card Details */}
          {selectedPayment === "card" && (
            <View style={styles.cardDetails}>
              {!selectedSavedCard ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Card Number"
                    value={cardNumber}
                    onChangeText={(text) =>
                      setCardNumber(formatCardNumber(text))
                    }
                    maxLength={19}
                    keyboardType="numeric"
                  />
                  <View style={styles.cardRow}>
                    <TextInput
                      style={[styles.input, styles.halfInput]}
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChangeText={(text) =>
                        setExpiryDate(formatExpiryDate(text))
                      }
                      maxLength={5}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.input, styles.halfInput]}
                      placeholder="CVC"
                      value={cvc}
                      onChangeText={setCvc}
                      maxLength={3}
                      keyboardType="numeric"
                      secureTextEntry
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.saveCardOption}
                    onPress={() => setSaveCard(!saveCard)}
                  >
                    <View style={styles.checkbox}>
                      {saveCard && (
                        <Ionicons name="checkmark" size={16} color="#007AFF" />
                      )}
                    </View>
                    <Text style={styles.saveCardText}>
                      Save card for future purchases
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.savedCardInfo}>
                  <Text style={styles.savedCardLabel}>
                    Using saved card ending in {selectedSavedCard.last4}
                  </Text>
                  <Text style={styles.savedCardExpiry}>
                    Expires {selectedSavedCard.expiryDate}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Cash Payment Option */}
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
          {orderType === "Delivery" && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                ${DELIVERY_FEE.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              $
              {(orderType === "Delivery"
                ? total + DELIVERY_FEE
                : total
              ).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderButtonText}>
            Place Order - $
            {(orderType === "Delivery" ? total + DELIVERY_FEE : total).toFixed(
              2
            )}
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
  cardDetails: {
    marginTop: 16,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  halfInput: {
    flex: 0.47,
  },
  savedCards: {
    marginTop: 12,
  },
  subsectionTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  savedCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },
  savedCardText: {
    marginLeft: 8,
    fontSize: 14,
  },
  saveCardOption: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 4,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveCardText: {
    fontSize: 14,
    color: "#333",
  },
  selectedSavedCard: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF15",
  },
  cardInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  cardExpiry: {
    marginLeft: 12,
    color: "#666",
    fontSize: 14,
  },
  newCardButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginTop: 8,
  },
  newCardText: {
    marginLeft: 8,
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  savedCardInfo: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  savedCardLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  savedCardExpiry: {
    fontSize: 14,
    color: "#666",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  checkboxLabel: {
    fontSize: 14,
    color: "#666",
  },
  deliveryFee: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    marginTop: 8,
  },
  totalText: {
    fontWeight: "600",
    fontSize: 16,
  },
  totalAmount: {
    fontWeight: "600",
    fontSize: 16,
    color: "#007AFF",
  },
});

export default CheckoutScreen;
