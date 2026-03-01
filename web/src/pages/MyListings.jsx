import { useState, useEffect } from 'react';
import { ArrowLeft, Pencil, Trash2, Plus, CheckCircle, Circle, Zap, RefreshCw, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMyListings, deleteListing, markAsSold, markAsUnsold, renewListing, bumpListing } from '../api/listings';
import { createBoostSession } from '../api/payments';
import { firstImage } from '../utils/images';

export default function MyListings() {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [boostingId, setBoostingId] = useState(null);
    const [renewingId, setRenewingId] = useState(null);
    const [bumpingId, setBumpingId] = useState(null);

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

    const handleBoost = async (listing) => {
        if (listing.is_boosted && listing.boosted_until && new Date(listing.boosted_until) > new Date()) {
            alert('This listing is already boosted!');
            return;
        }
        setBoostingId(listing.id);
        try {
            const { checkout_url } = await createBoostSession(listing.id);
            window.location.href = checkout_url;
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to start boost payment');
            setBoostingId(null);
        }
    };

    const handleRenew = async (listing) => {
        setRenewingId(listing.id);
        try {
            const updated = await renewListing(listing.id);
            setListings(prev => prev.map(l => l.id === listing.id ? { ...l, ...updated } : l));
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to renew listing');
        } finally {
            setRenewingId(null);
        }
    };

    const handleBump = async (listing) => {
        setBumpingId(listing.id);
        try {
            const updated = await bumpListing(listing.id);
            setListings(prev => prev.map(l => l.id === listing.id ? { ...l, ...updated } : l));
        } catch (err) {
            alert(err.response?.data?.detail || 'You can only bump once every 7 days');
        } finally {
            setBumpingId(null);
        }
    };

    const getExpiryStatus = (listing) => {
        if (!listing.expires_at) return null;
        const now = new Date();
        const expires = new Date(listing.expires_at);
        const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 0) return { label: 'Expired', color: 'red' };
        if (daysLeft <= 7) return { label: `Expires in ${daysLeft}d`, color: 'amber' };
        return { label: `${daysLeft}d left`, color: 'gray' };
    };

    const canBump = (listing) => {
        if (!listing.last_bumped_at) return true;
        const lastBumped = new Date(listing.last_bumped_at);
        const daysSince = (new Date() - lastBumped) / (1000 * 60 * 60 * 24);
        return daysSince >= 7;
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
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-unicycle-green">My Listings</h1>
                    <div className="flex-1" />
                    <button
                        onClick={() => navigate('/sell')}
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
                            onClick={() => navigate('/sell')}
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
                                    onClick={() => navigate(`/item/${listing.id}`, { state: { item: listing } })}
                                >
                                    <img
                                        src={firstImage(listing.images) || 'https://via.placeholder.com/80'}
                                        alt={listing.title}
                                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">{listing.title}</h4>
                                        <p className="text-lg font-bold text-unicycle-green">${listing.price}</p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                                listing.is_sold
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-green-100 text-green-700'
                                            }`}>
                                                {listing.is_sold ? 'Sold' : 'Active'}
                                            </span>
                                            {listing.is_boosted && listing.boosted_until && new Date(listing.boosted_until) > new Date() && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1 flex-shrink-0">
                                                    <Zap className="w-3 h-3" />
                                                    Boosted
                                                </span>
                                            )}
                                            {(() => {
                                                const exp = getExpiryStatus(listing);
                                                if (!exp) return null;
                                                const colors = {
                                                    red: 'bg-red-100 text-red-700',
                                                    amber: 'bg-amber-100 text-amber-700',
                                                    gray: 'bg-gray-100 text-gray-500'
                                                };
                                                return (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0 ${colors[exp.color]}`}>
                                                        <Clock className="w-3 h-3" />
                                                        {exp.label}
                                                    </span>
                                                );
                                            })()}
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
                                        onClick={() => navigate(`/edit/${listing.id}`)}
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
                                    {!listing.is_sold && (
                                        <button
                                            onClick={() => handleBoost(listing)}
                                            disabled={boostingId === listing.id}
                                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 ${
                                                listing.is_boosted && listing.boosted_until && new Date(listing.boosted_until) > new Date()
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                            }`}
                                        >
                                            <Zap className="w-4 h-4" />
                                            {listing.is_boosted && listing.boosted_until && new Date(listing.boosted_until) > new Date() ? 'Boosted' : 'Boost'}
                                        </button>
                                    )}
                                    {listing.expires_at && (
                                        <button
                                            onClick={() => handleRenew(listing)}
                                            disabled={renewingId === listing.id}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50"
                                            title="Renew for 60 more days"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Renew
                                        </button>
                                    )}
                                    {!listing.is_sold && canBump(listing) && (
                                        <button
                                            onClick={() => handleBump(listing)}
                                            disabled={bumpingId === listing.id}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium disabled:opacity-50"
                                            title="Move to top of search results (free, once per 7 days)"
                                        >
                                            <Zap className="w-4 h-4" />
                                            Bump
                                        </button>
                                    )}
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
