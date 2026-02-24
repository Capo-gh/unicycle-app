import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
    Modal,
    TextInput,
    Dimensions,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getListings } from '../api/listings';
import { COLORS } from '../../../shared/constants/colors';
import NotificationBell from '../components/NotificationBell';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

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

const categories = [
    { label: 'All', value: 'All' },
    { label: 'Textbooks', value: 'Textbooks & Course Materials' },
    { label: 'Electronics', value: 'Electronics & Gadgets' },
    { label: 'Furniture', value: 'Furniture & Decor' },
    { label: 'Clothing', value: 'Clothing & Accessories' },
    { label: 'Sports', value: 'Sports & Fitness' },
    { label: 'Kitchen', value: 'Kitchen & Dining' },
    { label: 'Supplies', value: 'School Supplies' },
    { label: 'Bikes', value: 'Bikes & Transportation' },
    { label: 'Other', value: 'Other' },
];

const conditions = ['All', 'New', 'Like New', 'Good', 'Fair'];

const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
];

export default function BrowseScreen({ navigation }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMarketplacePicker, setShowMarketplacePicker] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [currentMarketplace, setCurrentMarketplace] = useState('McGill University');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Advanced filters
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        condition: 'All',
        sort: 'newest',
    });

    const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.condition !== 'All' || filters.sort !== 'newest';

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchListings();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchListings();
    }, [currentMarketplace, selectedCategory, filters]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = { university: currentMarketplace };
            if (searchQuery.trim()) params.search = searchQuery.trim();
            if (selectedCategory !== 'All') params.category = selectedCategory;
            if (filters.minPrice) params.min_price = parseFloat(filters.minPrice);
            if (filters.maxPrice) params.max_price = parseFloat(filters.maxPrice);
            if (filters.condition !== 'All') params.condition = filters.condition;
            if (filters.sort !== 'newest') params.sort = filters.sort;

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

    const clearFilters = () => {
        setFilters({ minPrice: '', maxPrice: '', condition: 'All', sort: 'newest' });
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
            {item.condition && (
                <View style={styles.conditionBadge}>
                    <Text style={styles.conditionBadgeText}>{item.condition}</Text>
                </View>
            )}
            {item.seller?.is_sponsor && item.seller?.sponsored_category === item.category && (
                <View style={styles.sponsoredBadge}>
                    <Text style={styles.sponsoredBadgeText}>Sponsored</Text>
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
                    <Text style={styles.headerTitle}>UniCycle</Text>
                    <View style={styles.headerTopRight}>
                        <NotificationBell
                            onPress={() => navigation.navigate('Profile', { screen: 'Notifications' })}
                            color={COLORS.dark}
                        />
                        <TouchableOpacity
                            style={styles.marketplaceButton}
                            onPress={() => setShowMarketplacePicker(true)}
                        >
                            <Ionicons name="location" size={16} color={COLORS.green} />
                            <Text style={styles.marketplaceButtonText}>{currentMarketplaceShortName}</Text>
                            <Ionicons name="chevron-down" size={16} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search + Filter Button */}
                <View style={styles.searchRow}>
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
                    <TouchableOpacity
                        style={[styles.filterButton, (showFilterModal || hasActiveFilters) && styles.filterButtonActive]}
                        onPress={() => setShowFilterModal(true)}
                    >
                        <Ionicons name="options-outline" size={22} color={(showFilterModal || hasActiveFilters) ? '#fff' : '#666'} />
                        {hasActiveFilters && !showFilterModal && <View style={styles.filterDot} />}
                    </TouchableOpacity>
                </View>

                {/* Category Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryRow}
                >
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.value}
                            style={[styles.categoryChip, selectedCategory === cat.value && styles.categoryChipActive]}
                            onPress={() => setSelectedCategory(cat.value)}
                        >
                            <Text style={[styles.categoryChipText, selectedCategory === cat.value && styles.categoryChipTextActive]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Results count */}
            {!loading && (
                <View style={styles.resultsRow}>
                    <Text style={styles.resultsText}>
                        {listings.length} item{listings.length !== 1 ? 's' : ''} found
                        {hasActiveFilters ? ' (filtered)' : ''}
                    </Text>
                    {hasActiveFilters && (
                        <TouchableOpacity onPress={clearFilters}>
                            <Text style={styles.clearFiltersText}>Clear filters</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.green} />
                </View>
            ) : listings.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="search-outline" size={64} color="#d1d5db" />
                    <Text style={styles.emptyTitle}>No listings found</Text>
                    <Text style={styles.emptySubtitle}>
                        {hasActiveFilters ? 'Try adjusting your filters' : 'Try selecting a different marketplace'}
                    </Text>
                    {hasActiveFilters && (
                        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                            <Text style={styles.clearFiltersButtonText}>Clear all filters</Text>
                        </TouchableOpacity>
                    )}
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

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowFilterModal(false)}
                >
                    <View style={styles.filterModalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filters</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.dark} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.filterBody}>
                            {/* Price Range */}
                            <Text style={styles.filterLabel}>Price Range (CAD)</Text>
                            <View style={styles.priceRow}>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="Min"
                                    keyboardType="numeric"
                                    value={filters.minPrice}
                                    onChangeText={(val) => setFilters(prev => ({ ...prev, minPrice: val }))}
                                />
                                <Text style={styles.priceDash}>—</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="Max"
                                    keyboardType="numeric"
                                    value={filters.maxPrice}
                                    onChangeText={(val) => setFilters(prev => ({ ...prev, maxPrice: val }))}
                                />
                            </View>

                            {/* Condition */}
                            <Text style={styles.filterLabel}>Condition</Text>
                            <View style={styles.chipRow}>
                                {conditions.map((cond) => (
                                    <TouchableOpacity
                                        key={cond}
                                        style={[styles.chipOption, filters.condition === cond && styles.chipOptionActive]}
                                        onPress={() => setFilters(prev => ({ ...prev, condition: cond }))}
                                    >
                                        <Text style={[styles.chipOptionText, filters.condition === cond && styles.chipOptionTextActive]}>
                                            {cond}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Sort */}
                            <Text style={styles.filterLabel}>Sort By</Text>
                            {sortOptions.map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={styles.sortOption}
                                    onPress={() => setFilters(prev => ({ ...prev, sort: opt.value }))}
                                >
                                    <Ionicons
                                        name={filters.sort === opt.value ? 'radio-button-on' : 'radio-button-off'}
                                        size={20}
                                        color={filters.sort === opt.value ? COLORS.green : '#999'}
                                    />
                                    <Text style={[styles.sortOptionText, filters.sort === opt.value && { color: COLORS.dark, fontWeight: '600' }]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Bottom actions */}
                        <View style={styles.filterActions}>
                            {hasActiveFilters && (
                                <TouchableOpacity style={styles.clearAllButton} onPress={clearFilters}>
                                    <Text style={styles.clearAllButtonText}>Clear All</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.applyButton, !hasActiveFilters && { flex: 1 }]}
                                onPress={() => setShowFilterModal(false)}
                            >
                                <Text style={styles.applyButtonText}>Apply Filters</Text>
                            </TouchableOpacity>
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
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerTopRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    searchContainer: {
        flex: 1,
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
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: COLORS.green,
        borderColor: COLORS.green,
    },
    filterDot: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
    },
    categoryRow: {
        paddingBottom: 12,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
    },
    categoryChipActive: {
        backgroundColor: COLORS.green,
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#374151',
    },
    categoryChipTextActive: {
        color: '#fff',
    },
    resultsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    resultsText: {
        fontSize: 13,
        color: '#666',
    },
    clearFiltersText: {
        fontSize: 13,
        color: COLORS.green,
        fontWeight: '600',
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
    conditionBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    conditionBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#374151',
    },
    sponsoredBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#f59e0b',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    sponsoredBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#ffffff',
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
        textAlign: 'center',
    },
    clearFiltersButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.green,
    },
    clearFiltersButtonText: {
        color: COLORS.green,
        fontWeight: '600',
        fontSize: 14,
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
    // Filter Modal
    filterModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
        maxHeight: '75%',
    },
    filterBody: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 10,
        marginTop: 16,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    priceInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 15,
        backgroundColor: '#fff',
    },
    priceDash: {
        fontSize: 16,
        color: '#999',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chipOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    chipOptionActive: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderColor: COLORS.green,
    },
    chipOptionText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#374151',
    },
    chipOptionTextActive: {
        color: COLORS.green,
        fontWeight: '600',
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    sortOptionText: {
        fontSize: 15,
        color: '#666',
    },
    filterActions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 10,
    },
    clearAllButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
    },
    clearAllButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },
    applyButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: COLORS.green,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
});
