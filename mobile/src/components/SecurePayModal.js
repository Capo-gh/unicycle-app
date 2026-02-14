import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';

export default function SecurePayModal({ visible, item, onClose, onProceed }) {
    if (!item) return null;

    const imageUrl = item.images
        ? (Array.isArray(item.images) ? item.images[0] : item.images.split(',')[0])
        : null;

    const safeZone = item.safe_zone || item.safeZone || 'the safe zone';

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
                                <Text style={styles.headerTitle}>Secure-Pay Protection</Text>
                                <Text style={styles.headerSubtitle}>Escrow for your safety</Text>
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

                        {/* Why Secure-Pay */}
                        <View style={styles.whySection}>
                            <View style={styles.whyHeader}>
                                <Ionicons name="lock-closed" size={18} color={COLORS.green} />
                                <View style={styles.whyContent}>
                                    <Text style={styles.whyTitle}>Why Secure-Pay?</Text>
                                    <Text style={styles.whyText}>
                                        This item qualifies for escrow protection because it's over $80. Your money stays safe until you verify the item in person.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* How It Works */}
                        <Text style={styles.sectionTitle}>How It Works</Text>
                        {[
                            { step: '1', title: 'You pay through UniCycle', desc: 'Your payment is held securely in escrow' },
                            { step: '2', title: 'Meet at the Safe Zone', desc: `Inspect the item at ${safeZone}` },
                            { step: '3', title: 'Confirm or decline', desc: 'Accept if satisfied, or get a full refund' },
                            { step: '4', title: 'Seller gets paid', desc: 'Payment released after your confirmation' },
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
                                'Full refund if item doesn\'t match description',
                                'Seller doesn\'t get paid until you approve',
                                'Dispute resolution if issues arise',
                            ].map((feature, i) => (
                                <View key={i} style={styles.featureRow}>
                                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Fee Info */}
                        <View style={styles.feeSection}>
                            <Text style={styles.feeTitle}>Service Fee: 7% (${(item.price * 0.07).toFixed(2)})</Text>
                            <Text style={styles.feeDesc}>This covers escrow protection, dispute resolution, and platform security.</Text>
                        </View>
                    </ScrollView>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.proceedButton} onPress={onProceed}>
                            <Text style={styles.proceedText}>Contact Seller (Secure-Pay)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.laterButton} onPress={onClose}>
                            <Text style={styles.laterText}>Maybe Later</Text>
                        </TouchableOpacity>
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
    proceedText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    laterButton: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    laterText: {
        color: '#555',
        fontSize: 14,
        fontWeight: '500',
    },
});
