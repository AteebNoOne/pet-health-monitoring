import React, { useState } from "react";
import { View, TextInput, Text, Image, StyleSheet, ScrollView, Switch, TouchableOpacity } from "react-native";
import temgraph from "../assets/temgraph.png";

const TemperatureScreen = () => {
  const [isAlertOn, setIsAlertOn] = useState(true);
  const toggleSwitch = () => setIsAlertOn(prev => !prev);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Temperature</Text>

      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🌡️</Text>
      </View>

      <Text style={styles.normalRange}>Normal Temperature{"\n"}97°F - 99°F</Text>

      <View style={styles.readingBox}>
        <Text style={styles.readingValue}>
          102.0 <Text style={styles.unitText}>°F</Text>
        </Text>
        <Text style={styles.statusText}>Normal</Text>
      </View>

      <View style={styles.graphtem_card}>
        <Image source={temgraph} style={styles.tem_graph} />
      </View>

      <View style={styles.alertSection}>
        <Text style={styles.alertLabel}>Alert</Text>
        <Switch
          trackColor={{ false: "#ccc", true: "#007bff" }}
          thumbColor="#fff"
          ios_backgroundColor="#ccc"
          onValueChange={toggleSwitch}
          value={isAlertOn}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Notify if abnormal"
        placeholderTextColor="#000"
      />

      <TouchableOpacity style={styles.alertButton}>
        <Text style={styles.alertButtonText}>Alert</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    flexGrow: 1
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    color: "#000",
  },
  iconContainer: {
    marginVertical: 10,
  },
  icon: {
    fontSize: 60,
  },
  normalRange: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
    color: "#000"
  },
  readingBox: {
    backgroundColor: "#fff",
    borderColor: "#A9A9A9",
    borderWidth: 1,
    padding: 50,
    borderRadius: 20,
    marginTop: 30,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  readingValue: {
    fontSize: 30,
    fontWeight: 'bold',
    color: "#000",
  },
  unitText: {
    fontSize: 18,
    color: "#000",
  },
  statusText: {
    fontSize: 16,
    marginTop: 4,
    color: '#000',
  },
  graphtem_card: {
    backgroundColor: "#fff",
    borderColor: "#A9A9A9",
    borderWidth: 1,
    padding: 10,
    borderRadius: 20,
    marginTop: 30,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  tem_graph: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },
  alertSection: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    width:'100%',
  },
  alertLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
    color: "#000"
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 20,
    backgroundColor: "#fff",
    color: "#000"
  },
  alertButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center'
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default TemperatureScreen;
