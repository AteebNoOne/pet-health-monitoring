import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import profile1 from '../assets/profile1.jpg';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

      <View style={styles.infoSection}>
        <Text style={styles.name}>{pet?.pet_name || "Unnamed Pet"}</Text>
        <View style={styles.detailsRow}>
          <MaterialCommunityIcons name="paw" size={14} color="#999" />
          <Text style={styles.detailsText}>{pet?.pet_type || "Pet"}</Text>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('EditedPetScreen', { pet_id: pet.id })}
        >
          <MaterialCommunityIcons name="square-edit-outline" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, styles.deleteButton]}
          onPress={confirmDelete}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 2,
  },
  infoSection: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#e91e63',
    shadowColor: '#e91e63',
  },
});

export default PetCard;
