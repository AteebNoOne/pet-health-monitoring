import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CheckPetCard from "../components/CheckPetCard";
import { BASE_URL } from "../api/backend";

export default function PetActivitiesScreen({ navigation }) {
  const [pets, setPets] = useState([]);

  // Fetch pets just like HomeScreen
  const fetchPets = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) return;

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

  // Fetch pets when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [])
  );

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.headerTitle}>Pet Activities</Text>
          <Text style={styles.headerSubtitle}>Monitor your pets' health</Text>
        </View>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="chart-line" size={32} color="#fff" />
        </View>
      </View>

      {/* Pets Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="paw" size={24} color="#e91e63" />
          <Text style={styles.sectionTitle}>Check In</Text>
        </View>

        {pets.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="paw-off" size={60} color="#ccc" />
            <Text style={styles.emptyStateText}>No pets found</Text>
            <Text style={styles.emptyStateSubtext}>
              Add your first pet to start monitoring
            </Text>
            <TouchableOpacity
              style={styles.addPetButton}
              onPress={() => navigation.navigate("Pets")}
            >
              <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
              <Text style={styles.addPetButtonText}>Go to Pets</Text>
            </TouchableOpacity>
          </View>
        ) : (
          pets.map((pet, index) => <CheckPetCard key={index} pet={pet} />)
        )}
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
    textAlign: "center",
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
});
