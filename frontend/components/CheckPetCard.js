import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import profile1 from '../assets/profile1.jpg';
import { useNavigation } from '@react-navigation/native';

const CheckPetCard = ({ pet }) => {
  const navigation = useNavigation();
  useEffect(() => {
  }, [pet]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PetCheckScreen', { pet })}
      activeOpacity={0.7}
    >
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

      <View style={styles.checkInButton}>
        <MaterialCommunityIcons name="heart-pulse" size={20} color="#fff" />
      </View>
    </TouchableOpacity>
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
  checkInButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e91e63',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default CheckPetCard;
