import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Alert,
    Linking,
    ActivityIndicator,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../../../shared/constants/colors';
import { markAsSold, markAsUnsold } from '../api/listings';
import { createTransaction, getMyTransactions, deleteTransaction } from '../api/transactions';
import { getUserReviews } from '../api/reviews';
import { reportUser } from '../api/users';
import SecurePayModal from '../components/SecurePayModal';
import { getListingSecurePay, confirmHandoff, confirmReceipt, disputeTransaction } from '../api/payments';

const { width } = Dimensions.get('window');

export default function ItemDetailScreen({ route, navigation }) {
    const { listing } = route.params;
    const { user: currentUser } = useAuth();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSold, setIsSold] = useState(listing?.is_sold || false);
    const [updating, setUpdating] = useState(false);
    const [expressingInterest, setExpressingInterest] = useState(false);
    const [alreadyInterested, setAlreadyInterested] = useState(false);
    const [interestTransactionId, setInterestTransactionId] = useState(null);
    const [sellerReviews, setSellerReviews] = useState(null);
    const [showSecurePayModal, setShowSecurePayModal] = useState(false);
    const [securePayTx, setSecurePayTx] = useState(null);
    const [escrowAction, setEscrowAction] = useState(null); // 'confirming-handoff' | 'confirming-receipt' | 'disputing'
    const [escrowMessage, setEscrowMessage] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDetails, setReportDetails] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);

    // Auto-translation state
    const [translatedTitle, setTranslatedTitle] = useState(null);
    const [translatedDescription, setTranslatedDescription] = useState(null);
    const [isTranslating, setIsTranslating] = useState(false);

    // Check if current user is the owner
    const isOwner = currentUser && listing?.seller_id === currentUser.id;

    // Get images array
    const getImages = () => {
        if (!listing.images) return ['https://via.placeholder.com/400x400?text=No+Image'];
        if (Array.isArray(listing.images)) return listing.images;
        return listing.images.split(',').filter(img => img.trim());
    };

    const images = getImages();

    // Add share button to navigation header
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => {
                        const WEB_BASE = 'https://unicycle-app.vercel.app';
                        Share.share({
                            message: `${listing.title} — $${listing.price}\n${WEB_BASE}?listing=${listing.id}`,
                            url: `${WEB_BASE}?listing=${listing.id}`,
                        });
                    }}
                    style={{ marginRight: 12 }}
                >
                    <Ionicons name="share-outline" size={24} color="#374151" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, listing?.id]);

    // Fetch seller reviews
    useEffect(() => {
        if (listing?.seller_id) {
            fetchSellerReviews();
        }
    }, [listing?.seller_id]);

    // Fetch active Secure-Pay transaction for this listing
    useEffect(() => {
        if (currentUser && listing?.id) {
            getListingSecurePay(listing.id).then(tx => setSecurePayTx(tx || null)).catch(() => {});
        }
    }, [currentUser, listing?.id]);

    // Check if user has already expressed interest
    useEffect(() => {
        const checkInterestStatus = async () => {
            if (currentUser && listing?.id && !isOwner) {
                try {
                    const myInterests = await getMyTransactions(true);
                    const existingInterest = myInterests.find(t => t.listing_id === listing.id);
                    if (existingInterest) {
                        setAlreadyInterested(true);
                        setInterestTransactionId(existingInterest.id);
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
            const transaction = await createTransaction(listing.id);
            setAlreadyInterested(true);
            setInterestTransactionId(transaction.id);
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

    const handleRemoveInterest = async () => {
        if (!interestTransactionId) return;
        setExpressingInterest(true);
        try {
            await deleteTransaction(interestTransactionId);
            setAlreadyInterested(false);
            setInterestTransactionId(null);
        } catch (err) {
            console.error('Error removing interest:', err);
            Alert.alert('Error', err.response?.data?.detail || 'Failed to remove interest');
        } finally {
            setExpressingInterest(false);
        }
    };

    const handleContactSeller = () => {
        if (listing.price >= 80) {
            setShowSecurePayModal(true);
        } else {
            navigation.navigate('Messages', {
                listingId: listing.id,
                initialMessage: `Hi! Is "${listing.title}" still available?`
            });
        }
    };

    const handleSecurePayProceed = () => {
        setShowSecurePayModal(false);
        navigation.navigate('Messages', {
            listingId: listing.id,
            initialMessage: `Hi! I'm interested in "${listing.title}" ($${listing.price}). Is it still available?`
        });
    };

    const handleConfirmHandoff = async () => {
        setEscrowAction('confirming-handoff');
        try {
            await confirmHandoff(securePayTx.id);
            setSecurePayTx(prev => ({ ...prev, seller_confirmed_at: new Date().toISOString() }));
            setEscrowMessage('Handoff confirmed. The buyer can now release payment.');
        } catch {
            Alert.alert('Error', 'Failed to confirm handoff. Please try again.');
        } finally {
            setEscrowAction(null);
        }
    };

    const handleConfirmReceipt = async () => {
        Alert.alert(
            'Confirm Receipt',
            'Confirm you received the item? This will release payment to the seller.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setEscrowAction('confirming-receipt');
                        try {
                            await confirmReceipt(securePayTx.id);
                            setSecurePayTx(prev => ({ ...prev, payment_status: 'captured' }));
                            setEscrowMessage('Payment released to seller. Transaction complete!');
                        } catch {
                            Alert.alert('Error', 'Failed to confirm receipt. Please try again.');
                        } finally {
                            setEscrowAction(null);
                        }
                    }
                }
            ]
        );
    };

    const handleDispute = async () => {
        const hasSellerConfirmed = !!securePayTx?.seller_confirmed_at;
        const msg = hasSellerConfirmed
            ? 'The seller confirmed handoff. Disputing will hold funds for admin review — you will NOT get an immediate refund. Continue?'
            : 'Cancel this Secure-Pay transaction? You will get a full refund.';
        Alert.alert('Confirm', msg, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Confirm',
                style: 'destructive',
                onPress: async () => {
                    setEscrowAction('disputing');
                    try {
                        const result = await disputeTransaction(securePayTx.id);
                        setSecurePayTx(prev => ({ ...prev, payment_status: result.admin_review ? 'disputed' : 'refunded' }));
                        setEscrowMessage(result.admin_review
                            ? 'Dispute submitted. Admin will review within 24 hours. Funds are held.'
                            : 'Refund initiated. Funds will return to your card within 5–10 days.');
                    } catch {
                        Alert.alert('Error', 'Failed to submit dispute. Please try again.');
                    } finally {
                        setEscrowAction(null);
                    }
                }
            }
        ]);
    };

    const reportReasons = ['Fake listing', 'Inappropriate content', 'Spam or scam', 'Harassment', 'Other'];

    const handleReport = () => {
        setShowReportModal(true);
    };

    const submitReport = async () => {
        if (!reportReason) return;
        setSubmittingReport(true);
        try {
            await reportUser(listing.seller_id, reportReason, reportDetails);
            setReportSuccess(true);
        } catch (err) {
            Alert.alert('Error', 'Failed to submit report. Please try again.');
        } finally {
            setSubmittingReport(false);
        }
    };

    const closeReportModal = () => {
        setShowReportModal(false);
        setReportReason('');
        setReportDetails('');
        setReportSuccess(false);
    };

    const handleGetDirections = () => {
        const safeZone = listing.safe_zone || listing.safeZone;
        const safeZoneAddress = listing.safe_zone_address || listing.safeZoneAddress;
        const address = encodeURIComponent(`${safeZone}, ${safeZoneAddress}, Montreal, QC`);
        const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
        Linking.openURL(url);
    };

    const handleTranslate = async () => {
        if (translatedTitle) {
            setTranslatedTitle(null);
            setTranslatedDescription(null);
            return;
        }
        setIsTranslating(true);
        try {
            const [titleRes, descRes] = await Promise.all([
                fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(listing.title)}&langpair=en|fr`),
                listing.description
                    ? fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(listing.description)}&langpair=en|fr`)
                    : null,
            ]);
            const titleData = await titleRes.json();
            setTranslatedTitle(titleData.responseData?.translatedText || listing.title);
            if (descRes) {
                const descData = await descRes.json();
                setTranslatedDescription(descData.responseData?.translatedText || listing.description);
            }
        } catch {}
        setIsTranslating(false);
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
                                resizeMode="contain"
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
                            <Text style={styles.title}>{translatedTitle || listing.title}</Text>
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
                    <TouchableOpacity onPress={handleTranslate} style={styles.translateListingBtn}>
                        <Ionicons name="language-outline" size={14} color="#6b7280" />
                        <Text style={styles.translateListingBtnText}>
                            {isTranslating ? 'Translating...' : translatedTitle ? 'Show original' : 'Translate to French'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Seller Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Seller</Text>
                    <TouchableOpacity
                        style={styles.sellerCard}
                        onPress={() => !isOwner && listing.seller_id && navigation.navigate('UserProfile', { userId: listing.seller_id })}
                        activeOpacity={isOwner ? 1 : 0.7}
                    >
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
                    </TouchableOpacity>
                    {!isOwner && (
                        <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
                            <Ionicons name="flag-outline" size={14} color="#ef4444" />
                            <Text style={styles.reportButtonText}>Report Seller</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{translatedDescription || listing.description}</Text>
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

                {/* Secure-Pay Info (only for buyers when no active escrow) */}
                {!isOwner && !isSold && listing.price >= 80 && !securePayTx && (
                    <View style={styles.securePayInfo}>
                        <View style={styles.securePayInfoRow}>
                            <View style={styles.securePayIcon}>
                                <Ionicons name="shield-checkmark" size={18} color="#fff" />
                            </View>
                            <View style={styles.securePayTextContainer}>
                                <Text style={styles.securePayTitle}>Secure-Pay Protected</Text>
                                <Text style={styles.securePayDesc}>
                                    This item qualifies for escrow protection. Your payment is held securely until you verify the item in person.
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Secure-Pay Escrow Status Panel */}
                {securePayTx && (
                    <View style={[
                        styles.escrowPanel,
                        securePayTx.payment_status === 'captured' && styles.escrowPanelGreen,
                        securePayTx.payment_status === 'disputed' && styles.escrowPanelOrange,
                        securePayTx.payment_status === 'refunded' && styles.escrowPanelGray,
                    ]}>
                        <View style={styles.escrowHeader}>
                            <Ionicons
                                name="shield-checkmark"
                                size={20}
                                color={
                                    securePayTx.payment_status === 'captured' ? '#16a34a' :
                                    securePayTx.payment_status === 'disputed' ? '#ea580c' :
                                    '#2563eb'
                                }
                            />
                            <Text style={styles.escrowTitle}>
                                {securePayTx.payment_status === 'held' && 'Secure-Pay — Funds Held'}
                                {securePayTx.payment_status === 'captured' && 'Secure-Pay — Complete ✓'}
                                {securePayTx.payment_status === 'disputed' && 'Secure-Pay — Under Review'}
                                {securePayTx.payment_status === 'refunded' && 'Secure-Pay — Refunded'}
                            </Text>
                        </View>

                        {escrowMessage && (
                            <View style={styles.escrowMessageBox}>
                                <Text style={styles.escrowMessageText}>{escrowMessage}</Text>
                            </View>
                        )}

                        {securePayTx.payment_status === 'held' && (
                            <>
                                {/* Step indicator */}
                                <View style={styles.escrowSteps}>
                                    <View style={[styles.escrowStep, styles.escrowStepDone]}>
                                        <Text style={styles.escrowStepDoneText}>✓</Text>
                                    </View>
                                    <Text style={styles.escrowStepLabel}>Payment held</Text>
                                    <View style={styles.escrowStepLine} />
                                    <View style={[styles.escrowStep, securePayTx.seller_confirmed_at ? styles.escrowStepDone : styles.escrowStepPending]}>
                                        <Text style={securePayTx.seller_confirmed_at ? styles.escrowStepDoneText : styles.escrowStepPendingText}>2</Text>
                                    </View>
                                    <Text style={styles.escrowStepLabel}>Seller confirms</Text>
                                    <View style={styles.escrowStepLine} />
                                    <View style={styles.escrowStepPending}>
                                        <Text style={styles.escrowStepPendingText}>3</Text>
                                    </View>
                                    <Text style={styles.escrowStepLabel}>Buyer releases</Text>
                                </View>

                                {/* Seller actions */}
                                {securePayTx.is_seller && !securePayTx.seller_confirmed_at && (
                                    <TouchableOpacity
                                        style={[styles.escrowButton, styles.escrowButtonBlue, escrowAction === 'confirming-handoff' && styles.escrowButtonDisabled]}
                                        onPress={handleConfirmHandoff}
                                        disabled={!!escrowAction}
                                    >
                                        <Text style={styles.escrowButtonText}>
                                            {escrowAction === 'confirming-handoff' ? 'Confirming...' : 'I Handed Over the Item'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                {securePayTx.is_seller && securePayTx.seller_confirmed_at && (
                                    <Text style={styles.escrowConfirmedText}>✓ You confirmed handoff. Waiting for buyer to confirm receipt.</Text>
                                )}

                                {/* Buyer actions */}
                                {securePayTx.is_buyer && (
                                    <>
                                        {!securePayTx.seller_confirmed_at && (
                                            <Text style={styles.escrowWaitingText}>Waiting for seller to confirm they handed over the item.</Text>
                                        )}
                                        <TouchableOpacity
                                            style={[styles.escrowButton, styles.escrowButtonGreen, (!securePayTx.seller_confirmed_at || !!escrowAction) && styles.escrowButtonDisabled]}
                                            onPress={handleConfirmReceipt}
                                            disabled={!securePayTx.seller_confirmed_at || !!escrowAction}
                                        >
                                            <Text style={styles.escrowButtonText}>
                                                {escrowAction === 'confirming-receipt' ? 'Confirming...' : 'I Received the Item — Release Payment'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.escrowButtonOutlineRed, !!escrowAction && styles.escrowButtonDisabled]}
                                            onPress={handleDispute}
                                            disabled={!!escrowAction}
                                        >
                                            <Text style={styles.escrowButtonOutlineRedText}>
                                                {escrowAction === 'disputing' ? 'Submitting...' : securePayTx.seller_confirmed_at ? 'Dispute — I Did Not Receive the Item' : 'Cancel & Get Refund'}
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </>
                        )}

                        {securePayTx.payment_status === 'disputed' && (
                            <View style={styles.escrowDisputeNote}>
                                <Ionicons name="warning-outline" size={16} color="#ea580c" />
                                <Text style={styles.escrowDisputeText}>This transaction is under admin review. Funds are held securely until resolved.</Text>
                            </View>
                        )}
                    </View>
                )}
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
                    <View style={styles.dualButtonRow}>
                        <TouchableOpacity
                            style={[
                                styles.interestToggleButton,
                                alreadyInterested ? styles.removeInterestButton : styles.addInterestButton,
                                expressingInterest && styles.interestButtonDisabled
                            ]}
                            onPress={alreadyInterested ? handleRemoveInterest : handleExpressInterest}
                            disabled={expressingInterest}
                        >
                            {expressingInterest ? (
                                <ActivityIndicator color={alreadyInterested ? '#ef4444' : COLORS.green} size="small" />
                            ) : (
                                <>
                                    <Ionicons
                                        name={alreadyInterested ? 'heart' : 'heart-outline'}
                                        size={18}
                                        color={alreadyInterested ? '#ef4444' : COLORS.green}
                                    />
                                    <Text style={[
                                        styles.interestToggleText,
                                        { color: alreadyInterested ? '#ef4444' : COLORS.green }
                                    ]}>
                                        {alreadyInterested ? 'Remove' : 'Interested'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.messageSellerButton}
                            onPress={handleContactSeller}
                        >
                            <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
                            <Text style={styles.messageSellerText}>Message Seller</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Secure-Pay Modal */}
            <SecurePayModal
                visible={showSecurePayModal}
                item={listing}
                onClose={() => setShowSecurePayModal(false)}
                onProceed={handleSecurePayProceed}
            />

            {/* Report Modal */}
            <Modal visible={showReportModal} transparent animationType="slide">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.reportModalContent}>
                        {reportSuccess ? (
                            <View style={styles.reportSuccess}>
                                <View style={styles.reportSuccessIcon}>
                                    <Ionicons name="checkmark" size={28} color="#16a34a" />
                                </View>
                                <Text style={styles.reportSuccessTitle}>Report Submitted</Text>
                                <Text style={styles.reportSuccessText}>Our team will review it within 24 hours.</Text>
                                <TouchableOpacity style={styles.reportDoneButton} onPress={closeReportModal}>
                                    <Text style={styles.reportDoneButtonText}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <View style={styles.reportModalHeader}>
                                    <Text style={styles.reportModalTitle}>Report Seller</Text>
                                    <TouchableOpacity onPress={closeReportModal} style={styles.reportCloseButton}>
                                        <Ionicons name="close" size={22} color="#666" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.reportLabel}>Reason *</Text>
                                {reportReasons.map(reason => (
                                    <TouchableOpacity
                                        key={reason}
                                        style={[styles.reasonOption, reportReason === reason && styles.reasonOptionSelected]}
                                        onPress={() => setReportReason(reason)}
                                    >
                                        <View style={[styles.reasonRadio, reportReason === reason && styles.reasonRadioSelected]}>
                                            {reportReason === reason && <View style={styles.reasonRadioDot} />}
                                        </View>
                                        <Text style={[styles.reasonText, reportReason === reason && styles.reasonTextSelected]}>
                                            {reason}
                                        </Text>
                                    </TouchableOpacity>
                                ))}

                                <Text style={[styles.reportLabel, { marginTop: 14 }]}>Additional details (optional)</Text>
                                <TextInput
                                    style={styles.reportDetailsInput}
                                    placeholder="Describe what happened..."
                                    placeholderTextColor="#bbb"
                                    value={reportDetails}
                                    onChangeText={setReportDetails}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />

                                <View style={styles.reportModalButtons}>
                                    <TouchableOpacity style={styles.reportCancelButton} onPress={closeReportModal}>
                                        <Text style={styles.reportCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.reportSubmitButton, (!reportReason || submittingReport) && styles.reportSubmitDisabled]}
                                        onPress={submitReport}
                                        disabled={!reportReason || submittingReport}
                                    >
                                        {submittingReport ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text style={styles.reportSubmitText}>Submit Report</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
    translateListingBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },
    translateListingBtnText: {
        fontSize: 12,
        color: '#6b7280',
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
    dualButtonRow: {
        flexDirection: 'row',
        gap: 10,
    },
    interestToggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 6,
        borderWidth: 1.5,
    },
    addInterestButton: {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    removeInterestButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.06)',
        borderColor: 'rgba(239, 68, 68, 0.25)',
    },
    interestToggleText: {
        fontSize: 14,
        fontWeight: '600',
    },
    messageSellerButton: {
        flex: 1,
        backgroundColor: COLORS.green,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 6,
    },
    messageSellerText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    interestButtonDisabled: {
        opacity: 0.6,
    },
    securePayInfo: {
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        margin: 8,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    securePayInfoRow: {
        flexDirection: 'row',
        gap: 12,
    },
    securePayIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: COLORS.green,
        justifyContent: 'center',
        alignItems: 'center',
    },
    securePayTextContainer: {
        flex: 1,
    },
    securePayTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111',
        marginBottom: 4,
    },
    securePayDesc: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    reportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        marginTop: 10,
        paddingVertical: 4,
        paddingHorizontal: 2,
    },
    reportButtonText: {
        fontSize: 12,
        color: '#ef4444',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    reportModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 36,
    },
    reportModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    reportModalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
    },
    reportCloseButton: {
        padding: 4,
    },
    reportLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    reasonOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 6,
    },
    reasonOptionSelected: {
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.04)',
    },
    reasonRadio: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reasonRadioSelected: {
        borderColor: '#ef4444',
    },
    reasonRadioDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
    },
    reasonText: {
        fontSize: 14,
        color: '#374151',
    },
    reasonTextSelected: {
        color: '#ef4444',
        fontWeight: '500',
    },
    reportDetailsInput: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: '#111',
        minHeight: 72,
        marginBottom: 16,
    },
    reportModalButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    reportCancelButton: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
    },
    reportCancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    reportSubmitButton: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 10,
        backgroundColor: '#ef4444',
        alignItems: 'center',
    },
    reportSubmitDisabled: {
        backgroundColor: '#d1d5db',
    },
    reportSubmitText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    reportSuccess: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    reportSuccessIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#dcfce7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    reportSuccessTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
        marginBottom: 4,
    },
    reportSuccessText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 20,
    },
    reportDoneButton: {
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 10,
        backgroundColor: COLORS.green,
    },
    reportDoneButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    escrowPanel: {
        margin: 8,
        borderRadius: 12,
        padding: 16,
        backgroundColor: 'rgba(37, 99, 235, 0.06)',
        borderWidth: 2,
        borderColor: 'rgba(37, 99, 235, 0.25)',
    },
    escrowPanelGreen: {
        backgroundColor: 'rgba(22, 163, 74, 0.06)',
        borderColor: 'rgba(22, 163, 74, 0.3)',
    },
    escrowPanelOrange: {
        backgroundColor: 'rgba(234, 88, 12, 0.06)',
        borderColor: 'rgba(234, 88, 12, 0.3)',
    },
    escrowPanelGray: {
        backgroundColor: '#f9fafb',
        borderColor: '#d1d5db',
    },
    escrowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    escrowTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
    },
    escrowMessageBox: {
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    escrowMessageText: {
        fontSize: 13,
        color: '#374151',
    },
    escrowSteps: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        flexWrap: 'nowrap',
    },
    escrowStep: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    escrowStepDone: {
        backgroundColor: '#2563eb',
    },
    escrowStepPending: {
        backgroundColor: '#e5e7eb',
    },
    escrowStepDoneText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
    },
    escrowStepPendingText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6b7280',
    },
    escrowStepLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#d1d5db',
        marginHorizontal: 4,
    },
    escrowStepLabel: {
        fontSize: 10,
        color: '#6b7280',
        marginHorizontal: 4,
    },
    escrowButton: {
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 8,
    },
    escrowButtonBlue: {
        backgroundColor: '#2563eb',
    },
    escrowButtonGreen: {
        backgroundColor: COLORS.green,
    },
    escrowButtonDisabled: {
        opacity: 0.4,
    },
    escrowButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },
    escrowButtonOutlineRed: {
        paddingVertical: 11,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fca5a5',
        marginBottom: 4,
    },
    escrowButtonOutlineRedText: {
        fontSize: 13,
        color: '#ef4444',
        fontWeight: '500',
    },
    escrowConfirmedText: {
        fontSize: 13,
        color: '#2563eb',
        fontWeight: '500',
        marginBottom: 8,
    },
    escrowWaitingText: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 8,
    },
    escrowDisputeNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
    },
    escrowDisputeText: {
        flex: 1,
        fontSize: 13,
        color: '#ea580c',
        lineHeight: 18,
    },
});
