import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
    Alert,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../../../shared/constants/colors';
import { getMyListings, deleteListing } from '../api/listings';

export default function MyListingsScreen({ navigation }) {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const data = await getMyListings();
            setListings(data);
        } catch (error) {
            console.error('Error fetching listings:', error);
            Alert.alert('Error', 'Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const data = await getMyListings();
            setListings(data);
        } catch (error) {
            console.error('Error refreshing listings:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const handleDelete = (listingId, title) => {
        Alert.alert(
            'Delete Listing',
            `Are you sure you want to delete "${title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteListing(listingId);
                            setListings(prev => prev.filter(l => l.id !== listingId));
                        } catch (error) {
                            console.error('Error deleting listing:', error);
                            Alert.alert('Error', 'Failed to delete listing');
                        }
                    }
                }
            ]
        );
    };

    const renderListing = ({ item: listing }) => (
        <TouchableOpacity
            style={styles.listingCard}
            onPress={() => navigation.navigate('ItemDetail', { listing })}
            activeOpacity={0.7}
        >
            {listing.images ? (
                <Image
                    source={{ uri: typeof listing.images === 'string' ? listing.images.split(',')[0] : listing.images[0] }}
                    style={styles.listingImage}
                />
            ) : (
                <View style={[styles.listingImage, styles.listingImagePlaceholder]}>
                    <Ionicons name="image-outline" size={32} color="#d1d5db" />
                </View>
            )}
            <View style={styles.listingContent}>
                <Text style={styles.listingTitle} numberOfLines={1}>{listing.title}</Text>
                <Text style={styles.listingPrice}>${listing.price}</Text>
                <View style={styles.listingBadges}>
                    <View style={styles.listingBadge}>
                        <Text style={styles.listingBadgeText}>{listing.category}</Text>
                    </View>
                    <View style={[styles.listingBadge, listing.is_sold && styles.soldBadge]}>
                        <Text style={[styles.listingBadgeText, listing.is_sold && styles.soldBadgeText]}>
                            {listing.is_sold ? 'Sold' : 'Active'}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={styles.listingActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('ItemDetail', { listing })}
                >
                    <Ionicons name="create-outline" size={20} color={COLORS.green} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(listing.id, listing.title)}
                >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : listings.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="add-circle-outline" size={64} color="#d1d5db" />
                    <Text style={styles.emptyTitle}>No listings yet</Text>
                    <Text style={styles.emptySubtext}>Tap the Sell tab to create your first listing</Text>
                </View>
            ) : (
                <FlatList
                    data={listings}
                    renderItem={renderListing}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.green} />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.dark,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
    listingCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
    },
    listingImage: {
        width: 70,
        height: 70,
        borderRadius: 10,
    },
    listingImagePlaceholder: {
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listingContent: {
        flex: 1,
        marginLeft: 12,
    },
    listingTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    listingPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.green,
        marginBottom: 6,
    },
    listingBadges: {
        flexDirection: 'row',
        gap: 6,
    },
    listingBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        backgroundColor: '#f0fdf4',
    },
    listingBadgeText: {
        fontSize: 11,
        color: '#15803d',
        fontWeight: '500',
    },
    soldBadge: {
        backgroundColor: '#fef2f2',
    },
    soldBadgeText: {
        color: '#dc2626',
    },
    listingActions: {
        gap: 8,
        marginLeft: 8,
    },
    actionButton: {
        padding: 8,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
    },
});
