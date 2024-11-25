import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { toggleFavorite } from "../store/slices/favoritesSlice";
import { useNavigation } from "@react-navigation/native";
import { addToCart } from "../store/slices/cartSlice";

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.favorites.items);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const handleAddToCart = (item) => {
    if (!isAuthenticated) {
      Alert.alert("Login Required", "Please login to add items to your cart", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Login",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
      return;
    }

    dispatch(
      addToCart({
        id: Date.now(),
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
      })
    );
    Alert.alert("Success", "Item added to cart!");
  };

  const handleRemoveFavorite = (item) => {
    Alert.alert(
      "Remove from Favorites",
      "Are you sure you want to remove this item from favorites?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => dispatch(toggleFavorite(item)),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No favorite items yet</Text>
          </View>
        ) : (
          favorites.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => navigation.navigate("Details", { item })}
            >
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.rating}>{item.rating}</Text>
                  <Text style={styles.reviews}>({item.reviews})</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleAddToCart(item)}
                >
                  <Ionicons name="cart-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={() => handleRemoveFavorite(item)}
                >
                  <Ionicons name="heart" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    marginLeft: 4,
    fontWeight: "500",
  },
  reviews: {
    color: "#666",
    marginLeft: 4,
  },
  actions: {
    justifyContent: "space-between",
    paddingLeft: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: "#FFE5E5",
  },
});

export default FavoritesScreen;
