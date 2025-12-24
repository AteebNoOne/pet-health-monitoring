import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BehaviourScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Behaviour</Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.behaviourButton}>
          <Text style={styles.buttonText}>Eating</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.behaviourButton}>
          <Text style={styles.buttonText}>Sleeping</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.behaviourButton}>
          <Text style={styles.buttonText}>Activity</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.behaviourButtonRow}>
          <Text style={styles.buttonText}>View camera</Text>
          <Ionicons name="videocam" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.tipsHeader}>Tips</Text>

      <View style={styles.tipBox}>
        <Text style={styles.tipText}>Encourage play for{"\n"}at least 50 minutes a day</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#000",
  },
  buttonGroup: {
    gap: 15,
    marginBottom: 40,
  },
  behaviourButton: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  behaviourButtonRow: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#000",
  },
  tipsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  tipBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#fff",
  },
  tipText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
  },
});

export default BehaviourScreen;
