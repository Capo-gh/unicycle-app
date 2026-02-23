import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Modal,
    TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMyTransactions, updateTransactionStatus } from '../api/transactions';
import { createReview } from '../api/reviews';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../../../shared/constants/colors';

export default function MyInterestsScreen({ navigation }) {
    const { user: currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('buyer');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updating, setUpdating] = useState(null);

    // Review state
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, [activeTab]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const data = await getMyTransactions(activeTab === 'buyer');
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTransactions();
    }, [activeTab]);

    const handleUpdateStatus = async (transactionId, newStatus) => {
        const actionLabel = newStatus === 'completed' ? 'mark as complete' : 'cancel';
        Alert.alert(
            'Confirm',
            `Are you sure you want to ${actionLabel} this transaction?`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    style: newStatus === 'cancelled' ? 'destructive' : 'default',
                    onPress: async () => {
                        setUpdating(transactionId);
                        try {
                            await updateTransactionStatus(transactionId, newStatus);
                            await fetchTransactions();
                            if (newStatus === 'completed') {
                                Alert.alert('Done', 'Transaction marked as complete! You can now leave a review.');
                            }
                        } catch (err) {
                            console.error('Error updating transaction:', err);
                            Alert.alert('Error', 'Failed to update transaction');
                        } finally {
                            setUpdating(null);
                        }
                    }
                }
            ]
        );
    };

    const openReviewModal = (transaction) => {
        const targetUserId = activeTab === 'buyer' ? transaction.seller_id : transaction.buyer_id;
        const targetUserName = activeTab === 'buyer' ? transaction.seller?.name : transaction.buyer?.name;
        setReviewTarget({
            userId: targetUserId,
            userName: targetUserName,
            listingId: transaction.listing_id
        });
        setReviewRating(0);
        setReviewText('');
        setShowReviewModal(true);
    };

    const handleSubmitReview = async () => {
        if (!reviewTarget) return;
        setSubmittingReview(true);
        try {
            await createReview({
                reviewed_user_id: reviewTarget.userId,
                listing_id: reviewTarget.listingId,
                rating: reviewRating,
                text: reviewText.trim() || null
            });
            setShowReviewModal(false);
            Alert.alert('Thanks!', 'Your review has been submitted.');
            await fetchTransactions();
        } catch (err) {
            console.error('Error submitting review:', err);
            Alert.alert('Error', err.response?.data?.detail || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'interested':
                return { bg: '#dbeafe', text: '#1d4ed8', icon: 'time-outline', label: 'Interested' };
            case 'agreed':
                return { bg: '#e9d5ff', text: '#7c3aed', icon: 'checkmark-outline', label: 'Agreed' };
            case 'completed':
                return { bg: '#d1fae5', text: '#065f46', icon: 'checkmark-circle', label: 'Completed' };
            case 'cancelled':
                return { bg: '#f3f4f6', text: '#6b7280', icon: 'close-circle', label: 'Cancelled' };
            default:
                return { bg: '#dbeafe', text: '#1d4ed8', icon: 'time-outline', label: status };
        }
    };

    const renderTransaction = ({ item: transaction }) => {
        const statusStyle = getStatusStyle(transaction.status);
        const imageUri = transaction.listing?.images
            ? (typeof transaction.listing.images === 'string'
                ? transaction.listing.images.split(',')[0]
                : transaction.listing.images[0])
            : 'https://via.placeholder.com/80';
        const isActive = transaction.status !== 'completed' && transaction.status !== 'cancelled';

        return (
            <View style={styles.card}>
                {/* Item Info */}
                <TouchableOpacity
                    style={styles.cardContent}
                    onPress={() => navigation.navigate('ItemDetail', { listing: transaction.listing })}
                >
                    <Image source={{ uri: imageUri }} style={styles.image} />
                    <View style={styles.info}>
                        <Text style={styles.title} numberOfLines={1}>{transaction.listing?.title}</Text>
                        <Text style={styles.price}>${transaction.listing?.price}</Text>
                        <Text style={styles.otherPerson}>
                            {activeTab === 'buyer'
                                ? `Seller: ${transaction.seller?.name}`
                                : `Buyer: ${transaction.buyer?.name}`
                            }
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Ionicons name={statusStyle.icon} size={12} color={statusStyle.text} />
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {statusStyle.label}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Actions */}
                {isActive && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.completeButton}
                            onPress={() => handleUpdateStatus(transaction.id, 'completed')}
                            disabled={updating === transaction.id}
                        >
                            {updating === transaction.id ? (
                                <ActivityIndicator size="small" color="#065f46" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={16} color="#065f46" />
                                    <Text style={styles.completeButtonText}>Mark Complete</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => handleUpdateStatus(transaction.id, 'cancelled')}
                            disabled={updating === transaction.id}
                        >
                            <Ionicons name="close-outline" size={16} color="#6b7280" />
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Completed info + Leave Review */}
                {transaction.status === 'completed' && (
                    <View style={styles.completedInfo}>
                        {transaction.completed_at && (
                            <Text style={styles.completedText}>
                                Completed on {new Date(transaction.completed_at).toLocaleDateString()}
                            </Text>
                        )}
                        <TouchableOpacity
                            style={styles.reviewButton}
                            onPress={() => openReviewModal(transaction)}
                        >
                            <Ionicons name="star" size={16} color="#fbbf24" />
                            <Text style={styles.reviewButtonText}>Leave Review</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'buyer' && styles.tabActive]}
                    onPress={() => setActiveTab('buyer')}
                >
                    <Ionicons
                        name="cart-outline"
                        size={16}
                        color={activeTab === 'buyer' ? COLORS.green : '#999'}
                    />
                    <Text style={[styles.tabText, activeTab === 'buyer' && styles.tabTextActive]}>
                        My Interests
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'seller' && styles.tabActive]}
                    onPress={() => setActiveTab('seller')}
                >
                    <Ionicons
                        name="pricetag-outline"
                        size={16}
                        color={activeTab === 'seller' ? COLORS.green : '#999'}
                    />
                    <Text style={[styles.tabText, activeTab === 'seller' && styles.tabTextActive]}>
                        Incoming
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.green} />
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.green]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emoji}>
                                {activeTab === 'buyer' ? '🛒' : '📦'}
                            </Text>
                            <Text style={styles.emptyTitle}>
                                {activeTab === 'buyer' ? 'No interests yet' : 'No requests yet'}
                            </Text>
                            <Text style={styles.emptySubtext}>
                                {activeTab === 'buyer'
                                    ? 'Tap "I\'m Interested" on items you want to buy'
                                    : 'When buyers express interest, they\'ll show up here'}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Review Modal */}
            <Modal
                visible={showReviewModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowReviewModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowReviewModal(false)}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Rate {reviewTarget?.userName}
                            </Text>
                            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.dark} />
                            </TouchableOpacity>
                        </View>

                        {/* Star Rating */}
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setReviewRating(star)}
                                >
                                    <Ionicons
                                        name={star <= reviewRating ? 'star' : 'star-outline'}
                                        size={36}
                                        color={star <= reviewRating ? '#fbbf24' : '#d1d5db'}
                                    />
                                </TouchableOpacity>
                            ))}
                            <Text style={styles.ratingLabel}>{reviewRating}/5</Text>
                        </View>

                        {/* Review Text */}
                        <TextInput
                            style={styles.reviewInput}
                            placeholder="Share your experience (optional)"
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            value={reviewText}
                            onChangeText={setReviewText}
                        />

                        {/* Submit */}
                        <TouchableOpacity
                            style={[styles.submitReviewButton, (submittingReview || reviewRating === 0) && { opacity: 0.6 }]}
                            onPress={handleSubmitReview}
                            disabled={submittingReview || reviewRating === 0}
                        >
                            {submittingReview ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitReviewText}>Submit Review</Text>
                            )}
                        </TouchableOpacity>
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 6,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: COLORS.green,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#999',
    },
    tabTextActive: {
        color: COLORS.green,
        fontWeight: '600',
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardContent: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
    },
    image: {
        width: 64,
        height: 64,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 2,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.green,
        marginBottom: 2,
    },
    otherPerson: {
        fontSize: 12,
        color: '#999',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 12,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    completeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        backgroundColor: '#d1fae5',
        borderRadius: 8,
    },
    completeButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#065f46',
    },
    cancelButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
    },
    cancelButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6b7280',
    },
    completedInfo: {
        paddingHorizontal: 12,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
    },
    completedText: {
        fontSize: 12,
        color: '#999',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        alignItems: 'center',
        marginTop: 64,
        paddingHorizontal: 32,
    },
    emoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    reviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        backgroundColor: '#fef3c7',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    reviewButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#92400e',
    },
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
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.dark,
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
    },
    ratingLabel: {
        fontSize: 14,
        color: '#999',
        marginLeft: 8,
    },
    reviewInput: {
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        minHeight: 80,
        color: COLORS.dark,
        marginBottom: 16,
    },
    submitReviewButton: {
        marginHorizontal: 20,
        backgroundColor: COLORS.green,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitReviewText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
