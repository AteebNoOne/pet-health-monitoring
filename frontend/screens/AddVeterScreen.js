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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import profile1 from "../assets/profile1.jpg";
import { Ionicons } from "@expo/vector-icons";
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
          <TouchableOpacity
            onPress={() => navigation.navigate("FindVenterScreen")}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Find Veterinarian</Text>
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

        {/* Existing Inputs */}
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Education Qualification"
          value={education}
          onChangeText={setEducation}
        />

        {/* 👇 New Specialist Input */}
        <TextInput
          style={styles.input}
          placeholder="Specialist (e.g., Surgery, Dermatology)"
          value={specialist}
          onChangeText={setSpecialist}
        />

        {/* 👇 New Gender Picker */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingHorizontal: 2,
    backgroundColor: "#fff",
    flexGrow: 1,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 50,
    marginBottom: 30,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    marginLeft: 10,
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
    color: "#1e88e5",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "90%",
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
    width: "90%",
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
    backgroundColor: "#1e88e5",
    paddingVertical: 14,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
