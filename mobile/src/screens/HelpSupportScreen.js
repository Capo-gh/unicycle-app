import React, { useState } from 'react';
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

const faqs = [
    {
        q: 'How do I create a listing?',
        a: 'Tap the "Sell" tab in the bottom navigation bar. Fill in the title, category, condition, price, description, photos, and select a Safe Zone. Tap "Post Item" and your listing goes live immediately.',
    },
    {
        q: 'How do I message a seller?',
        a: "Open any listing and tap \"Message Seller\". This opens a private chat inside the Messages tab. You can also tap \"I'm Interested\" to express interest without sending a message.",
    },
    {
        q: 'What are Safe Zones?',
        a: 'Safe Zones are designated public locations on campus (library lobbies, student union buildings, etc.) where buyers and sellers agree to meet. All listings must include a Safe Zone.',
    },
    {
        q: 'How do I mark my item as sold?',
        a: 'Go to Profile → My Listings. Tap "Mark Sold" on the listing. The item will show a SOLD badge and be hidden from the active marketplace. You can mark it as available again anytime.',
    },
    {
        q: 'Can I edit my listing after posting?',
        a: 'Yes! Go to Profile → My Listings and tap "Edit" on any listing. You can change the title, price, description, photos, condition, category, and Safe Zone.',
    },
    {
        q: "Why can't I see listings from other universities?",
        a: 'UniCycle is campus-specific. Use the university selector on the Browse page to switch between universities you have access to.',
    },
    {
        q: 'How do I delete a listing?',
        a: "Go to Profile → My Listings, then tap the delete icon on the listing you want to remove. You'll be asked to confirm before it is permanently deleted.",
    },
    {
        q: "I didn't receive my verification email. What do I do?",
        a: "Check your spam/junk folder first. Make sure you used your university email address. If the email still isn't there, try signing up again. Contact support@unicycle.ca if the problem persists.",
    },
];

function FaqItem({ faq }) {
    const [open, setOpen] = useState(false);
    return (
        <View>
            <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => setOpen(!open)}
                activeOpacity={0.7}
            >
                <Text style={styles.faqQuestionText}>{faq.q}</Text>
                <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#999"
                />
            </TouchableOpacity>
            {open && (
                <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.a}</Text>
                </View>
            )}
        </View>
    );
}

export default function HelpSupportScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Contact tip */}
                <View style={[styles.section, { marginTop: 24 }]}>
                    <View style={styles.tipBanner}>
                        <Text style={styles.tipBannerText}>
                            Have a question not answered here? Email{' '}
                            <Text style={styles.tipBannerLink}>support@unicycle.ca</Text>
                            {'. We typically respond within one business day.'}
                        </Text>
                    </View>
                </View>

                {/* FAQ */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    <View style={styles.card}>
                        {faqs.map((faq, i) => (
                            <View key={i} style={i < faqs.length - 1 ? styles.faqBorder : null}>
                                <FaqItem faq={faq} />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Contact */}
                <View style={[styles.section, { marginBottom: 32 }]}>
                    <Text style={styles.sectionTitle}>Contact Support</Text>
                    <View style={styles.card}>
                        {[
                            { label: 'Email', value: 'support@unicycle.ca' },
                            { label: 'Hours', value: 'Mon – Fri, 9 AM – 5 PM ET' },
                            { label: 'Response', value: 'Within 1 business day' },
                        ].map((row, i) => (
                            <View key={i} style={[styles.contactRow, i < 2 && styles.contactBorder]}>
                                <Text style={styles.contactLabel}>{row.label}</Text>
                                <Text style={styles.contactValue}>{row.value}</Text>
                            </View>
                        ))}
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
        overflow: 'hidden',
    },
    tipBanner: {
        backgroundColor: '#f0fdf4',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#bbf7d0',
        padding: 14,
    },
    tipBannerText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    tipBannerLink: {
        color: COLORS.green,
        fontWeight: '600',
    },
    faqBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    faqQuestion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        gap: 8,
    },
    faqQuestionText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.dark,
        lineHeight: 20,
    },
    faqAnswer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    faqAnswerText: {
        fontSize: 13,
        color: '#555',
        lineHeight: 19,
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 14,
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
        color: COLORS.dark,
        flex: 1,
        textAlign: 'right',
    },
});
