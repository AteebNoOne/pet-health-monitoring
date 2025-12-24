import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, TextInput, Image, ScrollView } from 'react-native';
import temgraph from "../assets/temgraph.png";


const HeartRateScreen = () => {
  const [isAlertOn, setIsAlertOn] = useState(true);

  const toggleSwitch = () => setIsAlertOn(previousState => !previousState);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Heart Rate</Text>

      <View style={styles.iconContainer}>
        <Text style={styles.heartIcon}>💙</Text>
      </View>

      <Text style={styles.normalRange}>Normal heart Rate{"\n"}70 - 180</Text>

      <View style={styles.readingBox}>
        <Text style={styles.bpmValue}>
          110 <Text style={styles.bpmText}>BPM</Text>
        </Text>
        <Text style={styles.normalText}>Normal</Text>
      </View>

        <View style={styles.graphtem_card}>
          <Image source={temgraph} style={styles.tem_graph} />
        </View>

      <View style={styles.alertSection}>
        <Text style={styles.alertLabel}>Alert</Text>
        <Switch
          trackColor={{ false: "#ccc", true: "#007bff" }}
          thumbColor={isAlertOn ? "#fff" : "#fff"}
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
    marginTop: 10,
    alignSelf: 'flex-start',
    color: "#000",
  },
  iconContainer: {
    marginVertical: 10,
  },
  heartIcon: {
    fontSize: 60,
  },
  normalRange: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20
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
  bpmValue: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  bpmText: {
    fontSize: 18,
  },
  normalText: {
    color: 'blue',
    fontSize: 16,
    marginTop: 4,
    color: '#000',
  },
  graphBox: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20
  },
  graphImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
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
    marginRight: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 20
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

export default HeartRateScreen;
