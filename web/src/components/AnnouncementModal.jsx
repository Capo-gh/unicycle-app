import { useState, useEffect } from 'react';
import { X, Megaphone } from 'lucide-react';
import { getActiveAnnouncement, dismissAnnouncement } from '../api/announcements';

export default function AnnouncementModal() {
    const [announcement, setAnnouncement] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        fetchAnnouncement();
    }, []);

    const fetchAnnouncement = async () => {
        try {
            const data = await getActiveAnnouncement();
            if (data && data.id) {
                setAnnouncement(data);
                setVisible(true);
            }
        } catch (err) {}
    };

    const handleDismiss = async () => {
        if (announcement) {
            try {
                await dismissAnnouncement(announcement.id);
            } catch (err) {}
        }
        setVisible(false);
    };

    if (!visible || !announcement) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fadeIn">
                {/* Image */}
                {announcement.image_url && (
                    <img
                        src={announcement.image_url}
                        alt=""
                        className="w-full h-48 object-cover"
                    />
                )}

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-unicycle-green/10 flex items-center justify-center flex-shrink-0">
                                <Megaphone className="w-4 h-4 text-unicycle-green" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">{announcement.title}</h3>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-gray-600 mt-3 text-sm leading-relaxed">{announcement.message}</p>

                    <div className="mt-5 flex gap-3">
                        {announcement.action_text && (
                            <button
                                onClick={handleDismiss}
                                className="flex-1 py-2.5 bg-unicycle-green text-white rounded-lg font-medium text-sm hover:bg-unicycle-green/90 transition-colors"
                            >
                                {announcement.action_text}
                            </button>
                        )}
                        <button
                            onClick={handleDismiss}
                            className={`${announcement.action_text ? '' : 'flex-1'} py-2.5 px-4 border border-gray-200 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors`}
                        >
                            {announcement.action_text ? 'Not Now' : 'Got It'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
