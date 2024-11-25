import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { addOrderRating } from "../store/slices/ordersSlice";
import { addToCart } from "../store/slices/cartSlice";
import { useNavigation } from "@react-navigation/native";

const OrderStatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case "Received":
        return "#007AFF";
      case "In Preparation":
        return "#FF9500";
      case "Ready":
        return "#34C759";
      case "Out for Delivery":
        return "#5856D6";
      case "Delivered":
        return "#30D158";
      case "Cancelled":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );
};

const OrdersScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.orders.orders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);

  const handleReorder = (order) => {
    order.items.forEach((item) => {
      dispatch(addToCart({ ...item, id: Date.now() }));
    });
    navigation.navigate("Cart");
  };

  const handleRateOrder = (order) => {
    setSelectedOrder(order);
    setRating(order.rating || 0);
    setFeedback(order.feedback || "");
    setShowRatingModal(true);
  };

  const submitRating = () => {
    if (selectedOrder) {
      dispatch(
        addOrderRating({
          orderId: selectedOrder.id,
          rating,
          feedback,
        })
      );
    }
    setShowRatingModal(false);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={20}
        color="#FFD700"
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No orders yet</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderDate}>
                  {new Date(order.date).toLocaleDateString()}
                </Text>
                <OrderStatusBadge status={order.status} />
              </View>

              <View style={styles.orderItems}>
                {order.items.map((item, index) => (
                  <Text key={index} style={styles.orderItem}>
                    {item.quantity}x {item.name}
                  </Text>
                ))}
              </View>

              <View style={styles.orderDetails}>
                <Text style={styles.orderType}>
                  {order.orderType}
                  {order.deliveryAddress && ` • ${order.deliveryAddress}`}
                </Text>
                <Text style={styles.orderTotal}>
                  Total: ${order.total.toFixed(2)}
                </Text>
              </View>

              {order.status === "Delivered" && (
                <View style={styles.ratingSection}>
                  {order.rating ? (
                    <View style={styles.rating}>
                      <Text style={styles.ratingLabel}>Your Rating:</Text>
                      <View style={styles.stars}>
                        {renderStars(order.rating)}
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.rateButton}
                      onPress={() => handleRateOrder(order)}
                    >
                      <Text style={styles.rateButtonText}>Rate Order</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={styles.reorderButton}
                onPress={() => handleReorder(order)}
              >
                <Ionicons name="refresh" size={20} color="#007AFF" />
                <Text style={styles.reorderButtonText}>Reorder</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showRatingModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate Your Order</Text>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={32}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Share your feedback (optional)"
              value={feedback}
              onChangeText={setFeedback}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRatingModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitRating}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  orderCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderType: {
    fontSize: 14,
    color: "#666",
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  ratingSection: {
    marginBottom: 12,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingLabel: {
    marginRight: 8,
    fontSize: 14,
    color: "#666",
  },
  stars: {
    flexDirection: "row",
  },
  rateButton: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  rateButtonText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  reorderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  reorderButtonText: {
    color: "#007AFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  ratingStars: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  submitButton: {
    backgroundColor: "#007AFF",
  },
  cancelButtonText: {
    color: "#666",
    textAlign: "center",
    fontWeight: "600",
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});

export default OrdersScreen;
