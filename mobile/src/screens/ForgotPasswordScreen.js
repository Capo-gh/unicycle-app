import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { forgotPassword } from '../api/auth';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSend = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }
        setLoading(true);
        try {
            await forgotPassword(email.trim().toLowerCase());
            setSent(true);
        } catch {
            // Always show success to avoid email enumeration
            setSent(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                    </TouchableOpacity>

                    <View style={styles.iconContainer}>
                        <Ionicons name="lock-closed-outline" size={48} color={COLORS.green} />
                    </View>

                    <Text style={styles.title}>Reset Password</Text>

                    {sent ? (
                        <>
                            <View style={styles.successBox}>
                                <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                                <Text style={styles.successText}>
                                    If an account exists with that email, you will receive a reset link shortly. Check your inbox and follow the link to set a new password.
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                                <Text style={styles.buttonText}>Back to Login</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.subtitle}>
                                Enter your university email and we'll send you a link to reset your password.
                            </Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="your@university.ca"
                                    placeholderTextColor="#bbb"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                            <TouchableOpacity
                                style={[styles.button, (!email || loading) && styles.buttonDisabled]}
                                onPress={handleSend}
                                disabled={!email || loading}
                            >
                                <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, padding: 24 },
    backButton: { marginBottom: 32 },
    iconContainer: {
        width: 80, height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(76,175,80,0.1)',
        justifyContent: 'center', alignItems: 'center',
        alignSelf: 'center', marginBottom: 24,
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#111', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12,
        paddingHorizontal: 14, marginBottom: 16, backgroundColor: '#fafafa',
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, height: 50, fontSize: 15, color: '#111' },
    button: {
        backgroundColor: COLORS.green, paddingVertical: 14,
        borderRadius: 12, alignItems: 'center',
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    successBox: {
        flexDirection: 'row', gap: 10, alignItems: 'flex-start',
        backgroundColor: '#f0fdf4', borderRadius: 12, padding: 16,
        borderWidth: 1, borderColor: '#bbf7d0', marginBottom: 24,
    },
    successText: { flex: 1, fontSize: 14, color: '#166534', lineHeight: 20 },
});
