import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  setCategories,
  setMenuItems,
  setSelectedCategory,
  setSearchQuery,
  setLoading,
  setError,
} from "../store/slices/foodSlice";
import { getCategories, getFoodItems } from "../services/api/food";
import { useNavigation } from "@react-navigation/native";
import { logoutAndClearData } from "../store/slices/authSlice";

const HomeScreen = () => {
  const dispatch = useDispatch();
  const { categories, filteredItems, selectedCategory, searchQuery, loading } =
    useSelector((state: RootState) => state.food);
  const navigation = useNavigation();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading(true));
      try {
        const [categoriesData, menuItemsData] = await Promise.all([
          getCategories(),
          getFoodItems(),
        ]);
        dispatch(setCategories(categoriesData));
        dispatch(setMenuItems(menuItemsData));
      } catch (error) {
        dispatch(setError("Failed to fetch data"));
        console.error("Error fetching data:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchData();
  }, [dispatch]);

  const renderCategoryItem = ({ item: category }) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryCard,
        selectedCategory === category.name && styles.selectedCategory,
      ]}
      onPress={() => dispatch(setSelectedCategory(category.name))}
    >
      <Image source={{ uri: category.image }} style={styles.categoryImage} />
      <Ionicons name={category.icon} size={24} color="#007AFF" />
      <Text style={styles.categoryName}>{category.name}</Text>
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.itemCard}
      onPress={() => navigation.navigate("Details", { item })}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>${item.price}</Text>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={styles.rating}>{item.rating}</Text>
        <Text style={styles.reviews}>({item.reviews})</Text>
      </View>
    </TouchableOpacity>
  );

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          dispatch(logoutAndClearData());
          setShowProfileMenu(false);
        },
        style: "destructive",
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {isAuthenticated ? `Hello, ${user?.fullName}!` : "Welcome Guest!"}
          </Text>
          <Text style={styles.subtitle}>What would you like to eat?</Text>
        </View>
        {isAuthenticated ? (
          <View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => setShowProfileMenu(!showProfileMenu)}
            >
              <Ionicons
                name="person-circle-outline"
                size={32}
                color="#007AFF"
              />
            </TouchableOpacity>
            {showProfileMenu && (
              <View style={styles.profileMenu}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate("Orders");
                  }}
                >
                  <Ionicons name="receipt-outline" size={20} color="#333" />
                  <Text style={styles.menuItemText}>My Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate("Favorites");
                  }}
                >
                  <Ionicons name="heart-outline" size={20} color="#333" />
                  <Text style={styles.menuItemText}>Favorites</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={[styles.menuItem, styles.logoutItem]}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                  <Text style={[styles.menuItemText, styles.logoutText]}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Auth", { screen: "Login" })}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for dishes..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={(text) => dispatch(setSearchQuery(text))}
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            ListHeaderComponent={
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  !selectedCategory && styles.selectedCategory,
                ]}
                onPress={() => dispatch(setSelectedCategory(null))}
              >
                <Ionicons name="grid-outline" size={24} color="#007AFF" />
                <Text style={styles.categoryName}>All</Text>
              </TouchableOpacity>
            }
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory || "All Items"}
          </Text>
          <View style={styles.menuGrid}>
            <FlatList
              data={filteredItems}
              renderItem={renderMenuItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              scrollEnabled={false}
            />
          </View>
        </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    margin: 16,
    padding: 12,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#333",
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  categoryCard: {
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 120,
    height: 160,
  },
  categoryName: {
    marginTop: 8,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  itemCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    margin: "auto",
    width: "48%",
    marginBottom: 16,
  },
  itemImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  itemPrice: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  rating: {
    marginLeft: 4,
    color: "#666",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionButton: {
    alignItems: "center",
  },
  actionText: {
    marginTop: 4,
    color: "#333",
    fontSize: 14,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  categoryImage: {
    width: "100%",
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  reviews: {
    marginLeft: 4,
    color: "#666",
    fontSize: 12,
  },
  selectedCategory: {
    backgroundColor: "#007AFF15",
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  profileMenu: {
    position: "absolute",
    top: 50,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 4,
  },
  logoutItem: {
    marginTop: 4,
  },
  logoutText: {
    color: "#FF3B30",
  },
});

export default HomeScreen;
