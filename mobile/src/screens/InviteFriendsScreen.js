import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Share, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { COLORS } from '../../../shared/constants/colors';
import { getReferralInfo } from '../api/auth';

const FRONTEND_URL = 'https://unicycle.ca'; // update if needed

export default function InviteFriendsScreen({ navigation }) {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        getReferralInfo()
            .then(setInfo)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const referralLink = info?.referral_code
        ? `${FRONTEND_URL}/signup?ref=${info.referral_code}`
        : '';

    const handleCopy = async () => {
        if (!referralLink) return;
        await Clipboard.setStringAsync(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (!referralLink) return;
        try {
            await Share.share({
                message: `Join me on UniCycle — the student-only campus marketplace! Sign up with my link: ${referralLink}`,
                url: referralLink,
            });
        } catch (err) {
            Alert.alert('Error', 'Could not open share sheet');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header card */}
                <View style={styles.headerCard}>
                    <Ionicons name="gift-outline" size={40} color={COLORS.green} />
                    <Text style={styles.headerTitle}>Invite classmates, earn free boosts</Text>
                    <Text style={styles.headerSubtitle}>
                        For every friend who signs up with your link and completes their account, you get{' '}
                        <Text style={{ fontWeight: '700', color: COLORS.green }}>1 free listing boost</Text>
                        {' '}(worth $2 CAD).
                    </Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.green} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {/* Stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{info?.referred_count ?? 0}</Text>
                                <Text style={styles.statLabel}>Friends invited</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{info?.boost_credits ?? 0}</Text>
                                <Text style={styles.statLabel}>Boost credits left</Text>
                            </View>
                        </View>

                        {/* Referral link */}
                        <View style={styles.linkCard}>
                            <Text style={styles.linkLabel}>Your invite link</Text>
                            <View style={styles.linkRow}>
                                <Text style={styles.linkText} numberOfLines={1}>{referralLink}</Text>
                                <TouchableOpacity
                                    style={[styles.copyBtn, copied && styles.copiedBtn]}
                                    onPress={handleCopy}
                                >
                                    <Ionicons
                                        name={copied ? 'checkmark' : 'copy-outline'}
                                        size={16}
                                        color={copied ? COLORS.green : '#fff'}
                                    />
                                    <Text style={[styles.copyBtnText, copied && { color: COLORS.green }]}>
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Share button */}
                        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                            <Ionicons name="share-social-outline" size={20} color="#fff" />
                            <Text style={styles.shareBtnText}>Share Invite Link</Text>
                        </TouchableOpacity>

                        <Text style={styles.note}>
                            Credits are awarded once your friend completes their account setup.
                        </Text>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    content: { padding: 16, paddingBottom: 40 },
    headerCard: {
        backgroundColor: '#f0fdf4',
        borderWidth: 1,
        borderColor: '#bbf7d0',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.dark,
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#4b5563',
        textAlign: 'center',
        lineHeight: 20,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
    },
    statBox: { flex: 1, alignItems: 'center', paddingVertical: 16 },
    statDivider: { width: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
    statNumber: { fontSize: 28, fontWeight: '800', color: COLORS.green },
    statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
    linkCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    linkLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
    linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    linkText: {
        flex: 1,
        fontSize: 13,
        color: '#6b7280',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.green,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    copiedBtn: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
    copyBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: COLORS.green,
        borderRadius: 12,
        paddingVertical: 14,
        marginBottom: 12,
    },
    shareBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    note: { fontSize: 12, color: '#9ca3af', textAlign: 'center' },
});
