import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../../../shared/constants/colors';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                </View>
                <Text style={styles.name}>{user?.name || 'User'}</Text>
                <Text style={styles.email}>{user?.email || ''}</Text>
            </View>

            <View style={styles.menu}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('MyInterests')}
                >
                    <Text style={styles.menuText}>My Interests</Text>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={logout}
                >
                    <Text style={[styles.menuText, styles.logout]}>Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.green,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#666',
    },
    menu: {
        marginTop: 16,
    },
    menuItem: {
        backgroundColor: '#fff',
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    menuText: {
        fontSize: 16,
        color: COLORS.dark,
    },
    logout: {
        color: '#EF4444',
    },
    arrow: {
        fontSize: 24,
        color: '#999',
    },
});
