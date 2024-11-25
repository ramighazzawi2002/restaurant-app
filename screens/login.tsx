import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { login as loginAction } from "../store/slices/authSlice";
import { login } from "../services/api/auth";
import { useForm, Controller } from "react-hook-form";

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const user = await login({ email: data.email, password: data.password });
      dispatch(loginAction(user));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      Alert.alert("Error", errorMessage || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.backgroundImage}
      >
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
          >
            <View style={styles.loginContainer}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>

              <Controller
                control={control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Email is invalid",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#666"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {errors.email && (
                      <Text style={styles.errorText}>
                        {errors.email.message}
                      </Text>
                    )}
                  </>
                )}
              />

              <Controller
                control={control}
                name="password"
                rules={{ required: "Password is required" }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#666"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry
                    />
                    {errors.password && (
                      <Text style={styles.errorText}>
                        {errors.password.message}
                      </Text>
                    )}
                  </>
                )}
              />

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.disabledButton]}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? "Logging in..." : "Login"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate("Signup")}
              >
                <Text style={styles.forgotPasswordText}>
                  Don't have an account? Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  loginContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPassword: {
    marginTop: 15,
  },
  forgotPasswordText: {
    color: "#007AFF",
    textAlign: "center",
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 5,
  },
});

export default LoginScreen;
