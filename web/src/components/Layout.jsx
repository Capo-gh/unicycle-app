import { Search, ClipboardList, MessageCircle, User } from 'lucide-react';
import icon from '../assets/unicycle-icon.png';

export default function Layout({ currentPage, onNavigate, children }) {
    const navItems = [
        { id: 'listings', label: 'Browse', Icon: Search },
        { id: 'requests', label: 'Requests', Icon: ClipboardList },
        { id: 'sell', label: 'Sell', Icon: null, isPlus: true },
        { id: 'messages', label: 'Messages', Icon: MessageCircle, badge: true },
        { id: 'profile', label: 'Profile', Icon: User },
    ];

    // detail and chat are sub-pages of listings, so highlight Browse
    const getActiveNav = () => {
        if (currentPage === 'detail' || currentPage === 'chat') return 'listings';
        return currentPage;
    };
    const activeNav = getActiveNav();

    return (
        <div className="flex min-h-screen bg-gray-50">

            {/* ─── SIDEBAR (Desktop only: lg+ screens) ─── */}
            <aside className="hidden lg:flex lg:w-64 bg-white border-r border-gray-200 flex-col fixed h-full z-20">
                {/* Logo + Marketplace Switcher */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <img src={icon} alt="UniCycle" className="w-10 h-10 object-contain" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">UniCycle</h1>
                            <select
                                className="text-xs text-gray-500 bg-transparent border-none focus:outline-none cursor-pointer hover:text-unicycle-blue"
                                onChange={(e) => {
                                    if (e.target.value !== 'mcgill') {
                                        alert(`Switching to ${e.target.value} marketplace...`);
                                    }
                                }}
                            >
                                <option value="mcgill">McGill Marketplace</option>
                                <option value="concordia">Concordia Marketplace</option>
                                <option value="udem">UdeM Marketplace</option>
                                <option value="uqam">UQAM Marketplace</option>
                                <option value="ets">ÉTS Marketplace</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeNav === item.id
                                    ? 'bg-unicycle-green text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
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
                                {item.badge && activeNav !== item.id && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                                )}
                            </div>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ─── MAIN CONTENT ─── */}
            <main className="flex-1 lg:ml-64 min-h-screen pb-20 lg:pb-0">
                {children}
            </main>

            {/* ─── BOTTOM NAV (Mobile only: hidden on lg+) ─── */}
            <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 shadow-lg z-10">
                <div className="max-w-md mx-auto px-4 py-3 flex justify-around">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center gap-1 ${activeNav === item.id
                                    ? 'text-unicycle-green'
                                    : 'text-gray-400 hover:text-gray-600'
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
                                {item.badge && activeNav !== item.id && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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