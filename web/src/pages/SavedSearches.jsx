import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Trash2, Search, ArrowLeft } from 'lucide-react';
import { getSavedSearches, deleteSavedSearch } from '../api/savedSearches';

function describeSearch(s) {
    const parts = [];
    if (s.query) parts.push(`"${s.query}"`);
    if (s.category) parts.push(s.category);
    if (s.condition) parts.push(s.condition);
    if (s.min_price != null && s.max_price != null) parts.push(`$${s.min_price}–$${s.max_price}`);
    else if (s.min_price != null) parts.push(`From $${s.min_price}`);
    else if (s.max_price != null) parts.push(`Up to $${s.max_price}`);
    if (s.university) parts.push(s.university);
    return parts.length > 0 ? parts.join(' · ') : 'All items';
}

function buildBrowseParams(s) {
    const params = new URLSearchParams();
    if (s.query) params.set('q', s.query);
    if (s.category) params.set('category', s.category);
    if (s.condition) params.set('condition', s.condition);
    if (s.min_price != null) params.set('min_price', s.min_price);
    if (s.max_price != null) params.set('max_price', s.max_price);
    return params.toString();
}

export default function SavedSearches() {
    const navigate = useNavigate();
    const [searches, setSearches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSavedSearches()
            .then(setSearches)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteSavedSearch(id);
            setSearches(prev => prev.filter(s => s.id !== id));
        } catch {}
    };

    const handleApply = (s) => {
        const qs = buildBrowseParams(s);
        navigate(`/browse${qs ? `?${qs}` : ''}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            <div className="max-w-2xl mx-auto px-4 py-6">
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Profile
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-6 h-6 text-unicycle-green" />
                    <h1 className="text-2xl font-bold text-gray-900">Saved Searches</h1>
                </div>

                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-unicycle-green" />
                    </div>
                )}

                {!loading && searches.length === 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-1">No saved searches yet</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            When you search and filter items, tap the bell icon to save your search.
                        </p>
                        <button
                            onClick={() => navigate('/browse')}
                            className="px-4 py-2 bg-unicycle-green text-white rounded-lg text-sm font-medium hover:bg-unicycle-green/90"
                        >
                            Browse Items
                        </button>
                    </div>
                )}

                {!loading && searches.length > 0 && (
                    <div className="space-y-3">
                        {searches.map(s => (
                            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{describeSearch(s)}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Saved {new Date(s.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleApply(s)}
                                        className="px-3 py-1.5 bg-unicycle-green text-white rounded-lg text-xs font-medium hover:bg-unicycle-green/90 transition-colors"
                                    >
                                        Apply
                                    </button>
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete saved search"
                                    >
                                        <Trash2 className="w-4 h-4" />
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
