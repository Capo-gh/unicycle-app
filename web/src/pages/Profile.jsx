import { useState, useEffect } from 'react';
import { Settings, ShieldCheck, Package, Star, Pencil, Trash2, Plus } from 'lucide-react';
import { getMyListings, deleteListing } from '../api/listings';
import { getMyStats } from '../api/transactions';

export default function Profile({ user: signupUser, onNavigate }) {
    const [myListings, setMyListings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // listing id to delete
    const [deleting, setDeleting] = useState(false);

    const user = {
        name: signupUser?.name || 'User',
        email: signupUser?.email || '',
        university: signupUser?.university || '',
        verified: signupUser?.is_verified || false,
        memberSince: signupUser?.created_at
            ? new Date(signupUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : "Recently",
        rating: signupUser?.avg_rating || 0,
        totalReviews: signupUser?.review_count || 0,
        itemsSold: stats?.items_sold || 0,
        itemsBought: stats?.items_bought || 0,
        activeListings: stats?.active_listings || 0
    };

    // Fetch user's listings and stats from backend
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch listings and stats in parallel
                const [listingsData, statsData] = await Promise.all([
                    getMyListings(),
                    getMyStats()
                ]);
                setMyListings(listingsData);
                setStats(statsData);
            } catch (err) {
                console.error('Error fetching profile data:', err);
                if (err.response?.status === 401) {
                    setError('Please log in to view your profile');
                } else if (err.response?.status === 403) {
                    setError('Please verify your email to view your profile');
                } else {
                    setError('Failed to load your profile');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle delete listing
    const handleDelete = async (listingId) => {
        setDeleting(true);
        try {
            await deleteListing(listingId);
            // Remove from local state
            setMyListings(prev => prev.filter(l => l.id !== listingId));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Error deleting listing:', err);
            alert('Failed to delete listing. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">

            {/* ─── GRADIENT HEADER ─── */}
            <div className="bg-gradient-to-r from-unicycle-blue to-unicycle-green text-white">
                <div className="max-w-md lg:max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold">Profile</h1>
                        <button
                            onClick={() => onNavigate('settings')}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <Settings className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Profile Info */}
                    <div className="flex items-center gap-4 lg:gap-6">
                        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-full flex items-center justify-center text-unicycle-blue font-bold text-3xl lg:text-4xl flex-shrink-0">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xl lg:text-2xl font-bold">{user.name}</h2>
                                {user.verified && <ShieldCheck className="w-5 h-5" />}
                            </div>
                            <p className="text-sm text-white/80">{user.university}</p>
                            <p className="text-xs text-white/60 mt-1">Member since {user.memberSince}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── BODY: 2-column on desktop, single on mobile ─── */}
            <div className="max-w-md lg:max-w-4xl mx-auto px-4 lg:grid lg:grid-cols-[280px_1fr] lg:gap-6 lg:pt-6">

                {/* ─── LEFT COLUMN: Stats + Verification ─── */}
                <div className="space-y-4">

                    {/* Stats Card - overlaps header on mobile */}
                    <div className="bg-white rounded-lg shadow-md p-4 -mt-6 lg:mt-0">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{user.rating}</div>
                                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    Rating
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{user.itemsSold}</div>
                                <div className="text-xs text-gray-500">Sold</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{user.itemsBought}</div>
                                <div className="text-xs text-gray-500">Bought</div>
                            </div>
                        </div>
                    </div>

                    {/* Verification Badge */}
                    <div className="bg-gradient-to-r from-unicycle-blue/10 to-unicycle-green/10 rounded-lg p-4 border-2 border-unicycle-blue/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-unicycle-blue rounded-lg">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">Verified {user.university} Student</h3>
                                <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── RIGHT COLUMN: Listings + Reviews ─── */}
                <div className="space-y-6 mt-4 lg:mt-0">

                    {/* My Listings */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                My Listings
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                    {loading ? '...' : `${myListings.length} active`}
                                </span>
                                <button
                                    onClick={() => onNavigate('sell')}
                                    className="p-1.5 bg-unicycle-green text-white rounded-lg hover:bg-unicycle-green/90 transition-colors"
                                    title="Post new item"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-unicycle-green mx-auto"></div>
                                <p className="text-gray-500 text-sm mt-2">Loading your listings...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-center">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && myListings.length === 0 && (
                            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
                                <div className="text-4xl mb-3">📦</div>
                                <h4 className="font-semibold text-gray-900 mb-1">No listings yet</h4>
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

                        {/* Listings Grid */}
                        {!loading && !error && myListings.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {myListings.map((listing) => (
                                    <div
                                        key={listing.id}
                                        className="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
                                    >
                                        <div className="flex gap-3">
                                            <img
                                                src={listing.images ? listing.images.split(',')[0] : 'https://via.placeholder.com/80'}
                                                alt={listing.title}
                                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">{listing.title}</h4>
                                                <p className="text-lg font-bold text-unicycle-green">${listing.price}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                                        Active
                                                    </span>
                                                    <span className="text-xs text-gray-500">{listing.category}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
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
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* ─── Delete Confirmation Modal ─── */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Listing?</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                This will remove your listing from the marketplace. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}