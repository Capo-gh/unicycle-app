import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { getBlockedUsers, toggleBlockUser } from '../api/users';

export default function BlockedUsersScreen({ navigation }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unblocking, setUnblocking] = useState(null);

    const load = useCallback(async () => {
        try {
            const data = await getBlockedUsers();
            setUsers(data);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleUnblock = (userId, name) => {
        Alert.alert(
            'Unblock User',
            `Unblock ${name}? They will be able to contact you again.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Unblock',
                    onPress: async () => {
                        setUnblocking(userId);
                        try {
                            await toggleBlockUser(userId);
                            setUsers(prev => prev.filter(u => u.id !== userId));
                        } catch {
                            Alert.alert('Error', 'Could not unblock user.');
                        } finally {
                            setUnblocking(null);
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.row}>
            {item.avatar_url ? (
                <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
            ) : (
                <View style={styles.avatarInitials}>
                    <Text style={styles.avatarInitialsText}>{item.name?.charAt(0) || '?'}</Text>
                </View>
            )}
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.university}>{item.university || ''}</Text>
            </View>
            <TouchableOpacity
                style={[styles.unblockBtn, unblocking === item.id && { opacity: 0.6 }]}
                onPress={() => handleUnblock(item.id, item.name)}
                disabled={unblocking === item.id}
            >
                {unblocking === item.id
                    ? <ActivityIndicator size="small" color={COLORS.green} />
                    : <Text style={styles.unblockText}>Unblock</Text>
                }
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Blocked Users</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.green} style={{ marginTop: 40 }} />
            ) : users.length === 0 ? (
                <View style={styles.empty}>
                    <Ionicons name="person-remove-outline" size={48} color="#d1d5db" />
                    <Text style={styles.emptyText}>No blocked users</Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
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
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.dark },
    list: { padding: 16 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        gap: 12,
    },
    avatar: { width: 48, height: 48, borderRadius: 24 },
    avatarInitials: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: COLORS.green,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarInitialsText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    info: { flex: 1 },
    name: { fontSize: 15, fontWeight: '600', color: COLORS.dark },
    university: { fontSize: 13, color: '#6b7280', marginTop: 2 },
    unblockBtn: {
        borderWidth: 1,
        borderColor: COLORS.green,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 7,
        minWidth: 80,
        alignItems: 'center',
    },
    unblockText: { color: COLORS.green, fontSize: 13, fontWeight: '600' },
    separator: { height: 8 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    emptyText: { fontSize: 16, color: '#9ca3af' },
});
