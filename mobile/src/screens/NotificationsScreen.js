import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getNotifications, markAsRead, markAllAsRead } from '../api/notifications';
import { COLORS } from '../../../shared/constants/colors';

export default function NotificationsScreen({ navigation }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (err) {}
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {}
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `${diffHr}h ago`;
        const diffDay = Math.floor(diffHr / 24);
        if (diffDay < 7) return `${diffDay}d ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const hasUnread = notifications.some(n => !n.is_read);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.item, !item.is_read && styles.itemUnread]}
            onPress={() => !item.is_read && handleMarkRead(item.id)}
        >
            <View style={styles.itemRow}>
                {!item.is_read && <View style={styles.dot} />}
                <View style={[styles.itemContent, item.is_read && { marginLeft: 18 }]}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemMessage}>{item.message}</Text>
                    <View style={styles.itemMeta}>
                        <Text style={styles.itemDate}>{formatDate(item.created_at)}</Text>
                        {item.target_university && (
                            <View style={styles.universityBadge}>
                                <Text style={styles.universityBadgeText}>{item.target_university}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                {hasUnread && (
                    <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
                        <Text style={styles.markAllText}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.green} />
                </View>
            ) : notifications.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />
                    <Text style={styles.emptyTitle}>No notifications yet</Text>
                    <Text style={styles.emptySubtitle}>You'll see notifications here when there's something new</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    refreshing={loading}
                    onRefresh={fetchNotifications}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: { marginRight: 12 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.dark, flex: 1 },
    markAllButton: { paddingHorizontal: 8, paddingVertical: 4 },
    markAllText: { fontSize: 13, color: COLORS.green, fontWeight: '600' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.dark, marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' },
    item: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemUnread: { backgroundColor: 'rgba(59, 130, 246, 0.04)' },
    itemRow: { flexDirection: 'row', alignItems: 'flex-start' },
    dot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: COLORS.green, marginTop: 6, marginRight: 10,
    },
    itemContent: { flex: 1 },
    itemTitle: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
    itemMessage: { fontSize: 13, color: '#666', marginTop: 2 },
    itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
    itemDate: { fontSize: 11, color: '#999' },
    universityBadge: {
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    },
    universityBadgeText: { fontSize: 10, color: '#3b82f6' },
});
