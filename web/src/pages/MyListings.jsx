import { useState, useEffect } from 'react';
import { ArrowLeft, Pencil, Trash2, Plus, CheckCircle, Circle } from 'lucide-react';
import { getMyListings, deleteListing, markAsSold, markAsUnsold } from '../api/listings';

export default function MyListings({ onNavigate }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMyListings();
            setListings(data);
        } catch (err) {
            console.error('Error fetching listings:', err);
            setError('Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSold = async (listing) => {
        setTogglingId(listing.id);
        try {
            if (listing.is_sold) {
                await markAsUnsold(listing.id);
            } else {
                await markAsSold(listing.id);
            }
            setListings(prev => prev.map(l =>
                l.id === listing.id ? { ...l, is_sold: !l.is_sold } : l
            ));
        } catch (err) {
            console.error('Error toggling sold status:', err);
            alert('Failed to update listing');
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (listingId) => {
        setDeleting(true);
        try {
            await deleteListing(listingId);
            setListings(prev => prev.filter(l => l.id !== listingId));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Error deleting listing:', err);
            alert('Failed to delete listing');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => onNavigate('profile')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">My Listings</h1>
                    <div className="flex-1" />
                    <button
                        onClick={() => onNavigate('sell')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-unicycle-green text-white rounded-lg hover:bg-unicycle-green/90 text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        New
                    </button>
                </div>
            </div>

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

                {/* Empty */}
                {!loading && !error && listings.length === 0 && (
                    <div className="bg-white rounded-lg p-8 text-center">
                        <div className="text-4xl mb-3">📦</div>
                        <h3 className="font-semibold text-gray-900 mb-1">No listings yet</h3>
                        <p className="text-sm text-gray-600 mb-4">Start selling items to your campus community!</p>
                        <button
                            onClick={() => onNavigate('sell')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-unicycle-green text-white rounded-lg hover:bg-unicycle-green/90 text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Post Your First Item
                        </button>
                    </div>
                )}

                {/* Listings */}
                {!loading && !error && listings.length > 0 && (
                    <div className="space-y-3">
                        {listings.map((listing) => (
                            <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div
                                    className="flex gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => onNavigate('detail', listing)}
                                >
                                    <img
                                        src={listing.images ? listing.images.split(',')[0] : 'https://via.placeholder.com/80'}
                                        alt={listing.title}
                                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">{listing.title}</h4>
                                        <p className="text-lg font-bold text-unicycle-green">${listing.price}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                                listing.is_sold
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-green-100 text-green-700'
                                            }`}>
                                                {listing.is_sold ? 'Sold' : 'Active'}
                                            </span>
                                            <span className="text-xs text-gray-500 truncate">{listing.category}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 px-4 pb-4 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => handleToggleSold(listing)}
                                        disabled={togglingId === listing.id}
                                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 ${
                                            listing.is_sold
                                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                        }`}
                                    >
                                        {listing.is_sold ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                        {listing.is_sold ? 'Mark Available' : 'Mark Sold'}
                                    </button>
                                    <button
                                        onClick={() => onNavigate('edit-listing', listing)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(listing.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>

                                {/* Delete Confirmation */}
                                {deleteConfirm === listing.id && (
                                    <div className="px-4 pb-4">
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                            <p className="text-sm text-red-800 mb-3">Delete "{listing.title}"? This cannot be undone.</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setDeleteConfirm(null)}
                                                    className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(listing.id)}
                                                    disabled={deleting}
                                                    className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                                                </button>
                                            </div>
                                        </div>
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
