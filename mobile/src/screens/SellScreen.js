import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../../shared/constants/colors';
import { createListing } from '../api/listings';
import { uploadImages } from '../api/upload';

export default function SellScreen({ navigation }) {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        condition: '',
        price: '',
        description: '',
        safeZone: '',
        safeZoneAddress: ''
    });
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSafeZonePicker, setShowSafeZonePicker] = useState(false);

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

    const safeZones = [
        { name: 'McConnell Library', address: '3459 McTavish St, Main Floor Lobby' },
        { name: 'Redpath Library', address: '3461 McTavish St, Front Entrance' },
        { name: 'Leacock Building', address: '855 Sherbrooke St W, Main Entrance' },
        { name: 'Shatner University Centre', address: '3480 McTavish St, Main Floor' },
        { name: 'Trottier Building', address: '3630 University St, Lobby' }
    ];

    const pickImages = async () => {
        if (images.length >= 5) {
            Alert.alert('Limit Reached', 'Maximum 5 images allowed');
            return;
        }

        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission Required', 'Please allow access to your photo library');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: 5 - images.length,
        });

        if (!result.canceled && result.assets) {
            const newImages = result.assets.map(asset => asset.uri);
            setImages([...images, ...newImages].slice(0, 5));
        }
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        // Validation
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
        if (images.length === 0) {
            Alert.alert('Error', 'Please add at least one image');
            return;
        }

        setLoading(true);

        try {
            // Upload images first
            const uploadedImages = await uploadImages(images);

            // Create listing
            const listingData = {
                title: formData.title.trim(),
                category: formData.category,
                condition: formData.condition,
                price: parseFloat(formData.price),
                description: formData.description.trim(),
                safe_zone: formData.safeZone,
                safe_zone_address: formData.safeZoneAddress,
                images: uploadedImages
            };

            await createListing(listingData);

            Alert.alert(
                'Success!',
                'Your listing has been created',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Reset form
                            setFormData({
                                title: '',
                                category: '',
                                condition: '',
                                price: '',
                                description: '',
                                safeZone: '',
                                safeZoneAddress: ''
                            });
                            setImages([]);
                            // Navigate to profile to see the listing
                            navigation.navigate('Profile');
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error creating listing:', error);
            Alert.alert('Error', error.response?.data?.detail || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sell Item</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Images Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Photos (Max 5)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
                        {images.map((uri, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image source={{ uri }} style={styles.image} />
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeImage(index)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {images.length < 5 && (
                            <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                                <Ionicons name="camera" size={32} color="#999" />
                                <Text style={styles.addImageText}>Add Photo</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>

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
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.optionChip,
                                    formData.category === cat && styles.optionChipActive
                                ]}
                                onPress={() => setFormData({ ...formData, category: cat })}
                            >
                                <Text style={[
                                    styles.optionChipText,
                                    formData.category === cat && styles.optionChipTextActive
                                ]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Condition */}
                <View style={styles.section}>
                    <Text style={styles.label}>Condition *</Text>
                    <View style={styles.conditionsRow}>
                        {conditions.map((cond) => (
                            <TouchableOpacity
                                key={cond}
                                style={[
                                    styles.conditionButton,
                                    formData.condition === cond && styles.conditionButtonActive
                                ]}
                                onPress={() => setFormData({ ...formData, condition: cond })}
                            >
                                <Text style={[
                                    styles.conditionButtonText,
                                    formData.condition === cond && styles.conditionButtonTextActive
                                ]}>
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
                    />
                    <Text style={styles.charCount}>{formData.description.length}/500</Text>
                </View>

                {/* Safe Zone */}
                <View style={styles.section}>
                    <Text style={styles.label}>Meetup Location *</Text>
                    <Text style={styles.labelSubtext}>Choose a public safe zone on campus</Text>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setShowSafeZonePicker(true)}
                    >
                        <View style={styles.dropdownButtonContent}>
                            <Ionicons name="location" size={18} color={formData.safeZone ? COLORS.green : '#999'} />
                            <Text style={[
                                styles.dropdownButtonText,
                                !formData.safeZone && styles.dropdownPlaceholder
                            ]}>
                                {formData.safeZone || 'Select a safe zone'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-down" size={20} color="#999" />
                    </TouchableOpacity>
                    {formData.safeZoneAddress && (
                        <View style={styles.addressBox}>
                            <Ionicons name="location-outline" size={16} color="#666" />
                            <Text style={styles.addressText}>{formData.safeZoneAddress}</Text>
                        </View>
                    )}
                </View>

                {/* Submit Button */}
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
                            <Text style={styles.submitButtonText}>List Item</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Safe Zone Picker Modal */}
            <Modal
                visible={showSafeZonePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSafeZonePicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSafeZonePicker(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Safe Zone</Text>
                            <TouchableOpacity onPress={() => setShowSafeZonePicker(false)}>
                                <Ionicons name="close" size={24} color={COLORS.dark} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.safeZoneList}>
                            {safeZones.map((zone) => (
                                <TouchableOpacity
                                    key={zone.name}
                                    style={[
                                        styles.safeZoneItem,
                                        formData.safeZone === zone.name && styles.safeZoneItemActive
                                    ]}
                                    onPress={() => {
                                        setFormData({
                                            ...formData,
                                            safeZone: zone.name,
                                            safeZoneAddress: zone.address
                                        });
                                        setShowSafeZonePicker(false);
                                    }}
                                >
                                    <View style={styles.safeZoneItemContent}>
                                        <View style={styles.safeZoneItemHeader}>
                                            <Ionicons
                                                name="location"
                                                size={18}
                                                color={formData.safeZone === zone.name ? COLORS.green : '#666'}
                                            />
                                            <Text style={[
                                                styles.safeZoneItemTitle,
                                                formData.safeZone === zone.name && styles.safeZoneItemTitleActive
                                            ]}>
                                                {zone.name}
                                            </Text>
                                        </View>
                                        <Text style={styles.safeZoneItemSubtitle}>{zone.address}</Text>
                                    </View>
                                    {formData.safeZone === zone.name && (
                                        <Ionicons name="checkmark-circle" size={24} color={COLORS.green} />
                                    )}
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
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    content: {
        flex: 1,
    },
    section: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 8,
    },
    labelSubtext: {
        fontSize: 12,
        color: '#999',
        marginBottom: 12,
    },
    input: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
    },
    textArea: {
        minHeight: 100,
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        textAlign: 'right',
    },
    imagesContainer: {
        flexDirection: 'row',
    },
    imageWrapper: {
        marginRight: 12,
        position: 'relative',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    addImageButton: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#d1d5db',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addImageText: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    optionsContainer: {
        marginTop: 8,
    },
    optionChip: {
        backgroundColor: COLORS.lightGray,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
    },
    optionChipActive: {
        backgroundColor: COLORS.green,
    },
    optionChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666',
    },
    optionChipTextActive: {
        color: '#fff',
    },
    conditionsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    conditionButton: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    conditionButtonActive: {
        backgroundColor: COLORS.green,
    },
    conditionButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    conditionButtonTextActive: {
        color: '#fff',
    },
    priceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        paddingLeft: 16,
    },
    priceDollar: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.dark,
        marginRight: 4,
    },
    priceInput: {
        flex: 1,
        padding: 12,
        fontSize: 15,
    },
    dropdownButton: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    dropdownButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    dropdownButtonText: {
        fontSize: 15,
        color: COLORS.dark,
    },
    dropdownPlaceholder: {
        color: '#999',
    },
    addressBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        padding: 12,
        borderRadius: 12,
        marginTop: 12,
        gap: 8,
    },
    addressText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
    },
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
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.dark,
    },
    safeZoneList: {
        paddingVertical: 8,
    },
    safeZoneItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    safeZoneItemActive: {
        backgroundColor: 'rgba(76, 175, 80, 0.05)',
    },
    safeZoneItemContent: {
        flex: 1,
    },
    safeZoneItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    safeZoneItemTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.dark,
    },
    safeZoneItemTitleActive: {
        color: COLORS.green,
    },
    safeZoneItemSubtitle: {
        fontSize: 12,
        color: '#999',
        marginLeft: 26,
    },
});
