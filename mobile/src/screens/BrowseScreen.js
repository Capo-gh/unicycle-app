import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Image,
    Modal,
    TextInput,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getListings } from '../api/listings';
import { COLORS } from '../../../shared/constants/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Account for padding and gaps

const marketplaces = [
    { fullName: 'McGill University', shortName: 'McGill' },
    { fullName: 'Concordia University', shortName: 'Concordia' },
    { fullName: 'École de technologie supérieure (ÉTS)', shortName: 'ÉTS' },
    { fullName: 'Polytechnique Montréal', shortName: 'Poly' },
    { fullName: 'Université de Montréal (UdeM)', shortName: 'UdeM' },
    { fullName: 'Université du Québec à Montréal (UQAM)', shortName: 'UQAM' },
    { fullName: 'Université Laval', shortName: 'Laval' },
    { fullName: 'Université de Sherbrooke', shortName: 'Sherbrooke' },
];

export default function BrowseScreen({ navigation }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMarketplacePicker, setShowMarketplacePicker] = useState(false);
    const [currentMarketplace, setCurrentMarketplace] = useState('McGill University');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchListings();
    }, [currentMarketplace, searchQuery]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = { university: currentMarketplace };
            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }
            const data = await getListings(params);
            setListings(data);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarketplaceChange = (marketplace) => {
        setCurrentMarketplace(marketplace);
        setShowMarketplacePicker(false);
    };

    const currentMarketplaceShortName = marketplaces.find(m => m.fullName === currentMarketplace)?.shortName || 'UniCycle';

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ItemDetail', { listing: item })}
        >
            {item.images && item.images.length > 0 ? (
                <Image
                    source={{ uri: Array.isArray(item.images) ? item.images[0] : item.images.split(',')[0] }}
                    style={styles.image}
                />
            ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                    <Ionicons name="image-outline" size={48} color="#d1d5db" />
                </View>
            )}
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.price}>${item.price}</Text>
                <Text style={styles.category}>{item.category}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>🚲 UniCycle</Text>
                    <TouchableOpacity
                        style={styles.marketplaceButton}
                        onPress={() => setShowMarketplacePicker(true)}
                    >
                        <Ionicons name="location" size={16} color={COLORS.green} />
                        <Text style={styles.marketplaceButtonText}>{currentMarketplaceShortName}</Text>
                        <Ionicons name="chevron-down" size={16} color="#666" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search listings..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.green} />
                </View>
            ) : listings.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="search-outline" size={64} color="#d1d5db" />
                    <Text style={styles.emptyTitle}>No listings found</Text>
                    <Text style={styles.emptySubtitle}>Try selecting a different marketplace</Text>
                </View>
            ) : (
                <FlatList
                    data={listings}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={fetchListings}
                />
            )}

            {/* Marketplace Picker Modal */}
            <Modal
                visible={showMarketplacePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowMarketplacePicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowMarketplacePicker(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Switch Marketplace</Text>
                            <TouchableOpacity onPress={() => setShowMarketplacePicker(false)}>
                                <Ionicons name="close" size={24} color={COLORS.dark} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.marketplaceList}>
                            {marketplaces.map((marketplace) => (
                                <TouchableOpacity
                                    key={marketplace.fullName}
                                    style={[
                                        styles.marketplaceItem,
                                        currentMarketplace === marketplace.fullName && styles.marketplaceItemActive
                                    ]}
                                    onPress={() => handleMarketplaceChange(marketplace.fullName)}
                                >
                                    <View style={styles.marketplaceItemContent}>
                                        <Text style={[
                                            styles.marketplaceItemTitle,
                                            currentMarketplace === marketplace.fullName && styles.marketplaceItemTitleActive
                                        ]}>
                                            {marketplace.shortName} Marketplace
                                        </Text>
                                        <Text style={styles.marketplaceItemSubtitle}>
                                            {marketplace.fullName}
                                        </Text>
                                    </View>
                                    {currentMarketplace === marketplace.fullName && (
                                        <View style={styles.checkmark}>
                                            <Ionicons name="checkmark-circle" size={24} color={COLORS.green} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
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
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    marketplaceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        gap: 4,
    },
    marketplaceButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.dark,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 15,
    },
    clearButton: {
        padding: 4,
    },
    list: {
        padding: 8,
    },
    card: {
        width: CARD_WIDTH,
        margin: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: 150,
        backgroundColor: '#f0f0f0',
    },
    imagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        padding: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        color: COLORS.dark,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.green,
        marginBottom: 4,
    },
    category: {
        fontSize: 12,
        color: '#666',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.dark,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
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
        maxHeight: '80%',
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
    marketplaceList: {
        paddingVertical: 8,
    },
    marketplaceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    marketplaceItemActive: {
        backgroundColor: 'rgba(76, 175, 80, 0.05)',
    },
    marketplaceItemContent: {
        flex: 1,
    },
    marketplaceItemTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    marketplaceItemTitleActive: {
        color: COLORS.green,
    },
    marketplaceItemSubtitle: {
        fontSize: 12,
        color: '#999',
    },
    checkmark: {
        marginLeft: 12,
    },
});
