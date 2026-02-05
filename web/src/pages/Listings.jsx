import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import ListingCard from '../components/ListingCard';
import MarketplacePicker from '../components/MarketplacePicker';
import { getAllListings } from '../api/listings';

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

    // Fetch listings from backend
    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            setError(null);

            try {
                const filters = {
                    university: currentMarketplace,
                    category: selectedCategory !== 'All' ? selectedCategory : undefined,
                    search: searchQuery || undefined
                };

                const data = await getAllListings(filters);
                setListings(data);
            } catch (err) {
                console.error('Error fetching listings:', err);
                setError('Failed to load listings. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [currentMarketplace, selectedCategory, searchQuery]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-xl font-bold text-gray-900">Browse</h1>
                        <MarketplacePicker
                            currentMarketplace={currentMarketplace}
                            onMarketplaceChange={onMarketplaceChange}
                            compact={true}
                        />
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search items..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        />
                    </div>
                </div>
            </div>

            {/* Desktop/Tablet View */}
            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
                {/* Desktop Search Bar */}
                <div className="hidden lg:flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Browse Marketplace</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search items..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                            />
                        </div>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                                ? 'bg-unicycle-green text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-unicycle-green"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-sm text-unicycle-blue hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && listings.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery
                                ? `No results for "${searchQuery}"`
                                : selectedCategory !== 'All'
                                    ? `No items in ${selectedCategory}`
                                    : 'Be the first to list an item!'}
                        </p>
                        <button
                            onClick={() => onNavigate('sell')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-unicycle-green text-white rounded-lg hover:bg-unicycle-green/90"
                        >
                            <Plus className="w-5 h-5" />
                            Post an Item
                        </button>
                    </div>
                )}

                {/* Listings Grid */}
                {!loading && !error && listings.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                        {listings.map((item) => (
                            <ListingCard
                                key={item.id}
                                item={{
                                    ...item,
                                    images: item.images ? item.images.split(',') : [],
                                    safeZone: item.safe_zone,
                                    safeZoneAddress: item.safe_zone_address
                                }}
                                onClick={() => onItemClick({
                                    ...item,
                                    images: item.images ? item.images.split(',') : [],
                                    safeZone: item.safe_zone,
                                    safeZoneAddress: item.safe_zone_address
                                })}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button (Mobile) */}
            <button
                onClick={() => onNavigate('sell')}
                className="lg:hidden fixed bottom-20 right-4 w-14 h-14 bg-unicycle-green text-white rounded-full shadow-lg flex items-center justify-center hover:bg-unicycle-green/90 transition-colors z-10"
            >
                <Plus className="w-6 h-6" />
            </button>
        </div>
    );
}