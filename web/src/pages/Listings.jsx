import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { getListings } from '../api/listings';

export default function Browse({ onSelectItem, selectedMarketplace }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
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
    }, [selectedCategory, searchQuery, selectedMarketplace, filters]);

    const fetchListings = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                category: selectedCategory !== 'All' ? selectedCategory : undefined,
                search: searchQuery || undefined,
                university: selectedMarketplace || undefined,
                min_price: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
                max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
                condition: filters.condition !== 'All' ? filters.condition : undefined,
                sort: filters.sort !== 'newest' ? filters.sort : undefined
            };
            const data = await getListings(params);
            setListings(data);
        } catch (err) {
            console.error('Error fetching listings:', err);
            setError('Failed to load listings');
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

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 pb-24 lg:pb-8">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-xl font-bold text-gray-900">Browse Marketplace</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-2 h-2 bg-unicycle-green rounded-full"></span>
                            {selectedMarketplace || 'All Universities'}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex gap-2 mb-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={handleSearch}
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

                    {/* Category Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
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
                    <div className="max-w-6xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Filters</h3>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-unicycle-blue hover:underline"
                                >
                                    Clear all
                                </button>
                            )}
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

            {/* Results Count */}
            <div className="max-w-6xl mx-auto px-4 py-3">
                <p className="text-sm text-gray-600">
                    {loading ? 'Loading...' : `${listings.length} item${listings.length !== 1 ? 's' : ''} found`}
                    {hasActiveFilters && <span className="text-unicycle-green ml-1">(filtered)</span>}
                </p>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4">
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
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                        <p className="text-gray-600 mb-4">
                            {hasActiveFilters
                                ? 'Try adjusting your filters or search terms'
                                : 'Be the first to list something in this category!'
                            }
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-unicycle-blue hover:underline"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}

                {/* Listings Grid */}
                {!loading && !error && listings.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {listings.map((listing) => (
                            <div
                                key={listing.id}
                                onClick={() => onSelectItem(listing)}
                                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                            >
                                {/* Image */}
                                <div className="aspect-square bg-gray-100 relative">
                                    {listing.images && listing.images.length > 0 ? (
                                        <img
                                            src={listing.images[0]}
                                            alt={listing.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <span className="text-4xl">📦</span>
                                        </div>
                                    )}

                                    {/* Sold Badge */}
                                    {listing.is_sold && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                SOLD
                                            </span>
                                        </div>
                                    )}

                                    {/* Condition Badge */}
                                    {listing.condition && !listing.is_sold && (
                                        <div className="absolute top-2 left-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${listing.condition === 'New'
                                                ? 'bg-green-100 text-green-700'
                                                : listing.condition === 'Like New'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {listing.condition}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="p-3">
                                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                                        {listing.title}
                                    </h3>
                                    <p className="text-unicycle-green font-bold mt-1">
                                        ${listing.price?.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                        {listing.seller?.name || 'Unknown seller'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}