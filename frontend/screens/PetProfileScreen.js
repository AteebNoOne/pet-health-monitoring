import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import profile1 from "../assets/profile_11386227.png";
import { Ionicons } from "@expo/vector-icons";
import PetCard from "../components/PetCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { BASE_URL } from "../api/backend";

const PetProfileScreen = ({ navigation }) => {
  const [pets, setPets] = useState([]);
  const isFocused = useIsFocused();

  const fetchPets = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) return;

      const response = await fetch(
        `${BASE_URL}/api/pets?user_id=${userId}&t=${Date.now()}`
      );
      if (!response.ok) throw new Error("Failed to fetch pets");

      const data = await response.json();
      setPets(data);
    } catch (error) {
      console.error("Error fetching pets:", error);
    }
  };

  const handleDelete = async (petId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/pets/${petId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete pet");

      const data = await response.json();
      Alert.alert("Success", data.message);

      setPets((prevPets) => prevPets.filter((pet) => pet.id !== petId));
    } catch (error) {
      Alert.alert("Error", "Failed to delete pet");
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchPets();
    }
  }, [isFocused]);

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.headerTitle}>My Pets</Text>
          <Text style={styles.headerSubtitle}>Manage your pet profiles</Text>
        </View>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="paw" size={32} color="#fff" />
        </View>
      </View>

      {/* Add Pet Card */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.addPetCard}
          onPress={() => navigation.navigate("AddPetScreen")}
        >
          <View style={styles.addPetIconWrapper}>
            <MaterialCommunityIcons name="plus-circle" size={32} color="#e91e63" />
          </View>
          <View style={styles.addPetTextWrapper}>
            <Text style={styles.addPetTitle}>Add a Pet</Text>
            <Text style={styles.addPetSubtitle}>Create new pet profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#e91e63" />
        </TouchableOpacity>
      </View>

      {/* Pet Profiles Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="dog" size={24} color="#e91e63" />
          <Text style={styles.sectionTitle}>Pet Profiles</Text>
        </View>

        {pets.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="paw-off" size={60} color="#ccc" />
            <Text style={styles.emptyStateText}>No pets yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add your first pet to get started!
            </Text>
          </View>
        ) : (
          <View style={styles.petsContainer}>
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} onDelete={handleDelete} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

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
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
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
  addPetCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    gap: 16,
  },
  addPetIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fce4ec",
    justifyContent: "center",
    alignItems: "center",
  },
  addPetTextWrapper: {
    flex: 1,
  },
  addPetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  addPetSubtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 2,
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
  petsContainer: {
    gap: 12,
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
    textAlign: "center",
  },
});

export default PetProfileScreen;
