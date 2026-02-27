import { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Star, MapPin, Package, Flag, X, Pencil, MessageCircle } from 'lucide-react';
import { getUserProfile, reportUser } from '../api/users';
import { getUserListings } from '../api/listings';
import { getUserReviews, createReview, updateReview } from '../api/reviews';

export default function UserProfile({ userId, onBack, onItemClick, currentUser, onContact }) {
    const [user, setUser] = useState(null);
    const [listings, setListings] = useState([]);
    const [reviews, setReviews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('listings');

    // Review form state
    const [showReviewForm, setShowReviewForm] = useState(false);
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
            const [updatedReviews, updatedUser] = await Promise.all([
                getUserReviews(userId),
                getUserProfile(userId),
            ]);
            setReviews(updatedReviews);
            setUser(updatedUser);
            setEditingReview(null);
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to update review');
        } finally {
            setSavingReview(false);
        }
    };

    // Report state
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDetails, setReportDetails] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    const fetchUserData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [userData, userListings, userReviews] = await Promise.all([
                getUserProfile(userId),
                getUserListings(userId),
                getUserReviews(userId)
            ]);
            setUser(userData);
            setListings(userListings);
            setReviews(userReviews);
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Failed to load user profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async () => {
        if (reviewRating < 1 || reviewRating > 5) return;

        setSubmittingReview(true);
        try {
            await createReview({
                reviewed_user_id: userId,
                rating: reviewRating,
                text: reviewText.trim() || null
            });

            // Refresh reviews
            const updatedReviews = await getUserReviews(userId);
            setReviews(updatedReviews);

            // Also refresh user data to get updated avg_rating
            const updatedUser = await getUserProfile(userId);
            setUser(updatedUser);

            // Reset form
            setShowReviewForm(false);
            setReviewRating(0);
            setReviewText('');
        } catch (err) {
            console.error('Error submitting review:', err);
            alert(err.response?.data?.detail || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
    };

    const renderStars = (rating, interactive = false, onSelect = null) => {
        return [...Array(5)].map((_, i) => (
            <button
                key={i}
                type="button"
                disabled={!interactive}
                onClick={() => interactive && onSelect && onSelect(i + 1)}
                className={interactive ? 'cursor-pointer' : 'cursor-default'}
            >
                <Star
                    className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
            </button>
        ));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const getFirstImage = (images) => {
        if (!images) return 'https://via.placeholder.com/300x300?text=No+Image';
        const imageList = images.split(',');
        return imageList[0] || 'https://via.placeholder.com/300x300?text=No+Image';
    };

    const handleReport = async () => {
        if (!reportReason) return;
        setSubmittingReport(true);
        try {
            await reportUser(userId, reportReason, reportDetails);
            setReportSuccess(true);
            setTimeout(() => {
                setShowReportModal(false);
                setReportSuccess(false);
                setReportReason('');
                setReportDetails('');
            }, 2000);
        } catch (err) {
            console.error('Error submitting report:', err);
            alert('Failed to submit report. Please try again.');
        } finally {
            setSubmittingReport(false);
        }
    };

    // Check if current user already reviewed this user
    const hasReviewed = reviews?.reviews?.some(r => r.reviewer_id === currentUser?.id);
    const canReview = currentUser && currentUser.id !== userId && !hasReviewed;
    const canReport = currentUser && currentUser.id !== userId;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-unicycle-green"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'User not found'}</p>
                    <button onClick={onBack} className="text-unicycle-blue hover:underline">
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Seller Profile</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {/* Profile Card */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-bold text-2xl">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                <ShieldCheck className="w-5 h-5 text-unicycle-blue" />
                            </div>
                            <p className="text-gray-600">{user.university}</p>

                            {/* Rating */}
                            {reviews && reviews.review_count > 0 ? (
                                <div className="flex items-center gap-1 mt-1">
                                    <div className="flex">{renderStars(Math.round(reviews.avg_rating))}</div>
                                    <span className="text-sm text-gray-600 ml-1">
                                        {reviews.avg_rating.toFixed(1)} ({reviews.review_count} review{reviews.review_count !== 1 ? 's' : ''})
                                    </span>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mt-1">No reviews yet</p>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-gray-500">
                        Member since {formatDate(user.created_at)}
                    </p>

                    {/* Message User Button — only shown when they have at least one active listing */}
                    {currentUser && currentUser.id !== userId && onContact && listings.some(l => !l.is_sold) && (
                        <button
                            onClick={() => {
                                const activeListing = listings.find(l => !l.is_sold);
                                onContact({
                                    listingId: activeListing.id,
                                    listingTitle: activeListing.title,
                                    listingPrice: activeListing.price,
                                    sellerId: userId
                                });
                            }}
                            className="mt-4 w-full py-2.5 bg-unicycle-green text-white rounded-lg hover:bg-unicycle-green/90 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Message User
                        </button>
                    )}

                    {/* Leave Review Button */}
                    {canReview && (
                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="mt-4 w-full py-2 border border-unicycle-green text-unicycle-green rounded-lg hover:bg-unicycle-green/10 transition-colors font-medium"
                        >
                            {showReviewForm ? 'Cancel' : 'Leave a Review'}
                        </button>
                    )}

                    {/* Review Form */}
                    {showReviewForm && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-3">Rate your experience</h3>

                            <div className="flex items-center gap-2 mb-4">
                                {renderStars(reviewRating, true, setReviewRating)}
                                <span className="text-sm text-gray-600 ml-2">{reviewRating}/5</span>
                            </div>

                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Share your experience (optional)"
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green resize-none mb-3"
                            />

                            <button
                                onClick={handleSubmitReview}
                                disabled={submittingReview || reviewRating === 0}
                                className="w-full py-2 bg-unicycle-green text-white rounded-lg hover:bg-unicycle-green/90 transition-colors font-medium disabled:bg-gray-300"
                            >
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    )}

                    {/* Report User */}
                    {canReport && (
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="mt-3 w-full py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                            <Flag className="w-4 h-4" />
                            Report User
                        </button>
                    )}
                </div>

                {/* Report Modal */}
                {showReportModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                            {reportSuccess ? (
                                <div className="text-center py-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="font-semibold text-gray-900">Report submitted</p>
                                    <p className="text-sm text-gray-500 mt-1">Our team will review it within 24 hours.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-gray-900">Report {user?.name}</h3>
                                        <button onClick={() => setShowReportModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                                            <X className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                                            <select
                                                value={reportReason}
                                                onChange={(e) => setReportReason(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                                            >
                                                <option value="">Select a reason</option>
                                                <option>Scam / Fraud</option>
                                                <option>Suspicious or fake account</option>
                                                <option>Inappropriate listing or content</option>
                                                <option>Harassment or threatening behaviour</option>
                                                <option>Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Additional details (optional)</label>
                                            <textarea
                                                value={reportDetails}
                                                onChange={(e) => setReportDetails(e.target.value)}
                                                placeholder="Describe what happened..."
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 resize-none text-sm"
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowReportModal(false)}
                                                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleReport}
                                                disabled={!reportReason || submittingReport}
                                                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                                            >
                                                {submittingReport ? 'Submitting...' : 'Submit Report'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex bg-white rounded-lg shadow-sm overflow-hidden">
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'listings'
                                ? 'bg-unicycle-green text-white'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Listings ({listings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'reviews'
                                ? 'bg-unicycle-green text-white'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Reviews ({reviews?.review_count || 0})
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'listings' && (
                    <div>
                        {listings.length === 0 ? (
                            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No active listings</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {listings.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => onItemClick(item)}
                                        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left"
                                    >
                                        <div className="aspect-square relative">
                                            <img
                                                src={getFirstImage(item.images)}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium">
                                                {item.condition}
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-medium text-gray-900 text-sm truncate">{item.title}</h3>
                                            <p className="text-unicycle-green font-bold mt-1">{formatPrice(item.price)}</p>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate">{item.safe_zone}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="space-y-3">
                        {(!reviews || reviews.reviews.length === 0) ? (
                            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                                <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No reviews yet</p>
                            </div>
                        ) : (
                            reviews.reviews.map((review) => {
                                const isMyReview = review.reviewer_id === currentUser?.id;
                                const isEditing = editingReview?.id === review.id;
                                return (
                                <div key={review.id} className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-semibold">
                                            {review.reviewer?.name?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-medium text-gray-900">{review.reviewer?.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                                                    {isMyReview && !isEditing && (
                                                        <button
                                                            onClick={() => setEditingReview({ id: review.id, rating: review.rating, text: review.text || '', reviewed_user_id: review.reviewed_user_id, listing_id: review.listing_id })}
                                                            className="p-1 text-gray-400 hover:text-unicycle-green transition-colors"
                                                            title="Edit review"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {isEditing ? (
                                                <div className="space-y-2 mt-2">
                                                    <div className="flex gap-1">
                                                        {[1,2,3,4,5].map(s => (
                                                            <button key={s} type="button" onClick={() => setEditingReview(prev => ({ ...prev, rating: s }))}>
                                                                <Star className={`w-5 h-5 ${s <= editingReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <textarea
                                                        value={editingReview.text}
                                                        onChange={e => setEditingReview(prev => ({ ...prev, text: e.target.value }))}
                                                        rows={2}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green resize-none"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={handleUpdateReview}
                                                            disabled={savingReview || editingReview.rating === 0}
                                                            className="px-3 py-1.5 bg-unicycle-green text-white text-xs font-medium rounded-lg hover:bg-unicycle-green/90 disabled:opacity-50"
                                                        >
                                                            {savingReview ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingReview(null)}
                                                            className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex mb-2">{renderStars(review.rating)}</div>
                                                    {review.text && <p className="text-sm text-gray-700">{review.text}</p>}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}