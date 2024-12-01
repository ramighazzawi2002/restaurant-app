import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { updateUserProfile } from "../store/slices/authSlice";
import { useNavigation } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import { updateProfile } from "../services/api/auth";

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      defaultPaymentMethod: user?.defaultPaymentMethod || "",
    },
  });

  const handleToggleEdit = () => {
    if (isEditing && isDirty) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              reset();
              setIsEditing(false);
            },
          },
        ]
      );
    } else {
      setIsEditing(!isEditing);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (data.phone && !/^[0-9-+() ]{10,}$/.test(data.phone)) {
        Alert.alert("Error", "Please enter a valid phone number");
        return;
      }

      if (!user?.email) {
        Alert.alert("Error", "User email not found");
        return;
      }

      // Update profile in the backend
      const updatedUser = await updateProfile(user.email, data);

      // Update Redux store
      dispatch(updateUserProfile(data));
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleToggleEdit}>
          <Ionicons
            name={isEditing ? "close-outline" : "create-outline"}
            size={24}
            color="#007AFF"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <Controller
            control={control}
            name="fullName"
            rules={{ required: "Full name is required" }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput]}
                  value={value}
                  onChangeText={onChange}
                  editable={isEditing}
                />
                {errors.fullName && (
                  <Text style={styles.errorText}>
                    {errors.fullName.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { value } }) => (
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={value}
                  editable={false}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="phone"
            rules={{
              pattern: {
                value: /^[0-9-+()]*$/,
                message: "Invalid phone number",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.field}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput]}
                  value={value}
                  onChangeText={onChange}
                  editable={isEditing}
                  keyboardType="phone-pad"
                />
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone.message}</Text>
                )}
              </View>
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <View style={styles.field}>
                <Text style={styles.label}>Default Address</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput]}
                  value={value}
                  onChangeText={onChange}
                  editable={isEditing}
                  multiline
                />
              </View>
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Payment Method</Text>
          {isEditing ? (
            <Controller
              control={control}
              name="defaultPaymentMethod"
              render={({ field: { onChange, value } }) => (
                <View style={styles.paymentOptions}>
                  <TouchableOpacity
                    style={[
                      styles.paymentOption,
                      value === 'card' && styles.selectedPayment,
                    ]}
                    onPress={() => onChange('card')}
                  >
                    <Ionicons name="card-outline" size={24} color="#333" />
                    <Text style={styles.paymentText}>Card</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.paymentOption,
                      value === 'cash' && styles.selectedPayment,
                    ]}
                    onPress={() => onChange('cash')}
                  >
                    <Ionicons name="cash-outline" size={24} color="#333" />
                    <Text style={styles.paymentText}>Cash</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <View style={styles.infoRow}>
              <Ionicons
                name={user?.defaultPaymentMethod === 'card' ? "card-outline" : "cash-outline"}
                size={24}
                color="#333"
              />
              <Text style={styles.infoText}>
                {user?.defaultPaymentMethod === 'card' ? 'Card' : 'Cash'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
          {user?.savedCards?.length > 0 ? (
            user.savedCards.map((card, index) => (
              <View key={index} style={styles.savedCard}>
                <View style={styles.cardInfo}>
                  <Ionicons name="card-outline" size={24} color="#007AFF" />
                  <Text style={styles.cardNumber}>
                    •••• •••• •••• {card.last4}
                  </Text>
                  <Text style={styles.cardExpiry}>
                    Expires {card.expiryDate}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeCard}
                  onPress={() => {
                    // Add logic to remove saved card
                    Alert.alert(
                      "Remove Card",
                      "Are you sure you want to remove this card?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Remove",
                          style: "destructive",
                          onPress: () => {
                            // Add logic to remove saved card
                            const updatedCards = user.savedCards.filter(
                              (c) => c.id !== card.id
                            );
                            dispatch(
                              updateUserProfile({
                                ...user,
                                savedCards: updatedCards,
                              })
                            );
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noCards}>No saved cards</Text>
          )}
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => handleToggleEdit()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  savedCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardNumber: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  cardExpiry: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  removeCard: {
    padding: 8,
  },
  noCards: {
    color: "#666",
    fontStyle: "italic",
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  selectedPayment: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  paymentText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
});

export default ProfileScreen;