import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../api/notifications';

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const data = await getUnreadCount();
            setUnreadCount(data.unread_count);
        } catch (err) {}
    };

    const handleOpen = async () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setLoading(true);
            try {
                const data = await getNotifications();
                setNotifications(data);
            } catch (err) {}
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
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
        <div className="relative" ref={panelRef}>
            <button
                onClick={handleOpen}
                className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[400px] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-unicycle-green hover:underline flex items-center gap-1"
                            >
                                <CheckCheck className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1">
                        {loading && (
                            <div className="flex justify-center py-6">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-unicycle-green"></div>
                            </div>
                        )}

                        {!loading && notifications.length === 0 && (
                            <div className="py-8 text-center text-gray-400 text-sm">No notifications yet</div>
                        )}

                        {!loading && notifications.map(n => (
                            <div
                                key={n.id}
                                className={`px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                                    !n.is_read ? 'bg-blue-50/50' : ''
                                }`}
                                onClick={() => !n.is_read && handleMarkRead(n.id)}
                            >
                                <div className="flex items-start gap-2">
                                    {!n.is_read && (
                                        <span className="mt-1.5 w-2 h-2 rounded-full bg-unicycle-green flex-shrink-0"></span>
                                    )}
                                    <div className={!n.is_read ? '' : 'ml-4'}>
                                        <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                        <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">{formatDate(n.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
