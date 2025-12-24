import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

const conditionsData = {
  Vomiting: {
    title: "Indigestion",
    summary: "May be caused by dietary issues or sudden changes in food",
    firstAid: "Withhold food for 12–24h. Ensure access to fresh water.",
  },
  Coughing: {
    title: "Respiratory Irritation",
    summary: "Could be due to allergens or airway inflammation.",
    firstAid: "Keep pet calm and avoid dusty areas. Seek vet if persistent.",
  },
  "High Heart Beats": {
    title: "Stress or Overexertion",
    summary: "Heart rate may rise from excitement, heat, or stress.",
    firstAid: "Let pet rest in a cool place and hydrate.",
  },
  "High Temperature": {
    title: "Fever",
    summary: "Indicates possible infection or inflammation.",
    firstAid: "Provide cool environment, visit vet if fever persists.",
  },
};

export default function ExploreNewFeature({ navigation }) {
  const [selectedSymptom, setSelectedSymptom] = useState("Vomiting");

  const condition = conditionsData[selectedSymptom];

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Advice</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Symptom Selector */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="stethoscope" size={24} color="#e91e63" />
          <Text style={styles.sectionTitle}>Select Symptom</Text>
        </View>

        <View style={styles.pickerCard}>
          <MaterialCommunityIcons name="alert-circle" size={20} color="#666" style={styles.pickerIcon} />
          <Picker
            selectedValue={selectedSymptom}
            onValueChange={(itemValue) => setSelectedSymptom(itemValue)}
            style={styles.picker}
          >
            {Object.keys(conditionsData).map((symptom) => (
              <Picker.Item label={symptom} value={symptom} key={symptom} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Diagnosis Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="medical-bag" size={24} color="#e91e63" />
          <Text style={styles.sectionTitle}>Possible Condition</Text>
        </View>

        <View style={styles.diagnosisCard}>
          <View style={styles.diagnosisHeader}>
            <MaterialCommunityIcons name="heart-pulse" size={32} color="#e91e63" />
            <Text style={styles.diagnosisTitle}>{condition.title}</Text>
          </View>

          {/* Summary */}
          <View style={styles.infoSection}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons name="information" size={20} color="#3f51b5" />
              <Text style={styles.infoHeaderText}>Summary</Text>
            </View>
            <Text style={styles.infoText}>{condition.summary}</Text>
          </View>

          {/* First Aid */}
          <View style={styles.infoSection}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons name="hospital-box" size={20} color="#4caf50" />
              <Text style={styles.infoHeaderText}>First Aid</Text>
            </View>
            <Text style={styles.infoText}>{condition.firstAid}</Text>
          </View>

          {/* Warning */}
          <View style={styles.warningBanner}>
            <MaterialCommunityIcons name="alert" size={20} color="#ff9800" />
            <Text style={styles.warningText}>
              This is general advice. Consult a veterinarian for proper diagnosis.
            </Text>
          </View>
        </View>
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
  pickerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  pickerIcon: {
    marginRight: 8,
  },
  picker: {
    flex: 1,
    height: 50,
    color: "#333",
  },
  diagnosisCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  diagnosisHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  diagnosisTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  infoHeaderText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  infoText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    paddingLeft: 28,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#e65100",
    fontWeight: "500",
  },
});