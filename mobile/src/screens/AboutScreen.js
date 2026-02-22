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

const features = [
    { icon: '🎓', title: 'University-verified accounts', desc: 'Every user is verified with a real campus email.' },
    { icon: '🏫', title: 'Campus-specific marketplaces', desc: 'Browse listings from your own university only.' },
    { icon: '📍', title: 'Safe Zone meetups', desc: 'Every listing has a designated on-campus meeting spot.' },
    { icon: '💬', title: 'In-app messaging', desc: 'Chat with buyers and sellers without sharing personal info.' },
    { icon: '📱', title: 'Web + mobile', desc: 'Available as a web app and native iOS/Android app.' },
];

const universities = [
    'McGill University',
    'Concordia University',
    'Université de Montréal (UdeM)',
    'Université du Québec à Montréal (UQAM)',
    'Polytechnique Montréal',
    'École de technologie supérieure (ÉTS)',
    'Université Laval',
    'Université de Sherbrooke',
];

export default function AboutScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About UniCycle</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Logo + version */}
                <View style={[styles.section, { marginTop: 24 }]}>
                    <View style={[styles.card, styles.centerCard]}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoLetter}>U</Text>
                        </View>
                        <Text style={styles.appName}>UniCycle</Text>
                        <Text style={styles.version}>Version 1.0.0</Text>
                        <Text style={styles.tagline}>The campus marketplace for Canadian university students</Text>
                    </View>
                </View>

                {/* Mission */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Our mission</Text>
                    <View style={styles.card}>
                        <Text style={styles.bodyText}>
                            UniCycle was built to make student life a little easier and a lot more sustainable. Moving into residence? Graduating and clearing out? UniCycle connects students within the same campus so items get a second life instead of ending up in the trash.
                        </Text>
                        <Text style={[styles.bodyText, { marginTop: 12 }]}>
                            Every transaction stays on campus — verified student emails, university-specific marketplaces, and Safe Zone meetups keep the community trustworthy and the process simple.
                        </Text>
                    </View>
                </View>

                {/* Key features */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What UniCycle offers</Text>
                    <View style={styles.card}>
                        {features.map((feature, i) => (
                            <View key={i} style={[styles.featureRow, i < features.length - 1 && styles.featureBorder]}>
                                <Text style={styles.featureIcon}>{feature.icon}</Text>
                                <View style={styles.featureText}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureDesc}>{feature.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Universities */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Supported universities</Text>
                    <View style={styles.card}>
                        {universities.map((uni, i) => (
                            <View key={i} style={[styles.uniRow, i < universities.length - 1 && styles.uniBorder]}>
                                <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                                <Text style={styles.uniText}>{uni}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Contact */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Get in touch</Text>
                    <View style={styles.card}>
                        {[
                            { label: 'Support', value: 'support@unicycle.ca' },
                            { label: 'Feedback', value: 'hello@unicycle.ca' },
                        ].map((row, i) => (
                            <View key={i} style={[styles.contactRow, i === 0 && styles.contactBorder]}>
                                <Text style={styles.contactLabel}>{row.label}</Text>
                                <Text style={styles.contactValue}>{row.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <Text style={styles.footer}>Made with love for Canadian students</Text>
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
        marginTop: 16,
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
    centerCard: {
        alignItems: 'center',
        paddingVertical: 28,
    },
    logoBox: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: COLORS.green,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    logoLetter: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '900',
    },
    appName: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.dark,
        marginBottom: 4,
    },
    version: {
        fontSize: 14,
        color: '#999',
        marginBottom: 4,
    },
    tagline: {
        fontSize: 13,
        color: '#aaa',
        textAlign: 'center',
    },
    bodyText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 10,
    },
    featureBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    featureIcon: { fontSize: 20 },
    featureText: { flex: 1 },
    featureTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 2,
    },
    featureDesc: {
        fontSize: 13,
        color: '#666',
    },
    uniRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 9,
    },
    uniBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    uniText: {
        fontSize: 14,
        color: COLORS.dark,
        flex: 1,
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    contactBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    contactLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#888',
        width: 80,
    },
    contactValue: {
        fontSize: 14,
        color: '#2563eb',
        flex: 1,
        textAlign: 'right',
    },
    footer: {
        textAlign: 'center',
        fontSize: 12,
        color: '#bbb',
        marginVertical: 24,
    },
});
