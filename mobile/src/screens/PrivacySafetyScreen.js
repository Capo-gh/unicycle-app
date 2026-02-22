import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';

const tips = [
    {
        title: 'Meet at Safe Zones only',
        desc: 'All transactions should happen at designated campus Safe Zones — well-lit, public locations like library lobbies, student union buildings, and main building atria.',
    },
    {
        title: 'Inspect before you pay',
        desc: 'Always inspect the item in person before handing over any money. Test electronics, check for damage, and verify the item matches the listing.',
    },
    {
        title: 'Bring a friend',
        desc: 'Whenever possible, bring a friend along for meetups. There is safety in numbers.',
    },
    {
        title: 'Use in-app messaging',
        desc: "Keep all communication within the UniCycle chat. Never share personal contact details (phone number, social media) with buyers or sellers you don't know.",
    },
    {
        title: 'Trust your instincts',
        desc: 'If something feels off — a deal too good to be true, pressure to meet somewhere unusual, or strange messages — trust your gut and cancel the transaction.',
    },
];

export default function PrivacySafetyScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy & Safety</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* How we protect you */}
                <View style={styles.section}>
                    <View style={styles.card}>
                        <View style={styles.cardHeaderRow}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="shield-checkmark" size={20} color="#16a34a" />
                            </View>
                            <Text style={styles.cardTitle}>How UniCycle protects you</Text>
                        </View>
                        {[
                            { label: 'University email verification', desc: 'Every account is verified with a real university email. You only interact with fellow students.' },
                            { label: 'Campus-only marketplace', desc: 'Listings are only visible to students at the same university, keeping the community tight-knit.' },
                            { label: 'Safe Zones', desc: 'Every listing includes a designated Safe Zone meeting spot on campus.' },
                            { label: 'Admin moderation', desc: 'Our admin team can suspend accounts or remove listings that violate community guidelines.' },
                        ].map((item, i) => (
                            <View key={i} style={styles.checkRow}>
                                <Ionicons name="checkmark-circle" size={18} color={COLORS.green} style={{ marginTop: 1 }} />
                                <View style={styles.checkText}>
                                    <Text style={styles.checkLabel}>{item.label}</Text>
                                    <Text style={styles.checkDesc}>{item.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Safety tips */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5 tips for safe transactions</Text>
                    <View style={styles.card}>
                        {tips.map((tip, i) => (
                            <View key={i} style={[styles.tipRow, i < tips.length - 1 && styles.tipBorder]}>
                                <View style={styles.tipNumber}>
                                    <Text style={styles.tipNumberText}>{i + 1}</Text>
                                </View>
                                <View style={styles.tipText}>
                                    <Text style={styles.tipTitle}>{tip.title}</Text>
                                    <Text style={styles.tipDesc}>{tip.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Your data */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your data</Text>
                    <View style={styles.card}>
                        <Text style={styles.bodyText}>
                            UniCycle collects only what is necessary to run the marketplace: your name, university email, and the listings and messages you create. We do not sell your data to third parties.
                        </Text>
                        <Text style={[styles.bodyText, { marginTop: 12 }]}>
                            To request deletion of your account and data, email{' '}
                            <Text style={styles.linkText}>support@unicycle.ca</Text>.
                        </Text>
                    </View>
                </View>

                {/* Report */}
                <View style={[styles.section, { marginBottom: 32 }]}>
                    <View style={styles.warningCard}>
                        <Text style={styles.warningTitle}>Report a problem</Text>
                        <Text style={styles.warningText}>
                            If you encounter a suspicious listing or user, email{' '}
                            <Text style={styles.warningLink}>support@unicycle.ca</Text> with the listing ID or username. Our team responds within 24 hours.
                        </Text>
                    </View>
                </View>
            </ScrollView>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: { padding: 4 },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.dark,
    },
    content: { flex: 1 },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#dcfce7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.dark,
        flex: 1,
    },
    checkRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    checkText: { flex: 1 },
    checkLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 2,
    },
    checkDesc: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    tipRow: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 12,
    },
    tipBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tipNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.green,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
    },
    tipNumberText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    tipText: { flex: 1 },
    tipTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    tipDesc: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    bodyText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    linkText: {
        color: '#2563eb',
        fontWeight: '500',
    },
    warningCard: {
        backgroundColor: '#fffbeb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fde68a',
        padding: 16,
    },
    warningTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#92400e',
        marginBottom: 6,
    },
    warningText: {
        fontSize: 13,
        color: '#b45309',
        lineHeight: 18,
    },
    warningLink: {
        fontWeight: '600',
    },
});
