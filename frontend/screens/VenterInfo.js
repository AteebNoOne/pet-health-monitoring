import React, { useState, useEffect, useContext } from "react";
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
import { Picker } from "@react-native-picker/picker";
import { PetsContext } from "../components/PetsContext"; 
import { BASE_URL } from "../api/backend";

export default function VenterInfo({ route, navigation }) {
  const { pet_id } = route.params || {};
  const { setRefreshPets } = useContext(PetsContext); 

  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [breed, setBreed] = useState("");
  const [petType, setPetType] = useState("");

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/pets/${pet_id}`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        setName(data.pet_name || "");
        setAge(data.age || "");
        setWeight(data.weight || "");
        setGender(data.gender || "");
        setBreed(data.breed || "");
        setPetType(data.pet_type || "");
        setImage(data.image_url ? { uri: data.image_url } : null);
      } catch (error) {
        Alert.alert("Error", "Something went wrong while fetching pet");
      }
    };
    fetchPetData();
  }, [pet_id]);



  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("pet_name", name);
    formData.append("age", age);
    formData.append("weight", weight);
    formData.append("gender", gender);
    formData.append("breed", breed);
    formData.append("pet_type", petType);

    if (image && !image.uri.startsWith("http")) {
      formData.append("image_file", {
        uri: image.uri,
        type: "image/jpeg",
        name: "pet.jpg",
      });
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/pets/${pet_id}`,
        { method: "PUT", body: formData }
      );
      const data = await response.json();

      if (response.ok) {
        // ✅ Trigger refresh in PetProfileScreen
        setRefreshPets(true);

        Alert.alert("Success", "Pet updated successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", data.error || "Update failed");
      }
    } catch (error) {
      console.error("❌ Update error:", error);
      Alert.alert("Error", "Something went wrong while updating pet");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headRow}>
        <TouchableOpacity
          onPress={() => navigation.navigate("PetProfileScreen")}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTxt}>Pets</Text>
      </View>

      <View style={styles.imageCenter}>
        <Image
          source={image ? image : require("../assets/profile1.jpg")}
          style={styles.profileImage}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Weight"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />

      {/* ✅ Gender Field */}
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
        style={styles.input}
        placeholder="Breed"
        value={breed}
        onChangeText={setBreed}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={petType}
          onValueChange={(itemValue) => setPetType(itemValue)}
        >
          <Picker.Item label="Select Pet Type" value="" />
          <Picker.Item label="Dog" value="Dog" />
          <Picker.Item label="Cat" value="Cat" />
        </Picker>
      </View>

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

  // ✅ Gender styling
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

  pickerContainer: {
    width: "90%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fafafa",
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
