import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../../../shared/constants/colors';
import { UNIVERSITIES } from '../../../shared/constants/universities';

export default function SignupScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [university, setUniversity] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();

    const handleSignup = async () => {
        // Validation
        if (!name || !email || !password || !confirmPassword || !university) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await signup(name, email, password, university);
            Alert.alert(
                'Success!',
                'Account created! Please check your email to verify your account.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            console.error('Signup error:', error);
            Alert.alert(
                'Signup Failed',
                error.response?.data?.detail || 'Please try again'
            );
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
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.logo}>🚲</Text>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join your campus marketplace</Text>
                    </View>

                    {/* Signup Form */}
                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            value={name}
                            onChangeText={setName}
                            autoComplete="name"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="University Email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoComplete="email"
                        />

                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={university}
                                onValueChange={setUniversity}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select University" value="" />
                                {UNIVERSITIES.map((uni) => (
                                    <Picker.Item
                                        key={uni.name}
                                        label={uni.name}
                                        value={uni.name}
                                    />
                                ))}
                            </Picker>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Password (min 6 characters)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password-new"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            autoComplete="password-new"
                        />

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.linkText}>
                                Already have an account? <Text style={styles.linkTextBold}>Log In</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        fontSize: 48,
        marginBottom: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    form: {
        width: '100%',
    },
    input: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
    },
    pickerContainer: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    button: {
        backgroundColor: COLORS.green,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    linkButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    linkText: {
        fontSize: 14,
        color: '#666',
    },
    linkTextBold: {
        color: COLORS.green,
        fontWeight: '600',
    },
});
