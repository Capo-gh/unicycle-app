import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, LogOut, Bell, Shield, HelpCircle, Info, ChevronRight, Check, CheckCheck, ChevronDown, ChevronUp, Languages, Camera, Moon, Gift, Lock, Copy, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import imageCompression from 'browser-image-compression';
import { updateProfile, getBlockedUsers, toggleBlockUser } from '../api/users';
import { uploadImage } from '../api/upload';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../api/notifications';
import { getReferralInfo, changePassword } from '../api/auth';
import LanguageToggle from '../components/LanguageToggle';

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

// ─── Referral Sub-Page ───────────────────────────────────────────────────────
function ReferralPage({ onBack }) {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        getReferralInfo().then(setInfo).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const frontendUrl = window.location.origin;
    const referralLink = info?.referral_code ? `${frontendUrl}/signup?ref=${info.referral_code}` : '';

    const handleCopy = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Invite Friends</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                <div className="bg-unicycle-green/10 border border-unicycle-green/20 rounded-lg p-5 text-center">
                    <Gift className="w-10 h-10 text-unicycle-green mx-auto mb-2" />
                    <h2 className="font-bold text-gray-900 text-lg mb-1">Invite classmates, earn free boosts</h2>
                    <p className="text-sm text-gray-600">For every friend who signs up with your link and completes their account, you get <span className="font-semibold text-unicycle-green">1 free listing boost</span> (worth $2).</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-unicycle-green" /></div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="bg-white rounded-lg shadow-sm p-4 flex divide-x divide-gray-100">
                            <div className="flex-1 text-center">
                                <p className="text-2xl font-bold text-unicycle-green">{info?.referred_count ?? 0}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Friends invited</p>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-2xl font-bold text-unicycle-green">{info?.boost_credits ?? 0}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Boost credits left</p>
                            </div>
                        </div>

                        {/* Referral link */}
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Your invite link</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 truncate">
                                    {referralLink}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-unicycle-green text-white hover:bg-unicycle-green/90'}`}
                                >
                                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 text-center">Credits are awarded once your friend completes their account setup.</p>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Change Password Sub-Page ─────────────────────────────────────────────────
function ChangePasswordPage({ onBack }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
        if (newPassword !== confirmPassword) { setError('New passwords do not match.'); return; }
        setLoading(true);
        try {
            await changePassword(currentPassword, newPassword);
            setSuccess(true);
        } catch (err) {
            setError(err?.response?.data?.detail || 'Failed to change password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Change Password</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">
                {success ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                        <p className="font-semibold text-green-800">Password changed successfully!</p>
                        <button onClick={onBack} className="mt-4 text-sm text-unicycle-green hover:underline">Go back</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                                placeholder="Enter current password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                                placeholder="Min. 6 characters"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                                placeholder="Re-enter new password"
                            />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-unicycle-green text-white rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving…' : 'Change Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

// ─── Blocked Users Sub-Page ──────────────────────────────────────────────────
function BlockedUsersPage({ onBack }) {
    const [blocked, setBlocked] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unblocking, setUnblocking] = useState(null);

    useEffect(() => {
        getBlockedUsers().then(setBlocked).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const handleUnblock = async (userId, name) => {
        setUnblocking(userId);
        try {
            await toggleBlockUser(userId);
            setBlocked(prev => prev.filter(u => u.id !== userId));
        } catch {
            alert(`Failed to unblock ${name}`);
        } finally {
            setUnblocking(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Blocked Users</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-unicycle-green" /></div>
                ) : blocked.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                        <p className="text-gray-500">You haven't blocked anyone.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                        {blocked.map(u => (
                            <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-unicycle-blue to-unicycle-green flex items-center justify-center text-white font-semibold flex-shrink-0">
                                    {u.avatar_url
                                        ? <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                                        : u.name?.charAt(0)
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm truncate">{u.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{u.university}</p>
                                </div>
                                <button
                                    onClick={() => handleUnblock(u.id, u.name)}
                                    disabled={unblocking === u.id}
                                    className="text-sm text-unicycle-green hover:underline disabled:opacity-50 flex-shrink-0"
                                >
                                    {unblocking === u.id ? '...' : 'Unblock'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function Settings() {
    const navigate = useNavigate();
    const { user, logout: storeLogout, setUser } = useAuthStore();
    const [subPage, setSubPage] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState(null);
    const avatarInputRef = useRef(null);
    const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

    const toggleDarkMode = () => {
        const next = !darkMode;
        setDarkMode(next);
        if (next) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', '1');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.removeItem('darkMode');
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        setAvatarError(null);
        try {
            let fileToUpload = file;
            if (file.size > 500 * 1024) {
                fileToUpload = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 512, useWebWorker: true });
            }
            const url = await uploadImage(fileToUpload);
            await updateProfile({ avatar_url: url });
            setAvatarUrl(url);
            setUser({ ...user, avatar_url: url });
        } catch (err) {
            setAvatarError(err?.response?.data?.detail || 'Failed to upload photo. Please try again.');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleLogout = () => {
        storeLogout();
        navigate('/signup', { replace: true, state: { mode: 'login' } });
    };

    if (subPage === 'notifications') return <NotificationsPage onBack={() => setSubPage(null)} />;
    if (subPage === 'privacy') return <PrivacySafetyPage onBack={() => setSubPage(null)} />;
    if (subPage === 'help') return <HelpSupportPage onBack={() => setSubPage(null)} />;
    if (subPage === 'about') return <AboutPage onBack={() => setSubPage(null)} />;
    if (subPage === 'referral') return <ReferralPage onBack={() => setSubPage(null)} />;
    if (subPage === 'changePassword') return <ChangePasswordPage onBack={() => setSubPage(null)} />;
    if (subPage === 'blocked') return <BlockedUsersPage onBack={() => setSubPage(null)} />;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
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

                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                        <div
                            className="relative flex-shrink-0 cursor-pointer"
                            onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
                        >
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-unicycle-blue to-unicycle-green flex items-center justify-center text-white font-bold text-2xl">
                                {avatarUrl
                                    ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    : (user?.name?.charAt(0) || '?')
                                }
                            </div>
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow border border-gray-200">
                                {uploadingAvatar
                                    ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-unicycle-green" />
                                    : <Camera className="w-3 h-3 text-gray-600" />
                                }
                            </div>
                            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} onClick={(e) => { e.currentTarget.value = null; }} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-gray-700">Tap your photo to change it</p>
                            {avatarError && <p className="text-xs text-red-500">{avatarError}</p>}
                        </div>
                    </div>

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

                    <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Languages className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">Language</span>
                        </div>
                        <LanguageToggle />
                    </div>

                    <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Moon className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">Dark mode</span>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-unicycle-green' : 'bg-gray-200'}`}
                            aria-label="Toggle dark mode"
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

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

                    <button
                        onClick={() => setSubPage('changePassword')}
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Lock className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">Change Password</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>

                    <button
                        onClick={() => setSubPage('blocked')}
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">Blocked Users</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>

                    <button
                        onClick={() => setSubPage('referral')}
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Gift className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">Invite Friends</span>
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
