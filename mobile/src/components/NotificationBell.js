import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUnreadCount } from '../api/notifications';
import { COLORS } from '../../../shared/constants/colors';

export default function NotificationBell({ onPress, color }) {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchCount = async () => {
        try {
            const data = await getUnreadCount();
            setUnreadCount(data.unread_count);
        } catch (err) {}
    };

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Ionicons name="notifications-outline" size={24} color={color || COLORS.dark} />
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 4,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
});
