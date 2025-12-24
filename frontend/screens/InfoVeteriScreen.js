import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BASE_URL } from "../api/backend";

export default function InfoVeteriScreen({ route, navigation }) {
  const { vetId } = route.params;
  const [vet, setVet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVet = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/veterinarians/${vetId}`
        );
        const data = await response.json();
        setVet(data);
      } catch (error) {
        console.error("Failed to fetch veterinarian details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVet();
  }, [vetId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!vet) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={60} color="#ccc" />
        <Text style={styles.errorText}>No details found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Veterinarian Profile</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image
          source={
            vet.image_url
              ? { uri: vet.image_url }
              : require("../assets/profile1.jpg")
          }
          style={styles.profileImage}
        />
        <Text style={styles.name}>{vet.name}</Text>
        {vet.specialist && (
          <View style={styles.specialtyBadge}>
            <MaterialCommunityIcons name="stethoscope" size={16} color="#e91e63" />
            <Text style={styles.specialtyText}>{vet.specialist}</Text>
          </View>
        )}
        {vet.gender && (
          <View style={styles.genderRow}>
            <MaterialCommunityIcons
              name={vet.gender === "Male" ? "gender-male" : "gender-female"}
              size={18}
              color="#999"
            />
            <Text style={styles.genderText}>{vet.gender}</Text>
          </View>
        )}
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>

        <TouchableOpacity
          style={styles.infoCard}
          onPress={() => Linking.openURL(`mailto:${vet.email}`)}
        >
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="email" size={24} color="#e91e63" />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{vet.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoCard}
          onPress={() => Linking.openURL(`tel:${vet.phone}`)}
        >
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="phone" size={24} color="#4caf50" />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{vet.phone}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="map-marker" size={24} color="#ff9800" />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{vet.address}</Text>
          </View>
        </View>
      </View>

      {/* Professional Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Information</Text>

        <View style={styles.infoCard}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="school" size={24} color="#3f51b5" />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Education</Text>
            <Text style={styles.infoValue}>{vet.education}</Text>
          </View>
        </View>

        {vet.description && (
          <View style={styles.infoCard}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="text" size={24} color="#9c27b0" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>About</Text>
              <Text style={styles.infoValue}>{vet.description}</Text>
            </View>
          </View>
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
  headerBackButton: {
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
  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#fff",
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  specialtyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fce4ec",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    marginBottom: 8,
  },
  specialtyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e91e63",
  },
  genderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  genderText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    marginLeft: 4,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#e91e63",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 3,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});