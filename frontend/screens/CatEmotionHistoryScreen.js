import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../api/backend';

const API_BASE_URL = BASE_URL;

const CatEmotionHistoryScreen = ({ route }) => {
    const { pet } = route.params;
    const navigation = useNavigation();

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Get emotion emoji
    const getEmotionEmoji = (emotion) => {
        const emojis = {
            happy: '😸',
            sad: '😿',
            angry: '😾',
        };
        return emojis[emotion] || '😺';
    };

    // Get emotion color
    const getEmotionColor = (emotion) => {
        const colors = {
            happy: '#4CAF50',
            sad: '#2196F3',
            angry: '#F44336',
        };
        return colors[emotion] || '#9E9E9E';
    };

    // Format date time
    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
        return { date: dateStr, time: timeStr };
    };

    // Fetch history from API
    const fetchHistory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cat-emotion/history/${pet.id}`);
            const data = await response.json();

            if (data.success) {
                setHistory(data.data.history);
            } else {
                console.error('Failed to fetch history:', data.error);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchHistory();
    }, []);

    // Pull to refresh
    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    // Render each history item
    const renderHistoryItem = ({ item }) => {
        const { date, time } = formatDateTime(item.created_at);
        const emotionColor = getEmotionColor(item.emotion);

        return (
            <View style={styles.historyCard}>
                <View style={styles.cardLeft}>
                    <View style={[styles.emotionCircle, { backgroundColor: emotionColor }]}>
                        <Text style={styles.emotionEmoji}>{getEmotionEmoji(item.emotion)}</Text>
                    </View>
                </View>

                <View style={styles.cardCenter}>
                    <Text style={styles.emotionName}>{item.emotion.toUpperCase()}</Text>
                    <Text style={styles.confidenceText}>
                        {(item.confidence * 100).toFixed(1)}% confident
                    </Text>
                    <Text style={styles.dateText}>{date} at {time}</Text>
                </View>

                <View style={styles.cardRight}>
                    <View style={styles.probabilities}>
                        {Object.entries(item.probabilities).map(([emotion, prob]) => (
                            <View key={emotion} style={styles.miniProbRow}>
                                <Text style={styles.miniEmoji}>{getEmotionEmoji(emotion)}</Text>
                                <View style={styles.miniBarContainer}>
                                    <View
                                        style={[
                                            styles.miniBar,
                                            {
                                                width: `${prob * 100}%`,
                                                backgroundColor: getEmotionColor(emotion),
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    // Empty state
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="emoticon-sad-outline" size={80} color="#999" />
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptyText}>
                Emotion detections for {pet.pet_name} will appear here
            </Text>
            <TouchableOpacity
                style={styles.detectNowButton}
                onPress={() => navigation.goBack()}
            >
                <MaterialCommunityIcons name="emoticon-happy-outline" size={20} color="#fff" />
                <Text style={styles.detectNowText}>Detect Emotion Now</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Emotion History</Text>
                    <Text style={styles.headerSubtitle}>{pet.pet_name}</Text>
                </View>
                <View style={styles.placeholder} />
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#e91e63" />
                    <Text style={styles.loadingText}>Loading history...</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderHistoryItem}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={renderEmptyState}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#e91e63']}
                        />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#e91e63',
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
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        marginTop: 2,
    },
    placeholder: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    listContainer: {
        padding: 16,
    },
    historyCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardLeft: {
        marginRight: 16,
    },
    emotionCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emotionEmoji: {
        fontSize: 32,
    },
    cardCenter: {
        flex: 1,
        justifyContent: 'center',
    },
    emotionName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    confidenceText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    cardRight: {
        justifyContent: 'center',
        width: 80,
    },
    probabilities: {
        gap: 4,
    },
    miniProbRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    miniEmoji: {
        fontSize: 16,
        width: 20,
    },
    miniBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    miniBar: {
        height: '100%',
        borderRadius: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    detectNowButton: {
        flexDirection: 'row',
        backgroundColor: '#FF6F00',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: 'center',
        elevation: 3,
    },
    detectNowText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default CatEmotionHistoryScreen;
