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
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../../../shared/constants/colors';
import { getMyListings, deleteListing, markAsSold, markAsUnsold } from '../api/listings';
import { createBoostSession, activateBoost } from '../api/payments';

export default function MyListingsScreen({ navigation }) {
    useAuth();
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

    const handleBoost = async (listing) => {
        const isActiveBoosted = listing.is_boosted && listing.boosted_until && new Date(listing.boosted_until) > new Date();
        if (isActiveBoosted) {
            Alert.alert('Already Boosted', 'This listing is already boosted!');
            return;
        }
        try {
            const { checkout_url, session_id } = await createBoostSession(listing.id);
            await WebBrowser.openBrowserAsync(checkout_url);
            // Browser closed — check if payment completed
            try {
                await activateBoost(listing.id, session_id);
                Alert.alert('Boosted!', 'Your listing is now boosted to the top of Browse for 48 hours.');
                const data = await getMyListings();
                setListings(data);
            } catch {
                // Payment not completed — user cancelled
            }
        } catch (err) {
            Alert.alert('Error', err.response?.data?.detail || 'Failed to start boost payment');
        }
    };

    const handleToggleSold = async (listing) => {
        try {
            if (listing.is_sold) {
                await markAsUnsold(listing.id);
            } else {
                await markAsSold(listing.id);
            }
            setListings(prev => prev.map(l =>
                l.id === listing.id ? { ...l, is_sold: !l.is_sold } : l
            ));
        } catch (error) {
            Alert.alert('Error', 'Failed to update listing');
        }
    };

    const renderListing = ({ item: listing }) => (
        <View style={styles.listingCard}>
            <TouchableOpacity
                style={styles.listingCardInner}
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
                        {listing.is_boosted && listing.boosted_until && new Date(listing.boosted_until) > new Date() && (
                            <View style={styles.boostedBadge}>
                                <Ionicons name="flash" size={10} color="#b45309" />
                                <Text style={styles.boostedBadgeText}>Boosted</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
            <View style={styles.listingActions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.soldButton, listing.is_sold && styles.soldButtonActive]}
                    onPress={() => handleToggleSold(listing)}
                >
                    <Ionicons
                        name={listing.is_sold ? 'checkmark-circle' : 'checkmark-circle-outline'}
                        size={16}
                        color={listing.is_sold ? COLORS.green : '#f59e0b'}
                    />
                    <Text style={[styles.actionButtonText, listing.is_sold ? styles.soldActiveText : styles.soldInactiveText]}>
                        {listing.is_sold ? 'Sold' : 'Mark Sold'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => navigation.navigate('EditListing', { listing })}
                >
                    <Ionicons name="create-outline" size={16} color={COLORS.green} />
                    <Text style={[styles.actionButtonText, { color: COLORS.green }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(listing.id, listing.title)}
                >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Delete</Text>
                </TouchableOpacity>
                {!listing.is_sold && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.boostButton]}
                        onPress={() => handleBoost(listing)}
                    >
                        <Ionicons name="flash" size={16} color="#b45309" />
                        <Text style={[styles.actionButtonText, { color: '#b45309' }]}>
                            {listing.is_boosted && listing.boosted_until && new Date(listing.boosted_until) > new Date() ? 'Boosted' : 'Boost'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
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
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    listingCardInner: {
        flexDirection: 'row',
        padding: 12,
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
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 10,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    soldButton: {
        backgroundColor: '#fffbeb',
        borderRightWidth: 1,
        borderRightColor: '#f0f0f0',
    },
    soldButtonActive: {
        backgroundColor: 'rgba(76,175,80,0.06)',
    },
    soldActiveText: { color: COLORS.green },
    soldInactiveText: { color: '#f59e0b' },
    editButton: {
        backgroundColor: '#f0fdf4',
        borderRightWidth: 1,
        borderRightColor: '#f0f0f0',
    },
    deleteButton: {
        backgroundColor: '#fef2f2',
        borderRightWidth: 1,
        borderRightColor: '#f0f0f0',
    },
    boostButton: {
        backgroundColor: '#fffbeb',
    },
    boostedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        backgroundColor: '#fef3c7',
    },
    boostedBadgeText: {
        fontSize: 11,
        color: '#b45309',
        fontWeight: '500',
    },
});
