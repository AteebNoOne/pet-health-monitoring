import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api/backend';

export default function EditProfileScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState(''); // optional
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const id = await AsyncStorage.getItem('user_id');
      const name = await AsyncStorage.getItem('username');
      const mail = await AsyncStorage.getItem('useremail');
      const g = await AsyncStorage.getItem('gender');
      setUserId(id);
      setUsername(name || '');
      setEmail(mail || '');
      setGender(g || '');
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!userId) return Alert.alert('Error', 'Missing user id');
    if (!username || !email) return Alert.alert('Validation', 'Username and email are required');

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, useremail: email, userpassword: password, gender })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      // update local storage
      await AsyncStorage.setItem('username', data.username);
      await AsyncStorage.setItem('useremail', data.useremail);
      if (data.gender !== undefined && data.gender !== null) {
        await AsyncStorage.setItem('gender', data.gender);
      }

      Alert.alert('Success', 'Profile updated');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={50} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholderTextColor="#999" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#999" />

        <Text style={styles.label}>Gender</Text>
        <TextInput style={styles.input} value={gender} onChangeText={setGender} placeholder="Male / Female / Other" placeholderTextColor="#999" />

        <Text style={styles.label}>New Password (optional)</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Leave blank to keep current" placeholderTextColor="#999" />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
          <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { paddingBottom: 30 },
  header: {
    backgroundColor: '#e91e63',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: { marginRight: 8, padding: 6 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '700', marginLeft: 8 },
  form: { padding: 16, marginTop: 16 },
  label: { fontSize: 14, color: '#666', marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 12, elevation: 1, color: '#333' },
  saveButton: { flexDirection: 'row', backgroundColor: '#e91e63', padding: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 8 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
