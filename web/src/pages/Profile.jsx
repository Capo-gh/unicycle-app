import { useState, useEffect } from 'react';
import { Settings, ShieldCheck, Package, Star, Plus, ArrowLeftRight, Pencil, Check, X } from 'lucide-react';
import { getMyListings } from '../api/listings';
import { getMyStats, getMyTransactions } from '../api/transactions';
import { updateProfile } from '../api/users';

export default function Profile({ user: signupUser, onNavigate }) {
    const [myListings, setMyListings] = useState([]);
    const [myInterests, setMyInterests] = useState([]);
    const [incomingTransactions, setIncomingTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [displayName, setDisplayName] = useState(signupUser?.name || 'User');
    const [savingName, setSavingName] = useState(false);

    const handleSaveName = async () => {
        const trimmed = nameInput.trim();
        if (!trimmed) return;
        setSavingName(true);
        try {
            await updateProfile({ name: trimmed });
            setDisplayName(trimmed);
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, name: trimmed }));
            setEditingName(false);
        } catch {
            // ignore
        } finally {
            setSavingName(false);
        }
    };

    const user = {
        name: displayName,
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

    // Fetch user's listings, interests, and stats from backend
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch listings, interests, and stats in parallel
                const [listingsData, interestsData, incomingData, statsData] = await Promise.all([
                    getMyListings(),
                    getMyTransactions(true),  // as_buyer = true
                    getMyTransactions(false), // as_seller = false (incoming)
                    getMyStats()
                ]);
                setMyListings(listingsData);
                setMyInterests(interestsData);
                setIncomingTransactions(incomingData);
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

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">

            {/* ─── GRADIENT HEADER ─── */}
            <div className="bg-gradient-to-r from-unicycle-blue to-unicycle-green text-white">
                <div className="max-w-md lg:max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold text-unicycle-green">Profile</h1>
                        <button
                            onClick={() => onNavigate('settings')}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <Settings className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Profile Info */}
                    <div className="flex items-center gap-4 lg:gap-6">
                        <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex-shrink-0 overflow-hidden bg-white flex items-center justify-center text-unicycle-blue font-bold text-3xl lg:text-4xl">
                            {signupUser?.avatar_url
                                ? <img src={signupUser.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                : user.name.charAt(0)
                            }
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                {editingName ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <input
                                            autoFocus
                                            value={nameInput}
                                            onChange={(e) => setNameInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                                            maxLength={60}
                                            className="bg-white/20 text-white placeholder-white/60 border border-white/40 rounded-lg px-3 py-1 text-lg font-bold focus:outline-none focus:border-white flex-1"
                                        />
                                        <button onClick={handleSaveName} disabled={savingName || !nameInput.trim()} className="p-1 hover:bg-white/20 rounded-full disabled:opacity-50">
                                            <Check className="w-5 h-5 text-white" />
                                        </button>
                                        <button onClick={() => setEditingName(false)} className="p-1 hover:bg-white/20 rounded-full">
                                            <X className="w-5 h-5 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-xl lg:text-2xl font-bold">{user.name}</h2>
                                        {user.verified && <ShieldCheck className="w-5 h-5" />}
                                        <button onClick={() => { setNameInput(user.name); setEditingName(true); }} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                                            <Pencil className="w-4 h-4 text-white/70" />
                                        </button>
                                    </>
                                )}
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

                        {/* Listings Preview (max 3) */}
                        {!loading && !error && myListings.length > 0 && (
                            <div className="space-y-3">
                                {myListings.slice(0, 3).map((listing) => (
                                    <div
                                        key={listing.id}
                                        className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer hover:border-unicycle-green transition-colors"
                                        onClick={() => onNavigate('detail', listing)}
                                    >
                                        <div className="flex gap-3">
                                            <img
                                                src={listing.images ? listing.images.split(',')[0] : 'https://via.placeholder.com/80'}
                                                alt={listing.title}
                                                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">{listing.title}</h4>
                                                <p className="text-base font-bold text-unicycle-green">${listing.price}</p>
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
                                    </div>
                                ))}

                                {/* View All Button */}
                                <button
                                    onClick={() => onNavigate('my-listings')}
                                    className="w-full py-2.5 bg-unicycle-green text-white rounded-lg font-medium hover:bg-unicycle-green/90 transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    View All Listings
                                    {myListings.length > 3 && (
                                        <span className="px-2 py-0.5 bg-white text-unicycle-green text-xs rounded-full font-semibold">
                                            +{myListings.length - 3}
                                        </span>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Activity */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <ArrowLeftRight className="w-5 h-5" />
                                Activity
                            </h3>
                            <span className="text-sm text-gray-500">
                                {loading ? '...' : `${myInterests.length + incomingTransactions.length} total`}
                            </span>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-unicycle-green mx-auto"></div>
                                <p className="text-gray-500 text-sm mt-2">Loading activity...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-center">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && myInterests.length === 0 && incomingTransactions.length === 0 && (
                            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
                                <div className="text-4xl mb-3">📦</div>
                                <h4 className="font-semibold text-gray-900 mb-1">No activity yet</h4>
                                <p className="text-sm text-gray-600 mb-4">Express interest in items or wait for buyers to find yours!</p>
                                <button
                                    onClick={() => onNavigate('listings')}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-unicycle-green text-white rounded-lg hover:bg-unicycle-green/90 text-sm font-medium"
                                >
                                    Browse Listings
                                </button>
                            </div>
                        )}

                        {/* Transactions Preview (max 3) */}
                        {!loading && !error && (myInterests.length > 0 || incomingTransactions.length > 0) && (
                            <div className="space-y-3">
                                {[
                                    ...myInterests.map(t => ({ ...t, _type: 'buyer' })),
                                    ...incomingTransactions.map(t => ({ ...t, _type: 'seller' }))
                                ]
                                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                    .slice(0, 3)
                                    .map((transaction) => (
                                    <div
                                        key={`${transaction._type}-${transaction.id}`}
                                        className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer hover:border-unicycle-green transition-colors"
                                        onClick={() => onNavigate('my-interests')}
                                    >
                                        <div className="flex gap-3">
                                            <img
                                                src={transaction.listing?.images ? transaction.listing.images.split(',')[0] : 'https://via.placeholder.com/80'}
                                                alt={transaction.listing?.title || 'Item'}
                                                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                                                    {transaction.listing?.title || 'Untitled'}
                                                </h4>
                                                <p className="text-base font-bold text-unicycle-green">
                                                    ${transaction.listing?.price || '0'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                                        transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        transaction.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                                                        transaction.status === 'agreed' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {transaction.status === 'completed' ? 'Completed' :
                                                         transaction.status === 'cancelled' ? 'Cancelled' :
                                                         transaction.status === 'agreed' ? 'Agreed' : 'Interested'}
                                                    </span>
                                                    {transaction._type === 'seller' && (
                                                        <span className="text-xs text-gray-400">
                                                            (Incoming)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* View All Button */}
                                <button
                                    onClick={() => onNavigate('my-interests')}
                                    className="w-full py-2.5 bg-unicycle-green text-white rounded-lg font-medium hover:bg-unicycle-green/90 transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    View All Activity
                                    {(myInterests.length + incomingTransactions.length) > 3 && (
                                        <span className="px-2 py-0.5 bg-white text-unicycle-green text-xs rounded-full font-semibold">
                                            +{(myInterests.length + incomingTransactions.length) - 3}
                                        </span>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>

        </div>
    );
}