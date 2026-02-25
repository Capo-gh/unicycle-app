import { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Image,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../../shared/constants/colors';
import { createSecurePaySession, activateSecurePay } from '../api/payments';

export default function SecurePayModal({ visible, item, onClose, onProceed }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    if (!item) return null;

    const imageUrl = item.images
        ? (Array.isArray(item.images) ? item.images[0] : item.images.split(',')[0])
        : null;

    const safeZone = item.safe_zone || item.safeZone || 'the safe zone';

    const handleSecurePay = async () => {
        setLoading(true);
        try {
            const { checkout_url, session_id } = await createSecurePaySession(item.id);
            await WebBrowser.openBrowserAsync(checkout_url);
            // Browser closed — check if payment completed
            try {
                await activateSecurePay(item.id, session_id);
                onClose();
                Alert.alert(t('securePay.title'), 'Your payment is now held in escrow. Meet the seller at the safe zone to inspect the item.');
            } catch {
                // Payment not completed (cancelled or still pending) — just close browser silently
            }
        } catch (err) {
            Alert.alert('Error', err.response?.data?.detail || 'Failed to start payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.shieldIcon}>
                                <Ionicons name="shield-checkmark" size={22} color={COLORS.green} />
                            </View>
                            <View>
                                <Text style={styles.headerTitle}>{t('securePay.title')}</Text>
                                <Text style={styles.headerSubtitle}>{t('securePay.subtitle')}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={22} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Item Info */}
                        <View style={styles.itemInfo}>
                            {imageUrl && (
                                <Image source={{ uri: imageUrl }} style={styles.itemImage} />
                            )}
                            <View style={styles.itemDetails}>
                                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                                <Text style={styles.itemPrice}>${item.price}</Text>
                            </View>
                        </View>

                        {/* Recommendation Banner — shown when opened from "Message Seller" */}
                        {onProceed && (
                            <View style={styles.recommendBanner}>
                                <Text style={styles.recommendStar}>⭐</Text>
                                <View style={styles.recommendContent}>
                                    <Text style={styles.recommendTitle}>We recommend Secure-Pay for this item</Text>
                                    <Text style={styles.recommendDesc}>
                                        {item.price >= 80
                                            ? 'High-value purchases are best protected through escrow — pay only after you inspect and approve the item in person.'
                                            : 'Escrow protection gives you peace of mind — pay only after you inspect and approve the item in person.'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Why Secure-Pay */}
                        <View style={styles.whySection}>
                            <View style={styles.whyHeader}>
                                <Ionicons name="lock-closed" size={18} color={COLORS.green} />
                                <View style={styles.whyContent}>
                                    <Text style={styles.whyTitle}>{t('securePay.why')}</Text>
                                    <Text style={styles.whyText}>{t('securePay.whyDesc')}</Text>
                                </View>
                            </View>
                        </View>

                        {/* How It Works */}
                        <Text style={styles.sectionTitle}>{t('securePay.howItWorks')}</Text>
                        {[
                            { step: '1', title: t('securePay.step1Title'), desc: t('securePay.step1Desc') },
                            { step: '2', title: t('securePay.step2Title'), desc: `${t('securePay.step2Desc')} ${safeZone}` },
                            { step: '3', title: t('securePay.step3Title'), desc: t('securePay.step3Desc') },
                            { step: '4', title: t('securePay.step4Title'), desc: t('securePay.step4Desc') },
                        ].map((s) => (
                            <View key={s.step} style={styles.stepRow}>
                                <View style={styles.stepCircle}>
                                    <Text style={styles.stepNumber}>{s.step}</Text>
                                </View>
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>{s.title}</Text>
                                    <Text style={styles.stepDesc}>{s.desc}</Text>
                                </View>
                            </View>
                        ))}

                        {/* Protection Features */}
                        <View style={styles.protectionSection}>
                            {[
                                t('securePay.feature1'),
                                t('securePay.feature2'),
                                t('securePay.feature3'),
                            ].map((feature, i) => (
                                <View key={i} style={styles.featureRow}>
                                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Fee Info */}
                        <View style={styles.feeSection}>
                            <Text style={styles.feeTitle}>{t('securePay.feeLabel')} (${(item.price * 0.07).toFixed(2)})</Text>
                            <Text style={styles.feeDesc}>{t('securePay.feeDesc')}</Text>
                        </View>
                    </ScrollView>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        {onProceed ? (
                            /* Opened from "Message Seller" — informational, payment is on the listing page */
                            <>
                                <TouchableOpacity style={styles.proceedButton} onPress={onProceed}>
                                    <Text style={styles.proceedText}>Continue to Chat</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.laterButton} onPress={onClose}>
                                    <Text style={styles.laterText}>{t('securePay.maybeLater')}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            /* Opened from "Pay Securely" button on listing — full payment flow */
                            <>
                                <TouchableOpacity
                                    style={[styles.proceedButton, loading && styles.proceedButtonDisabled]}
                                    onPress={handleSecurePay}
                                    disabled={loading}
                                >
                                    {loading
                                        ? <ActivityIndicator color="#fff" size="small" />
                                        : <Text style={styles.proceedText}>{t('securePay.paySecurely')} (${((item.price || 0) * 1.07).toFixed(2)} CAD)</Text>
                                    }
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.laterButton} onPress={onClose}>
                                    <Text style={styles.laterText}>{t('securePay.maybeLater')}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    shieldIcon: {
        padding: 8,
        backgroundColor: 'rgba(76,175,80,0.1)',
        borderRadius: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    closeButton: {
        padding: 8,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        marginBottom: 16,
    },
    itemImage: {
        width: 56,
        height: 56,
        borderRadius: 8,
    },
    itemDetails: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111',
    },
    itemPrice: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.green,
    },
    recommendBanner: {
        backgroundColor: '#fffbeb',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#fcd34d',
        flexDirection: 'row',
        gap: 10,
    },
    recommendStar: {
        fontSize: 18,
    },
    recommendContent: {
        flex: 1,
    },
    recommendTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#92400e',
        marginBottom: 3,
    },
    recommendDesc: {
        fontSize: 12,
        color: '#b45309',
        lineHeight: 17,
    },
    whySection: {
        backgroundColor: 'rgba(76,175,80,0.08)',
        borderRadius: 10,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(76,175,80,0.2)',
    },
    whyHeader: {
        flexDirection: 'row',
        gap: 10,
    },
    whyContent: {
        flex: 1,
    },
    whyTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111',
        marginBottom: 4,
    },
    whyText: {
        fontSize: 13,
        color: '#555',
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111',
        marginBottom: 14,
    },
    stepRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 14,
    },
    stepCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.green,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumber: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111',
        marginBottom: 2,
    },
    stepDesc: {
        fontSize: 13,
        color: '#666',
    },
    protectionSection: {
        backgroundColor: '#f9fafb',
        borderRadius: 10,
        padding: 14,
        gap: 10,
        marginTop: 6,
        marginBottom: 12,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    featureText: {
        fontSize: 13,
        color: '#555',
        flex: 1,
    },
    feeSection: {
        backgroundColor: '#fefce8',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#fde68a',
        marginBottom: 20,
    },
    feeTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555',
        marginBottom: 4,
    },
    feeDesc: {
        fontSize: 12,
        color: '#888',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 8,
    },
    proceedButton: {
        backgroundColor: COLORS.green,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    proceedButtonDisabled: {
        opacity: 0.6,
    },
    proceedText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    contactButton: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    contactText: {
        color: '#555',
        fontSize: 14,
        fontWeight: '500',
    },
    laterButton: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    laterText: {
        color: '#888',
        fontSize: 14,
    },
});
