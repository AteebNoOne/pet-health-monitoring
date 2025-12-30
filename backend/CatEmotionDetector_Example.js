/**
 * Cat Emotion Detection Component
 * 
 * Example React Native component showing how to integrate
 * the cat emotion detection API into your mobile app
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // If using Expo
// OR
// import ImagePicker from 'react-native-image-picker'; // If using react-native-image-picker

// CONFIGURATION
const API_BASE_URL = 'http://YOUR_BACKEND_IP:5000'; // Change this to your backend URL
// For Android emulator use: http://10.0.2.2:5000
// For iOS simulator use: http://localhost:5000
// For physical device use your computer's IP: http://192.168.x.x:5000

const CatEmotionDetector = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    /**
     * Pick an image from gallery
     */
    const pickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions!');
            return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setResult(null); // Clear previous results
        }
    };

    /**
     * Take a photo with camera
     */
    const takePhoto = async () => {
        // Request permission
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera permissions!');
            return;
        }

        // Launch camera
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setResult(null);
        }
    };

    /**
     * Detect emotion from selected image
     */
    const detectEmotion = async () => {
        if (!selectedImage) {
            Alert.alert('No Image', 'Please select an image first');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            // Create form data
            const formData = new FormData();

            // Get filename from URI
            const filename = selectedImage.split('/').pop();

            // Determine file type
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri: selectedImage,
                name: filename,
                type: type,
            });

            // Make API request
            const response = await fetch(`${API_BASE_URL}/api/cat-emotion/detect`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();

            if (data.success) {
                setResult(data.data);

                // Show result in alert
                const emotion = data.data.emotion;
                const confidence = (data.data.confidence * 100).toFixed(1);
                Alert.alert(
                    'Emotion Detected! 😺',
                    `Your cat appears to be ${emotion.toUpperCase()}\n\nConfidence: ${confidence}%`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Error', data.error || 'Failed to detect emotion');
            }
        } catch (error) {
            console.error('Error detecting emotion:', error);
            Alert.alert(
                'Error',
                'Failed to connect to server. Make sure your backend is running.'
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Get emoji for emotion
     */
    const getEmotionEmoji = (emotion) => {
        const emojis = {
            happy: '😸',
            sad: '😿',
            angry: '😾',
        };
        return emojis[emotion] || '😺';
    };

    /**
     * Get color for emotion
     */
    const getEmotionColor = (emotion) => {
        const colors = {
            happy: '#4CAF50',
            sad: '#2196F3',
            angry: '#F44336',
        };
        return colors[emotion] || '#9E9E9E';
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cat Emotion Detector 🐱</Text>
            <Text style={styles.subtitle}>
                Take or select a photo of your cat to detect their emotion
            </Text>

            {/* Image Preview */}
            {selectedImage && (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.image} />
                </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button} onPress={pickImage}>
                    <Text style={styles.buttonText}>📷 Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={takePhoto}>
                    <Text style={styles.buttonText}>📸 Camera</Text>
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
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.detectButtonText}>🔍 Detect Emotion</Text>
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
                                    {getEmotionEmoji(emotion)} {emotion}:
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    image: {
        width: 300,
        height: 300,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#ddd',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    button: {
        backgroundColor: '#6200EA',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        flex: 0.45,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    detectButton: {
        backgroundColor: '#FF6F00',
        paddingVertical: 15,
        borderRadius: 25,
        marginVertical: 20,
        alignItems: 'center',
    },
    detectButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    resultContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
        marginBottom: 10,
        color: '#333',
    },
    probabilityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    probabilityLabel: {
        width: 80,
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    probabilityBarContainer: {
        flex: 1,
        height: 20,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        overflow: 'hidden',
        marginHorizontal: 10,
    },
    probabilityBar: {
        height: '100%',
        borderRadius: 10,
    },
    probabilityValue: {
        width: 50,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'right',
    },
});

export default CatEmotionDetector;
