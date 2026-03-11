import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { changePassword } from '../api/auth';

export default function ChangePasswordScreen({ navigation }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        if (newPassword.length < 8) {
            Alert.alert('Error', 'New password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await changePassword(currentPassword, newPassword);
            Alert.alert('Success', 'Password changed successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err) {
            const msg = err?.response?.data?.detail || 'Failed to change password.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.body}
            >
                <View style={styles.card}>
                    {/* Current password */}
                    <Text style={styles.label}>Current Password</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            secureTextEntry={!showCurrent}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Enter current password"
                            placeholderTextColor="#aaa"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowCurrent(v => !v)} style={styles.eyeBtn}>
                            <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* New password */}
                    <Text style={styles.label}>New Password</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            secureTextEntry={!showNew}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="At least 8 characters"
                            placeholderTextColor="#aaa"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowNew(v => !v)} style={styles.eyeBtn}>
                            <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* Confirm new password */}
                    <Text style={styles.label}>Confirm New Password</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            secureTextEntry={!showConfirm}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Repeat new password"
                            placeholderTextColor="#aaa"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.eyeBtn}>
                            <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.saveBtnText}>Save Password</Text>
                    }
                </TouchableOpacity>
            </KeyboardAvoidingView>
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
    body: { flex: 1, padding: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 24 },
    label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        backgroundColor: '#f9fafb',
        paddingHorizontal: 12,
        marginBottom: 4,
    },
    input: { flex: 1, height: 44, fontSize: 15, color: COLORS.dark },
    eyeBtn: { padding: 4 },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
    saveBtn: {
        backgroundColor: COLORS.green,
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
