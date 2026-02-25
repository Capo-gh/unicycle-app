import { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, Bell, Shield, HelpCircle, Info, ChevronRight, Check, CheckCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { logout } from '../api/auth';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../api/notifications';

// ─── Notifications Sub-Page ───────────────────────────────────────────────────
function NotificationsPage({ onBack }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const load = async () => {
            try {
                const [notifs, countData] = await Promise.all([getNotifications(), getUnreadCount()]);
                setNotifications(notifs);
                setUnreadCount(countData.unread_count);
            } catch (err) {}
            setLoading(false);
        };
        load();
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {}
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {}
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `${diffHr}h ago`;
        const diffDay = Math.floor(diffHr / 24);
        if (diffDay < 7) return `${diffDay}d ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900 flex-1">Notifications</h1>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-sm text-unicycle-green hover:underline flex items-center gap-1">
                            <CheckCheck className="w-4 h-4" /> Mark all read
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-unicycle-green"></div>
                    </div>
                )}

                {!loading && notifications.length === 0 && (
                    <div className="text-center py-20">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No notifications yet</p>
                        <p className="text-sm text-gray-400 mt-1">Admins can send announcements to all users</p>
                    </div>
                )}

                {!loading && notifications.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                        {notifications.map(n => (
                            <div
                                key={n.id}
                                className={`px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50/40' : ''}`}
                                onClick={() => !n.is_read && handleMarkRead(n.id)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.is_read ? 'bg-unicycle-green' : 'bg-transparent'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                                        <p className="text-gray-600 text-sm mt-0.5">{n.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">{formatDate(n.created_at)}</p>
                                    </div>
                                    {!n.is_read && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                                            className="flex-shrink-0 p-1 text-gray-400 hover:text-unicycle-green transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Privacy & Safety Sub-Page ────────────────────────────────────────────────
function PrivacySafetyPage({ onBack }) {
    const tips = [
        { title: 'Meet at Safe Zones only', desc: 'All transactions should happen at designated campus Safe Zones, like library lobbies, student union buildings, and main building atria.' },
        { title: 'Inspect before you pay', desc: 'Always inspect the item in person before handing over any money. Test electronics, check for damage, and make sure the item matches the listing.' },
        { title: 'Bring a friend', desc: 'Whenever possible, bring a friend along for meetups. There is safety in numbers.' },
        { title: 'Use in-app messaging', desc: "Keep all communication within the UniCycle chat. Never share personal contact details (phone number, social media) with buyers or sellers you don't know." },
        { title: 'Trust your instincts', desc: 'If something feels off, like a deal that seems too good, pressure to meet somewhere unusual, or strange messages, trust your gut and cancel the transaction.' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Privacy & Safety</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* How we protect you */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="font-semibold text-gray-900">How UniCycle protects you</h2>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                            <span className="text-unicycle-green font-bold mt-0.5">✓</span>
                            <p><span className="font-medium text-gray-800">University email verification:</span> every account is verified with a real university email address. You only interact with fellow students.</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-unicycle-green font-bold mt-0.5">✓</span>
                            <p><span className="font-medium text-gray-800">Campus-only marketplace:</span> listings are only visible to students at the same university, keeping the community tight-knit and trustworthy.</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-unicycle-green font-bold mt-0.5">✓</span>
                            <p><span className="font-medium text-gray-800">Safe Zones:</span> every listing includes a designated Safe Zone meeting spot on campus, so you always know exactly where to meet.</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-unicycle-green font-bold mt-0.5">✓</span>
                            <p><span className="font-medium text-gray-800">Admin moderation:</span> our admin team can suspend accounts or remove listings that violate our community guidelines.</p>
                        </div>
                    </div>
                </div>

                {/* Safety tips */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-4">5 tips for safe transactions</h2>
                    <div className="space-y-4">
                        {tips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-unicycle-green text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm">{tip.title}</p>
                                    <p className="text-gray-500 text-sm mt-0.5">{tip.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Your data */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-3">Your data</h2>
                    <p className="text-sm text-gray-600 mb-3">UniCycle collects only what is necessary to run the marketplace: your name, university email, and the listings and messages you create. We do not sell your data to third parties.</p>
                    <p className="text-sm text-gray-600">To request deletion of your account and data, email us at <span className="text-unicycle-blue font-medium">support@unicycle.ca</span>.</p>
                </div>

                {/* Report */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-amber-800 mb-1">Report a problem</p>
                    <p className="text-sm text-amber-700">If you encounter a suspicious listing or user, email <span className="font-medium">support@unicycle.ca</span> with the listing ID or username. Our team responds within 24 hours.</p>
                </div>
            </div>
        </div>
    );
}

// ─── Help & Support Sub-Page ─────────────────────────────────────────────────
function HelpSupportPage({ onBack }) {
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            q: 'How do I create a listing?',
            a: 'Tap the "Sell" tab in the navigation bar. Fill in the title, category, condition, price, description, photos, and select a Safe Zone. Hit "Post Item" and your listing goes live immediately.'
        },
        {
            q: 'How do I message a seller?',
            a: "Open any listing and tap the \"Message Seller\" button. This opens a private chat with the seller inside the Messages tab. You can also tap \"I'm Interested\" to express interest without sending a message."
        },
        {
            q: 'What are Safe Zones?',
            a: 'Safe Zones are designated public locations on campus (library lobbies, student union buildings, etc.) where buyers and sellers agree to meet. All listings must include a Safe Zone, which keeps transactions safe and predictable.'
        },
        {
            q: 'How do I mark my item as sold?',
            a: 'Go to Profile → My Listings. Tap the "Mark Sold" button on the listing. The item will show a SOLD badge and be hidden from the active marketplace. You can mark it as available again anytime.'
        },
        {
            q: 'Can I edit my listing after posting?',
            a: 'Yes! Go to Profile → My Listings and tap "Edit" on any listing. You can change the title, price, description, photos, condition, category, and Safe Zone.'
        },
        {
            q: "Why can't I see listings from other universities?",
            a: 'UniCycle is a campus-specific marketplace. Use the marketplace picker (top of the Browse page on web, or the university selector on mobile) to switch between universities you have access to.'
        },
        {
            q: 'How do I delete a listing?',
            a: "Go to Profile → My Listings, then tap the trash icon on the listing you want to remove. You'll be asked to confirm before it's permanently deleted."
        },
        {
            q: "I didn't receive my verification email. What do I do?",
            a: "Check your spam/junk folder first. Make sure you used your university email address. If the email still isn't there, try signing up again and a new verification link will be sent. Contact support@unicycle.ca if the problem persists."
        },
        {
            q: 'Is UniCycle available on mobile?',
            a: 'Yes! The UniCycle mobile app is available for iOS and Android. Search "UniCycle" in the App Store or Google Play, or ask your university rep for a download link.'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Help & Support</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Quick tip */}
                <div className="bg-unicycle-green/10 border border-unicycle-green/20 rounded-lg p-4">
                    <p className="text-sm text-gray-700">Have a question not answered here? Email us at <span className="font-medium text-unicycle-green">support@unicycle.ca</span>. We typically respond within one business day.</p>
                </div>

                {/* FAQ */}
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                    <div className="px-4 py-3">
                        <h2 className="font-semibold text-gray-900">Frequently Asked Questions</h2>
                    </div>
                    {faqs.map((faq, i) => (
                        <div key={i}>
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-medium text-gray-800 text-sm pr-4">{faq.q}</span>
                                {openFaq === i
                                    ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                }
                            </button>
                            {openFaq === i && (
                                <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Contact */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-3">Contact Support</h2>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 w-20">Email</span>
                            <span className="text-unicycle-blue">support@unicycle.ca</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 w-20">Hours</span>
                            <span>Mon – Fri, 9 AM – 5 PM ET</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 w-20">Response</span>
                            <span>Within 1 business day</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── About UniCycle Sub-Page ─────────────────────────────────────────────────
function AboutPage({ onBack }) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">About UniCycle</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Logo + version */}
                <div className="bg-white rounded-lg p-8 shadow-sm text-center">
                    <div className="w-16 h-16 bg-unicycle-green rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl font-black">U</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">UniCycle</h2>
                    <p className="text-sm text-gray-500">Version 1.0.0</p>
                    <p className="text-xs text-gray-400 mt-1">The campus marketplace for Canadian university students</p>
                </div>

                {/* Mission */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-3">Our mission</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        UniCycle was built to make student life a little easier and a lot more sustainable. Moving into residence? Graduating and clearing out? UniCycle connects students within the same campus so items get a second life instead of ending up in the trash.
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed mt-3">
                        Every transaction stays on campus. Verified student emails, university-specific marketplaces, and Safe Zone meetups keep the community trustworthy and the process simple.
                    </p>
                </div>

                {/* Key features */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-4">What UniCycle offers</h2>
                    <div className="space-y-3">
                        {[
                            { icon: '🎓', title: 'University-verified accounts', desc: 'Every user is verified with a real campus email.' },
                            { icon: '🏫', title: 'Campus-specific marketplaces', desc: 'Browse listings from your own university only, with no noise from across the country.' },
                            { icon: '📍', title: 'Safe Zone meetups', desc: 'Every listing has a designated on-campus meeting spot.' },
                            { icon: '💬', title: 'In-app messaging', desc: 'Chat with buyers and sellers without sharing personal contact info.' },
                            { icon: '📱', title: 'Web + mobile', desc: 'Available as a web app and native iOS/Android app.' },
                        ].map((feature, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className="text-xl">{feature.icon}</span>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm">{feature.title}</p>
                                    <p className="text-gray-500 text-sm">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Universities */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-3">Supported universities</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        {[
                            'McGill University',
                            'Concordia University',
                            'Université de Montréal (UdeM)',
                            'Université du Québec à Montréal (UQAM)',
                            'Polytechnique Montréal',
                            'École de technologie supérieure (ÉTS)',
                            'Université Laval',
                            'Université de Sherbrooke',
                        ].map((uni, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="text-unicycle-green">✓</span>
                                <span>{uni}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-3">Get in touch</h2>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex gap-2">
                            <span className="font-medium text-gray-700 w-20">Support</span>
                            <span className="text-unicycle-blue">support@unicycle.ca</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-medium text-gray-700 w-20">Feedback</span>
                            <span className="text-unicycle-blue">hello@unicycle.ca</span>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 pb-4">Made with love for Canadian students</p>
            </div>
        </div>
    );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function Settings({ user, onBack, onLogout }) {
    const [subPage, setSubPage] = useState(null);

    const handleLogout = () => {
        logout();
        onLogout();
    };

    if (subPage === 'notifications') return <NotificationsPage onBack={() => setSubPage(null)} />;
    if (subPage === 'privacy') return <PrivacySafetyPage onBack={() => setSubPage(null)} />;
    if (subPage === 'help') return <HelpSupportPage onBack={() => setSubPage(null)} />;
    if (subPage === 'about') return <AboutPage onBack={() => setSubPage(null)} />;

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
                    <h1 className="text-lg font-semibold text-unicycle-green">Settings</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Account Info */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-4">Account Information</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm text-gray-500">Name</label>
                            <p className="text-gray-900 font-medium">{user?.name}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Email</label>
                            <p className="text-gray-900 font-medium">{user?.email}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">University</label>
                            <p className="text-gray-900 font-medium">{user?.university}</p>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                    <button
                        onClick={() => setSubPage('notifications')}
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">Notifications</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>

                    <button
                        onClick={() => setSubPage('privacy')}
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">Privacy & Safety</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Support */}
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                    <button
                        onClick={() => setSubPage('help')}
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <HelpCircle className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">Help & Support</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>

                    <button
                        onClick={() => setSubPage('about')}
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Info className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">About UniCycle</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">v1.0.0</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                    </button>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    Log Out
                </button>
            </div>
        </div>
    );
}
