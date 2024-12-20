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
import { signup } from "../services/api/auth";
import { useDispatch } from "react-redux";
import { login as loginAction } from "../store/slices/authSlice";
import { useForm, Controller } from "react-hook-form";

const SignupScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const user = await signup({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
      });

      dispatch(loginAction(user));
      navigation.navigate("MainTabs", { screen: "HomeTab" });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      Alert.alert("Error", errorMessage || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const password = watch("password");

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
            <View style={styles.signupContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started</Text>

              <Controller
                control={control}
                name="fullName"
                rules={{
                  required: "Full Name is required",
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#666"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="words"
                    />
                    {errors.fullName && (
                      <Text style={styles.errorText}>
                        {errors.fullName.message}
                      </Text>
                    )}
                  </>
                )}
              />

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
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
                }}
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

              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor="#666"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry
                    />
                    {errors.confirmPassword && (
                      <Text style={styles.errorText}>
                        {errors.confirmPassword.message}
                      </Text>
                    )}
                  </>
                )}
              />

              <Controller
                control={control}
                name="phone"
                rules={{
                  required: "Phone number is required",
                  pattern: {
                    value: /^\d{10}$/,
                    message: "Phone number must be exactly 10 digits",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Phone Number (10 digits)"
                      placeholderTextColor="#666"
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^\d]/g, "");
                        onChange(cleaned.slice(0, 10));
                      }}
                      value={value}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                    {errors.phone && (
                      <Text style={styles.errorText}>
                        {errors.phone.message}
                      </Text>
                    )}
                  </>
                )}
              />

              <TouchableOpacity
                style={[styles.signupButton, loading && styles.disabledButton]}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
              >
                <Text style={styles.signupButtonText}>
                  {loading ? "Creating Account..." : "Sign Up"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.loginLinkText}>
                  Already have an account? Login
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
  signupContainer: {
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
  signupButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  signupButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 15,
  },
  loginLinkText: {
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

export default SignupScreen;
