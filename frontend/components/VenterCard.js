import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import profile1 from '../assets/profile1.jpg';

const VetCard = ({ name, info, image = profile1, userType, onEdit, onDelete, onInfo }) => {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.profileImage} />

      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.specialtyRow}>
          <MaterialCommunityIcons name="stethoscope" size={16} color="#999" />
          <Text style={styles.info}>{info}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        {/* Icons for veterinarians */}
        {userType === 'veterinarian' && (
          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
              <MaterialCommunityIcons name="pencil" size={20} color="#3f51b5" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.iconButtonDelete}>
              <MaterialCommunityIcons name="delete" size={20} color="#ff5252" />
            </TouchableOpacity>
          </View>
        )}

        {/* Info button */}
        <TouchableOpacity style={styles.infoButton} onPress={onInfo}>
          <MaterialCommunityIcons name="information" size={20} color="#fff" />
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
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  info: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonDelete: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e91e63',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default VetCard;

