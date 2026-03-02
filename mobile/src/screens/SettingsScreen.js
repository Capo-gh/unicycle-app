import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../../../shared/constants/colors';
import { uploadImage } from '../api/upload';
import { updateProfile } from '../api/users';

export default function SettingsScreen({ navigation }) {
    const { user, logout, updateUser } = useAuth();
    const { i18n } = useTranslation();
    const isEn = i18n.language === 'en';
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const toggleLanguage = async () => {
        const next = isEn ? 'fr' : 'en';
        await i18n.changeLanguage(next);
        await AsyncStorage.setItem('language', next);
    };

    const handleAvatarChange = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission required', 'Please allow access to your photo library.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (result.canceled) return;

        const uri = result.assets[0].uri;
        setUploadingAvatar(true);
        try {
            const url = await uploadImage(uri);
            await updateProfile({ avatar_url: url });
            if (updateUser) await updateUser({ avatar_url: url });
        } catch (err) {
            console.error('Avatar upload error:', err);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Account Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
                    <View style={styles.card}>
                        {/* Avatar */}
                        <View style={styles.avatarRow}>
                            <View style={styles.avatarWrap}>
                                {user?.avatar_url ? (
                                    <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
                                ) : (
                                    <View style={styles.avatarInitials}>
                                        <Text style={styles.avatarInitialsText}>{user?.name?.charAt(0) || '?'}</Text>
                                    </View>
                                )}
                                {uploadingAvatar && (
                                    <View style={styles.avatarOverlay}>
                                        <ActivityIndicator size="small" color="#fff" />
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity style={styles.changePhotoBtn} onPress={handleAvatarChange} disabled={uploadingAvatar}>
                                <Ionicons name="camera-outline" size={16} color={COLORS.dark} />
                                <Text style={styles.changePhotoText}>Change photo</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Name</Text>
                            <Text style={styles.infoValue}>{user?.name || 'N/A'}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>University</Text>
                            <Text style={styles.infoValue}>{user?.university || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.menuItem} onPress={toggleLanguage}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="language-outline" size={22} color={COLORS.dark} />
                                <Text style={styles.menuText}>Language</Text>
                            </View>
                            <View style={styles.langToggle}>
                                <Text style={[styles.langOption, !isEn && styles.langActive]}>FR</Text>
                                <Text style={styles.langSep}>/</Text>
                                <Text style={[styles.langOption, isEn && styles.langActive]}>EN</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Notifications')}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="notifications-outline" size={22} color={COLORS.dark} />
                                <Text style={styles.menuText}>Notifications</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PrivacySafety')}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.dark} />
                                <Text style={styles.menuText}>Privacy & Safety</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Support */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL('mailto:hello@unicycleapp.ca')}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="help-circle-outline" size={22} color={COLORS.dark} />
                                <Text style={styles.menuText}>Help & Support</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL('https://unicycleapp.ca/terms')}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="document-text-outline" size={22} color={COLORS.dark} />
                                <Text style={styles.menuText}>Terms of Service</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL('https://unicycleapp.ca/privacy')}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="shield-outline" size={22} color={COLORS.dark} />
                                <Text style={styles.menuText}>Privacy Policy</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <View style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="information-circle-outline" size={22} color={COLORS.dark} />
                                <Text style={styles.menuText}>UniCycle</Text>
                            </View>
                            <Text style={styles.versionText}>v1.0.0</Text>
                        </View>
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color="#fff" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
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
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.dark },
    content: { flex: 1 },
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionTitle: {
        fontSize: 13, fontWeight: '600', color: '#999',
        textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
    },
    card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
    avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
    avatarWrap: { position: 'relative' },
    avatarImg: { width: 64, height: 64, borderRadius: 32 },
    avatarInitials: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: COLORS.green, justifyContent: 'center', alignItems: 'center',
    },
    avatarInitialsText: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
    avatarOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 32,
        backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center',
    },
    changePhotoBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 8,
    },
    changePhotoText: { fontSize: 14, color: COLORS.dark, fontWeight: '500' },
    infoRow: { padding: 16 },
    infoLabel: { fontSize: 13, color: '#999', marginBottom: 4 },
    infoValue: { fontSize: 16, fontWeight: '500', color: COLORS.dark },
    divider: { height: 1, backgroundColor: '#f0f0f0' },
    menuItem: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', padding: 16,
    },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    menuItemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    menuText: { fontSize: 16, color: COLORS.dark },
    versionText: { fontSize: 14, color: '#999' },
    langToggle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    langOption: { fontSize: 13, fontWeight: '700', color: '#ccc' },
    langActive: { color: COLORS.green },
    langSep: { fontSize: 13, color: '#ddd' },
    logoutButton: {
        flexDirection: 'row', backgroundColor: '#ef4444',
        marginHorizontal: 16, marginTop: 32, padding: 16,
        borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
