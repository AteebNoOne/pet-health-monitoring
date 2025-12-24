import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import VetCard from "../components/VenterCard";
import profile1 from "../assets/profile_11386227.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api/backend";

export default function FindVetScreen({ navigation }) {
  const [userType, setUserType] = useState(null);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const type = await AsyncStorage.getItem("user_type");
        setUserType(type);
      } catch (error) {
        console.error("Failed to fetch user_type:", error);
      }
    };
    fetchUserType();
  }, []);

  useEffect(() => {
    const fetchVets = async () => {
      try {
        const user_id = await AsyncStorage.getItem("user_id");
        const user_type = await AsyncStorage.getItem("user_type");

        const response = await fetch(
          `${BASE_URL}/api/veterinarians/?user_id=${user_id}&user_type=${user_type}`
        );

        const data = await response.json();

        const formattedVets = data.map((vet) => ({
          id: vet.id,
          name: vet.name,
          info: vet.specialist,
          image: vet.image_url ? { uri: vet.image_url } : profile1,
        }));

        setVets(formattedVets);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch veterinarians:", error);
        setLoading(false);
      }
    };

    fetchVets();
  }, []);

  const handleDelete = async (vetId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/veterinarians/delete/${vetId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setVets((prev) => prev.filter((vet) => vet.id !== vetId));
      }
    } catch (error) {
      console.error("Failed to delete veterinarian:", error);
    }
  };

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Veterinarians</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Add Veterinarian Card (only for vets) */}
      {userType === "veterinarian" && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.addVetCard}
            onPress={() => navigation.navigate("AddVeterScreen")}
          >
            <View style={styles.addVetIconWrapper}>
              <MaterialCommunityIcons name="plus-circle" size={32} color="#e91e63" />
            </View>
            <View style={styles.addVetTextWrapper}>
              <Text style={styles.addVetTitle}>Add Yourself</Text>
              <Text style={styles.addVetSubtitle}>Register as a veterinarian</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#e91e63" />
          </TouchableOpacity>
        </View>
      )}

      {/* Veterinarians Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="medical-bag" size={24} color="#e91e63" />
          <Text style={styles.sectionTitle}>Available Veterinarians</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e91e63" />
            <Text style={styles.loadingText}>Loading veterinarians...</Text>
          </View>
        ) : vets.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="hospital-building" size={60} color="#ccc" />
            <Text style={styles.emptyStateText}>No veterinarians found</Text>
            <Text style={styles.emptyStateSubtext}>
              Check back later for available veterinarians
            </Text>
          </View>
        ) : (
          vets.map((vet) => (
            <View key={vet.id} style={styles.vetCardWrapper}>
              <VetCard
                name={vet.name}
                info={vet.info}
                image={vet.image}
                userType={userType}
                onEdit={() =>
                  navigation.navigate("EditVeteriScreen", { vetId: vet.id })
                }
                onDelete={() => handleDelete(vet.id)}
                onInfo={() =>
                  navigation.navigate("InfoVeteriScreen", { vetId: vet.id })
                }
              />
            </View>
          ))
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 5,
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  addVetCard: {
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
    marginBottom: 8,
  },
  addVetIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fce4ec",
    justifyContent: "center",
    alignItems: "center",
  },
  addVetTextWrapper: {
    flex: 1,
  },
  addVetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  addVetSubtitle: {
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
  vetCardWrapper: {
    marginBottom: 12,
  },
  loadingContainer: {
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
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