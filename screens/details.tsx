import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MenuItem } from "../services/api/food";
import { RootState } from "../store/index";
import { toggleFavorite } from "../store/slices/favoritesSlice";

const DetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const item = route.params?.item as MenuItem;
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const favorites = useSelector((state: RootState) => state.favorites.items);
  const isFavorite = favorites.some((fav) => fav.id === item.id);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(
    item.options?.sizes?.[0] || null
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const handleAddToFavorites = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Login Required",
        "Please login to add items to your favorites",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Login",
            onPress: () => navigation.navigate("Auth", { screen: "Login" }),
          },
        ]
      );
      return;
    }
    dispatch(toggleFavorite(item));
  };
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      Alert.alert("Login Required", "Please login to add items to your cart", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Login",
          onPress: () => navigation.navigate("Auth", { screen: "Login" }),
        },
      ]);
      return;
    }

    dispatch(
      addToCart({
        id: Date.now(),
        menuItemId: item.id,
        name: item.name,
        price: calculateTotalPrice(),
        quantity,
        selectedSize,
        selectedAddons,
        specialInstructions,
        image: item.image,
      })
    );
    navigation.goBack();
  };

  const calculateTotalPrice = () => {
    let total = item.price * quantity;
    // Add logic for size and addon pricing
    return total;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleAddToFavorites}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#FF3B30" : "#333"}
            />
          </TouchableOpacity>
        </View>

        {/* Image */}
        <Image source={{ uri: item.image }} style={styles.image} />

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviews}>({item.reviews} reviews)</Text>
          </View>

          {/* Size Options */}
          {item.options?.sizes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Size</Text>
              <View style={styles.optionsContainer}>
                {item.options.sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.optionButton,
                      selectedSize === size && styles.selectedOption,
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedSize === size && styles.selectedOptionText,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Add-ons */}
          {item.options?.addons && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add-ons</Text>
              <View style={styles.optionsContainer}>
                {item.options.addons.map((addon) => (
                  <TouchableOpacity
                    key={addon}
                    style={[
                      styles.optionButton,
                      selectedAddons.includes(addon) && styles.selectedOption,
                    ]}
                    onPress={() => {
                      if (selectedAddons.includes(addon)) {
                        setSelectedAddons(
                          selectedAddons.filter((item) => item !== addon)
                        );
                      } else {
                        setSelectedAddons([...selectedAddons, addon]);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedAddons.includes(addon) &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {addon}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => quantity > 1 && setQuantity(quantity - 1)}
              >
                <Ionicons name="remove" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Special Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <TextInput
              style={styles.instructionsInput}
              placeholder="Add note (e.g., allergies, spice level)"
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.price}>${calculateTotalPrice().toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>Add to Cart</Text>
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
    justifyContent: "space-between",
    padding: 16,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: "100%",
    height: 300,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  rating: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    margin: 4,
  },
  selectedOption: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  optionText: {
    color: "#333",
  },
  selectedOptionText: {
    color: "#fff",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  quantity: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 16,
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    height: 80,
    textAlignVertical: "top",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 16,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DetailsScreen;
