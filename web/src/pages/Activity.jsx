import { useState, useEffect } from 'react';
import { ArrowLeft, Package, ShoppingBag, Clock, CheckCircle, X, Star } from 'lucide-react';
import { getMyTransactions, updateTransaction } from '../api/transactions';
import { createReview } from '../api/reviews';

export default function Transactions({ onNavigate }) {
    const [activeTab, setActiveTab] = useState('buyer'); // buyer or seller
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(null);
    const [reviewModal, setReviewModal] = useState(null); // { userId, userName, listingId }
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    // Fetch transactions
    useEffect(() => {
        fetchTransactions();
    }, [activeTab]);

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMyTransactions(activeTab === 'buyer');
            setTransactions(data);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    // Update transaction status
    const handleUpdateStatus = async (transactionId, newStatus) => {
        setUpdating(transactionId);
        try {
            await updateTransaction(transactionId, newStatus);
            // Refresh transactions
            await fetchTransactions();
        } catch (err) {
            console.error('Error updating transaction:', err);
            alert('Failed to update transaction');
        } finally {
            setUpdating(null);
        }
    };

    const openReviewModal = (transaction) => {
        setReviewModal({
            userId: activeTab === 'buyer' ? transaction.seller_id : transaction.buyer_id,
            userName: activeTab === 'buyer' ? transaction.seller?.name : transaction.buyer?.name,
            listingId: transaction.listing_id
        });
        setReviewRating(0);
        setReviewText('');
    };

    const handleSubmitReview = async () => {
        if (!reviewModal) return;
        setSubmittingReview(true);
        try {
            await createReview({
                reviewed_user_id: reviewModal.userId,
                listing_id: reviewModal.listingId,
                rating: reviewRating,
                text: reviewText.trim() || null
            });
            setReviewModal(null);
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            interested: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Interested', icon: Clock },
            agreed: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Agreed', icon: CheckCircle },
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', icon: CheckCircle },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled', icon: X }
        };
        const badge = badges[status] || badges.interested;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    return (
        <>
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => onNavigate('profile')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-unicycle-green">Activity</h1>
                </div>

                {/* Tabs */}
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex gap-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('buyer')}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                                activeTab === 'buyer'
                                    ? 'border-unicycle-green text-unicycle-green font-semibold'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            My Interests
                        </button>

                        <button
                            onClick={() => setActiveTab('seller')}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                                activeTab === 'seller'
                                    ? 'border-unicycle-green text-unicycle-green font-semibold'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Package className="w-4 h-4" />
                            Incoming
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-unicycle-green"></div>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && transactions.length === 0 && (
                    <div className="bg-white rounded-lg p-8 text-center">
                        <div className="text-4xl mb-3">
                            {activeTab === 'buyer' ? '🛒' : '📦'}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                            {activeTab === 'buyer' ? 'No interests yet' : 'No requests yet'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {activeTab === 'buyer'
                                ? 'Click "I\'m Interested" on items you want to buy'
                                : 'When buyers express interest, they\'ll show up here'}
                        </p>
                        <button
                            onClick={() => onNavigate('listings')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-unicycle-green text-white rounded-lg hover:bg-unicycle-green/90 text-sm font-medium"
                        >
                            Browse Listings
                        </button>
                    </div>
                )}

                {/* Transactions List */}
                {!loading && !error && transactions.length > 0 && (
                    <div className="space-y-3">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                {/* Item Info - Clickable */}
                                <div
                                    className="flex gap-3 p-4 pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => onNavigate('detail', transaction.listing)}
                                >
                                    <img
                                        src={transaction.listing?.images?.split(',')[0] || 'https://via.placeholder.com/80'}
                                        alt={transaction.listing?.title}
                                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                                            {transaction.listing?.title}
                                        </h4>
                                        <p className="text-lg font-bold text-unicycle-green">${transaction.listing?.price}</p>
                                        <p className="text-xs text-gray-500">
                                            {activeTab === 'buyer'
                                                ? `Seller: ${transaction.seller?.name}`
                                                : `Buyer: ${transaction.buyer?.name}`
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        {getStatusBadge(transaction.status)}
                                    </div>
                                </div>

                                {/* Actions (only if not completed or cancelled) */}
                                {transaction.status !== 'completed' && transaction.status !== 'cancelled' && (
                                    <div className="flex gap-2 px-4 pb-4 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => handleUpdateStatus(transaction.id, 'completed')}
                                            disabled={updating === transaction.id}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Mark Complete
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(transaction.id, 'cancelled')}
                                            disabled={updating === transaction.id}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    </div>
                                )}

                                {/* Completed info + Leave Review */}
                                {transaction.status === 'completed' && (
                                    <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <p className="text-xs text-gray-500">
                                            {transaction.completed_at
                                                ? `Completed on ${new Date(transaction.completed_at).toLocaleDateString()}`
                                                : 'Completed'}
                                        </p>
                                        {activeTab === 'buyer' && (
                                            <button
                                                onClick={() => openReviewModal(transaction)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors text-xs font-medium border border-amber-200"
                                            >
                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                Leave Review
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Review Modal */}
        {reviewModal && (
            <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Rate {reviewModal.userName}</h3>
                        <button onClick={() => setReviewModal(null)} className="p-1 hover:bg-gray-100 rounded-full">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <div className="p-5 space-y-4">
                        {/* Star picker */}
                        <div className="flex items-center justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setReviewRating(star)}>
                                    <Star className={`w-9 h-9 transition-colors ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                </button>
                            ))}
                            <span className="text-sm text-gray-500 ml-1">{reviewRating}/5</span>
                        </div>
                        {/* Text */}
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your experience (optional)"
                            rows={3}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green resize-none"
                        />
                        <button
                            onClick={handleSubmitReview}
                            disabled={submittingReview || reviewRating === 0}
                            className="w-full py-2.5 bg-unicycle-green text-white rounded-lg font-semibold text-sm hover:bg-unicycle-green/90 transition-colors disabled:opacity-50"
                        >
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
