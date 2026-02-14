import { useState, useEffect } from 'react';
import { Users, Package, ArrowLeftRight, BarChart3, Search, Shield, ShieldOff, Ban, CheckCircle, Trash2, Eye, EyeOff } from 'lucide-react';
import {
    getAdminStats,
    getAdminUsers,
    toggleUserAdmin,
    toggleUserSuspend,
    getAdminListings,
    toggleListingActive,
    adminDeleteListing,
    getAdminTransactions
} from '../api/admin';

const TABS = [
    { id: 'stats', label: 'Stats', Icon: BarChart3 },
    { id: 'users', label: 'Users', Icon: Users },
    { id: 'listings', label: 'Listings', Icon: Package },
    { id: 'transactions', label: 'Transactions', Icon: ArrowLeftRight },
];

export default function Admin() {
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [listings, setListings] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        loadTabData();
    }, [activeTab]);

    const loadTabData = async () => {
        setLoading(true);
        setSearchQuery('');
        try {
            switch (activeTab) {
                case 'stats':
                    setStats(await getAdminStats());
                    break;
                case 'users':
                    setUsers(await getAdminUsers());
                    break;
                case 'listings':
                    setListings(await getAdminListings());
                    break;
                case 'transactions':
                    setTransactions(await getAdminTransactions());
                    break;
            }
        } catch (err) {
            console.error('Error loading admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                setUsers(await getAdminUsers(searchQuery));
            } else if (activeTab === 'listings') {
                setListings(await getAdminListings(searchQuery));
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (userId) => {
        setActionLoading(userId);
        try {
            await toggleUserAdmin(userId);
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, is_admin: !u.is_admin } : u
            ));
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to toggle admin');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleSuspend = async (userId) => {
        setActionLoading(userId);
        try {
            await toggleUserSuspend(userId);
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, is_suspended: !u.is_suspended } : u
            ));
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to toggle suspend');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleListingActive = async (listingId) => {
        setActionLoading(listingId);
        try {
            await toggleListingActive(listingId);
            setListings(prev => prev.map(l =>
                l.id === listingId ? { ...l, is_active: !l.is_active } : l
            ));
        } catch (err) {
            alert('Failed to toggle listing');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteListing = async (listingId) => {
        if (!confirm('Delete this listing permanently?')) return;
        setActionLoading(listingId);
        try {
            await adminDeleteListing(listingId);
            setListings(prev => prev.filter(l => l.id !== listingId));
        } catch (err) {
            alert('Failed to delete listing');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const statusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'agreed': return 'bg-blue-100 text-blue-700';
            case 'interested': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                </div>
                {/* Tabs */}
                <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-unicycle-green text-unicycle-green'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <tab.Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-unicycle-green"></div>
                    </div>
                )}

                {/* Stats Tab */}
                {!loading && activeTab === 'stats' && stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { label: 'Total Users', value: stats.total_users, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Total Listings', value: stats.total_listings, color: 'text-purple-600', bg: 'bg-purple-50' },
                            { label: 'Active Listings', value: stats.active_listings, color: 'text-green-600', bg: 'bg-green-50' },
                            { label: 'Total Transactions', value: stats.total_transactions, color: 'text-orange-600', bg: 'bg-orange-50' },
                            { label: 'Completed', value: stats.completed_transactions, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Est. Revenue', value: `$${stats.estimated_revenue}`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                        ].map((stat) => (
                            <div key={stat.label} className={`${stat.bg} rounded-xl p-5 border`}>
                                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Users Tab */}
                {!loading && activeTab === 'users' && (
                    <div>
                        <div className="mb-4 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or university..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                                />
                            </div>
                            <button onClick={handleSearch} className="px-4 py-2.5 bg-unicycle-green text-white rounded-lg text-sm font-medium hover:bg-unicycle-green/90">
                                Search
                            </button>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">University</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                                            <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                                                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                                <td className="px-4 py-3 text-gray-600">{u.university}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {u.is_verified && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">Verified</span>
                                                        )}
                                                        {u.is_admin && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">Admin</span>
                                                        )}
                                                        {u.is_suspended && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">Suspended</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(u.created_at)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-1">
                                                        <button
                                                            onClick={() => handleToggleAdmin(u.id)}
                                                            disabled={actionLoading === u.id}
                                                            title={u.is_admin ? 'Remove admin' : 'Make admin'}
                                                            className={`p-1.5 rounded-lg transition-colors ${u.is_admin ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                                        >
                                                            {u.is_admin ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleSuspend(u.id)}
                                                            disabled={actionLoading === u.id}
                                                            title={u.is_suspended ? 'Unsuspend' : 'Suspend'}
                                                            className={`p-1.5 rounded-lg transition-colors ${u.is_suspended ? 'text-red-600 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                                        >
                                                            {u.is_suspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {users.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm">No users found</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Listings Tab */}
                {!loading && activeTab === 'listings' && (
                    <div>
                        <div className="mb-4 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by title or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                                />
                            </div>
                            <button onClick={handleSearch} className="px-4 py-2.5 bg-unicycle-green text-white rounded-lg text-sm font-medium hover:bg-unicycle-green/90">
                                Search
                            </button>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Seller</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Posted</th>
                                            <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listings.map(l => (
                                            <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{l.title}</td>
                                                <td className="px-4 py-3 text-gray-600">{l.seller_name}</td>
                                                <td className="px-4 py-3 text-gray-900 font-medium">${l.price}</td>
                                                <td className="px-4 py-3 text-gray-600">{l.category}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        {l.is_sold ? (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">Sold</span>
                                                        ) : l.is_active ? (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">Active</span>
                                                        ) : (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">Inactive</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(l.created_at)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-1">
                                                        <button
                                                            onClick={() => handleToggleListingActive(l.id)}
                                                            disabled={actionLoading === l.id}
                                                            title={l.is_active ? 'Deactivate' : 'Activate'}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                                                        >
                                                            {l.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteListing(l.id)}
                                                            disabled={actionLoading === l.id}
                                                            title="Delete"
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {listings.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm">No listings found</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Transactions Tab */}
                {!loading && activeTab === 'transactions' && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Buyer</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Seller</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Item</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(t => (
                                        <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-900">{t.buyer_name}</td>
                                            <td className="px-4 py-3 text-gray-900">{t.seller_name}</td>
                                            <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{t.listing_title}</td>
                                            <td className="px-4 py-3 text-gray-900 font-medium">${t.listing_price}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${statusColor(t.status)}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(t.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {transactions.length === 0 && (
                            <div className="text-center py-8 text-gray-500 text-sm">No transactions found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
