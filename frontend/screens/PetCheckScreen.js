import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  PermissionsAndroid
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import profile1 from "../assets/profile1.jpg";
import temgraph from "../assets/temgraph.png";
import heatgraph from "../assets/temgraph.png";
import * as ImagePicker from "expo-image-picker";
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

const SERVICE_UUID = "0000180d-0000-1000-8000-00805f9b34fb";
const CHAR_UUID = "00002a37-0000-1000-8000-00805f9b34fb";

export default function PetCheckScreen({ navigation, route }) {
  const { pet } = route.params || {};
  const [temperature, setTemperature] = useState("--");
  const [heartRate, setHeartRate] = useState("--");
  const [battery, setBattery] = useState(0);

  const [status, setStatus] = useState("Disconnected");
  const [isConnected, setIsConnected] = useState(false);

  const managerRef = useRef(new BleManager());
  const deviceRef = useRef(null);
  const dataTimeoutRef = useRef(null);
  const monitorSubscriptionRef = useRef(null); // Track monitoring subscription

  useEffect(() => {
    if (!pet?.device_mac_id) {
      Alert.alert("No Belt Paired", "Please pair a health belt for this pet in the profile settings.");
      return;
    }

    const initConnection = async () => {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert("Permission Error", "Bluetooth permissions are required to connect.");
        return;
      }

      const state = await managerRef.current.state();
      if (state !== 'PoweredOn') {
        try {
          if (Platform.OS === 'android') {
            const enabled = await RNBluetoothClassic.requestBluetoothEnabled();
            if (enabled) {
              console.log("Bluetooth enabled by user.");
              // Add a small delay for state to update
              await new Promise(r => setTimeout(r, 1000));
            } else {
              Alert.alert("Bluetooth Off", "User denied enabling Bluetooth.");
              return;
            }
          } else {
            Alert.alert("Bluetooth Off", "Please turn on Bluetooth in Settings.");
            return;
          }
        } catch (e) {
          console.log("Failed to enable Bluetooth:", e);
          Alert.alert("Bluetooth Off", "Could not turn on Bluetooth automatically. Please check Settings.");
          return;
        }
      }

      startConnectionProcess();
    };

    initConnection();

    return () => {
      console.log("Unmounting PetCheckScreen...");
      const manager = managerRef.current;

      // Clear data timeout
      if (dataTimeoutRef.current) {
        clearTimeout(dataTimeoutRef.current);
      }

      // NOTE: Don't manually remove subscription - causes crash on cleanup
      // device.cancelConnection() will automatically clean up all subscriptions
      // if (monitorSubscriptionRef.current) {
      //   monitorSubscriptionRef.current.remove();
      // }

      // Cancel device connection
      if (deviceRef.current) {
        console.log("Cancelling device connection...");
        deviceRef.current.cancelConnection().catch(err => console.log("Error cancelling connection:", err));
        deviceRef.current = null;
      }

      // Stop scan and cleanup
      if (manager) {
        console.log("Stopping scan...");
        manager.stopDeviceScan();
      }

      // Reset state
      setIsConnected(false);
      setStatus("Disconnected");
      setHeartRate("--");
      setTemperature("--");
      setBattery(0);
    };
  }, [pet]);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        ]);
        return (
          result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  };

  const startConnectionProcess = () => {
    setStatus("Searching for Belt...");
    console.log(`Scanning for ${pet.device_mac_id}...`);

    const subscription = managerRef.current.onStateChange((state) => {
      if (state === 'PoweredOn') {
        scanAndConnect();
        subscription.remove();
      }
    }, true);
  };

  const scanAndConnect = () => {
    managerRef.current.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Scan error:", error);
        return;
      }

      // Check if this is our device (ID matches MAC Address)
      if (device && device.id === pet.device_mac_id) {
        console.log("Device found!", device.id);
        managerRef.current.stopDeviceScan();
        setStatus("Connecting...");

        device.connect()
          .then((device) => {
            console.log("Connected to device");
            // Small delay before discovery to let connection stabilize
            return new Promise(resolve => setTimeout(() => resolve(device), 500));
          })
          .then((device) => {
            console.log("Discovering services...");
            return device.discoverAllServicesAndCharacteristics();
          })
          .then(async (device) => {
            deviceRef.current = device;
            setIsConnected(true);
            setStatus("Connected - Negotiating MTU...");

            // Setup Disconnection Listener
            const subscription = device.onDisconnected((error, device) => {
              console.log("Device disconnected abnormally:", error?.message);
              setIsConnected(false);
              setStatus("Disconnected");
              if (dataTimeoutRef.current) clearTimeout(dataTimeoutRef.current);
            });

            // Request larger MTU
            try {
              if (Platform.OS === 'android') {
                await device.requestMTU(512);
                console.log("MTU Requested");
                await new Promise(r => setTimeout(r, 500));
              }
            } catch (e) {
              console.log("MTU Request failed (ignoring):", e);
            }

            setStatus("Connected - Waiting for Data...");

            // Debug: Check services
            try {
              const services = await device.services();
              console.log("Services discovered:", services.map(s => s.uuid));
            } catch (e) { console.log(e); }

            // Monitoring Logic
            const startMonitoring = async () => {
              try {
                // Start monitoring and store subscription
                const subscription = device.monitorCharacteristicForService(SERVICE_UUID, CHAR_UUID, (error, characteristic) => {
                  if (error) {
                    // Null errors happen during cleanup/disconnection - ignore them
                    if (error.errorCode || error.message) {
                      console.log("Monitor Error:", error.message || error);
                    }
                    return;
                  }

                  if (characteristic?.value) {
                    const rawData = Buffer.from(characteristic.value, 'base64').toString('ascii');
                    console.log("RX:", rawData);
                    parseData(rawData);
                  }
                });

                // Store subscription for cleanup
                monitorSubscriptionRef.current = subscription;
                console.log("Monitoring started successfully for", CHAR_UUID);
              } catch (e) {
                console.log("Monitoring failed to start:", e);
              }
            };

            startMonitoring();
          })
          .catch((error) => {
            console.log("Connection/Flow failed:", error);
            setStatus("Connection Failed. Retrying...");
            setIsConnected(false);
            setTimeout(scanAndConnect, 5000);
          });
      }
    });
  };

  const parseData = (dataStr) => {
    // Expected Format: "HR:80.0,Temp:101.5,Bat:85"
    console.log("📥 parseData called with:", dataStr);
    if (!dataStr) return;

    // Reset watchdog on new data
    if (dataTimeoutRef.current) clearTimeout(dataTimeoutRef.current);
    dataTimeoutRef.current = setTimeout(() => {
      setStatus("Connected (No Data)"); // Warn user if stream stops
    }, 3000);

    // Clean string
    const cleanStr = dataStr.replace(/(\r\n|\n|\r)/gm, "");

    try {
      const parts = cleanStr.split(',');
      parts.forEach(part => {
        // Heart Rate validation (Allow any positive reading)
        if (part.startsWith("HR:")) {
          const hr = parseFloat(part.split(':')[1]);
          if (hr > 0 && hr <= 250) { // Any positive reading
            const hrVal = Math.round(hr).toString();
            console.log("💓 Setting HR to:", hrVal);
            setHeartRate(hrVal);
          } else if (hr === 0) {
            console.log("💓 Setting HR to: --");
            setHeartRate("--"); // No finger
          }
        }

        // Temperature validation (Allow room temp for testing: 70-115°F)
        if (part.startsWith("Temp:")) {
          const temp = parseFloat(part.split(':')[1]);
          if (temp >= 70 && temp <= 115) { // Wide range for testing
            const tempVal = temp.toFixed(1);
            console.log("🌡️ Setting Temp to:", tempVal);
            setTemperature(tempVal);
          }
        }

        // Battery validation (0-100%)
        if (part.startsWith("Bat:")) {
          const bat = parseInt(part.split(':')[1]);
          if (bat >= 0 && bat <= 100) {
            console.log("🔋 Setting Battery to:", bat);
            setBattery(bat); // Set as number, not string
          }
        }
      });
      setStatus("Live Data");
      console.log(`✅ Data parsed: HR=${heartRate}, Temp=${temperature}, Bat=${battery}`);
    } catch (e) {
      console.log("Parse error:", e);
    }
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("Camera permission required");
      return;
    }
    const result = await ImagePicker.launchCameraAsync();
    if (!result.canceled) {
      console.log(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Health Monitor</Text>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: "#fff" }}
        contentContainerStyle={styles.container}
      >
        <Image
          source={pet?.image_url ? { uri: pet.image_url } : profile1}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{pet?.pet_name || "Unknown Pet"}</Text>

        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4caf50' : '#ff9800' }]} />
          <Text style={{ color: isConnected ? '#4caf50' : '#ff9800', fontWeight: '600', fontSize: 14 }}>
            {status}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="heart-pulse" size={32} color="#fff" />
            </View>
            <Text style={styles.statValue}>{heartRate}</Text>
            <Text style={styles.statLabel}>Heart Rate</Text>
            <Text style={styles.statUnit}>BPM</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#ff6b6b' }]}>
              <MaterialCommunityIcons name="thermometer" size={32} color="#fff" />
            </View>
            <Text style={styles.statValue}>{temperature}</Text>
            <Text style={styles.statLabel}>Temperature</Text>
            <Text style={styles.statUnit}>°F</Text>
          </View>
        </View>

        {/* Beautiful Battery Indicator */}
        <View style={styles.batteryCard}>
          <View style={styles.batteryHeader}>
            <MaterialCommunityIcons
              name={battery >= 80 ? "battery-high" : battery >= 50 ? "battery-medium" : battery >= 20 ? "battery-low" : "battery-alert"}
              size={28}
              color={battery >= 20 ? "#4caf50" : "#ff5252"}
            />
            <Text style={styles.batteryLabel}>Battery Status</Text>
          </View>

          <View style={styles.batteryBarContainer}>
            <View
              style={[
                styles.batteryBarFill,
                {
                  width: `${battery}%`,
                  backgroundColor: battery >= 50 ? '#4caf50' : battery >= 20 ? '#ff9800' : '#ff5252'
                }
              ]}
            />
          </View>

          <Text style={styles.batteryPercent}>{battery}%</Text>
        </View>

        {/* 
        <View style={styles.inner_container}>
          <Text style={styles.sectionHeader}>Historical Data</Text>
          <Image source={temgraph} style={styles.tem_graph} />

          <Text style={styles.sectionHeader}>Emotion Detection</Text>
          <View style={styles.emotionRow}>
            <TouchableOpacity onPress={openCamera} style={styles.openCameraBtn}>
              <Text style={styles.openCameraBtnText}>Analyze Emotion</Text>
            </TouchableOpacity>
          </View>
        </View>
        */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#fff",
    elevation: 2,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 12,
    color: "#333",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 4,
    borderColor: '#fff',
    elevation: 4,
  },
  name: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e91e63',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
    color: '#333',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  statUnit: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  batteryCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  batteryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  batteryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  batteryBarContainer: {
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  batteryBarFill: {
    height: '100%',
    borderRadius: 12,
    transition: 'width 0.3s ease',
  },
  batteryPercent: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  inner_container: {
    width: "100%",
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
    textAlign: "left",
  },
  tem_graph: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
  },
  emotionRow: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  openCameraBtn: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    backgroundColor: "#1e88e5",
  },
  openCameraBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
