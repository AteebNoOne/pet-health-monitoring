import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import CheckPetCard from "../components/CheckPetCard";
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { PetsContext } from "../components/PetsContext";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// profile icon
import profile1 from "../assets/profile_11386227.png";
import { BASE_URL } from "../api/backend";

export default function HomeScreen({ navigation }) {
  const [pets, setPets] = useState([]);
  const { refreshPets, setRefreshPets } = useContext(PetsContext);
  const [userType, setUserType] = useState(null);
  const [username, setUsername] = useState("");

  // fetch pets
  const fetchPets = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");

      if (!userId) {
        return;
      }

      const response = await fetch(
        `${BASE_URL}/api/pets?user_id=${userId}`
      );
      if (!response.ok) throw new Error("Failed to fetch pets");

      const data = await response.json();
      setPets(data);
    } catch (error) {
      console.error("Error fetching pets:", error);
    }
  };

  // fetch user type and username
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const type = await AsyncStorage.getItem("user_type");
        const name = await AsyncStorage.getItem("username");
        setUserType(type);
        setUsername(name || "User");
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [])
  );

  useEffect(() => {
    if (refreshPets) {
      fetchPets();
      setRefreshPets(false);
    }
  }, [refreshPets]);

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.greetingText}>Welcome back,</Text>
          <Text style={styles.usernameText}>{username}!</Text>
        </View>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="paw" size={32} color="#fff" />
        </View>
      </View>

      {/* Pets Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="dog" size={24} color="#e91e63" />
          <Text style={styles.sectionTitle}>My Pets</Text>
        </View>

        {pets.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="paw-off" size={60} color="#ccc" />
            <Text style={styles.emptyStateText}>No pets added yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add your first pet to get started!
            </Text>
            <TouchableOpacity
              style={styles.addPetButton}
              onPress={() => navigation.navigate("PetProfileScreen")}
            >
              <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
              <Text style={styles.addPetButtonText}>Add Pet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          pets.map((pet, index) => <CheckPetCard key={index} pet={pet} />)
        )}
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="star-circle" size={24} color="#e91e63" />
          <Text style={styles.sectionTitle}>Explore Features</Text>
        </View>

        <View style={styles.featuresGrid}>
          <TouchableOpacity
            style={[styles.featureCard, styles.featureCardPrimary]}
            onPress={() => navigation.navigate("FindVenterScreen")}
          >
            <View style={styles.featureIconWrapper}>
              <MaterialCommunityIcons name="heart-pulse" size={32} color="#fff" />
            </View>
            <Text style={styles.featureTitle}>Find Veterinarians</Text>
            <Text style={styles.featureSubtitle}>Connect with experts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.featureCard, styles.featureCardSecondary]}
            onPress={() => navigation.navigate("MedicalAdvice")}
          >
            <View style={styles.featureIconWrapper}>
              <FontAwesome5 name="user-md" size={32} color="#fff" />
            </View>
            <Text style={styles.featureTitle}>Medical Advice</Text>
            <Text style={styles.featureSubtitle}>Get expert guidance</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.featureCard, styles.featureCardEmergency]}
          onPress={() => navigation.navigate("EmergencyScreen")}
        >
          <View style={styles.emergencyIconWrapper}>
            <MaterialCommunityIcons name="medical-bag" size={28} color="#fff" />
          </View>
          <View style={styles.emergencyTextWrapper}>
            <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
            <Text style={styles.emergencySubtitle}>Quick access to help</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: "#e91e63",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  welcomeSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
    fontWeight: "400",
  },
  usernameText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginTop: 4,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    marginBottom: 20,
  },
  addPetButton: {
    flexDirection: "row",
    backgroundColor: "#e91e63",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: "center",
    gap: 8,
    elevation: 3,
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addPetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  featuresGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  featureCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  featureCardPrimary: {
    flex: 1,
    backgroundColor: "#e91e63",
  },
  featureCardSecondary: {
    flex: 1,
    backgroundColor: "#3f51b5",
  },
  featureCardEmergency: {
    flexDirection: "row",
    backgroundColor: "#ff5252",
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 12,
  },
  featureIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
    textAlign: "center",
  },
  emergencyIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyTextWrapper: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  emergencySubtitle: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.9,
    marginTop: 2,
  },
});
