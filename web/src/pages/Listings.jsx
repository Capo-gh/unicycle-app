import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, MapPin, Package } from 'lucide-react';
import { getListings } from '../api/listings';

export default function Listings({ onItemClick, onNavigate, currentMarketplace, onMarketplaceChange }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const universities = [
        'McGill University',
        'Concordia University',
        'Université de Montréal',
        'UQAM',
        'HEC Montréal'
    ];

    useEffect(() => {
        fetchListings();
    }, [selectedCategory, currentMarketplace]);

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
            const filters = {};

            if (selectedCategory !== 'All') {
                filters.category = selectedCategory;
            }

            if (searchQuery) {
                filters.search = searchQuery;
            }

            if (currentMarketplace) {
                filters.university = currentMarketplace;
            }

            const data = await getListings(filters);
            setListings(data);
        } catch (err) {
            console.error('Error fetching listings:', err);
            setError('Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    const handleMarketplaceChange = (e) => {
        onMarketplaceChange(e.target.value);
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
        if (!images) return 'https://via.placeholder.com/300x300?text=No+Image';
        const imageList = images.split(',');
        return imageList[0] || 'https://via.placeholder.com/300x300?text=No+Image';
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Title Row */}
                    <div className="py-4 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900">Browse Marketplace</h1>

                        {/* Marketplace Selector */}
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-unicycle-green" />
                            <select
                                value={currentMarketplace}
                                onChange={handleMarketplaceChange}
                                className="text-sm font-medium text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
                            >
                                <option value="">All Marketplaces</option>
                                {universities.map(uni => (
                                    <option key={uni} value={uni}>{uni}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="pb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-12 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                <SlidersHorizontal className="w-5 h-5" />
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

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
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
                            {currentMarketplace
                                ? `Be the first to list an item in ${currentMarketplace}!`
                                : 'Be the first to list an item!'
                            }
                        </p>
                        <button
                            onClick={() => onNavigate('sell')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-unicycle-green text-white rounded-lg hover:bg-unicycle-green/90"
                        >
                            + Post an Item
                        </button>
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
                                <div className="aspect-square relative">
                                    <img
                                        src={getFirstImage(item.images)}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium">
                                        {item.condition}
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-medium text-gray-900 text-sm truncate">{item.title}</h3>
                                    <p className="text-unicycle-green font-bold mt-1">{formatPrice(item.price)}</p>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">{item.safe_zone || item.safeZone}</span>
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