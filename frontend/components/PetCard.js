import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import profile1 from '../assets/profile1.jpg';
import { useNavigation } from '@react-navigation/native';

const PetCard = ({ pet, onDelete }) => {
  const navigation = useNavigation();

  const confirmDelete = () => {
    Alert.alert(
      "Delete Pet",
      "Are you sure you want to delete this pet?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(pet.id) },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <Image
        source={pet?.image_url ? { uri: pet.image_url } : profile1}
        style={styles.profileImage}
      />
      <Text style={styles.name}>{pet?.pet_name || "Unnamed Pet"}</Text>

      <TouchableOpacity
        style={styles.cardButton}
        onPress={() => navigation.navigate('EditedPetScreen', { pet_id: pet.id })}>
        <Text style={styles.buttonText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deletecardButton}
        onPress={confirmDelete}>
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
    borderRadius: 12,
    elevation: 5,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardButton: {
    marginLeft: 'auto',
    backgroundColor: 'blue',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  deletecardButton: {
    marginLeft: 10,
    backgroundColor: 'red',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default PetCard;
