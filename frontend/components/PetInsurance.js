import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const cardData = [
  {
    icon: "thermometer",
    label: "Temperature",
    screen: "TemperatureScreen",
  },
  {
    icon: "heart-pulse",
    label: "Heart Beats",
    screen: "HeartBeatScreen",
  },
  {
    icon: "eye", 
    label: "Behaviour Lacking",
    screen: "BehaviourScreen",
  },
  {
    icon: "alert-circle-outline",
    label: "Emergency",
    screen: "EmergencyScreen",
  },
];

const PetInsurance = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {cardData.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={30}
             color={["heart-pulse", "alert-circle-outline"].includes(item.icon) ? "#e53935" : "#1e88e5"}
              style={styles.icon}
            />
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFF",
    padding: 8,
    paddingRight: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default PetInsurance;
