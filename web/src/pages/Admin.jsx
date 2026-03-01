import { useState, useEffect } from 'react';
import { parseImages } from '../utils/images';
import {
    Users, Package, ArrowLeftRight, BarChart3, Search, Shield, ShieldOff, Ban, CheckCircle,
    Trash2, Eye, EyeOff, Bell, Megaphone, Send, Star, DollarSign, RotateCcw,
    Flag, Mail, Activity, Download, X, TrendingUp, Building2, Settings, UserPlus
} from 'lucide-react';
import {
    getAdminStats, getAdminStatsHistory,
    getAdminUsers, toggleUserAdmin, toggleUserSuspend, emailUser, setSponsor,
    getAdminListings, toggleListingActive, adminDeleteListing,
    getAdminTransactions, getUniversities, resolveDispute,
    getAdminReports, dismissReport, actionReport,
    getAdminReviews, adminDeleteReview,
    getAdminLogs, getSettings, updateSetting, createBusinessUser
} from '../api/admin';
import { sendBroadcast, getAdminNotifications } from '../api/notifications';
import { createAnnouncement, getAdminAnnouncements, toggleAnnouncement, deleteAnnouncement } from '../api/announcements';

const TABS = [
    { id: 'stats', label: 'Stats', Icon: BarChart3 },
    { id: 'users', label: 'Users', Icon: Users },
    { id: 'listings', label: 'Listings', Icon: Package },
    { id: 'transactions', label: 'Transactions', Icon: ArrowLeftRight },
    { id: 'reports', label: 'Reports', Icon: Flag },
    { id: 'reviews', label: 'Reviews', Icon: Star },
    { id: 'notifications', label: 'Notifications', Icon: Bell },
    { id: 'announcements', label: 'Announcements', Icon: Megaphone },
    { id: 'logs', label: 'Audit Log', Icon: Activity },
    { id: 'settings', label: 'Settings', Icon: Settings },
];

export default function Admin() {
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [statsHistory, setStatsHistory] = useState([]);
    const [users, setUsers] = useState([]);
    const [listings, setListings] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [reports, setReports] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [logs, setLogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    // University filter
    const [universities, setUniversities] = useState([]);
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [txUniversity, setTxUniversity] = useState('');

    // Reports filter
    const [reportStatusFilter, setReportStatusFilter] = useState('pending');

    // Listing preview modal
    const [previewListing, setPreviewListing] = useState(null);
    const [previewImageIdx, setPreviewImageIdx] = useState(0);

    // Email user modal
    const [emailModal, setEmailModal] = useState(null); // { userId, userName }
    const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
    const [sendingEmail, setSendingEmail] = useState(false);

    // Sponsor modal
    const [sponsorModal, setSponsorModal] = useState(null); // { userId, userName, isSponsor, currentCategory }
    const [sponsorCategory, setSponsorCategory] = useState('');
    const [settingSponsor, setSettingSponsor] = useState(false);

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

    // System settings
    const [systemSettings, setSystemSettings] = useState({});
    const [savingSetting, setSavingSetting] = useState(null);

    // Create business user modal
    const [businessModal, setBusinessModal] = useState(false);
    const [businessForm, setBusinessForm] = useState({ name: '', email: '', password: '', university: '' });
    const [creatingBusiness, setCreatingBusiness] = useState(false);

    useEffect(() => {
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            setIsSuperAdmin(userData.is_super_admin === true);
        } catch {}
        getUniversities().then(setUniversities).catch(() => {});
        getSettings().then(setSystemSettings).catch(() => {});
    }, []);

    useEffect(() => {
        loadTabData();
    }, [activeTab, selectedUniversity, txUniversity, reportStatusFilter]);

    const loadTabData = async () => {
        setLoading(true);
        setSearchQuery('');
        try {
            switch (activeTab) {
                case 'stats':
                    const [s, h] = await Promise.all([getAdminStats(), getAdminStatsHistory()]);
                    setStats(s);
                    setStatsHistory(h);
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
                case 'reports':
                    setReports(await getAdminReports(reportStatusFilter));
                    break;
                case 'reviews':
                    setReviews(await getAdminReviews(''));
                    break;
                case 'notifications':
                    setSentNotifications(await getAdminNotifications());
                    break;
                case 'announcements':
                    setAnnouncements(await getAdminAnnouncements());
                    break;
                case 'logs':
                    setLogs(await getAdminLogs());
                    break;
                case 'settings':
                    setSystemSettings(await getSettings());
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
            if (activeTab === 'users') setUsers(await getAdminUsers(searchQuery, selectedUniversity));
            else if (activeTab === 'listings') setListings(await getAdminListings(searchQuery, selectedUniversity));
            else if (activeTab === 'reviews') setReviews(await getAdminReviews(searchQuery));
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    // ── User actions ────────────────────────────────────────────────────────
    const handleToggleAdmin = async (userId, userName, currentlyAdmin) => {
        const action = currentlyAdmin ? 'remove admin access from' : 'grant admin access to';
        if (!confirm(`Are you sure you want to ${action} ${userName}?`)) return;
        setActionLoading(userId);
        try {
            await toggleUserAdmin(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !u.is_admin } : u));
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to toggle admin');
        } finally { setActionLoading(null); }
    };

    const handleToggleSuspend = async (userId) => {
        setActionLoading(userId);
        try {
            await toggleUserSuspend(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_suspended: !u.is_suspended } : u));
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to toggle suspend');
        } finally { setActionLoading(null); }
    };

    const handleSetSponsor = async (e) => {
        e.preventDefault();
        setSettingSponsor(true);
        try {
            await setSponsor(sponsorModal.userId, true, sponsorCategory);
            setUsers(prev => prev.map(u => u.id === sponsorModal.userId
                ? { ...u, is_sponsor: true, sponsored_category: sponsorCategory } : u));
            setSponsorModal(null);
        } catch { alert('Failed to set sponsor'); }
        finally { setSettingSponsor(false); }
    };

    const handleRemoveSponsor = async (userId) => {
        try {
            await setSponsor(userId, false, null);
            setUsers(prev => prev.map(u => u.id === userId
                ? { ...u, is_sponsor: false, sponsored_category: null } : u));
            setSponsorModal(null);
        } catch { alert('Failed to remove sponsor'); }
    };

    const handleToggleSetting = async (key, currentValue) => {
        const newValue = currentValue === 'true' ? 'false' : 'true';
        setSavingSetting(key);
        try {
            await updateSetting(key, newValue);
            setSystemSettings(prev => ({ ...prev, [key]: newValue }));
        } catch { alert('Failed to update setting'); }
        finally { setSavingSetting(null); }
    };

    const handleCreateBusiness = async (e) => {
        e.preventDefault();
        if (!businessForm.name || !businessForm.email || !businessForm.password) return;
        setCreatingBusiness(true);
        try {
            await createBusinessUser(businessForm.name, businessForm.email, businessForm.password, businessForm.university || 'Business');
            setBusinessModal(false);
            setBusinessForm({ name: '', email: '', password: '', university: '' });
            alert(`Business account created! They can log in immediately with the password you set.`);
            setUsers(await getAdminUsers('', selectedUniversity));
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to create business account');
        } finally { setCreatingBusiness(false); }
    };

    const handleEmailUser = async (e) => {
        e.preventDefault();
        if (!emailForm.subject.trim() || !emailForm.message.trim()) return;
        setSendingEmail(true);
        try {
            await emailUser(emailModal.userId, emailForm.subject, emailForm.message);
            setEmailModal(null);
            setEmailForm({ subject: '', message: '' });
            alert('Email sent!');
        } catch {
            alert('Failed to send email');
        } finally { setSendingEmail(false); }
    };

    // ── Listing actions ─────────────────────────────────────────────────────
    const handleToggleListingActive = async (listingId) => {
        setActionLoading(listingId);
        try {
            await toggleListingActive(listingId);
            setListings(prev => prev.map(l => l.id === listingId ? { ...l, is_active: !l.is_active } : l));
        } catch { alert('Failed to toggle listing'); }
        finally { setActionLoading(null); }
    };

    const handleDeleteListing = async (listingId) => {
        if (!confirm('Delete this listing permanently?')) return;
        setActionLoading(listingId);
        try {
            await adminDeleteListing(listingId);
            setListings(prev => prev.filter(l => l.id !== listingId));
            if (previewListing?.id === listingId) setPreviewListing(null);
        } catch { alert('Failed to delete listing'); }
        finally { setActionLoading(null); }
    };

    // ── Transaction actions ─────────────────────────────────────────────────
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
        } finally { setActionLoading(null); }
    };

    // ── Report actions ──────────────────────────────────────────────────────
    const handleDismissReport = async (reportId) => {
        setActionLoading(reportId);
        try {
            await dismissReport(reportId);
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r));
        } catch { alert('Failed to dismiss report'); }
        finally { setActionLoading(null); }
    };

    const handleActionReport = async (reportId) => {
        setActionLoading(reportId);
        try {
            await actionReport(reportId);
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'actioned' } : r));
        } catch { alert('Failed to update report'); }
        finally { setActionLoading(null); }
    };

    // ── Review actions ──────────────────────────────────────────────────────
    const handleDeleteReview = async (reviewId) => {
        if (!confirm('Delete this review permanently?')) return;
        setActionLoading(reviewId);
        try {
            await adminDeleteReview(reviewId);
            setReviews(prev => prev.filter(r => r.id !== reviewId));
        } catch { alert('Failed to delete review'); }
        finally { setActionLoading(null); }
    };

    // ── Notification actions ────────────────────────────────────────────────
    const handleSendNotification = async (e) => {
        e.preventDefault();
        if (!notifForm.title.trim() || !notifForm.message.trim()) return;
        setSendingNotif(true);
        try {
            await sendBroadcast({ title: notifForm.title, message: notifForm.message, target_university: notifForm.target_university || null });
            setNotifForm({ title: '', message: '', target_university: '' });
            setSentNotifications(await getAdminNotifications());
            alert('Notification sent!');
        } catch { alert('Failed to send notification'); }
        finally { setSendingNotif(false); }
    };

    // ── Announcement actions ────────────────────────────────────────────────
    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        if (!announcementForm.title.trim() || !announcementForm.message.trim()) return;
        setCreatingAnnouncement(true);
        try {
            await createAnnouncement({
                title: announcementForm.title, message: announcementForm.message,
                image_url: announcementForm.image_url || null, action_text: announcementForm.action_text || null,
                action_type: announcementForm.action_type || null, target_university: announcementForm.target_university || null,
                expires_at: announcementForm.expires_at || null
            });
            setAnnouncementForm({ title: '', message: '', image_url: '', action_text: '', action_type: '', target_university: '', expires_at: '' });
            setAnnouncements(await getAdminAnnouncements());
            alert('Announcement created!');
        } catch { alert('Failed to create announcement'); }
        finally { setCreatingAnnouncement(false); }
    };

    const handleToggleAnnouncement = async (id) => {
        try {
            await toggleAnnouncement(id);
            setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a));
        } catch { alert('Failed to toggle announcement'); }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!confirm('Delete this announcement?')) return;
        try {
            await deleteAnnouncement(id);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch { alert('Failed to delete announcement'); }
    };

    // ── CSV Export ──────────────────────────────────────────────────────────
    const exportCSV = (data, filename, columns) => {
        const header = columns.map(c => c.label).join(',');
        const rows = data.map(row =>
            columns.map(c => {
                const val = row[c.key] ?? '';
                return `"${String(val).replace(/"/g, '""')}"`;
            }).join(',')
        );
        const csv = [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    };

    // ── Helpers ─────────────────────────────────────────────────────────────
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const statusColor = (s) => {
        switch (s) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'agreed': return 'bg-blue-100 text-blue-700';
            case 'interested': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'disputed': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const reportStatusColor = (s) => {
        switch (s) {
            case 'pending': return 'bg-orange-100 text-orange-700';
            case 'dismissed': return 'bg-gray-100 text-gray-500';
            case 'actioned': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const actionLabel = (action) => action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const inputClass = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green";

    const UniversityFilter = ({ value, onChange }) => (
        <select value={value} onChange={e => onChange(e.target.value)}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green">
            <option value="">All Universities</option>
            {universities.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
    );

    // Bar chart helper (pure CSS, no library)
    const maxVal = (arr, key) => Math.max(...arr.map(w => w[key] || 0), 1);

    const MiniBar = ({ value, max, color }) => (
        <div className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-gray-100 rounded-t" style={{ height: 48 }}>
                <div
                    className={`${color} rounded-t transition-all`}
                    style={{ height: `${Math.round((value / max) * 48)}px`, marginTop: `${48 - Math.round((value / max) * 48)}px` }}
                />
            </div>
            <span className="text-[10px] font-semibold text-gray-700">{value}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                    {isSuperAdmin && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium flex items-center gap-1">
                            <Star className="w-3 h-3" /> Super Admin
                        </span>
                    )}
                    {stats?.pending_reports > 0 && (
                        <button onClick={() => setActiveTab('reports')}
                            className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium flex items-center gap-1">
                            <Flag className="w-3 h-3" /> {stats.pending_reports} pending report{stats.pending_reports !== 1 ? 's' : ''}
                        </button>
                    )}
                </div>
                <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === tab.id ? 'border-unicycle-green text-unicycle-green' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}>
                            <tab.Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-unicycle-green" />
                    </div>
                )}

                {/* ── STATS ── */}
                {!loading && activeTab === 'stats' && stats && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { label: 'Total Users', value: stats.total_users, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Total Listings', value: stats.total_listings, color: 'text-purple-600', bg: 'bg-purple-50' },
                                { label: 'Active Listings', value: stats.active_listings, color: 'text-green-600', bg: 'bg-green-50' },
                                { label: 'Total Transactions', value: stats.total_transactions, color: 'text-orange-600', bg: 'bg-orange-50' },
                                { label: 'Completed', value: stats.completed_transactions, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { label: 'Est. Revenue', value: `$${stats.estimated_revenue}`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                            ].map(s => (
                                <div key={s.label} className={`${s.bg} rounded-xl p-5 border`}>
                                    <p className="text-sm text-gray-600 mb-1">{s.label}</p>
                                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Growth charts */}
                        {statsHistory.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {[
                                    { key: 'users', label: 'New Users / Week', color: 'bg-blue-400' },
                                    { key: 'listings', label: 'New Listings / Week', color: 'bg-purple-400' },
                                    { key: 'transactions', label: 'Transactions / Week', color: 'bg-orange-400' },
                                ].map(chart => (
                                    <div key={chart.key} className="bg-white rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <TrendingUp className="w-4 h-4 text-gray-400" />
                                            <h3 className="text-sm font-semibold text-gray-700">{chart.label}</h3>
                                        </div>
                                        <div className="flex gap-1 items-end">
                                            {statsHistory.map((w, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                    <MiniBar value={w[chart.key]} max={maxVal(statsHistory, chart.key)} color={chart.color} />
                                                    <span className="text-[9px] text-gray-400 truncate w-full text-center">{w.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── USERS ── */}
                {!loading && activeTab === 'users' && (
                    <div>
                        <div className="mb-4 flex gap-2 flex-wrap items-center">
                            <UniversityFilter value={selectedUniversity} onChange={setSelectedUniversity} />
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" placeholder="Search by name, email, or university..."
                                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green" />
                            </div>
                            <button onClick={handleSearch} className="px-4 py-2.5 bg-unicycle-green text-white rounded-lg text-sm font-medium hover:bg-unicycle-green/90">Search</button>
                            <button onClick={() => exportCSV(users, 'users.csv', [
                                { label: 'Name', key: 'name' }, { label: 'Email', key: 'email' },
                                { label: 'University', key: 'university' }, { label: 'Listings', key: 'listing_count' },
                                { label: 'Verified', key: 'is_verified' }, { label: 'Suspended', key: 'is_suspended' },
                                { label: 'Joined', key: 'created_at' }
                            ])} className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600" title="Export CSV">
                                <Download className="w-4 h-4" />
                            </button>
                            {isSuperAdmin && (
                                <button onClick={() => setBusinessModal(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                                    <UserPlus className="w-4 h-4" />
                                    Add Business
                                </button>
                            )}
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">University</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Listings</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Rating</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                                            <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                                                <td className="px-4 py-3 text-gray-600 text-xs">{u.email}</td>
                                                <td className="px-4 py-3 text-gray-600 text-xs">{u.university}</td>
                                                <td className="px-4 py-3 text-gray-700 font-medium">{u.listing_count}</td>
                                                <td className="px-4 py-3 text-gray-600 text-xs">
                                                    {u.review_count > 0 ? `★ ${(u.avg_rating || 0).toFixed(1)} (${u.review_count})` : '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {u.is_verified && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">Verified</span>}
                                                        {u.is_super_admin && <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium">Super</span>}
                                                        {u.is_admin && !u.is_super_admin && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">Admin</span>}
                                                        {u.is_suspended && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">Suspended</span>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(u.created_at)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => { setEmailModal({ userId: u.id, userName: u.name }); setEmailForm({ subject: '', message: '' }); }}
                                                            title="Email user" className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                                            <Mail className="w-4 h-4" />
                                                        </button>
                                                        {isSuperAdmin && !u.is_super_admin && (
                                                            <button onClick={() => handleToggleAdmin(u.id, u.name, u.is_admin)}
                                                                disabled={actionLoading === u.id} title={u.is_admin ? 'Remove admin' : 'Make admin'}
                                                                className={`p-1.5 rounded-lg transition-colors ${u.is_admin ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                                                                {u.is_admin ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleToggleSuspend(u.id)}
                                                            disabled={actionLoading === u.id} title={u.is_suspended ? 'Unsuspend' : 'Suspend'}
                                                            className={`p-1.5 rounded-lg transition-colors ${u.is_suspended ? 'text-red-600 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                                                            {u.is_suspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                        </button>
                                                        {isSuperAdmin && (
                                                            <button
                                                                onClick={() => { setSponsorModal({ userId: u.id, userName: u.name, isSponsor: u.is_sponsor, currentCategory: u.sponsored_category }); setSponsorCategory(u.sponsored_category || ''); }}
                                                                title={u.is_sponsor ? `Sponsor: ${u.sponsored_category}` : 'Set as category sponsor'}
                                                                className={`p-1.5 rounded-lg transition-colors ${u.is_sponsor ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                                                                <Building2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {users.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No users found</div>}
                        </div>
                    </div>
                )}

                {/* ── LISTINGS ── */}
                {!loading && activeTab === 'listings' && (
                    <div>
                        <div className="mb-4 flex gap-2 flex-wrap items-center">
                            <UniversityFilter value={selectedUniversity} onChange={setSelectedUniversity} />
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" placeholder="Search by title or category..."
                                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green" />
                            </div>
                            <button onClick={handleSearch} className="px-4 py-2.5 bg-unicycle-green text-white rounded-lg text-sm font-medium hover:bg-unicycle-green/90">Search</button>
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
                                                <td className="px-4 py-3 max-w-[200px]">
                                                    <button onClick={() => { setPreviewListing(l); setPreviewImageIdx(0); }}
                                                        className="font-medium text-unicycle-green hover:underline text-left truncate block w-full">
                                                        {l.title}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 text-xs">{l.seller_name}</td>
                                                <td className="px-4 py-3 text-gray-900 font-medium">${l.price}</td>
                                                <td className="px-4 py-3 text-gray-600 text-xs">{l.category}</td>
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
                                                        <button onClick={() => handleToggleListingActive(l.id)} disabled={actionLoading === l.id}
                                                            title={l.is_active ? 'Deactivate' : 'Activate'}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                                                            {l.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                        <button onClick={() => handleDeleteListing(l.id)} disabled={actionLoading === l.id}
                                                            title="Delete" className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {listings.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No listings found</div>}
                        </div>
                    </div>
                )}

                {/* ── TRANSACTIONS ── */}
                {!loading && activeTab === 'transactions' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <UniversityFilter value={txUniversity} onChange={setTxUniversity} />
                            <span className="text-sm text-gray-500">{transactions.length} transactions</span>
                            <button onClick={() => exportCSV(transactions, 'transactions.csv', [
                                { label: 'Buyer', key: 'buyer_name' }, { label: 'Seller', key: 'seller_name' },
                                { label: 'Item', key: 'listing_title' }, { label: 'Price', key: 'listing_price' },
                                { label: 'Status', key: 'status' }, { label: 'Payment', key: 'payment_method' },
                                { label: 'Payment Status', key: 'payment_status' }, { label: 'Date', key: 'created_at' }
                            ])} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 ml-auto" title="Export CSV">
                                <Download className="w-4 h-4" />
                            </button>
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
                                                <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate text-xs">{t.listing_title}</td>
                                                <td className="px-4 py-3 text-gray-900 font-medium">${t.listing_price}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${statusColor(t.status)}`}>{t.status}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {t.payment_status && (
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${
                                                            t.payment_status === 'disputed' ? 'bg-orange-100 text-orange-700' :
                                                            t.payment_status === 'captured' ? 'bg-green-100 text-green-700' :
                                                            t.payment_status === 'held' ? 'bg-blue-100 text-blue-700' :
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
                                                            <button onClick={() => handleResolveDispute(t.id, 'release')} disabled={actionLoading === t.id}
                                                                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50">
                                                                <DollarSign className="w-3 h-3" /> Release
                                                            </button>
                                                            <button onClick={() => handleResolveDispute(t.id, 'refund')} disabled={actionLoading === t.id}
                                                                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50">
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
                            {transactions.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No transactions found</div>}
                        </div>
                    </div>
                )}

                {/* ── REPORTS ── */}
                {!loading && activeTab === 'reports' && (
                    <div className="space-y-4">
                        <div className="flex gap-2 flex-wrap items-center">
                            {['pending', 'dismissed', 'actioned', ''].map(s => (
                                <button key={s} onClick={() => setReportStatusFilter(s)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                                        reportStatusFilter === s ? 'bg-unicycle-green text-white border-unicycle-green' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}>
                                    {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                            <span className="text-sm text-gray-500">{reports.length} report{reports.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="space-y-3">
                            {reports.map(r => (
                                <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-900 text-sm">{r.reportee_name}</span>
                                                <span className="text-[10px] text-gray-400">{r.reportee_email}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${reportStatusColor(r.status)}`}>{r.status}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 font-medium">Reason: <span className="font-normal text-gray-600">{r.reason}</span></p>
                                            {r.details && <p className="text-sm text-gray-500 mt-0.5">{r.details}</p>}
                                            <p className="text-xs text-gray-400 mt-1">
                                                Reported by <span className="text-gray-600">{r.reporter_name}</span> · {formatDate(r.created_at)}
                                            </p>
                                        </div>
                                        {r.status === 'pending' && (
                                            <div className="flex flex-col gap-1.5">
                                                <button onClick={() => handleActionReport(r.id)} disabled={actionLoading === r.id}
                                                    className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium disabled:opacity-50 whitespace-nowrap">
                                                    Take Action
                                                </button>
                                                <button onClick={() => handleDismissReport(r.id)} disabled={actionLoading === r.id}
                                                    className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50">
                                                    Dismiss
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {reports.length === 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 py-12 text-center text-gray-500 text-sm">
                                    No {reportStatusFilter} reports
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── REVIEWS ── */}
                {!loading && activeTab === 'reviews' && (
                    <div>
                        <div className="mb-4 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" placeholder="Search by reviewer name..."
                                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green" />
                            </div>
                            <button onClick={handleSearch} className="px-4 py-2.5 bg-unicycle-green text-white rounded-lg text-sm font-medium hover:bg-unicycle-green/90">Search</button>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Reviewer</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Reviewed</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Rating</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Review</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                                            <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reviews.map(r => (
                                            <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-900 font-medium">{r.reviewer_name}</td>
                                                <td className="px-4 py-3 text-gray-600">{r.reviewed_user_name}</td>
                                                <td className="px-4 py-3">
                                                    <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate text-xs">{r.text || '-'}</td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(r.created_at)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end">
                                                        <button onClick={() => handleDeleteReview(r.id)} disabled={actionLoading === r.id}
                                                            title="Delete review" className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {reviews.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No reviews found</div>}
                        </div>
                    </div>
                )}

                {/* ── NOTIFICATIONS ── */}
                {!loading && activeTab === 'notifications' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Send className="w-4 h-4" /> Send Broadcast Notification
                            </h3>
                            <form onSubmit={handleSendNotification} className="space-y-3">
                                <input type="text" placeholder="Notification title..." value={notifForm.title}
                                    onChange={e => setNotifForm(p => ({ ...p, title: e.target.value }))} className={inputClass} required />
                                <textarea placeholder="Notification message..." value={notifForm.message}
                                    onChange={e => setNotifForm(p => ({ ...p, message: e.target.value }))} rows={3} className={inputClass} required />
                                <div className="flex gap-3">
                                    <select value={notifForm.target_university} onChange={e => setNotifForm(p => ({ ...p, target_university: e.target.value }))} className={inputClass}>
                                        <option value="">All Universities</option>
                                        {universities.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                    <button type="submit" disabled={sendingNotif}
                                        className="px-6 py-2.5 bg-unicycle-green text-white rounded-lg text-sm font-medium hover:bg-unicycle-green/90 disabled:opacity-50 whitespace-nowrap">
                                        {sendingNotif ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-medium text-gray-700 text-sm">Sent ({sentNotifications.length})</h3>
                            </div>
                            {sentNotifications.map(n => (
                                <div key={n.id} className="px-4 py-3 border-b border-gray-100 last:border-0">
                                    <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                                    <p className="text-gray-600 text-sm mt-0.5">{n.message}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[10px] text-gray-400">{formatDate(n.created_at)}</span>
                                        {n.target_university
                                            ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{n.target_university}</span>
                                            : <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">All Universities</span>
                                        }
                                    </div>
                                </div>
                            ))}
                            {sentNotifications.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No notifications sent yet</div>}
                        </div>
                    </div>
                )}

                {/* ── ANNOUNCEMENTS ── */}
                {!loading && activeTab === 'announcements' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Megaphone className="w-4 h-4" /> Create Announcement
                            </h3>
                            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                                <input type="text" placeholder="Announcement title..." value={announcementForm.title}
                                    onChange={e => setAnnouncementForm(p => ({ ...p, title: e.target.value }))} className={inputClass} required />
                                <textarea placeholder="Announcement message..." value={announcementForm.message}
                                    onChange={e => setAnnouncementForm(p => ({ ...p, message: e.target.value }))} rows={3} className={inputClass} required />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input type="text" placeholder="Image URL (optional)" value={announcementForm.image_url}
                                        onChange={e => setAnnouncementForm(p => ({ ...p, image_url: e.target.value }))} className={inputClass} />
                                    <input type="text" placeholder="Action button text (e.g. Boost Now)" value={announcementForm.action_text}
                                        onChange={e => setAnnouncementForm(p => ({ ...p, action_text: e.target.value }))} className={inputClass} />
                                    <select value={announcementForm.target_university} onChange={e => setAnnouncementForm(p => ({ ...p, target_university: e.target.value }))} className={inputClass}>
                                        <option value="">All Universities</option>
                                        {universities.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                    <input type="datetime-local" value={announcementForm.expires_at}
                                        onChange={e => setAnnouncementForm(p => ({ ...p, expires_at: e.target.value }))} className={inputClass} />
                                </div>
                                <button type="submit" disabled={creatingAnnouncement}
                                    className="px-6 py-2.5 bg-unicycle-green text-white rounded-lg text-sm font-medium hover:bg-unicycle-green/90 disabled:opacity-50">
                                    {creatingAnnouncement ? 'Creating...' : 'Create Announcement'}
                                </button>
                            </form>
                        </div>
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
                                                {a.is_active
                                                    ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">Active</span>
                                                    : <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">Inactive</span>
                                                }
                                            </div>
                                            <p className="text-gray-600 text-sm mt-0.5 truncate">{a.message}</p>
                                            <div className="flex gap-2 mt-1 flex-wrap">
                                                <span className="text-[10px] text-gray-400">{formatDate(a.created_at)}</span>
                                                {a.target_university && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{a.target_university}</span>}
                                                {a.action_text && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600">Button: {a.action_text}</span>}
                                                {a.expires_at && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-600">Expires: {formatDate(a.expires_at)}</span>}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleToggleAnnouncement(a.id)} title={a.is_active ? 'Deactivate' : 'Activate'}
                                                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                                                {a.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => handleDeleteAnnouncement(a.id)} title="Delete"
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {announcements.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No announcements created yet</div>}
                        </div>
                    </div>
                )}

                {/* ── AUDIT LOG ── */}
                {!loading && activeTab === 'logs' && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                            <h3 className="font-medium text-gray-700 text-sm">Admin Audit Log ({logs.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Admin</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Target</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Details</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map(l => (
                                        <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{l.admin_name}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                                    l.action.includes('delete') || l.action.includes('suspend') ? 'bg-red-100 text-red-700' :
                                                    l.action.includes('unsuspend') ? 'bg-green-100 text-green-700' :
                                                    l.action.includes('email') ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {actionLabel(l.action)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 text-xs">
                                                {l.target_type && `${l.target_type} #${l.target_id}`}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 text-xs max-w-[200px] truncate">{l.details || '-'}</td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(l.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {logs.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No admin actions recorded yet</div>}
                    </div>
                )}

                {/* ── SETTINGS ── */}
                {!loading && activeTab === 'settings' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-1">Sponsored Listings</h3>
                            <p className="text-sm text-gray-500 mb-4">Control how sponsored business listings behave in the marketplace.</p>
                            <div className="flex items-center justify-between py-4 border-b border-gray-100">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Pin sponsored listings in "All" view</p>
                                    <p className="text-xs text-gray-500 mt-0.5">When enabled, sponsored business listings float to the top even when browsing all categories. When off, they only pin within their specific category.</p>
                                </div>
                                <button
                                    onClick={() => isSuperAdmin && handleToggleSetting('sponsored_pins_in_all', systemSettings.sponsored_pins_in_all)}
                                    disabled={savingSetting === 'sponsored_pins_in_all' || !isSuperAdmin}
                                    title={!isSuperAdmin ? 'Super admin only' : ''}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-6 ${
                                        systemSettings.sponsored_pins_in_all === 'true' ? 'bg-amber-500' : 'bg-gray-300'
                                    } ${!isSuperAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                        systemSettings.sponsored_pins_in_all === 'true' ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                        </div>
                        {!isSuperAdmin && (
                            <p className="text-xs text-gray-400 text-center">Settings can only be changed by the super admin.</p>
                        )}
                    </div>
                )}
            </div>

            {/* ── LISTING PREVIEW MODAL ── */}
            {previewListing && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreviewListing(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {/* Images */}
                        {(() => { const imgs = parseImages(previewListing.images); return imgs.length > 0 && (
                            <div className="relative">
                                <img src={imgs[previewImageIdx]} alt="" className="w-full h-56 object-cover rounded-t-2xl" />
                                {imgs.length > 1 && (
                                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                                        {imgs.map((_, i) => (
                                            <button key={i} onClick={() => setPreviewImageIdx(i)}
                                                className={`w-2 h-2 rounded-full ${i === previewImageIdx ? 'bg-white' : 'bg-white/50'}`} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ); })()}
                        <div className="p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{previewListing.title}</h2>
                                    <p className="text-xl font-bold text-unicycle-green">${previewListing.price}</p>
                                </div>
                                <button onClick={() => setPreviewListing(null)} className="p-1.5 rounded-full hover:bg-gray-100">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="flex gap-2 mb-3 flex-wrap">
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{previewListing.category}</span>
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{previewListing.condition}</span>
                                {previewListing.is_sold && <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">Sold</span>}
                                {!previewListing.is_active && !previewListing.is_sold && <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-500">Inactive</span>}
                            </div>
                            <p className="text-sm text-gray-700 mb-4 leading-relaxed">{previewListing.description}</p>
                            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                    By <span className="font-medium text-gray-700">{previewListing.seller_name}</span>
                                    <span className="ml-1 text-gray-400">· {formatDate(previewListing.created_at)}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleToggleListingActive(previewListing.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                        {previewListing.is_active ? <><EyeOff className="w-3.5 h-3.5" /> Deactivate</> : <><Eye className="w-3.5 h-3.5" /> Activate</>}
                                    </button>
                                    <button onClick={() => handleDeleteListing(previewListing.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SPONSOR MODAL ── */}
            {sponsorModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSponsorModal(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-amber-500" />
                                Sponsor: {sponsorModal.userName}
                            </h2>
                            <button onClick={() => setSponsorModal(null)} className="p-1.5 rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        {sponsorModal.isSponsor && (
                            <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-3">
                                Currently sponsoring: <strong>{sponsorModal.currentCategory}</strong>
                            </p>
                        )}
                        <form onSubmit={handleSetSponsor} className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Sponsored Category</label>
                                <select value={sponsorCategory} onChange={e => setSponsorCategory(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green" required>
                                    <option value="">Select category...</option>
                                    {['Textbooks & Course Materials','Electronics & Gadgets','Furniture & Decor',
                                      'Clothing & Accessories','Sports & Fitness','Kitchen & Dining',
                                      'School Supplies','Bikes & Transportation','Other'].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                {sponsorModal.isSponsor && (
                                    <button type="button" onClick={() => handleRemoveSponsor(sponsorModal.userId)}
                                        className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">
                                        Remove Sponsor
                                    </button>
                                )}
                                <button type="submit" disabled={settingSponsor}
                                    className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50">
                                    {settingSponsor ? 'Saving...' : sponsorModal.isSponsor ? 'Update' : 'Set Sponsor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── CREATE BUSINESS USER MODAL ── */}
            {businessModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setBusinessModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Create Business Account</h2>
                            <button onClick={() => setBusinessModal(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Creates a pre-verified account for a local business. They can log in immediately and you can then set them as a sponsor.</p>
                        <form onSubmit={handleCreateBusiness} className="space-y-3">
                            <input type="text" placeholder="Business name" value={businessForm.name}
                                onChange={e => setBusinessForm(p => ({ ...p, name: e.target.value }))} className={inputClass} required />
                            <input type="email" placeholder="Business email" value={businessForm.email}
                                onChange={e => setBusinessForm(p => ({ ...p, email: e.target.value }))} className={inputClass} required />
                            <input type="password" placeholder="Temporary password" value={businessForm.password}
                                onChange={e => setBusinessForm(p => ({ ...p, password: e.target.value }))} className={inputClass} required minLength={6} />
                            <select value={businessForm.university} onChange={e => setBusinessForm(p => ({ ...p, university: e.target.value }))} className={inputClass}>
                                <option value="">Which campus do they serve? (optional)</option>
                                {universities.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <button type="submit" disabled={creatingBusiness}
                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                                {creatingBusiness ? 'Creating…' : 'Create Account'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── EMAIL USER MODAL ── */}
            {emailModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEmailModal(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Email {emailModal.userName}</h2>
                            <button onClick={() => setEmailModal(null)} className="p-1.5 rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleEmailUser} className="space-y-3">
                            <input type="text" placeholder="Subject" value={emailForm.subject}
                                onChange={e => setEmailForm(p => ({ ...p, subject: e.target.value }))} className={inputClass} required />
                            <textarea placeholder="Message..." value={emailForm.message}
                                onChange={e => setEmailForm(p => ({ ...p, message: e.target.value }))} rows={5} className={inputClass} required />
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setEmailModal(null)}
                                    className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={sendingEmail}
                                    className="px-4 py-2 text-sm bg-unicycle-green text-white rounded-lg hover:bg-unicycle-green/90 disabled:opacity-50 flex items-center gap-2">
                                    <Send className="w-4 h-4" /> {sendingEmail ? 'Sending...' : 'Send Email'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
