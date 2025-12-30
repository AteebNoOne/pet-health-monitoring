import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import profile1 from '../assets/profile1.jpg';
import { useNavigation } from '@react-navigation/native';

const CheckPetCard = ({ pet }) => {
  const navigation = useNavigation();
  useEffect(() => {
  }, [pet]);

  // Check if the pet is a cat
  const isCat = pet?.pet_type?.toLowerCase() === 'cat';
  // Check if the pet is a dog
  const isDog = pet?.pet_type?.toLowerCase() === 'dog';

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

      {/* Buttons container - show emotion buttons for cats and dogs */}
      <View style={styles.buttonsContainer}>
        {isCat && (
          <TouchableOpacity
            style={styles.emotionButton}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('CatEmotionScreen', { pet });
            }}
          >
            <MaterialCommunityIcons name="emoticon-happy-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {isDog && (
          <TouchableOpacity
            style={[styles.emotionButton, styles.dogEmotionButton]}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('DogEmotionScreen', { pet });
            }}
          >
            <MaterialCommunityIcons name="dog" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.checkInButton, (isCat || isDog) && styles.checkInButtonWithMargin]}
          onPress={(e) => {
            e.stopPropagation();
            navigation.navigate('PetCheckScreen', { pet });
          }}
        >
          <MaterialCommunityIcons name="heart-pulse" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity >
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
  emotionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6F00',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#FF6F00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dogEmotionButton: {
    backgroundColor: '#FF6F00', // Orange for dogs
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
  checkInButtonWithMargin: {
    marginLeft: 0,
  },
});

export default CheckPetCard;
