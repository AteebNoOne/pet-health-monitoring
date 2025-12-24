import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const EmergencyCareScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Care</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Hero Section */}
      <View style={styles.heroCard}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="alert-octagon" size={60} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>24/7 Emergency Support</Text>
        <Text style={styles.heroSubtitle}>
          Access quick care for urgent health issues, at any hour
        </Text>
      </View>

      {/* Symptoms Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="alert-circle" size={24} color="#ff5252" />
          <Text style={styles.sectionTitle}>Symptoms of Emergency</Text>
        </View>

        <View style={styles.symptomsCard}>
          <View style={styles.symptomItem}>
            <MaterialCommunityIcons name="lungs" size={24} color="#ff5252" />
            <Text style={styles.symptomText}>Difficulty breathing</Text>
          </View>

          <View style={styles.symptomItem}>
            <MaterialCommunityIcons name="pulse" size={24} color="#ff5252" />
            <Text style={styles.symptomText}>Seizures</Text>
          </View>

          <View style={styles.symptomItem}>
            <MaterialCommunityIcons name="hospital" size={24} color="#ff5252" />
            <Text style={styles.symptomText}>Collapse or unconsciousness</Text>
          </View>

          <View style={styles.symptomItem}>
            <MaterialCommunityIcons name="bandage" size={24} color="#ff5252" />
            <Text style={styles.symptomText}>Major injury or bleeding</Text>
          </View>

          <View style={styles.symptomItem}>
            <MaterialCommunityIcons name="thermometer-alert" size={24} color="#ff5252" />
            <Text style={styles.symptomText}>Severe fever or poisoning</Text>
          </View>
        </View>
      </View>

      {/* Warning Banner */}
      <View style={styles.warningBanner}>
        <MaterialCommunityIcons name="information" size={20} color="#ff5252" />
        <Text style={styles.warningText}>
          If your pet shows any of these symptoms, seek immediate veterinary care
        </Text>
      </View>

      {/* Find Emergency Vet Button */}
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={() => navigation.navigate("FindVenterScreen")}
      >
        <MaterialCommunityIcons name="hospital-marker" size={24} color="#fff" />
        <Text style={styles.emergencyButtonText}>Find Emergency Vet</Text>
      </TouchableOpacity>
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
    backgroundColor: "#ff5252",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 5,
    shadowColor: "#ff5252",
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
  heroCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ff5252",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
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
  symptomsCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    gap: 16,
  },
  symptomItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 8,
  },
  symptomText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ff5252",
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#c62828",
    fontWeight: "500",
    lineHeight: 20,
  },
  emergencyButton: {
    flexDirection: "row",
    backgroundColor: "#ff5252",
    paddingVertical: 18,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    elevation: 5,
    shadowColor: "#ff5252",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  emergencyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default EmergencyCareScreen;
