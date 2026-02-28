import { useState, useEffect } from 'react';
import { Heart, Package } from 'lucide-react';
import { getSaved, toggleSave } from '../api/saved';

export default function Saved({ onItemClick, onNavigate }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedIds, setSavedIds] = useState(new Set());

    useEffect(() => {
        fetchSaved();
    }, []);

    const fetchSaved = async () => {
        setLoading(true);
        try {
            const data = await getSaved();
            setListings(data);
            setSavedIds(new Set(data.map(l => l.id)));
        } catch {
            setListings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSave = async (listingId) => {
        try {
            const result = await toggleSave(listingId);
            if (!result.saved) {
                setListings(prev => prev.filter(l => l.id !== listingId));
                setSavedIds(prev => { const n = new Set(prev); n.delete(listingId); return n; });
            }
        } catch { /* ignore */ }
    };

    const getFirstImage = (images) => {
        if (!images) return null;
        if (Array.isArray(images)) return images[0];
        return images.split(',')[0] || null;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-unicycle-green" />
                    <h1 className="text-xl font-bold text-unicycle-green">Saved Items</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-unicycle-green"></div>
                    </div>
                )}

                {!loading && listings.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Heart className="w-16 h-16 text-gray-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nothing saved yet</h3>
                        <p className="text-gray-500 mb-5">Tap the heart on any listing to save it here.</p>
                        {onNavigate && (
                            <button
                                onClick={() => onNavigate('listings')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-unicycle-green text-white rounded-lg hover:bg-unicycle-green/90 text-sm font-medium"
                            >
                                Browse listings
                            </button>
                        )}
                    </div>
                )}

                {!loading && listings.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {listings.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <button onClick={() => onItemClick(item)} className="w-full text-left">
                                    <div className="aspect-square relative bg-gray-100">
                                        {getFirstImage(item.images) ? (
                                            <img
                                                src={getFirstImage(item.images)}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-10 h-10 text-gray-300" />
                                            </div>
                                        )}
                                        {item.is_sold && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">Sold</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-medium text-gray-900 text-sm truncate">{item.title}</h3>
                                        <p className="text-unicycle-green font-bold mt-1">
                                            {item.price === 0 ? 'Free' : `$${item.price}`}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 truncate">{item.category || 'Other'}</p>
                                    </div>
                                </button>
                                <div className="px-3 pb-3 -mt-2 flex justify-end">
                                    <button
                                        onClick={() => handleToggleSave(item.id)}
                                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                        aria-label="Remove from saved"
                                    >
                                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
