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
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import profile1 from "../assets/profile1.jpg";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker"; // 👈 for dropdown
import { BASE_URL } from "../api/backend";

export default function AddVeteriScreen({ navigation }) {
  const [image, setImage] = useState(profile1);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [education, setEducation] = useState("");
  const [description, setDescription] = useState("");
  const [specialist, setSpecialist] = useState("");
  const [gender, setGender] = useState("");
  const [genderModalVisible, setGenderModalVisible] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage({ uri: result.assets[0].uri });
    }
  };

const handleSave = async () => {
  const user_id = await AsyncStorage.getItem("user_id");

  if (!user_id) {
    Alert.alert("Error", "User not found. Please login again.");
    return;
  }

  const formData = new FormData();
  formData.append("user_id", user_id);
  formData.append("name", name);
  formData.append("address", address);
  formData.append("email", email);
  formData.append("phone", phone);
  formData.append("education", education);
  formData.append("description", description);
  formData.append("specialist", specialist);
  formData.append("gender", gender);

  if (image) {
    formData.append("image_file", {
      uri: image.uri,
      name: "veteri.jpg",
      type: "image/jpeg",
    });
  }

  try {
    const res = await fetch(`${BASE_URL}/api/veterinarians/add`, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const data = await res.json();

    if (res.status === 201) {
      Alert.alert("Success", "Veterinarian added successfully!");
      navigation.navigate("FindVenterScreen", { refresh: true });
    } else {
      Alert.alert("Error", data.error || "Failed to add veterinarian");
    }
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Network issue");
  }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={30} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerText}>Add Veterinarian</Text>

          <View style={styles.headerIconCircle}>
            <MaterialCommunityIcons name="stethoscope" size={28} color="#fff" />
          </View>
        </View>

        <View style={styles.imageCenter}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={typeof image === "number" ? image : { uri: image.uri }}
              style={styles.profileImage}
            />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Card with inputs */}
        <View style={styles.cardContainer}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Education Qualification"
            value={education}
            onChangeText={setEducation}
            placeholderTextColor="#999"
          />

          {/* Specialist */}
          <TextInput
            style={styles.input}
            placeholder="Specialist (e.g., Surgery, Dermatology)"
            value={specialist}
            onChangeText={setSpecialist}
            placeholderTextColor="#999"
          />

          {/* Gender Picker */}
          <View style={styles.pickerContainer}>
            {Platform.OS === 'android' ? (
              <>
                <TouchableOpacity style={styles.pickerTouchable} onPress={() => setGenderModalVisible(true)}>
                  <Text style={[styles.pickerText, gender ? { color: '#333' } : { color: '#999' }]}>{gender || 'Select Gender'}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#999" />
                </TouchableOpacity>

                <Modal visible={genderModalVisible} transparent animationType="fade" onRequestClose={() => setGenderModalVisible(false)}>
                  <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setGenderModalVisible(false)}>
                    <View style={styles.modalSheet}>
                      {['Male', 'Female', 'Other'].map((g) => (
                        <TouchableOpacity key={g} style={styles.modalItem} onPress={() => { setGender(g); setGenderModalVisible(false); }}>
                          <Text style={styles.modalItemText}>{g}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Modal>
              </>
            ) : (
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
                style={[styles.picker, { color: '#333' }]}
                dropdownIconColor="#999"
                itemStyle={{ color: '#333' }}
                mode="dropdown"
              >
                <Picker.Item label="Select Gender" value="" color="#999" />
                <Picker.Item label="Male" value="Male" color="#333" />
                <Picker.Item label="Female" value="Female" color="#333" />
                <Picker.Item label="Other" value="Other" color="#333" />
              </Picker>
            )}
          </View>

          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingHorizontal: 0,
    backgroundColor: "#f8f9fa",
    flexGrow: 1,
    alignItems: "stretch",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    alignSelf: "stretch",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    marginBottom: 8,
    backgroundColor: "#e91e63",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    padding: 6,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "700",
    marginLeft: 6,
    color: '#fff'
  },
  headerIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageCenter: {
    alignItems: "center",
    width: "100%",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
    marginBottom: 10,
  },
  changePhotoText: {
    color: "#e91e63",
    marginBottom: 20,
    textAlign: "center",
  },
  cardContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    marginBottom: 16,
  },
  input: {
    width: "100%",
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  pickerContainer: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  picker: {
    height: 48,
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#e91e63",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    width: "95%",
    alignSelf: 'center',
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  pickerTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  pickerText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
});
