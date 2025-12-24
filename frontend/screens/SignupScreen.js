import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api/backend";

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [userType, setUserType] = useState("pet_owner");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          useremail: email,
          userpassword: password,
          gender,
          userType,
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        await AsyncStorage.setItem("user_type", userType.toLowerCase());
        Alert.alert("Success", "User registered successfully!");
        navigation.navigate("Login");
      } else {
        Alert.alert("Error", data.error || "Signup failed");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network issue");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.wrapper}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="paw" size={48} color="#fff" />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our pet care community</Text>
        </View>

        {/* Card Container */}
        <View style={styles.card}>
          {/* Username Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrapper}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#666" />
            </View>
            <TextInput
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              placeholderTextColor="#999"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrapper}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#666" />
            </View>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#666" />
            </View>
            <TextInput
              placeholder="Password"
              value={password}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              style={styles.input}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Gender Input (Optional) */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrapper}>
              <MaterialCommunityIcons name="gender-male-female" size={20} color="#666" />
            </View>
            <TextInput
              placeholder="Gender (optional)"
              value={gender}
              onChangeText={setGender}
              style={styles.input}
              placeholderTextColor="#999"
            />
          </View>

          {/* User Type Selection */}
          <Text style={styles.sectionLabel}>I am a:</Text>
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                userType === "pet_owner" && styles.radioButtonSelected,
              ]}
              onPress={() => setUserType("pet_owner")}
            >
              <View style={styles.radioCircleWrapper}>
                <View
                  style={[
                    styles.radioCircle,
                    userType === "pet_owner" && styles.selectedRadio,
                  ]}
                >
                  {userType === "pet_owner" && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
              <MaterialCommunityIcons name="paw" size={20} color={userType === "pet_owner" ? "#e91e63" : "#666"} />
              <Text style={[styles.radioText, userType === "pet_owner" && styles.radioTextSelected]}>
                Pet Owner
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioButton,
                userType === "veterinarian" && styles.radioButtonSelected,
              ]}
              onPress={() => setUserType("veterinarian")}
            >
              <View style={styles.radioCircleWrapper}>
                <View
                  style={[
                    styles.radioCircle,
                    userType === "veterinarian" && styles.selectedRadio,
                  ]}
                >
                  {userType === "veterinarian" && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
              <MaterialCommunityIcons name="medical-bag" size={20} color={userType === "veterinarian" ? "#e91e63" : "#666"} />
              <Text style={[styles.radioText, userType === "veterinarian" && styles.radioTextSelected]}>
                Veterinarian
              </Text>
            </TouchableOpacity>
          </View>

          {/* Signup Button */}
          <TouchableOpacity onPress={handleSignup} style={styles.button}>
            <Text style={styles.buttonText}>Create Account</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.link}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e91e63",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputIconWrapper: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    padding: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  radioButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    backgroundColor: "#f8f9fa",
    gap: 8,
  },
  radioButtonSelected: {
    borderColor: "#e91e63",
    backgroundColor: "#fff",
  },
  radioCircleWrapper: {
    marginRight: 4,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  selectedRadio: {
    borderColor: "#e91e63",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e91e63",
  },
  radioText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  radioTextSelected: {
    color: "#e91e63",
    fontWeight: "700",
  },
  button: {
    backgroundColor: "#e91e63",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
    elevation: 3,
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 18,
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  linkText: {
    fontSize: 14,
    color: "#666",
  },
  link: {
    fontSize: 14,
    color: "#e91e63",
    fontWeight: "700",
  },
});
