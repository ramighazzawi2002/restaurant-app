import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import LoginScreen from "./screens/login";
import SignupScreen from "./screens/signup";
import HomeScreen from "./screens/home";
import DetailsScreen from "./screens/details";
import CartScreen from "./screens/cart";
import CheckoutScreen from "./screens/checkout";
import OrdersScreen from "./screens/orders";
import FavoritesScreen from "./screens/favorites";
import ProfileScreen from "./screens/profile";
import { Provider } from "react-redux";
import { store } from "./store";
import { useSelector } from "react-redux";
import { RootState } from "./store";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
function TabNavigator() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string | undefined;

          switch (route.name) {
            case "HomeTab":
              iconName = focused ? "home" : "home-outline";
              break;
            case "CartTab":
              iconName = focused ? "cart" : "cart-outline";
              break;
            case "OrdersTab":
              iconName = focused ? "receipt" : "receipt-outline";
              break;
            case "FavoritesTab":
              iconName = focused ? "heart" : "heart-outline";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: {
          display: isAuthenticated ? "flex" : "none", // Hide tabs when not authenticated
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{ title: "Cart" }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{ title: "Orders" }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesScreen}
        options={{ title: "Favorites" }}
      />
    </Tab.Navigator>
  );
}

// Auth stack for login/signup screens
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// Main app component with navigation structure
function AppNavigator() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Auth" component={AuthStack} />
        </>
      ) : (
        <>
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="Orders" component={OrdersScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}
