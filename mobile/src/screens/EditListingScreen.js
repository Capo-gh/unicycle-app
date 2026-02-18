import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { getSafeZones } from '../../../shared/constants/safeZones';
import { updateListing, markAsSold, markAsUnsold } from '../api/listings';
import { useAuth } from '../contexts/AuthContext';

export default function EditListingScreen({ route, navigation }) {
    const { listing } = route.params;
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [togglingId, setTogglingId] = useState(false);
    const [showSafeZonePicker, setShowSafeZonePicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const [formData, setFormData] = useState({
        title: listing.title || '',
        category: listing.category || '',
        condition: listing.condition || '',
        price: listing.price?.toString() || '',
        description: listing.description || '',
        safeZone: listing.safe_zone || listing.safeZone || '',
        safeZoneAddress: listing.safe_zone_address || listing.safeZoneAddress || '',
    });

    const categories = [
        'Textbooks & Course Materials',
        'Electronics & Gadgets',
        'Furniture & Decor',
        'Clothing & Accessories',
        'Sports & Fitness',
        'Kitchen & Dining',
        'School Supplies',
        'Bikes & Transportation',
        'Other'
    ];

    const conditions = ['New', 'Like New', 'Good', 'Fair'];
    const safeZones = getSafeZones(user?.university || '');

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }
        if (!formData.category) {
            Alert.alert('Error', 'Please select a category');
            return;
        }
        if (!formData.condition) {
            Alert.alert('Error', 'Please select a condition');
            return;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            Alert.alert('Error', 'Please enter a valid price');
            return;
        }
        if (!formData.description.trim() || formData.description.length < 10) {
            Alert.alert('Error', 'Description must be at least 10 characters');
            return;
        }
        if (!formData.safeZone) {
            Alert.alert('Error', 'Please select a safe zone');
            return;
        }

        setLoading(true);
        try {
            await updateListing(listing.id, {
                title: formData.title.trim(),
                category: formData.category,
                condition: formData.condition,
                price: parseFloat(formData.price),
                description: formData.description.trim(),
                safe_zone: formData.safeZone,
                safe_zone_address: formData.safeZoneAddress,
            });
            Alert.alert('Success', 'Listing updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to update listing');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSold = async () => {
        setTogglingId(true);
        try {
            if (listing.is_sold) {
                await markAsUnsold(listing.id);
                Alert.alert('Success', 'Listing marked as available', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                await markAsSold(listing.id);
                Alert.alert('Success', 'Listing marked as sold', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update listing status');
        } finally {
            setTogglingId(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Mark as Sold Toggle */}
                <TouchableOpacity
                    style={[styles.soldToggle, listing.is_sold && styles.soldToggleActive]}
                    onPress={handleToggleSold}
                    disabled={togglingId}
                >
                    {togglingId ? (
                        <ActivityIndicator color={listing.is_sold ? COLORS.green : '#ef4444'} size="small" />
                    ) : (
                        <Ionicons
                            name={listing.is_sold ? 'checkmark-circle' : 'checkmark-circle-outline'}
                            size={20}
                            color={listing.is_sold ? COLORS.green : '#ef4444'}
                        />
                    )}
                    <Text style={[styles.soldToggleText, listing.is_sold && styles.soldToggleTextActive]}>
                        {listing.is_sold ? 'Marked as Sold — Tap to Mark Available' : 'Tap to Mark as Sold'}
                    </Text>
                </TouchableOpacity>

                {/* Title */}
                <View style={styles.section}>
                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., MacBook Pro 13-inch"
                        value={formData.title}
                        onChangeText={(text) => setFormData({ ...formData, title: text })}
                    />
                </View>

                {/* Category */}
                <View style={styles.section}>
                    <Text style={styles.label}>Category *</Text>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setShowCategoryPicker(true)}
                    >
                        <View style={styles.dropdownButtonContent}>
                            <Ionicons name="grid" size={18} color={formData.category ? COLORS.green : '#999'} />
                            <Text style={[styles.dropdownButtonText, !formData.category && styles.dropdownPlaceholder]}>
                                {formData.category || 'Select a category'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-down" size={20} color="#999" />
                    </TouchableOpacity>
                </View>

                {/* Condition */}
                <View style={styles.section}>
                    <Text style={styles.label}>Condition *</Text>
                    <View style={styles.conditionsRow}>
                        {conditions.map((cond) => (
                            <TouchableOpacity
                                key={cond}
                                style={[styles.conditionButton, formData.condition === cond && styles.conditionButtonActive]}
                                onPress={() => setFormData({ ...formData, condition: cond })}
                            >
                                <Text style={[styles.conditionButtonText, formData.condition === cond && styles.conditionButtonTextActive]}>
                                    {cond}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Price */}
                <View style={styles.section}>
                    <Text style={styles.label}>Price (CAD) *</Text>
                    <View style={styles.priceInputContainer}>
                        <Text style={styles.priceDollar}>$</Text>
                        <TextInput
                            style={styles.priceInput}
                            placeholder="0"
                            value={formData.price}
                            onChangeText={(text) => setFormData({ ...formData, price: text })}
                            keyboardType="decimal-pad"
                        />
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.label}>Description *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your item..."
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        returnKeyType="done"
                        onSubmitEditing={() => Keyboard.dismiss()}
                    />
                </View>

                {/* Safe Zone */}
                <View style={styles.section}>
                    <Text style={styles.label}>Meetup Location *</Text>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setShowSafeZonePicker(true)}
                    >
                        <View style={styles.dropdownButtonContent}>
                            <Ionicons name="location" size={18} color={formData.safeZone ? COLORS.green : '#999'} />
                            <Text style={[styles.dropdownButtonText, !formData.safeZone && styles.dropdownPlaceholder]}>
                                {formData.safeZone || 'Select a safe zone'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-down" size={20} color="#999" />
                    </TouchableOpacity>
                    {formData.safeZoneAddress ? (
                        <View style={styles.addressBox}>
                            <Ionicons name="location-outline" size={16} color="#666" />
                            <Text style={styles.addressText}>{formData.safeZoneAddress}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                            <Text style={styles.submitButtonText}>Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Category Picker Modal */}
            <Modal visible={showCategoryPicker} transparent animationType="slide" onRequestClose={() => setShowCategoryPicker(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCategoryPicker(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Category</Text>
                            <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                                <Ionicons name="close" size={24} color={COLORS.dark} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.pickerList}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.pickerItem, formData.category === cat && styles.pickerItemActive]}
                                    onPress={() => { setFormData({ ...formData, category: cat }); setShowCategoryPicker(false); }}
                                >
                                    <Text style={[styles.pickerItemText, formData.category === cat && styles.pickerItemTextActive]}>{cat}</Text>
                                    {formData.category === cat && <Ionicons name="checkmark-circle" size={24} color={COLORS.green} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Safe Zone Picker Modal */}
            <Modal visible={showSafeZonePicker} transparent animationType="slide" onRequestClose={() => setShowSafeZonePicker(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSafeZonePicker(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Safe Zone</Text>
                            <TouchableOpacity onPress={() => setShowSafeZonePicker(false)}>
                                <Ionicons name="close" size={24} color={COLORS.dark} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.pickerList}>
                            {safeZones.map((zone) => (
                                <TouchableOpacity
                                    key={zone.name}
                                    style={[styles.pickerItem, formData.safeZone === zone.name && styles.pickerItemActive]}
                                    onPress={() => {
                                        setFormData({ ...formData, safeZone: zone.name, safeZoneAddress: zone.address });
                                        setShowSafeZonePicker(false);
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.pickerItemText, formData.safeZone === zone.name && styles.pickerItemTextActive]}>{zone.name}</Text>
                                        <Text style={styles.pickerItemSub}>{zone.address}</Text>
                                    </View>
                                    {formData.safeZone === zone.name && <Ionicons name="checkmark-circle" size={24} color={COLORS.green} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1 },
    soldToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        margin: 16,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#fca5a5',
        backgroundColor: '#fef2f2',
    },
    soldToggleActive: {
        borderColor: COLORS.green,
        backgroundColor: 'rgba(76,175,80,0.06)',
    },
    soldToggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ef4444',
        flex: 1,
    },
    soldToggleTextActive: {
        color: COLORS.green,
    },
    section: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
    },
    textArea: { minHeight: 100 },
    conditionsRow: { flexDirection: 'row', gap: 8 },
    conditionButton: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    conditionButtonActive: { backgroundColor: COLORS.green },
    conditionButtonText: { fontSize: 13, fontWeight: '600', color: '#666' },
    conditionButtonTextActive: { color: '#fff' },
    priceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        paddingLeft: 16,
    },
    priceDollar: { fontSize: 18, fontWeight: '600', color: COLORS.dark, marginRight: 4 },
    priceInput: { flex: 1, padding: 12, fontSize: 15 },
    dropdownButton: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    dropdownButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    dropdownButtonText: { fontSize: 15, color: COLORS.dark },
    dropdownPlaceholder: { color: '#999' },
    addressBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        padding: 12,
        borderRadius: 12,
        marginTop: 12,
        gap: 8,
    },
    addressText: { flex: 1, fontSize: 13, color: '#666' },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.green,
        marginHorizontal: 16,
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    submitButtonDisabled: { opacity: 0.6 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
        maxHeight: '70%',
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#d1d5db',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: { fontSize: 18, fontWeight: '600', color: COLORS.dark },
    pickerList: { paddingVertical: 8 },
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    pickerItemActive: { backgroundColor: 'rgba(76,175,80,0.05)' },
    pickerItemText: { fontSize: 15, fontWeight: '500', color: COLORS.dark },
    pickerItemTextActive: { color: COLORS.green, fontWeight: '600' },
    pickerItemSub: { fontSize: 12, color: '#999', marginTop: 2 },
});
