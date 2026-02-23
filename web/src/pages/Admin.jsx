import { useState, useEffect } from 'react';
import { Users, Package, ArrowLeftRight, BarChart3, Search, Shield, ShieldOff, Ban, CheckCircle, Trash2, Eye, EyeOff, Bell, Megaphone, Send, Star, DollarSign, RotateCcw } from 'lucide-react';
import {
    getAdminStats,
    getAdminUsers,
    toggleUserAdmin,
    toggleUserSuspend,
    getAdminListings,
    toggleListingActive,
    adminDeleteListing,
    getAdminTransactions,
    getUniversities,
    resolveDispute
} from '../api/admin';
import {
    sendBroadcast,
    getAdminNotifications
} from '../api/notifications';
import {
    createAnnouncement,
    getAdminAnnouncements,
    toggleAnnouncement,
    deleteAnnouncement
} from '../api/announcements';

const TABS = [
    { id: 'stats', label: 'Stats', Icon: BarChart3 },
    { id: 'users', label: 'Users', Icon: Users },
    { id: 'listings', label: 'Listings', Icon: Package },
    { id: 'transactions', label: 'Transactions', Icon: ArrowLeftRight },
    { id: 'notifications', label: 'Notifications', Icon: Bell },
    { id: 'announcements', label: 'Announcements', Icon: Megaphone },
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

    // Super admin check
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    // University filter
    const [universities, setUniversities] = useState([]);
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [txUniversity, setTxUniversity] = useState('');

    // Notifications
    const [sentNotifications, setSentNotifications] = useState([]);
    const [notifForm, setNotifForm] = useState({ title: '', message: '', target_university: '' });
    const [sendingNotif, setSendingNotif] = useState(false);

    // Announcements
    const [announcements, setAnnouncements] = useState([]);
    const [announcementForm, setAnnouncementForm] = useState({
        title: '', message: '', image_url: '', action_text: '', action_type: '', target_university: '', expires_at: ''
    });
    const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);

    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                setIsSuperAdmin(userData.is_super_admin === true);
            }
        } catch (e) {}

        // Load universities
        getUniversities().then(setUniversities).catch(() => {});
    }, []);

    useEffect(() => {
        loadTabData();
    }, [activeTab, selectedUniversity, txUniversity]);

    const loadTabData = async () => {
        setLoading(true);
        setSearchQuery('');
        try {
            switch (activeTab) {
                case 'stats':
                    setStats(await getAdminStats());
                    break;
                case 'users':
                    setUsers(await getAdminUsers('', selectedUniversity));
                    break;
                case 'listings':
                    setListings(await getAdminListings('', selectedUniversity));
                    break;
                case 'transactions':
                    setTransactions(await getAdminTransactions(txUniversity));
                    break;
                case 'notifications':
                    setSentNotifications(await getAdminNotifications());
                    break;
                case 'announcements':
                    setAnnouncements(await getAdminAnnouncements());
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
                setUsers(await getAdminUsers(searchQuery, selectedUniversity));
            } else if (activeTab === 'listings') {
                setListings(await getAdminListings(searchQuery, selectedUniversity));
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (userId, userName, currentlyAdmin) => {
        const action = currentlyAdmin ? 'remove admin access from' : 'grant admin access to';
        if (!confirm(`Are you sure you want to ${action} ${userName}?`)) return;
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

    const handleResolveDispute = async (transactionId, action) => {
        const label = action === 'release' ? 'release funds to the seller' : 'refund the buyer';
        if (!confirm(`Are you sure you want to ${label}? This action cannot be undone.`)) return;
        setActionLoading(transactionId);
        try {
            await resolveDispute(transactionId, action);
            setTransactions(prev => prev.map(t =>
                t.id === transactionId
                    ? { ...t, payment_status: action === 'release' ? 'captured' : 'refunded', status: action === 'release' ? 'completed' : 'cancelled' }
                    : t
            ));
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to resolve dispute');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        if (!notifForm.title.trim() || !notifForm.message.trim()) return;
        setSendingNotif(true);
        try {
            await sendBroadcast({
                title: notifForm.title,
                message: notifForm.message,
                target_university: notifForm.target_university || null
            });
            setNotifForm({ title: '', message: '', target_university: '' });
            setSentNotifications(await getAdminNotifications());
            alert('Notification sent!');
        } catch (err) {
            alert('Failed to send notification');
        } finally {
            setSendingNotif(false);
        }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        if (!announcementForm.title.trim() || !announcementForm.message.trim()) return;
        setCreatingAnnouncement(true);
        try {
            await createAnnouncement({
                title: announcementForm.title,
                message: announcementForm.message,
                image_url: announcementForm.image_url || null,
                action_text: announcementForm.action_text || null,
                action_type: announcementForm.action_type || null,
                target_university: announcementForm.target_university || null,
                expires_at: announcementForm.expires_at || null
            });
            setAnnouncementForm({ title: '', message: '', image_url: '', action_text: '', action_type: '', target_university: '', expires_at: '' });
            setAnnouncements(await getAdminAnnouncements());
            alert('Announcement created!');
        } catch (err) {
            alert('Failed to create announcement');
        } finally {
            setCreatingAnnouncement(false);
        }
    };

    const handleToggleAnnouncement = async (id) => {
        try {
            await toggleAnnouncement(id);
            setAnnouncements(prev => prev.map(a =>
                a.id === id ? { ...a, is_active: !a.is_active } : a
            ));
        } catch (err) {
            alert('Failed to toggle announcement');
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!confirm('Delete this announcement?')) return;
        try {
            await deleteAnnouncement(id);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            alert('Failed to delete announcement');
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
            case 'disputed': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const inputClass = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green";

    // University filter dropdown (reused in Users and Listings tabs)
    const UniversityFilter = () => (
        <select
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
        >
            <option value="">All Universities</option>
            {universities.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                        {isSuperAdmin && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium flex items-center gap-1">
                                <Star className="w-3 h-3" /> Super Admin
                            </span>
                        )}
                    </div>
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
                        <div className="mb-4 flex gap-2 flex-wrap">
                            <UniversityFilter />
                            <div className="relative flex-1 min-w-[200px]">
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
                                                        {u.is_super_admin && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium">Super Admin</span>
                                                        )}
                                                        {u.is_admin && !u.is_super_admin && (
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
                                                        {isSuperAdmin && !u.is_super_admin && (
                                                            <button
                                                                onClick={() => handleToggleAdmin(u.id, u.name, u.is_admin)}
                                                                disabled={actionLoading === u.id}
                                                                title={u.is_admin ? 'Remove admin' : 'Make admin'}
                                                                className={`p-1.5 rounded-lg transition-colors ${u.is_admin ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                                            >
                                                                {u.is_admin ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                                                            </button>
                                                        )}
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
                        <div className="mb-4 flex gap-2 flex-wrap">
                            <UniversityFilter />
                            <div className="relative flex-1 min-w-[200px]">
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
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <select
                                value={txUniversity}
                                onChange={(e) => setTxUniversity(e.target.value)}
                                className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                            >
                                <option value="">All Universities</option>
                                {universities.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <span className="text-sm text-gray-500">{transactions.length} transactions</span>
                        </div>
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
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Payment</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(t => (
                                        <tr key={t.id} className={`border-b border-gray-100 hover:bg-gray-50 ${t.payment_status === 'disputed' ? 'bg-orange-50/50' : ''}`}>
                                            <td className="px-4 py-3 text-gray-900">{t.buyer_name}</td>
                                            <td className="px-4 py-3 text-gray-900">{t.seller_name}</td>
                                            <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{t.listing_title}</td>
                                            <td className="px-4 py-3 text-gray-900 font-medium">${t.listing_price}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${statusColor(t.status)}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {t.payment_status && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${
                                                        t.payment_status === 'disputed' ? 'bg-orange-100 text-orange-700' :
                                                        t.payment_status === 'captured' ? 'bg-green-100 text-green-700' :
                                                        t.payment_status === 'held' ? 'bg-blue-100 text-blue-700' :
                                                        t.payment_status === 'refunded' ? 'bg-gray-100 text-gray-600' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {t.payment_method === 'secure_pay' ? `SP: ${t.payment_status}` : 'cash'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(t.created_at)}</td>
                                            <td className="px-4 py-3">
                                                {t.payment_status === 'disputed' && (
                                                    <div className="flex justify-end gap-1">
                                                        <button
                                                            onClick={() => handleResolveDispute(t.id, 'release')}
                                                            disabled={actionLoading === t.id}
                                                            title="Release funds to seller"
                                                            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                                        >
                                                            <DollarSign className="w-3 h-3" /> Release
                                                        </button>
                                                        <button
                                                            onClick={() => handleResolveDispute(t.id, 'refund')}
                                                            disabled={actionLoading === t.id}
                                                            title="Refund buyer"
                                                            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                                        >
                                                            <RotateCcw className="w-3 h-3" /> Refund
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {transactions.length === 0 && (
                            <div className="text-center py-8 text-gray-500 text-sm">No transactions found</div>
                        )}
                    </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {!loading && activeTab === 'notifications' && (
                    <div className="space-y-6">
                        {/* Send Broadcast Form */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Send className="w-4 h-4" /> Send Broadcast Notification
                            </h3>
                            <form onSubmit={handleSendNotification} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Notification title..."
                                    value={notifForm.title}
                                    onChange={(e) => setNotifForm(prev => ({ ...prev, title: e.target.value }))}
                                    className={inputClass}
                                    required
                                />
                                <textarea
                                    placeholder="Notification message..."
                                    value={notifForm.message}
                                    onChange={(e) => setNotifForm(prev => ({ ...prev, message: e.target.value }))}
                                    rows={3}
                                    className={inputClass}
                                    required
                                />
                                <div className="flex gap-3">
                                    <select
                                        value={notifForm.target_university}
                                        onChange={(e) => setNotifForm(prev => ({ ...prev, target_university: e.target.value }))}
                                        className={inputClass}
                                    >
                                        <option value="">All Universities</option>
                                        {universities.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={sendingNotif}
                                        className="px-6 py-2.5 bg-unicycle-green text-white rounded-lg text-sm font-medium hover:bg-unicycle-green/90 disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {sendingNotif ? 'Sending...' : 'Send Notification'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Sent Notifications List */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-medium text-gray-700 text-sm">Sent Notifications ({sentNotifications.length})</h3>
                            </div>
                            {sentNotifications.map(n => (
                                <div key={n.id} className="px-4 py-3 border-b border-gray-100 last:border-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                                            <p className="text-gray-600 text-sm mt-0.5">{n.message}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[10px] text-gray-400">{formatDate(n.created_at)}</span>
                                                {n.target_university && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{n.target_university}</span>
                                                )}
                                                {!n.target_university && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">All Universities</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {sentNotifications.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm">No notifications sent yet</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Announcements Tab */}
                {!loading && activeTab === 'announcements' && (
                    <div className="space-y-6">
                        {/* Create Announcement Form */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Megaphone className="w-4 h-4" /> Create Announcement
                            </h3>
                            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Announcement title..."
                                    value={announcementForm.title}
                                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                                    className={inputClass}
                                    required
                                />
                                <textarea
                                    placeholder="Announcement message..."
                                    value={announcementForm.message}
                                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                                    rows={3}
                                    className={inputClass}
                                    required
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Image URL (optional)"
                                        value={announcementForm.image_url}
                                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, image_url: e.target.value }))}
                                        className={inputClass}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Action button text (e.g. Boost Now)"
                                        value={announcementForm.action_text}
                                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, action_text: e.target.value }))}
                                        className={inputClass}
                                    />
                                    <select
                                        value={announcementForm.target_university}
                                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, target_university: e.target.value }))}
                                        className={inputClass}
                                    >
                                        <option value="">All Universities</option>
                                        {universities.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                    <input
                                        type="datetime-local"
                                        value={announcementForm.expires_at}
                                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, expires_at: e.target.value }))}
                                        className={inputClass}
                                        placeholder="Expires at (optional)"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={creatingAnnouncement}
                                    className="px-6 py-2.5 bg-unicycle-green text-white rounded-lg text-sm font-medium hover:bg-unicycle-green/90 disabled:opacity-50"
                                >
                                    {creatingAnnouncement ? 'Creating...' : 'Create Announcement'}
                                </button>
                            </form>
                        </div>

                        {/* Announcements List */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-medium text-gray-700 text-sm">All Announcements ({announcements.length})</h3>
                            </div>
                            {announcements.map(a => (
                                <div key={a.id} className="px-4 py-3 border-b border-gray-100 last:border-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-900 text-sm">{a.title}</p>
                                                {a.is_active ? (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">Active</span>
                                                ) : (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">Inactive</span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 text-sm mt-0.5 truncate">{a.message}</p>
                                            <div className="flex gap-2 mt-1 flex-wrap">
                                                <span className="text-[10px] text-gray-400">{formatDate(a.created_at)}</span>
                                                {a.target_university && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{a.target_university}</span>
                                                )}
                                                {a.action_text && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600">Button: {a.action_text}</span>
                                                )}
                                                {a.expires_at && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-600">Expires: {formatDate(a.expires_at)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleToggleAnnouncement(a.id)}
                                                title={a.is_active ? 'Deactivate' : 'Activate'}
                                                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                                            >
                                                {a.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAnnouncement(a.id)}
                                                title="Delete"
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {announcements.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm">No announcements created yet</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
