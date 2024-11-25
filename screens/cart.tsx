import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  removeFromCart,
  updateQuantity,
  applyPromoCode,
  removePromoCode,
  updateCartTotals,
} from "../store/slices/cartSlice";
import { useNavigation } from "@react-navigation/native";

const CartScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { items, subtotal, discount, total, promoCode } = useSelector(
    (state: RootState) => state.cart
  );
  const [promoInput, setPromoInput] = React.useState("");

  React.useEffect(() => {
    dispatch(updateCartTotals());
  }, [items]);

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    } else {
      dispatch(removeFromCart(id));
    }
  };

  const handleApplyPromo = () => {
    if (promoInput) {
      dispatch(applyPromoCode(promoInput));
      setPromoInput("");
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert(
        "Cart Empty",
        "Please add items to your cart before checkout"
      );
      return;
    }
    navigation.navigate("Checkout");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {items.length === 0 ? (
          <View style={styles.emptyCart}>
            <Ionicons name="cart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
          </View>
        ) : (
          <>
            {items.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  {item.selectedSize && (
                    <Text style={styles.itemOption}>
                      Size: {item.selectedSize}
                    </Text>
                  )}
                  {item.selectedAddons?.length > 0 && (
                    <Text style={styles.itemOption}>
                      Add-ons: {item.selectedAddons.join(", ")}
                    </Text>
                  )}
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    onPress={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                  >
                    <Ionicons name="remove-circle" size={24} color="#007AFF" />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                  >
                    <Ionicons name="add-circle" size={24} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.promoSection}>
              <View style={styles.promoInputContainer}>
                <TextInput
                  style={styles.promoInput}
                  placeholder="Enter promo code"
                  value={promoInput}
                  onChangeText={setPromoInput}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.promoButton}
                  onPress={handleApplyPromo}
                >
                  <Text style={styles.promoButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
              {promoCode && (
                <View style={styles.appliedPromo}>
                  <Text style={styles.appliedPromoText}>
                    Code {promoCode.code} applied
                  </Text>
                  <TouchableOpacity onPress={() => dispatch(removePromoCode())}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.summary}>
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

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            items.length === 0 && styles.disabledButton,
          ]}
          onPress={handleCheckout}
          disabled={items.length === 0}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
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
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyCartText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  cartItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemPrice: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 4,
  },
  itemOption: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 12,
  },
  promoSection: {
    padding: 16,
  },
  promoInputContainer: {
    flexDirection: "row",
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  promoButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  promoButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  appliedPromo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  appliedPromoText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  summary: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
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
  checkoutButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  checkoutButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default CartScreen;
