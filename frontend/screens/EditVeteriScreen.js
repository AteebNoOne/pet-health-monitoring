import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../api/backend";

export default function EditVeteriScreen({ route, navigation }) {
  const { vetId } = route.params || {};
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [education, setEducation] = useState("");
  const [description, setDescription] = useState("");
  const [specialist, setSpecialist] = useState("");
  const [gender, setGender] = useState("");

  // ✅ Fetch vet details
  useEffect(() => {
    const fetchVetData = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/veterinarians/${vetId}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        setName(data.name || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setEmail(data.email || "");
        setEducation(data.education || "");
        setDescription(data.description || "");
        setSpecialist(data.specialist || "");
        setGender(data.gender || "");
        setImage(data.image_url ? { uri: data.image_url } : null);
      } catch (error) {
        Alert.alert("Error", "Something went wrong while fetching veterinarian");
        navigation.goBack();
      }
    };
    fetchVetData();
  }, [vetId]);

  // ✅ Pick image
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });
      if (!result.canceled) setImage(result.assets[0]);
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // ✅ Update vet details
  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("email", email);
    formData.append("education", education);
    formData.append("description", description);
    formData.append("specialist", specialist);
    formData.append("gender", gender);

    if (image && !image.uri.startsWith("http")) {
      formData.append("image_file", {
        uri: image.uri,
        type: "image/jpeg",
        name: "vet.jpg",
      });
    }

    try {
      const response = await fetch(
      `${BASE_URL}/api/veterinarians/${vetId}`,
      { method: "PUT", body: formData }
    );
      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Veterinarian updated successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", data.error || "Update failed");
      }
    } catch (error) {
      console.error("❌ Update error:", error);
      Alert.alert("Error", "Something went wrong while updating vet");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTxt}>Find Veterinarian</Text>
      </View>

      {/* Image */}
      <View style={styles.imageCenter}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={image ? image : require("../assets/profile1.jpg")}
            style={styles.profileImage}
          />
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Education"
        value={education}
        onChangeText={setEducation}
      />
      <TextInput
        style={styles.input}
        placeholder="Specialist"
        value={specialist}
        onChangeText={setSpecialist}
      />

      {/* ✅ Gender selection */}
      <View style={styles.genderWrapper}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === "Male" && styles.genderSelected,
            ]}
            onPress={() => setGender("Male")}
          >
            <Text
              style={[
                styles.genderText,
                gender === "Male" && styles.genderTextSelected,
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === "Female" && styles.genderSelected,
            ]}
            onPress={() => setGender("Female")}
          >
            <Text
              style={[
                styles.genderText,
                gender === "Female" && styles.genderTextSelected,
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
        <Text style={styles.saveButtonText}>Save changes</Text>
      </TouchableOpacity>
    </ScrollView>
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
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 50,
    marginBottom: 30,
    backgroundColor: "#fff",
  },
  headerTxt: {
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
  genderWrapper: {
    width: "90%",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderOption: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
  },
  genderSelected: {
    backgroundColor: "blue",
    borderColor: "blue",
  },
  genderText: {
    color: "black",
    fontWeight: "600",
  },
  genderTextSelected: {
    color: "white",
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
