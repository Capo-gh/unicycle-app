import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, Clock, CheckCircle, X } from 'lucide-react';
import { getMyTransactions } from '../api/transactions';

export default function MyInterests({ onNavigate, onContactSeller }) {
    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInterests();
    }, []);

    const fetchInterests = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMyTransactions(true); // as_buyer = true
            setInterests(data);
        } catch (err) {
            console.error('Error fetching interests:', err);
            setError('Failed to load your interests');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            interested: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Interested', Icon: Clock },
            agreed: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Agreed', Icon: CheckCircle },
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', Icon: CheckCircle },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled', Icon: X }
        };
        const { bg, text, label, Icon } = config[status] || config.interested;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
                <Icon className="w-3 h-3" />
                {label}
            </span>
        );
    };

    return (
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
                    <Heart className="w-6 h-6 text-unicycle-green" />
                    <h1 className="text-lg font-semibold text-gray-900">My Interests</h1>
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
                        <button onClick={fetchInterests} className="mt-2 text-sm text-unicycle-blue hover:underline">
                            Try again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && interests.length === 0 && (
                    <div className="bg-white rounded-lg p-8 text-center">
                        <div className="text-4xl mb-3">❤️</div>
                        <h3 className="font-semibold text-gray-900 mb-1">No interests yet</h3>
                        <p className="text-sm text-gray-600 mb-4">Click "I'm Interested" on items you want to buy!</p>
                        <button
                            onClick={() => onNavigate('listings')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-unicycle-green text-white rounded-lg hover:bg-unicycle-green/90 text-sm font-medium"
                        >
                            Browse Listings
                        </button>
                    </div>
                )}

                {/* Interests List */}
                {!loading && !error && interests.length > 0 && (
                    <div className="space-y-3">
                        {interests.map((transaction) => (
                            <div key={transaction.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                {/* Item Info */}
                                <div className="flex gap-3 mb-3">
                                    <img
                                        src={transaction.listing?.images ? transaction.listing.images.split(',')[0] : 'https://via.placeholder.com/80'}
                                        alt={transaction.listing?.title || 'Item'}
                                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-75 transition-opacity"
                                        onClick={() => onNavigate('detail', transaction.listing)}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4
                                            className="font-semibold text-gray-900 text-sm mb-1 truncate cursor-pointer hover:text-unicycle-green"
                                            onClick={() => onNavigate('detail', transaction.listing)}
                                        >
                                            {transaction.listing?.title || 'Untitled'}
                                        </h4>
                                        <p className="text-lg font-bold text-unicycle-green">
                                            ${transaction.listing?.price || '0'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            {getStatusBadge(transaction.status)}
                                            <span className="text-xs text-gray-500">
                                                Seller: {transaction.seller?.name || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {transaction.status !== 'completed' && transaction.status !== 'cancelled' && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => onContactSeller({
                                                listingId: transaction.listing?.id,
                                                listingTitle: transaction.listing?.title,
                                                listingPrice: transaction.listing?.price
                                            })}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-unicycle-green text-white rounded-lg hover:bg-unicycle-green/90 transition-colors text-sm font-medium"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            Message Seller
                                        </button>
                                    </div>
                                )}

                                {/* Completed info */}
                                {transaction.status === 'completed' && transaction.completed_at && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <p className="text-xs text-gray-500">
                                            Completed on {new Date(transaction.completed_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
