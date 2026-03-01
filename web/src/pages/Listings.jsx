import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Package, X, Heart, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMarketplaceStore } from '../store/marketplaceStore';
import { getListings } from '../api/listings';
import { getSavedIds, toggleSave } from '../api/saved';
import { saveSearch } from '../api/savedSearches';

export default function Listings() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { currentMarketplace } = useMarketplaceStore();

    const userUniversity = user?.university || '';
    const isOwnSchool = !currentMarketplace || currentMarketplace === userUniversity;

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [savedIds, setSavedIds] = useState(new Set());

    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        condition: 'All',
        sort: 'newest'
    });

    const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.condition !== 'All' || filters.sort !== 'newest';
    const hasSearchToSave = searchQuery || selectedCategory !== 'All' || hasActiveFilters;

    const [searchSaved, setSearchSaved] = useState(false);

    const handleSaveSearch = async () => {
        try {
            await saveSearch({
                query: searchQuery || null,
                category: selectedCategory !== 'All' ? selectedCategory : null,
                min_price: filters.minPrice ? parseFloat(filters.minPrice) : null,
                max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
                condition: filters.condition !== 'All' ? filters.condition : null,
                university: currentMarketplace !== 'all' ? currentMarketplace : null,
            });
            setSearchSaved(true);
            setTimeout(() => setSearchSaved(false), 3000);
        } catch { /* ignore */ }
    };

    // Category definitions: value (sent to API, always English) + translation key
    const categories = [
        { value: 'All',                          key: 'listings.categories.all' },
        { value: 'Free',                         key: 'listings.categories.free' },
        { value: 'Textbooks & Course Materials', key: 'listings.categories.textbooks' },
        { value: 'Electronics & Gadgets',        key: 'listings.categories.electronics' },
        { value: 'Furniture & Decor',            key: 'listings.categories.furniture' },
        { value: 'Clothing & Accessories',       key: 'listings.categories.clothing' },
        { value: 'Sports & Fitness',             key: 'listings.categories.sports' },
        { value: 'Kitchen & Dining',             key: 'listings.categories.kitchen' },
        { value: 'School Supplies',              key: 'listings.categories.school' },
        { value: 'Bikes & Transportation',       key: 'listings.categories.bikes' },
        { value: 'Other',                        key: 'listings.categories.other' },
    ];

    // Condition definitions: value (sent to API) + translation key
    const conditions = [
        { value: 'All',      key: 'listings.conditions.all' },
        { value: 'New',      key: 'listings.conditions.new' },
        { value: 'Like New', key: 'listings.conditions.likeNew' },
        { value: 'Good',     key: 'listings.conditions.good' },
        { value: 'Fair',     key: 'listings.conditions.fair' },
    ];

    const sortOptions = [
        { value: 'newest',     labelKey: 'listings.newest' },
        { value: 'oldest',     labelKey: 'listings.oldest' },
        { value: 'price_asc',  labelKey: 'listings.priceLow' },
        { value: 'price_desc', labelKey: 'listings.priceHigh' },
    ];

    useEffect(() => {
        fetchListings();
    }, [selectedCategory, currentMarketplace, filters]);

    useEffect(() => {
        getSavedIds().then(ids => setSavedIds(new Set(ids))).catch(() => {});
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchListings();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchListings = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};

            if (selectedCategory !== 'All') {
                params.category = selectedCategory;
            }

            if (searchQuery) {
                params.search = searchQuery;
            }

            if (currentMarketplace && currentMarketplace !== 'all') {
                params.university = currentMarketplace;
            }

            if (filters.minPrice) {
                params.min_price = parseFloat(filters.minPrice);
            }
            if (filters.maxPrice) {
                params.max_price = parseFloat(filters.maxPrice);
            }
            if (filters.condition !== 'All') {
                params.condition = filters.condition;
            }
            if (filters.sort !== 'newest') {
                params.sort = filters.sort;
            }

            const data = await getListings(params);
            setListings(data);
        } catch (err) {
            console.error('Error fetching listings:', err);
            if (err.response?.status === 403) {
                setError('Please verify your email to browse listings. Check your inbox for the verification link!');
            } else {
                setError(t('listings.loadError'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ minPrice: '', maxPrice: '', condition: 'All', sort: 'newest' });
    };

    const formatPrice = (price) => `$${price}`;

    const getFirstImage = (images) => {
        if (!images) return null;
        if (Array.isArray(images)) return images[0];
        const imageList = images.split(',');
        return imageList[0] || null;
    };

    const handleToggleSave = async (listingId) => {
        try {
            const result = await toggleSave(listingId);
            setSavedIds(prev => {
                const next = new Set(prev);
                if (result.saved) next.add(listingId);
                else next.delete(listingId);
                return next;
            });
        } catch { /* not logged in or other error — silently ignore */ }
    };

    // Get translated label for a condition value (for the card badge)
    const getConditionLabel = (conditionValue) => {
        const found = conditions.find(c => c.value === conditionValue);
        return found ? t(found.key) : conditionValue;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="py-4">
                        <h1 className="text-xl font-bold text-unicycle-green">{t('listings.browseMarketplace')}</h1>
                    </div>

                    {/* Search Bar */}
                    <div className="pb-4">
                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder={t('listings.searchItems')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                                />
                            </div>
                            {hasSearchToSave && (
                                <button
                                    onClick={handleSaveSearch}
                                    title="Save this search"
                                    className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    <Bell className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2.5 rounded-lg border transition-colors relative ${showFilters || hasActiveFilters
                                    ? 'bg-unicycle-green text-white border-unicycle-green'
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                                {hasActiveFilters && !showFilters && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Category Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.value
                                    ? 'bg-unicycle-green text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {t(cat.key)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white border-b border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">{t('listings.filters')}</h3>
                            <div className="flex items-center gap-3">
                                {hasActiveFilters && (
                                    <button onClick={clearFilters} className="text-sm text-unicycle-blue hover:underline">
                                        {t('listings.clearAll')}
                                    </button>
                                )}
                                <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('listings.priceRange')}
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder={t('listings.minPrice')}
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                                    />
                                    <span className="text-gray-400">to</span>
                                    <input
                                        type="number"
                                        placeholder={t('listings.maxPrice')}
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                                    />
                                </div>
                            </div>

                            {/* Condition */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('listings.condition')}
                                </label>
                                <select
                                    value={filters.condition}
                                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green bg-white"
                                >
                                    {conditions.map(c => (
                                        <option key={c.value} value={c.value}>{t(c.key)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('listings.sortBy')}
                                </label>
                                <select
                                    value={filters.sort}
                                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green bg-white"
                                >
                                    {sortOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Apply Button (mobile) */}
                            <div className="flex items-end sm:hidden">
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="w-full py-2 bg-unicycle-green text-white rounded-lg font-medium"
                                >
                                    {t('listings.applyFilters')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Results count — only shown when searching or filtering */}
                {!loading && !error && (searchQuery || hasActiveFilters) && (
                    <p className="text-sm text-gray-600 mb-4">
                        {listings.length} {listings.length !== 1 ? t('listings.items') : t('listings.item')} {t('listings.found')}
                        {hasActiveFilters && <span className="text-unicycle-green ml-1">{t('common.filtered')}</span>}
                    </p>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-unicycle-green"></div>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-600">{error}</p>
                        <button onClick={fetchListings} className="mt-2 text-sm text-unicycle-blue hover:underline">
                            {t('common.tryAgain')}
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && listings.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Package className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('listings.noItemsFound')}</h3>
                        <p className="text-gray-500 mb-4">
                            {hasActiveFilters
                                ? t('listings.adjustFilters')
                                : currentMarketplace
                                    ? t('listings.beFirstIn', { university: currentMarketplace })
                                    : t('listings.beFirst')
                            }
                        </p>
                        {hasActiveFilters ? (
                            <button onClick={clearFilters} className="text-unicycle-blue hover:underline">
                                {t('listings.clearAllFilters')}
                            </button>
                        ) : isOwnSchool ? (
                            <button
                                onClick={() => navigate('/sell')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-unicycle-green text-white rounded-lg hover:bg-unicycle-green/90"
                            >
                                {t('listings.postItem')}
                            </button>
                        ) : null}
                    </div>
                )}

                {/* Listings Grid */}
                {!loading && !error && listings.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {listings.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <button
                                    onClick={() => navigate(`/item/${item.id}`, { state: { item } })}
                                    className="w-full text-left"
                                >
                                    <div className="aspect-square relative bg-gray-100">
                                        {getFirstImage(item.images) ? (
                                            <img
                                                src={getFirstImage(item.images)}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <span className="text-4xl">📦</span>
                                            </div>
                                        )}

                                        {/* Sold Badge */}
                                        {item.is_sold && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                    {t('itemDetail.soldBadge')}
                                                </span>
                                            </div>
                                        )}

                                        {/* Sponsored Badge */}
                                        {item.seller?.is_sponsor && item.seller?.sponsored_category === item.category && (
                                            <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                                                Sponsored
                                            </div>
                                        )}

                                        {/* Condition Badge */}
                                        {item.condition && !item.is_sold && (
                                            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium">
                                                {getConditionLabel(item.condition)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-medium text-gray-900 text-sm truncate">{item.title}</h3>
                                        <p className="text-unicycle-green font-bold mt-1">
                                            {item.price === 0 ? 'Free' : formatPrice(item.price)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 truncate">{item.category || 'Other'}</p>
                                    </div>
                                </button>
                                {/* Heart button */}
                                <div className="px-3 pb-3 -mt-2 flex justify-end">
                                    <button
                                        onClick={() => handleToggleSave(item.id)}
                                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                        aria-label={savedIds.has(item.id) ? 'Remove from saved' : 'Save item'}
                                    >
                                        <Heart className={`w-4 h-4 ${savedIds.has(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Save Search Toast */}
            {searchSaved && (
                <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
                    <Bell className="w-4 h-4 text-unicycle-green" />
                    Search saved! We'll notify you when new listings match.
                </div>
            )}
        </div>
    );
}
