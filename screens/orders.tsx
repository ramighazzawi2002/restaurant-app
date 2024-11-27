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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { addOrderRating, addMenuItemRating } from "../store/slices/ordersSlice";
import { addToCart } from "../store/slices/cartSlice";
import { useNavigation } from "@react-navigation/native";

interface MenuItem {
  id: number;
  menuItemId: number;
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  items: MenuItem[];
  orderType: string;
  status: string;
  total: number;
  date: string;
  deliveryAddress?: string;
  menuItemsRatings?: {
    menuItemId: number;
    rating: number;
    review?: string;
  }[];
}

const OrderStatusBadge = ({ status }: { status: string }) => {
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

const RatingModal = ({
  visible,
  onClose,
  onSubmit,
  orderId,
  menuItem,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    orderId: string,
    menuItemId: number,
    rating: number,
    review: string
  ) => void;
  orderId?: string;
  menuItem?: MenuItem;
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmit = () => {
    if (!orderId || !menuItem) {
      return;
    }

    if (rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }

    onSubmit(orderId, menuItem.menuItemId, rating, review);
    setRating(0);
    setReview("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Rate {menuItem?.name}</Text>
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
            style={styles.reviewInput}
            placeholder="Write your review (optional)"
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={4}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const OrdersScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.orders.orders);
  const [selectedMenuItem, setSelectedMenuItem] = useState<
    (MenuItem & { orderId: string }) | null
  >(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const handleRateMenuItem = (orderId: string, menuItem: MenuItem) => {
    setSelectedMenuItem({ ...menuItem, orderId });
    setShowRatingModal(true);
  };

  const handleSubmitRating = (
    orderId: string,
    menuItemId: number,
    rating: number,
    review: string
  ) => {
    dispatch(
      addMenuItemRating({
        orderId,
        menuItemId,
        rating,
        review,
      })
    );
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      dispatch(
        addToCart({
          id: Date.now(),
          menuItemId: item.menuItemId,
          name: item.name,
          price: order.total / order.items.length, // Approximate price per item
          quantity: item.quantity,
          image: item.image,
        })
      );
    });
    navigation.navigate("Cart" as never);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={16}
        color="#FFD700"
      />
    ));
  };

  return orders.length === 0 ? (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.emptyState}>
        <Ionicons name="sad-outline" size={64} color="#ccc" />
        <Text style={styles.emptyStateText}>No orders found</Text>
      </View>
    </SafeAreaView>
  ) : (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <OrderStatusBadge status={order.status} />
              <Text style={styles.orderDate}>
                {new Date(order.date).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.orderItems}>
              {order.items.map((item) => {
                const itemRating = order.menuItemsRatings?.find(
                  (r) => r.menuItemId === item.menuItemId
                );

                return (
                  <View key={item.id} style={styles.orderItem}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>
                        {item.quantity}x {item.name}
                      </Text>
                      {itemRating && (
                        <View style={styles.ratingContainer}>
                          {renderStars(itemRating.rating)}
                          {itemRating.review && (
                            <Text style={styles.reviewText} numberOfLines={1}>
                              {itemRating.review}
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                    {order.status === "Received" && !itemRating && (
                      <TouchableOpacity
                        style={styles.rateButton}
                        onPress={() => handleRateMenuItem(order.id, item)}
                      >
                        <Text style={styles.rateButtonText}>Rate Item</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
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

            <TouchableOpacity
              style={styles.reorderButton}
              onPress={() => handleReorder(order)}
            >
              <Ionicons name="refresh" size={20} color="#007AFF" />
              <Text style={styles.reorderButtonText}>Reorder</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleSubmitRating}
        orderId={selectedMenuItem?.orderId}
        menuItem={selectedMenuItem}
      />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  rateButton: {
    backgroundColor: "#007AFF15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 80,
    alignItems: "center",
  },
  rateButtonText: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "500",
  },
  reviewText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    flex: 1,
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
  reviewInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    height: 100,
    textAlignVertical: "top",
  },
});

export default OrdersScreen;
