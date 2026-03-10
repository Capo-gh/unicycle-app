import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getSavedSearches, deleteSavedSearch } from '../api/savedSearches';
import { COLORS } from '../../../shared/constants/colors';

function describeSearch(s) {
    const parts = [];
    if (s.query) parts.push(`"${s.query}"`);
    if (s.category) parts.push(s.category);
    if (s.condition) parts.push(s.condition);
    if (s.min_price != null && s.max_price != null) parts.push(`$${s.min_price}–$${s.max_price}`);
    else if (s.min_price != null) parts.push(`From $${s.min_price}`);
    else if (s.max_price != null) parts.push(`Up to $${s.max_price}`);
    if (s.university) parts.push(s.university);
    return parts.length > 0 ? parts.join(' · ') : 'All items';
}

export default function SavedSearchesScreen({ navigation }) {
    const [searches, setSearches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSavedSearches()
            .then(setSearches)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = (id) => {
        Alert.alert('Delete Search', 'Remove this saved search?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await deleteSavedSearch(id);
                        setSearches(prev => prev.filter(s => s.id !== id));
                    } catch {}
                }
            },
        ]);
    };

    const handleApply = (s) => {
        // Navigate to Browse with search params pre-applied
        navigation.navigate('Browse', {
            screen: 'BrowseList',
            params: {
                presetQuery: s.query || '',
                presetCategory: s.category || 'All',
                presetUniversity: s.university || null,
            },
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator style={{ flex: 1 }} color={COLORS.green} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {searches.length === 0 ? (
                <View style={styles.empty}>
                    <Ionicons name="notifications-outline" size={52} color="#d1d5db" />
                    <Text style={styles.emptyTitle}>No saved searches</Text>
                    <Text style={styles.emptyText}>
                        When you search or filter items, tap the bookmark icon to save your search.
                    </Text>
                    <TouchableOpacity
                        style={styles.browseBtn}
                        onPress={() => navigation.navigate('Browse', { screen: 'BrowseList' })}
                    >
                        <Text style={styles.browseBtnText}>Browse Items</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={searches}
                    keyExtractor={s => String(s.id)}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardTitle} numberOfLines={1}>{describeSearch(item)}</Text>
                                <Text style={styles.cardDate}>
                                    Saved {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity style={styles.applyBtn} onPress={() => handleApply(item)}>
                                    <Text style={styles.applyBtnText}>Apply</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    list: { padding: 16, gap: 10 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 3 },
    cardDate: { fontSize: 12, color: '#9ca3af' },
    cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    applyBtn: {
        backgroundColor: COLORS.green,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
    },
    applyBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    deleteBtn: { padding: 6 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 16, marginBottom: 8 },
    emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    browseBtn: { backgroundColor: COLORS.green, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
    browseBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
