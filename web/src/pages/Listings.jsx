import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, MapPin, Package, X } from 'lucide-react';
import { getListings } from '../api/listings';

export default function Listings({ onItemClick, onNavigate, currentMarketplace, onMarketplaceChange }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Advanced filters
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        condition: 'All',
        sort: 'newest'
    });

    // Track if any advanced filters are active
    const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.condition !== 'All' || filters.sort !== 'newest';

    const categories = [
        'All',
        'Textbooks & Course Materials',
        'Electronics & Gadgets',
        'Furniture & Decor',
        'Clothing & Accessories',
        'Sports & Fitness',
        'Kitchen & Dining',
        'School Supplies',
        'Bikes & Transportation',
        'Other'
    ];

    const conditions = ['All', 'New', 'Like New', 'Good', 'Fair'];

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' }
    ];

    useEffect(() => {
        fetchListings();
    }, [selectedCategory, currentMarketplace, filters]);

    // Debounce search
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

            if (currentMarketplace) {
                params.university = currentMarketplace;
            }

            // Advanced filters
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
                setError('Failed to load listings');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            minPrice: '',
            maxPrice: '',
            condition: 'All',
            sort: 'newest'
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const getFirstImage = (images) => {
        if (!images) return null;
        if (Array.isArray(images)) return images[0];
        const imageList = images.split(',');
        return imageList[0] || null;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Title Row */}
                    <div className="py-4">
                        <h1 className="text-xl font-bold text-gray-900">Browse Marketplace</h1>
                    </div>

                    {/* Search Bar */}
                    <div className="pb-4">
                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                                />
                            </div>
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
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                    ? 'bg-unicycle-green text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {category}
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
                            <h3 className="font-semibold text-gray-900">Filters</h3>
                            <div className="flex items-center gap-3">
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-unicycle-blue hover:underline"
                                    >
                                        Clear all
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price Range (CAD)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                                    />
                                    <span className="text-gray-400">—</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                                    />
                                </div>
                            </div>

                            {/* Condition */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Condition
                                </label>
                                <select
                                    value={filters.condition}
                                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green bg-white"
                                >
                                    {conditions.map(condition => (
                                        <option key={condition} value={condition}>{condition}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sort By
                                </label>
                                <select
                                    value={filters.sort}
                                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green bg-white"
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Apply Button (mobile) */}
                            <div className="flex items-end sm:hidden">
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="w-full py-2 bg-unicycle-green text-white rounded-lg font-medium"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Results count */}
                {!loading && !error && (
                    <p className="text-sm text-gray-600 mb-4">
                        {listings.length} item{listings.length !== 1 ? 's' : ''} found
                        {hasActiveFilters && <span className="text-unicycle-green ml-1">(filtered)</span>}
                    </p>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-unicycle-green"></div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={fetchListings}
                            className="mt-2 text-sm text-unicycle-blue hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && listings.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Package className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                        <p className="text-gray-500 mb-4">
                            {hasActiveFilters
                                ? 'Try adjusting your filters or search terms'
                                : currentMarketplace
                                    ? `Be the first to list an item in ${currentMarketplace}!`
                                    : 'Be the first to list an item!'
                            }
                        </p>
                        {hasActiveFilters ? (
                            <button
                                onClick={clearFilters}
                                className="text-unicycle-blue hover:underline"
                            >
                                Clear all filters
                            </button>
                        ) : (
                            <button
                                onClick={() => onNavigate('sell')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-unicycle-green text-white rounded-lg hover:bg-unicycle-green/90"
                            >
                                + Post an Item
                            </button>
                        )}
                    </div>
                )}

                {/* Listings Grid */}
                {!loading && !error && listings.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {listings.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onItemClick(item)}
                                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left"
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
                                                SOLD
                                            </span>
                                        </div>
                                    )}

                                    {/* Condition Badge */}
                                    {item.condition && !item.is_sold && (
                                        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium">
                                            {item.condition}
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h3 className="font-medium text-gray-900 text-sm truncate">{item.title}</h3>
                                    <p className="text-unicycle-green font-bold mt-1">{formatPrice(item.price)}</p>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">{item.safe_zone || item.safeZone || 'Campus'}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}