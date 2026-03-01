import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Search, Megaphone, MessageCircle, User, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useMarketplaceStore } from '../store/marketplaceStore';
import icon from '../assets/unicycle-icon.png';
import MarketplacePicker from './MarketplacePicker';
import NotificationBell from './NotificationBell';
import LanguageToggle from './LanguageToggle';
import AnnouncementModal from './AnnouncementModal';
import { getUnreadCount } from '../api/messages';

export default function Layout() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const { currentMarketplace, setCurrentMarketplace } = useMarketplaceStore();
    const [unreadMessages, setUnreadMessages] = useState(0);

    const isAdmin = user?.is_admin === true;

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const data = await getUnreadCount();
                setUnreadMessages(data.unread_count || 0);
            } catch {}
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    // Reset unread count when user navigates to messages
    useEffect(() => {
        if (location.pathname === '/messages') {
            setUnreadMessages(0);
        }
    }, [location.pathname]);

    const navItems = [
        { id: 'listings', path: '/browse', label: t('nav.browse'), Icon: Search },
        { id: 'requests', path: '/requests', label: t('nav.requests'), Icon: Megaphone },
        { id: 'sell', path: '/sell', label: t('nav.sell'), Icon: null, isPlus: true },
        { id: 'messages', path: '/messages', label: t('nav.messages'), Icon: MessageCircle },
        { id: 'profile', path: '/profile', label: t('nav.profile'), Icon: User },
        ...(isAdmin ? [{ id: 'admin', path: '/admin', label: t('nav.admin'), Icon: Shield }] : []),
    ];

    const getActiveNav = () => {
        const { pathname } = location;
        if (pathname === '/browse' || pathname.startsWith('/item/')) return 'listings';
        if (pathname === '/requests') return 'requests';
        if (pathname === '/sell') return 'sell';
        if (pathname === '/messages') return 'messages';
        if (pathname === '/profile' || pathname === '/settings' || pathname === '/my-listings' || pathname === '/saved') return 'profile';
        if (pathname === '/admin') return 'admin';
        return 'listings';
    };
    const activeNav = getActiveNav();

    const isOnListings = location.pathname === '/browse';

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <AnnouncementModal />

            {/* ─── SIDEBAR (Desktop only) ─── */}
            <aside className="hidden lg:flex lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col fixed h-full z-20">
                {/* Logo + Marketplace Picker */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                        <button onClick={() => navigate('/browse')} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                            <img src={icon} alt="UniCycle" className="w-10 h-10 object-contain flex-shrink-0" />
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white min-w-0">UniCycle</h1>
                        </button>
                        <NotificationBell />
                    </div>
                    <div className="flex items-center gap-2">
                        {isOnListings && (
                            <div className="flex-1 min-w-0">
                                <MarketplacePicker currentMarketplace={currentMarketplace} onMarketplaceChange={setCurrentMarketplace} />
                            </div>
                        )}
                        <LanguageToggle />
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeNav === item.id
                                ? 'bg-unicycle-green text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className="relative">
                                {item.isPlus ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                ) : (
                                    <item.Icon className="w-5 h-5" />
                                )}
                                {item.id === 'messages' && unreadMessages > 0 && activeNav !== 'messages' && (
                                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-0.5">
                                        {unreadMessages > 9 ? '9+' : unreadMessages}
                                    </span>
                                )}
                            </div>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Mobile Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-14 px-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
                    <button onClick={() => navigate('/browse')} className="hover:opacity-80 transition-opacity flex-shrink-0">
                        <img src={icon} alt="UniCycle" className="w-8 h-8 object-contain" />
                    </button>
                    {isOnListings && (
                        <MarketplacePicker currentMarketplace={currentMarketplace} onMarketplaceChange={setCurrentMarketplace} compact />
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <LanguageToggle />
                    <NotificationBell />
                </div>
            </div>

            {/* ─── CONTENT COLUMN ─── */}
            <div className="flex-1 lg:ml-64 min-w-0">
                <main className="pb-20 lg:pb-0 min-w-0">
                    <div className="h-14 lg:hidden" />
                    <Outlet />
                </main>
            </div>

            {/* ─── BOTTOM NAV (Mobile only) ─── */}
            <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-10">
                <div className="max-w-md mx-auto px-4 py-3 flex justify-around">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center gap-1 ${activeNav === item.id
                                ? 'text-unicycle-green'
                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            <div className="relative">
                                {item.isPlus ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                ) : (
                                    <item.Icon className="w-6 h-6" />
                                )}
                                {item.id === 'messages' && unreadMessages > 0 && activeNav !== 'messages' && (
                                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-0.5">
                                        {unreadMessages > 9 ? '9+' : unreadMessages}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}
