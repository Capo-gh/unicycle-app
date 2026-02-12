import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    Alert,
    Linking,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../../../shared/constants/colors';
import { markAsSold, markAsUnsold } from '../api/listings';
import { createTransaction, getMyTransactions } from '../api/transactions';
import { getUserReviews } from '../api/reviews';

const { width } = Dimensions.get('window');

export default function ItemDetailScreen({ route, navigation }) {
    const { listing } = route.params;
    const { user: currentUser } = useAuth();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSold, setIsSold] = useState(listing?.is_sold || false);
    const [updating, setUpdating] = useState(false);
    const [expressingInterest, setExpressingInterest] = useState(false);
    const [alreadyInterested, setAlreadyInterested] = useState(false);
    const [sellerReviews, setSellerReviews] = useState(null);

    // Check if current user is the owner
    const isOwner = currentUser && listing?.seller_id === currentUser.id;

    // Get images array
    const getImages = () => {
        if (!listing.images) return ['https://via.placeholder.com/400x400?text=No+Image'];
        if (Array.isArray(listing.images)) return listing.images;
        return listing.images.split(',').filter(img => img.trim());
    };

    const images = getImages();

    // Fetch seller reviews
    useEffect(() => {
        if (listing?.seller_id) {
            fetchSellerReviews();
        }
    }, [listing?.seller_id]);

    // Check if user has already expressed interest
    useEffect(() => {
        const checkInterestStatus = async () => {
            if (currentUser && listing?.id && !isOwner) {
                try {
                    const myInterests = await getMyTransactions(true);
                    const existingInterest = myInterests.find(t => t.listing_id === listing.id);
                    if (existingInterest) {
                        setAlreadyInterested(true);
                    }
                } catch (err) {
                    console.error('Error checking interest status:', err);
                }
            }
        };
        checkInterestStatus();
    }, [currentUser, listing?.id, isOwner]);

    const fetchSellerReviews = async () => {
        try {
            const data = await getUserReviews(listing.seller_id);
            setSellerReviews(data);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    };

    const handleToggleSold = async () => {
        setUpdating(true);
        try {
            if (isSold) {
                await markAsUnsold(listing.id);
                setIsSold(false);
                Alert.alert('Success', 'Listing marked as available');
            } else {
                await markAsSold(listing.id);
                setIsSold(true);
                Alert.alert('Success', 'Listing marked as sold');
            }
        } catch (err) {
            console.error('Error updating sold status:', err);
            Alert.alert('Error', 'Failed to update listing status');
        } finally {
            setUpdating(false);
        }
    };

    const handleEditListing = () => {
        navigation.navigate('EditListing', { listingId: listing.id });
    };

    const handleExpressInterest = async () => {
        if (!currentUser) {
            Alert.alert('Login Required', 'Please log in to express interest');
            return;
        }

        setExpressingInterest(true);
        try {
            await createTransaction(listing.id);
            setAlreadyInterested(true);
            Alert.alert('Success', 'Interest expressed! You can now message the seller.');
        } catch (err) {
            console.error('Error expressing interest:', err);
            if (err.response?.data?.detail && err.response.data.detail.includes('already')) {
                setAlreadyInterested(true);
            } else {
                Alert.alert('Error', err.response?.data?.detail || 'Failed to express interest');
            }
        } finally {
            setExpressingInterest(false);
        }
    };

    const handleContactSeller = () => {
        navigation.navigate('Messages', {
            listingId: listing.id,
            initialMessage: `Hi! Is "${listing.title}" still available?`
        });
    };

    const handleGetDirections = () => {
        const safeZone = listing.safe_zone || listing.safeZone;
        const safeZoneAddress = listing.safe_zone_address || listing.safeZoneAddress;
        const address = encodeURIComponent(`${safeZone}, ${safeZoneAddress}, Montreal, QC`);
        const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
        Linking.openURL(url);
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Ionicons key={i} name="star" size={14} color="#fbbf24" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<Ionicons key={i} name="star-half" size={14} color="#fbbf24" />);
            } else {
                stars.push(<Ionicons key={i} name="star-outline" size={14} color="#d1d5db" />);
            }
        }
        return stars;
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Image Gallery */}
                <View style={styles.imageContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setCurrentImageIndex(index);
                        }}
                        scrollEventThrottle={16}
                    >
                        {images.map((img, idx) => (
                            <Image
                                key={idx}
                                source={{ uri: img }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>

                    {/* Image counter */}
                    {images.length > 1 && (
                        <View style={styles.imageCounter}>
                            <Text style={styles.imageCounterText}>
                                {currentImageIndex + 1} / {images.length}
                            </Text>
                        </View>
                    )}

                    {/* Owner badge */}
                    {isOwner && (
                        <View style={styles.ownerBadge}>
                            <Text style={styles.ownerBadgeText}>Your Listing</Text>
                        </View>
                    )}

                    {/* Sold badge */}
                    {isSold && (
                        <View style={styles.soldBadge}>
                            <Ionicons name="checkmark-circle" size={16} color="#fff" />
                            <Text style={styles.soldBadgeText}>SOLD</Text>
                        </View>
                    )}
                </View>

                {/* Price & Title */}
                <View style={styles.section}>
                    <View style={styles.titleRow}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{listing.title}</Text>
                            <View style={styles.metaRow}>
                                <Text style={styles.metaText}>{listing.category}</Text>
                                <Text style={styles.metaText}>•</Text>
                                <Text style={styles.metaText}>{listing.condition}</Text>
                            </View>
                        </View>
                        <Text style={[styles.price, isSold && styles.priceSold]}>${listing.price}</Text>
                    </View>
                    {isSold && !isOwner && (
                        <Text style={styles.soldText}>This item has been sold</Text>
                    )}
                </View>

                {/* Seller Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Seller</Text>
                    <View style={styles.sellerCard}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>
                                {listing.seller?.name?.charAt(0) || '?'}
                            </Text>
                        </View>
                        <View style={styles.sellerInfo}>
                            <View style={styles.sellerNameRow}>
                                <Text style={styles.sellerName}>{listing.seller?.name || 'Unknown'}</Text>
                                {listing.seller?.is_verified && (
                                    <Ionicons name="shield-checkmark" size={16} color={COLORS.green} />
                                )}
                                {isOwner && (
                                    <View style={styles.youBadge}>
                                        <Text style={styles.youBadgeText}>You</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.sellerUniversity}>{listing.seller?.university || ''}</Text>
                            {sellerReviews && sellerReviews.review_count > 0 && (
                                <View style={styles.ratingRow}>
                                    <View style={styles.stars}>{renderStars(sellerReviews.avg_rating)}</View>
                                    <Text style={styles.ratingText}>
                                        ({sellerReviews.avg_rating.toFixed(1)}) • {sellerReviews.review_count} review{sellerReviews.review_count !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{listing.description}</Text>
                </View>

                {/* Safe Zone */}
                <View style={styles.safeZoneSection}>
                    <View style={styles.safeZoneHeader}>
                        <View style={styles.safeZoneIconContainer}>
                            <Ionicons name="location" size={20} color="#fff" />
                        </View>
                        <View style={styles.safeZoneInfo}>
                            <Text style={styles.safeZoneTitle}>Recommended Safe Zone</Text>
                            <Text style={styles.safeZoneName}>{listing.safe_zone || listing.safeZone}</Text>
                            <Text style={styles.safeZoneAddress}>{listing.safe_zone_address || listing.safeZoneAddress}</Text>
                            <Text style={styles.safeZoneFeatures}>
                                ✓ Well-lit public area • Security cameras • Student traffic
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
                        <Ionicons name="navigate" size={18} color="#fff" />
                        <Text style={styles.directionsButtonText}>Get Directions</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Fixed Bottom Action Bar */}
            <View style={styles.bottomBar}>
                {isOwner ? (
                    <View style={styles.ownerActions}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                            onPress={handleEditListing}
                        >
                            <Ionicons name="create-outline" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, isSold ? styles.relistButton : styles.soldButton]}
                            onPress={handleToggleSold}
                            disabled={updating}
                        >
                            {updating ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                    <Text style={styles.actionButtonText}>
                                        {isSold ? 'Relist' : 'Mark Sold'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : isSold ? (
                    <View style={styles.soldContainer}>
                        <Text style={styles.soldContainerText}>This item has been sold</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.interestButton, expressingInterest && styles.interestButtonDisabled]}
                        onPress={alreadyInterested ? handleContactSeller : handleExpressInterest}
                        disabled={expressingInterest}
                    >
                        {expressingInterest ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons
                                    name={alreadyInterested ? 'chatbubble-ellipses' : 'heart'}
                                    size={20}
                                    color="#fff"
                                />
                                <Text style={styles.interestButtonText}>
                                    {alreadyInterested ? 'Message Seller' : "I'm Interested"}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    imageContainer: {
        height: 300,
        backgroundColor: '#000',
    },
    image: {
        width: width,
        height: 300,
    },
    imageCounter: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    imageCounterText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    ownerBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: COLORS.green,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    ownerBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    soldBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#ef4444',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    soldBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
        marginTop: 8,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleContainer: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        color: '#999',
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.green,
    },
    priceSold: {
        color: '#999',
        textDecorationLine: 'line-through',
    },
    soldText: {
        color: '#ef4444',
        fontSize: 13,
        fontWeight: '500',
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 12,
    },
    sellerCard: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.green,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    sellerInfo: {
        flex: 1,
    },
    sellerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    sellerName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.dark,
    },
    youBadge: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    youBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.green,
    },
    sellerUniversity: {
        fontSize: 13,
        color: '#999',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    stars: {
        flexDirection: 'row',
        gap: 2,
    },
    ratingText: {
        fontSize: 12,
        color: '#999',
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    safeZoneSection: {
        backgroundColor: 'rgba(76, 175, 80, 0.05)',
        margin: 8,
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: 'rgba(76, 175, 80, 0.2)',
    },
    safeZoneHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    safeZoneIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: COLORS.green,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    safeZoneInfo: {
        flex: 1,
    },
    safeZoneTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    safeZoneName: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.dark,
        marginBottom: 2,
    },
    safeZoneAddress: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6,
    },
    safeZoneFeatures: {
        fontSize: 11,
        color: '#999',
    },
    directionsButton: {
        backgroundColor: COLORS.green,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    directionsButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        padding: 16,
        paddingBottom: 20,
    },
    ownerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    editButton: {
        backgroundColor: COLORS.green,
    },
    soldButton: {
        backgroundColor: '#10b981',
    },
    relistButton: {
        backgroundColor: '#6b7280',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    soldContainer: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    soldContainerText: {
        color: '#999',
        fontSize: 15,
        fontWeight: '500',
    },
    interestButton: {
        backgroundColor: COLORS.green,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    interestButtonDisabled: {
        opacity: 0.6,
    },
    interestButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
