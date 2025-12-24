import { useState, useEffect, useContext } from "react";
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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { PetsContext } from "../components/PetsContext";
import { BASE_URL } from "../api/backend";

export default function EditPetScreen({ route, navigation }) {
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

  const pickImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission required", "Please allow access to your photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
        allowsMultipleSelection: false,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleUpdate = async () => {
    if (!name || !age || !weight || !gender || !breed || !petType) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

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
        setRefreshPets(true);
        Alert.alert("Success", "Pet updated successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", data.error || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Something went wrong while updating pet");
    }
  };

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Pet</Text>
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
        <Text style={styles.imageHint}>Tap to change photo</Text>
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

      {/* Update Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
        <MaterialCommunityIcons name="content-save" size={24} color="#fff" />
        <Text style={styles.saveButtonText}>Save Changes</Text>
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

