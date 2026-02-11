import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../../../shared/constants/colors';

export default function MessagesScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>
            <View style={styles.center}>
                <Text style={styles.emoji}>💬</Text>
                <Text style={styles.text}>Messages coming soon!</Text>
                <Text style={styles.subtext}>Chat with buyers and sellers</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    text: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.dark,
    },
    subtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
});
