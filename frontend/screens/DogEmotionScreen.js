import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
    Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../api/backend';

const { width } = Dimensions.get('window');
const API_BASE_URL = BASE_URL;

const DogEmotionScreen = ({ route }) => {
    const { pet } = route.params;
    const navigation = useNavigation();

    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Get emotion emoji (4 dog emotions)
    const getEmotionEmoji = (emotion) => {
        const emojis = {
            happy: '😊',
            sad: '😢',
            angry: '😠',
            relaxed: '😌',
        };
        return emojis[emotion] || '🐕';
    };

    // Get emotion color
    const getEmotionColor = (emotion) => {
        const colors = {
            happy: '#4CAF50',
            sad: '#2196F3',
            angry: '#F44336',
            relaxed: '#9C27B0',
        };
        return colors[emotion] || '#9E9E9E';
    };

    // Request permissions and pick image from gallery
    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera roll permissions are required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
                setResult(null);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    // Take photo with camera
    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera permissions are required!');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
                setResult(null);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    // Detect emotion from selected image
    const detectEmotion = async () => {
        if (!selectedImage) {
            Alert.alert('No Image', 'Please select an image first');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const formData = new FormData();

            const filename = selectedImage.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri: selectedImage,
                name: filename || 'dog_photo.jpg',
                type: type,
            });

            formData.append('pet_id', pet.id.toString());

            const response = await fetch(`${API_BASE_URL}/api/dog-emotion/detect`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();

            if (data.success) {
                setResult(data.data);

                const emotion = data.data.emotion;
                const confidence = (data.data.confidence * 100).toFixed(1);
                Alert.alert(
                    'Emotion Detected! 🐕',
                    `${pet.pet_name} appears to be ${emotion.toUpperCase()}\n\nConfidence: ${confidence}%`
                );
            } else {
                Alert.alert('Error', data.error || 'Failed to detect emotion');
            }
        } catch (error) {
            console.error('Error detecting emotion:', error);
            Alert.alert(
                'Connection Error',
                'Failed to connect to server. Make sure your backend is running.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Dog Emotion Detector</Text>
                <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => navigation.navigate('DogEmotionHistoryScreen', { pet })}
                >
                    <MaterialCommunityIcons name="history" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Pet Info */}
            <View style={styles.petInfo}>
                <Image
                    source={pet?.image_url ? { uri: pet.image_url } : require('../assets/profile1.jpg')}
                    style={styles.petImage}
                />
                <Text style={styles.petName}>{pet?.pet_name || 'Unknown Dog'}</Text>
                <Text style={styles.subtitle}>How is your dog feeling?</Text>
            </View>

            {/* Image Preview */}
            {selectedImage && (
                <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                    <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => {
                            setSelectedImage(null);
                            setResult(null);
                        }}
                    >
                        <MaterialCommunityIcons name="close-circle" size={32} color="#F44336" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                    <View style={styles.actionButtonContent}>
                        <MaterialCommunityIcons name="image" size={32} color="#6200EA" />
                        <Text style={styles.actionButtonText}>Gallery</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                    <View style={styles.actionButtonContent}>
                        <MaterialCommunityIcons name="camera" size={32} color="#FF6F00" />
                        <Text style={styles.actionButtonText}>Camera</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Detect Button */}
            {selectedImage && (
                <TouchableOpacity
                    style={[styles.detectButton, loading && styles.buttonDisabled]}
                    onPress={detectEmotion}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="brain" size={24} color="#fff" />
                            <Text style={styles.detectButtonText}>Detect Emotion</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}

            {/* Results */}
            {result && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Results:</Text>

                    <View style={[styles.emotionBadge, { backgroundColor: getEmotionColor(result.emotion) }]}>
                        <Text style={styles.emotionEmoji}>{getEmotionEmoji(result.emotion)}</Text>
                        <Text style={styles.emotionText}>{result.emotion.toUpperCase()}</Text>
                        <Text style={styles.confidenceText}>
                            {(result.confidence * 100).toFixed(1)}% confident
                        </Text>
                    </View>

                    <View style={styles.probabilitiesContainer}>
                        <Text style={styles.probabilitiesTitle}>Detailed Breakdown:</Text>
                        {Object.entries(result.probabilities).map(([emotion, probability]) => (
                            <View key={emotion} style={styles.probabilityRow}>
                                <Text style={styles.probabilityLabel}>
                                    {getEmotionEmoji(emotion)} {emotion}
                                </Text>
                                <View style={styles.probabilityBarContainer}>
                                    <View
                                        style={[
                                            styles.probabilityBar,
                                            {
                                                width: `${probability * 100}%`,
                                                backgroundColor: getEmotionColor(emotion),
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.probabilityValue}>
                                    {(probability * 100).toFixed(1)}%
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Instructions */}
            {!selectedImage && !result && (
                <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsTitle}>📸 Instructions:</Text>
                    <Text style={styles.instructionText}>1. Take a clear photo of your dog's face</Text>
                    <Text style={styles.instructionText}>2. Make sure the lighting is good</Text>
                    <Text style={styles.instructionText}>3. Crop the image to focus on the face</Text>
                    <Text style={styles.instructionText}>4. Tap "Detect Emotion" to analyze</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    contentContainer: {
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FF6F00',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    historyButton: {
        padding: 8,
    },
    petInfo: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    petImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#FF6F00',
        marginBottom: 10,
    },
    petName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    imagePreviewContainer: {
        alignItems: 'center',
        marginVertical: 20,
        position: 'relative',
    },
    imagePreview: {
        width: width - 60,
        height: width - 60,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#ddd',
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#fff',
        borderRadius: 16,
        elevation: 3,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 30,
        marginBottom: 20,
    },
    actionButton: {
        flex: 0.45,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    actionButtonContent: {
        alignItems: 'center',
    },
    actionButtonText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    detectButton: {
        backgroundColor: '#FF6F00',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginHorizontal: 30,
        marginVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    detectButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    resultContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 20,
        marginTop: 10,
        elevation: 3,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    emotionBadge: {
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    emotionEmoji: {
        fontSize: 60,
        marginBottom: 10,
    },
    emotionText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    confidenceText: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
    },
    probabilitiesContainer: {
        marginTop: 10,
    },
    probabilitiesTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        color: '#333',
    },
    probabilityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    probabilityLabel: {
        width: 90,
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    probabilityBarContainer: {
        flex: 1,
        height: 24,
        backgroundColor: '#e0e0e0',
        borderRadius: 12,
        overflow: 'hidden',
        marginHorizontal: 10,
    },
    probabilityBar: {
        height: '100%',
        borderRadius: 12,
    },
    probabilityValue: {
        width: 55,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'right',
    },
    instructionsContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginHorizontal: 20,
        marginTop: 20,
        elevation: 2,
    },
    instructionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    instructionText: {
        fontSize: 14,
        color: '#666',
        marginVertical: 5,
        lineHeight: 22,
    },
});

export default DogEmotionScreen;
