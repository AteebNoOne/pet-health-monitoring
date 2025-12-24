import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  Platform,
  PermissionsAndroid
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api/backend";
import { BleManager } from 'react-native-ble-plx';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

export default function AddPetScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [breed, setBreed] = useState("");
  const [petType, setPetType] = useState("");
  const [deviceMacId, setDeviceMacId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scannedDevices, setScannedDevices] = useState([]);
  const [showScanModal, setShowScanModal] = useState(false);
  const [bleManager] = useState(() => new BleManager());

  // BLE Permission Check
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        ]);

        const isGranted =
          result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED;

        return isGranted;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  };

  const scanForDevices = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Bluetooth permissions are required.");
      return;
    }

    try {
      const state = await bleManager.state();

      if (state !== 'PoweredOn') {
        try {
          if (Platform.OS === 'android') {
            const enabled = await RNBluetoothClassic.requestBluetoothEnabled();
            if (enabled) {
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
          Alert.alert("Bluetooth Off", "Could not turn on Bluetooth automatically. Please check Settings.");
          return;
        }
      }
    } catch (e) {
      console.log("Error accessing BLE state:", e);
    }

    setIsScanning(true);
    setScannedDevices([]);
    setShowScanModal(true);

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        if (error.errorCode !== 600) {
          setIsScanning(false);
        }
        return;
      }

      if (device && (device.name === 'PetHealthBelt' || device.localName === 'PetHealthBelt')) {
        setScannedDevices(prev => {
          if (!prev.find(d => d.id === device.id)) {
            return [...prev, device];
          }
          return prev;
        });
      }
    });

    setTimeout(() => {
      bleManager.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };

  const pairDevice = (device) => {
    setDeviceMacId(device.id);
    bleManager.stopDeviceScan();
    setShowScanModal(false);
    Alert.alert("Paired", `Connected to ${device.name} (${device.id})`);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSave = async () => {
    if (!name || !age || !weight || !gender || !breed || !petType) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const user_id = await AsyncStorage.getItem("user_id");

    if (!user_id) {
      Alert.alert("Error", "User not found. Please login again.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", user_id);
    formData.append("pet_name", name);
    formData.append("age", age);
    formData.append("weight", weight);
    formData.append("gender", gender);
    formData.append("breed", breed);
    formData.append("pet_type", petType);
    formData.append("device_mac_id", deviceMacId);

    if (image) {
      formData.append("image_file", {
        uri: image.uri,
        name: "pet.jpg",
        type: "image/jpeg",
      });
    }

    try {
      const res = await fetch(`${BASE_URL}/api/pets/add`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await res.json();

      if (res.status === 201) {
        Alert.alert("Success", "Pet added successfully!");
        navigation.navigate("PetProfileScreen", { refresh: true });
      } else {
        Alert.alert("Error", data.error || "Failed to add pet");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network issue");
    }
  };

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Pet</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Image Picker Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pet Photo</Text>
        <TouchableOpacity onPress={pickImage} style={styles.imagePickerContainer}>
          <Image
            source={
              image
                ? { uri: image.uri }
                : require("../assets/profile1.jpg")
            }
            style={styles.profileImage}
          />
          <View style={styles.imageOverlay}>
            <MaterialCommunityIcons name="camera-plus" size={32} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.imageHint}>Tap to select photo</Text>
      </View>

      {/* Basic Information Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Basic Information</Text>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="tag-outline" size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Pet Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfInput]}>
            <MaterialCommunityIcons name="cake-variant" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <View style={[styles.inputContainer, styles.halfInput]}>
            <MaterialCommunityIcons name="weight" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Weight (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="dog" size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Breed"
            value={breed}
            onChangeText={setBreed}
            placeholderTextColor="#999"
          />
        </View>

        {/* Gender Selection */}
        <Text style={styles.fieldLabel}>Gender</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "Male" && styles.genderButtonSelected,
            ]}
            onPress={() => setGender("Male")}
          >
            <MaterialCommunityIcons
              name="gender-male"
              size={24}
              color={gender === "Male" ? "#fff" : "#666"}
            />
            <Text style={[
              styles.genderText,
              gender === "Male" && styles.genderTextSelected
            ]}>
              Male
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "Female" && styles.genderButtonSelected,
            ]}
            onPress={() => setGender("Female")}
          >
            <MaterialCommunityIcons
              name="gender-female"
              size={24}
              color={gender === "Female" ? "#fff" : "#666"}
            />
            <Text style={[
              styles.genderText,
              gender === "Female" && styles.genderTextSelected
            ]}>
              Female
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pet Type Picker */}
        <Text style={styles.fieldLabel}>Pet Type</Text>
        <View style={styles.pickerContainer}>
          <MaterialCommunityIcons name="paw" size={20} color="#666" style={styles.pickerIcon} />
          <Picker
            selectedValue={petType}
            onValueChange={(itemValue) => setPetType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Pet Type" value="" />
            <Picker.Item label="Dog" value="Dog" />
            <Picker.Item label="Cat" value="Cat" />
          </Picker>
        </View>
      </View>

      {/* Health Belt Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Health Monitoring</Text>
        <Text style={styles.cardSubtitle}>Connect your pet's health belt for real-time monitoring</Text>

        <TouchableOpacity
          style={[
            styles.pairButton,
            deviceMacId && styles.pairButtonPaired
          ]}
          onPress={scanForDevices}
        >
          <MaterialCommunityIcons
            name={deviceMacId ? "check-circle" : "bluetooth"}
            size={24}
            color="#fff"
          />
          <Text style={styles.pairButtonText}>
            {deviceMacId ? `Paired: ${deviceMacId.substring(0, 17)}...` : "Pair Health Belt"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Scanning */}
      <Modal visible={showScanModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Belt</Text>
            {isScanning && <ActivityIndicator size="large" color="#e91e63" />}

            <FlatList
              data={scannedDevices}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.deviceItem} onPress={() => pairDevice(item)}>
                  <MaterialCommunityIcons name="bluetooth" size={24} color="#e91e63" />
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{item.name}</Text>
                    <Text style={styles.deviceId}>{item.id}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#999" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={!isScanning && <Text style={styles.emptyText}>No devices found. Press button on belt.</Text>}
            />

            <TouchableOpacity style={styles.closeButton} onPress={() => {
              if (isScanning) bleManager.stopDeviceScan();
              setIsScanning(false);
              setShowScanModal(false);
            }}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <MaterialCommunityIcons name="content-save" size={24} color="#fff" />
        <Text style={styles.saveButtonText}>Add Pet</Text>
      </TouchableOpacity>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 16,
  },
  imagePickerContainer: {
    alignSelf: "center",
    marginVertical: 16,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    borderWidth: 4,
    borderColor: "#fff",
    elevation: 3,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e91e63",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  imageHint: {
    textAlign: "center",
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    backgroundColor: "#f8f9fa",
    gap: 8,
  },
  genderButtonSelected: {
    borderColor: "#e91e63",
    backgroundColor: "#e91e63",
  },
  genderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  genderTextSelected: {
    color: "#fff",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 12,
  },
  pickerIcon: {
    marginRight: 8,
  },
  picker: {
    flex: 1,
    height: 50,
    color: "#333",
  },
  pairButton: {
    flexDirection: "row",
    backgroundColor: "#3f51b5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    elevation: 3,
    shadowColor: "#3f51b5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  pairButtonPaired: {
    backgroundColor: "#4caf50",
  },
  pairButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    minHeight: 300,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: "#333",
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: "#333",
  },
  deviceId: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: "#999",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#e91e63",
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    elevation: 4,
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
