import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../../../shared/constants/colors';
import { getUserProfile, reportUser } from '../api/users';
import { getUserListings } from '../api/listings';
import { getUserReviews, createReview, updateReview } from '../api/reviews';

export default function UserProfileScreen({ route, navigation }) {
    const { userId } = route.params;
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState(null);
    const [listings, setListings] = useState([]);
    const [reviews, setReviews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('listings');

    // Review state
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    // Edit review state
    const [editingReview, setEditingReview] = useState(null); // { id, rating, text, reviewed_user_id, listing_id }
    const [savingReview, setSavingReview] = useState(false);

    const handleUpdateReview = async () => {
        if (!editingReview || editingReview.rating === 0) return;
        setSavingReview(true);
        try {
            await updateReview(editingReview.id, {
                reviewed_user_id: editingReview.reviewed_user_id,
                listing_id: editingReview.listing_id,
                rating: editingReview.rating,
                text: editingReview.text?.trim() || null,
            });
            const [updatedReviews, updatedProfile] = await Promise.all([
                getUserReviews(userId),
                getUserProfile(userId),
            ]);
            setReviews(updatedReviews);
            setProfile(updatedProfile);
            setEditingReview(null);
        } catch (err) {
            Alert.alert('Error', err.response?.data?.detail || 'Failed to update review');
        } finally {
            setSavingReview(false);
        }
    };

    // Report state
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDetails, setReportDetails] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);

    useEffect(() => {
        fetchAll();
    }, [userId]);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [userData, userListings, userReviews] = await Promise.all([
                getUserProfile(userId),
                getUserListings(userId),
                getUserReviews(userId),
            ]);
            setProfile(userData);
            setListings(userListings);
            setReviews(userReviews);
        } catch (err) {
            console.error('Error fetching user profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async () => {
        if (reviewRating === 0) return;
        setSubmittingReview(true);
        try {
            await createReview({
                reviewed_user_id: userId,
                rating: reviewRating,
                text: reviewText.trim() || null,
            });
            const updatedReviews = await getUserReviews(userId);
            const updatedProfile = await getUserProfile(userId);
            setReviews(updatedReviews);
            setProfile(updatedProfile);
            setShowReviewModal(false);
            setReviewRating(0);
            setReviewText('');
            Alert.alert('Thanks!', 'Your review has been submitted.');
        } catch (err) {
            Alert.alert('Error', err.response?.data?.detail || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleReport = async () => {
        if (!reportReason) return;
        setSubmittingReport(true);
        try {
            await reportUser(userId, reportReason, reportDetails);
            setShowReportModal(false);
            setReportReason('');
            setReportDetails('');
            Alert.alert('Reported', 'Our team will review it within 24 hours.');
        } catch (err) {
            Alert.alert('Error', 'Failed to submit report. Please try again.');
        } finally {
            setSubmittingReport(false);
        }
    };

    const getFirstImage = (images) => {
        if (!images) return null;
        const list = typeof images === 'string' ? images.split(',') : images;
        return list[0] || null;
    };

    const hasReviewed = reviews?.reviews?.some(r => r.reviewer_id === currentUser?.id);
    const canReview = currentUser && currentUser.id !== userId && !hasReviewed;
    const canReport = currentUser && currentUser.id !== userId;

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.green} />
            </SafeAreaView>
        );
    }

    if (error || !profile) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={styles.errorText}>{error || 'User not found'}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backLink}>Go back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarLetter}>{profile.name?.charAt(0) || '?'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={styles.nameRow}>
                            <Text style={styles.name}>{profile.name}</Text>
                            <Ionicons name="shield-checkmark" size={18} color={COLORS.blue || '#3b82f6'} />
                        </View>
                        <Text style={styles.university}>{profile.university}</Text>

                        {reviews && reviews.review_count > 0 ? (
                            <View style={styles.ratingRow}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Ionicons
                                        key={s}
                                        name={s <= Math.round(reviews.avg_rating) ? 'star' : 'star-outline'}
                                        size={14}
                                        color="#fbbf24"
                                    />
                                ))}
                                <Text style={styles.ratingText}>
                                    {reviews.avg_rating.toFixed(1)} ({reviews.review_count} review{reviews.review_count !== 1 ? 's' : ''})
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.noReviews}>No reviews yet</Text>
                        )}
                    </View>
                </View>

                {/* Action buttons */}
                <View style={styles.actionRow}>
                    {canReview && (
                        <TouchableOpacity
                            style={styles.reviewBtn}
                            onPress={() => setShowReviewModal(true)}
                        >
                            <Ionicons name="star-outline" size={16} color={COLORS.green} />
                            <Text style={styles.reviewBtnText}>Leave a Review</Text>
                        </TouchableOpacity>
                    )}
                    {canReport && (
                        <TouchableOpacity
                            style={styles.reportBtn}
                            onPress={() => setShowReportModal(true)}
                        >
                            <Ionicons name="flag-outline" size={16} color="#ef4444" />
                            <Text style={styles.reportBtnText}>Report</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'listings' && styles.tabActive]}
                        onPress={() => setActiveTab('listings')}
                    >
                        <Text style={[styles.tabText, activeTab === 'listings' && styles.tabTextActive]}>
                            Listings ({listings.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
                        onPress={() => setActiveTab('reviews')}
                    >
                        <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
                            Reviews ({reviews?.review_count || 0})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Listings Grid */}
                {activeTab === 'listings' && (
                    <View style={styles.grid}>
                        {listings.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Ionicons name="cube-outline" size={40} color="#d1d5db" />
                                <Text style={styles.emptyText}>No active listings</Text>
                            </View>
                        ) : (
                            listings.map(item => {
                                const img = getFirstImage(item.images);
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.gridItem}
                                        onPress={() => navigation.navigate('ItemDetail', { listing: item })}
                                    >
                                        {img ? (
                                            <Image source={{ uri: img }} style={styles.gridImage} />
                                        ) : (
                                            <View style={[styles.gridImage, styles.gridImagePlaceholder]}>
                                                <Ionicons name="image-outline" size={24} color="#d1d5db" />
                                            </View>
                                        )}
                                        <View style={styles.gridInfo}>
                                            <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
                                            <Text style={styles.gridPrice}>${item.price}</Text>
                                        </View>
                                        {item.is_sold && (
                                            <View style={styles.soldBadge}>
                                                <Text style={styles.soldBadgeText}>SOLD</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>
                )}

                {/* Reviews */}
                {activeTab === 'reviews' && (
                    <View style={styles.reviewsList}>
                        {(!reviews || reviews.reviews.length === 0) ? (
                            <View style={styles.emptyBox}>
                                <Ionicons name="star-outline" size={40} color="#d1d5db" />
                                <Text style={styles.emptyText}>No reviews yet</Text>
                            </View>
                        ) : (
                            reviews.reviews.map(review => {
                                const isMyReview = review.reviewer_id === currentUser?.id;
                                const isEditing = editingReview?.id === review.id;
                                return (
                                <View key={review.id} style={styles.reviewCard}>
                                    <View style={styles.reviewHeader}>
                                        <View style={styles.reviewAvatar}>
                                            <Text style={styles.reviewAvatarText}>
                                                {review.reviewer?.name?.charAt(0) || '?'}
                                            </Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.reviewerName}>{review.reviewer?.name}</Text>
                                            {!isEditing && (
                                                <View style={styles.starsRow}>
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Ionicons key={s} name={s <= review.rating ? 'star' : 'star-outline'} size={12} color="#fbbf24" />
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <Text style={styles.reviewDate}>
                                                {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </Text>
                                            {isMyReview && !isEditing && (
                                                <TouchableOpacity onPress={() => setEditingReview({ id: review.id, rating: review.rating, text: review.text || '', reviewed_user_id: review.reviewed_user_id, listing_id: review.listing_id })}>
                                                    <Ionicons name="pencil-outline" size={14} color="#9ca3af" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>

                                    {isEditing ? (
                                        <View style={{ marginTop: 8, gap: 8 }}>
                                            <View style={styles.starsRow}>
                                                {[1,2,3,4,5].map(s => (
                                                    <TouchableOpacity key={s} onPress={() => setEditingReview(prev => ({ ...prev, rating: s }))}>
                                                        <Ionicons name={s <= editingReview.rating ? 'star' : 'star-outline'} size={24} color="#fbbf24" />
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                            <TextInput
                                                style={styles.editReviewInput}
                                                value={editingReview.text}
                                                onChangeText={t => setEditingReview(prev => ({ ...prev, text: t }))}
                                                multiline
                                                numberOfLines={2}
                                                textAlignVertical="top"
                                                placeholder="Update your review..."
                                                placeholderTextColor="#999"
                                            />
                                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                                <TouchableOpacity
                                                    style={[styles.editSaveBtn, (savingReview || editingReview.rating === 0) && { opacity: 0.5 }]}
                                                    onPress={handleUpdateReview}
                                                    disabled={savingReview || editingReview.rating === 0}
                                                >
                                                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{savingReview ? 'Saving...' : 'Save'}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.editCancelBtn} onPress={() => setEditingReview(null)}>
                                                    <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600' }}>Cancel</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        review.text ? <Text style={styles.reviewText}>{review.text}</Text> : null
                                    )}
                                </View>
                                );
                            })
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Leave Review Modal */}
            <Modal visible={showReviewModal} transparent animationType="slide" onRequestClose={() => setShowReviewModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowReviewModal(false)}>
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Rate {profile.name}</Text>
                            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.dark} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                                    <Ionicons
                                        name={star <= reviewRating ? 'star' : 'star-outline'}
                                        size={36}
                                        color={star <= reviewRating ? '#fbbf24' : '#d1d5db'}
                                    />
                                </TouchableOpacity>
                            ))}
                            {reviewRating > 0 && <Text style={styles.ratingLabel}>{reviewRating}/5</Text>}
                        </View>
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
                        <TouchableOpacity
                            style={[styles.submitBtn, (submittingReview || reviewRating === 0) && { opacity: 0.5 }]}
                            onPress={handleSubmitReview}
                            disabled={submittingReview || reviewRating === 0}
                        >
                            {submittingReview ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitBtnText}>Submit Review</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Report Modal */}
            <Modal visible={showReportModal} transparent animationType="slide" onRequestClose={() => setShowReportModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowReportModal(false)}>
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Report {profile.name}</Text>
                            <TouchableOpacity onPress={() => setShowReportModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.dark} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.reportLabel}>Reason *</Text>
                        {['Scam / Fraud', 'Suspicious or fake account', 'Inappropriate content', 'Harassment', 'Other'].map(reason => (
                            <TouchableOpacity
                                key={reason}
                                style={[styles.reasonOption, reportReason === reason && styles.reasonOptionSelected]}
                                onPress={() => setReportReason(reason)}
                            >
                                <Text style={[styles.reasonText, reportReason === reason && styles.reasonTextSelected]}>
                                    {reason}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TextInput
                            style={[styles.reviewInput, { marginTop: 12 }]}
                            placeholder="Additional details (optional)"
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={2}
                            textAlignVertical="top"
                            value={reportDetails}
                            onChangeText={setReportDetails}
                        />
                        <TouchableOpacity
                            style={[styles.reportSubmitBtn, (!reportReason || submittingReport) && { opacity: 0.5 }]}
                            onPress={handleReport}
                            disabled={!reportReason || submittingReport}
                        >
                            {submittingReport ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitBtnText}>Submit Report</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: '#ef4444', marginBottom: 8 },
    backLink: { color: COLORS.green, fontWeight: '600' },

    profileCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        backgroundColor: '#fff',
        padding: 20,
        margin: 16,
        marginBottom: 0,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    avatarCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.green,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLetter: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
    name: { fontSize: 18, fontWeight: '700', color: '#111827' },
    university: { fontSize: 13, color: '#6b7280', marginBottom: 6 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    ratingText: { fontSize: 12, color: '#6b7280', marginLeft: 4 },
    noReviews: { fontSize: 12, color: '#9ca3af' },

    actionRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12 },
    reviewBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderWidth: 1.5,
        borderColor: COLORS.green,
        borderRadius: 10,
    },
    reviewBtnText: { color: COLORS.green, fontWeight: '600', fontSize: 14 },
    reportBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderWidth: 1.5,
        borderColor: '#fca5a5',
        borderRadius: 10,
    },
    reportBtnText: { color: '#ef4444', fontWeight: '600', fontSize: 14 },

    tabs: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 10,
        overflow: 'hidden',
    },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    tabActive: { backgroundColor: COLORS.green },
    tabText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
    tabTextActive: { color: '#fff', fontWeight: '600' },

    grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
    gridItem: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    gridImage: { width: '100%', aspectRatio: 1 },
    gridImagePlaceholder: { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
    gridInfo: { padding: 10 },
    gridTitle: { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 2 },
    gridPrice: { fontSize: 14, fontWeight: '700', color: COLORS.green },
    soldBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#374151',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    soldBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

    emptyBox: { flex: 1, alignItems: 'center', paddingVertical: 48, gap: 12 },
    emptyText: { fontSize: 14, color: '#9ca3af' },

    reviewsList: { padding: 16, gap: 12 },
    reviewCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        marginBottom: 10,
    },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    reviewAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.green,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reviewAvatarText: { color: '#fff', fontWeight: '600', fontSize: 15 },
    reviewerName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
    starsRow: { flexDirection: 'row', gap: 1 },
    reviewDate: { fontSize: 11, color: '#9ca3af' },
    reviewText: { fontSize: 13, color: '#374151', lineHeight: 18 },
    editReviewInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 10,
        fontSize: 13,
        minHeight: 56,
        color: '#111827',
    },
    editSaveBtn: {
        flex: 1,
        backgroundColor: COLORS.green,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    editCancelBtn: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 },
    modalHandle: { width: 40, height: 4, backgroundColor: '#d1d5db', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '600', color: COLORS.dark },

    starsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
    ratingLabel: { fontSize: 14, color: '#999', marginLeft: 8 },
    reviewInput: {
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        minHeight: 70,
        color: COLORS.dark,
        marginBottom: 16,
    },
    submitBtn: { marginHorizontal: 20, backgroundColor: COLORS.green, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

    reportLabel: { paddingHorizontal: 20, fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    reasonOption: {
        marginHorizontal: 20,
        marginBottom: 6,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
    },
    reasonOptionSelected: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
    reasonText: { fontSize: 14, color: '#374151' },
    reasonTextSelected: { color: '#ef4444', fontWeight: '600' },
    reportSubmitBtn: { marginHorizontal: 20, backgroundColor: '#ef4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
});
