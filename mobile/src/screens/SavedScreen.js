import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getSaved, toggleSave } from '../api/saved';
import { COLORS } from '../../../shared/constants/colors';

const { width } = require('react-native').Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function SavedScreen({ navigation }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchSaved();
        }, [])
    );

    const fetchSaved = async () => {
        setLoading(true);
        try {
            const data = await getSaved();
            setListings(data);
        } catch (err) {
            console.error('Error fetching saved listings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = async (listingId) => {
        try {
            await toggleSave(listingId);
            setListings(prev => prev.filter(l => l.id !== listingId));
        } catch (err) {
            console.error('Error unsaving listing:', err);
        }
    };

    const renderItem = ({ item }) => {
        const imageUri = item.images
            ? (Array.isArray(item.images) ? item.images[0] : item.images.split(',')[0])
            : null;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ItemDetail', { listing: item })}
            >
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.image} />
                ) : (
                    <View style={[styles.image, styles.imagePlaceholder]}>
                        <Ionicons name="image-outline" size={40} color="#d1d5db" />
                    </View>
                )}
                {item.is_sold && (
                    <View style={styles.soldOverlay}>
                        <Text style={styles.soldText}>SOLD</Text>
                    </View>
                )}
                {/* Unsave button */}
                <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={() => handleUnsave(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Ionicons name="heart" size={20} color="#ef4444" />
                </TouchableOpacity>
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.price}>{item.price === 0 ? 'Free' : `$${item.price}`}</Text>
                    <Text style={styles.category}>{item.category}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Saved</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.green} />
                </View>
            ) : listings.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="heart-outline" size={64} color="#d1d5db" />
                    <Text style={styles.emptyTitle}>No saved listings</Text>
                    <Text style={styles.emptySubtitle}>Tap the heart on any listing to save it here.</Text>
                </View>
            ) : (
                <FlatList
                    data={listings}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={fetchSaved}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.green },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 16, textAlign: 'center' },
    emptySubtitle: { fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' },
    list: { padding: 16, gap: 16 },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    image: { width: '100%', height: CARD_WIDTH, resizeMode: 'cover' },
    imagePlaceholder: { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
    soldOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center',
    },
    soldText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    heartBtn: {
        position: 'absolute', top: 8, right: 8,
        backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, padding: 4,
    },
    info: { padding: 10 },
    title: { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 4, lineHeight: 18 },
    price: { fontSize: 15, fontWeight: 'bold', color: COLORS.green, marginBottom: 2 },
    category: { fontSize: 11, color: '#9ca3af' },
});
