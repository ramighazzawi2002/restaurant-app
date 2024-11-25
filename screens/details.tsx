import React, { useState, useEffect } from "react";
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
import { MenuItem, Review } from "../services/api/food";
import { RootState } from "../store/index";
import { toggleFavorite } from "../store/slices/favoritesSlice";

const ReviewItem = ({ review }: { review: Review }) => {
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

  return (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewRating}>{renderStars(review.rating)}</View>
        <Text style={styles.reviewDate}>
          {new Date(review.date).toLocaleDateString()}
        </Text>
      </View>
      {review.review && <Text style={styles.reviewText}>{review.review}</Text>}
    </View>
  );
};

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
  // Convert string sizes to object format with prices
  const normalizedSizes = item.options?.sizes?.map((size) =>
    typeof size === "string"
      ? {
          name: size,
          price: size === "Small" ? 0 : size === "Medium" ? 2 : 4, // Default price increments
        }
      : size
  );
  // Initialize with first size or null
  const [selectedSize, setSelectedSize] = useState<{
    name: string;
    price: number;
  } | null>(normalizedSizes?.[0] || null);

  const [selectedAddons, setSelectedAddons] = useState<
    { name: string; price: number }[]
  >([]);
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

    // Add size price if selected
    if (selectedSize) {
      total += selectedSize.price * quantity;
    }

    // Add addons prices
    selectedAddons.forEach((addon) => {
      total += addon.price * quantity;
    });

    return total;
  };

  // Get all orders to collect reviews for this item
  const orders = useSelector((state: RootState) => state.orders.orders);
  const [itemReviews, setItemReviews] = useState<Review[]>([]);

  useEffect(() => {
    // Collect all reviews for this menu item from orders
    const reviews: Review[] = [];
    orders.forEach((order) => {
      order.menuItemsRatings?.forEach((rating) => {
        if (rating.menuItemId === item.id) {
          reviews.push({
            menuItemId: rating.menuItemId,
            rating: rating.rating,
            review: rating.review,
            date: order.date,
          });
        }
      });
    });
    setItemReviews(reviews);
  }, [orders, item.id]);

  // Calculate average rating
  const averageRating =
    itemReviews.length > 0
      ? itemReviews.reduce((acc, curr) => acc + curr.rating, 0) /
        itemReviews.length
      : 0;

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
            <Text style={styles.rating}>{averageRating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({itemReviews.length} reviews)</Text>
          </View>

          {/* Size Options */}
          {item.options?.sizes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Size</Text>
              <View style={styles.optionsContainer}>
                {normalizedSizes?.map((size) => (
                  <TouchableOpacity
                    key={size.name}
                    style={[
                      styles.optionButton,
                      selectedSize?.name === size.name && styles.selectedOption,
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedSize?.name === size.name &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {size.name}{" "}
                      {size.price > 0 && `(+$${size.price.toFixed(2)})`}
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
                {item.options.addons.map((addon) => {
                  const addonObj =
                    typeof addon === "string"
                      ? { name: addon, price: 0 }
                      : addon;
                  const isSelected = selectedAddons.some(
                    (a) => a.name === addonObj.name
                  );

                  return (
                    <TouchableOpacity
                      key={addonObj.name}
                      style={[
                        styles.optionButton,
                        isSelected && styles.selectedOption,
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedAddons(
                            selectedAddons.filter(
                              (item) => item.name !== addonObj.name
                            )
                          );
                        } else {
                          setSelectedAddons([...selectedAddons, addonObj]);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.selectedOptionText,
                        ]}
                      >
                        {typeof addon === "string"
                          ? addon
                          : `${addon.name} (+$${addon.price.toFixed(2)})`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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

          {/* Reviews Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.reviewsSummary}>
              <View style={styles.averageRating}>
                <Text style={styles.averageRatingNumber}>
                  {averageRating.toFixed(1)}
                </Text>
                <View style={styles.starsContainer}>
                  {[...Array(5)].map((_, index) => (
                    <Ionicons
                      key={index}
                      name={
                        index < Math.round(averageRating)
                          ? "star"
                          : "star-outline"
                      }
                      size={20}
                      color="#FFD700"
                    />
                  ))}
                </View>
                <Text style={styles.totalReviews}>
                  {itemReviews.length} reviews
                </Text>
              </View>
            </View>

            {itemReviews.length > 0 ? (
              itemReviews.map((review, index) => (
                <ReviewItem key={index} review={review} />
              ))
            ) : (
              <Text style={styles.noReviews}>No reviews yet</Text>
            )}
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
  reviewsSummary: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 16,
  },
  averageRating: {
    alignItems: "center",
  },
  averageRatingNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
  },
  starsContainer: {
    flexDirection: "row",
    marginVertical: 8,
  },
  totalReviews: {
    color: "#666",
    fontSize: 14,
  },
  reviewItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewRating: {
    flexDirection: "row",
  },
  reviewDate: {
    color: "#666",
    fontSize: 12,
  },
  reviewText: {
    color: "#333",
    fontSize: 14,
    lineHeight: 20,
  },
  noReviews: {
    textAlign: "center",
    color: "#666",
    padding: 16,
  },
});

export default DetailsScreen;
