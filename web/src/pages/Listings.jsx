import { useState } from 'react';
import { Search, MapPin, ShieldCheck, MessageCircle } from 'lucide-react';
import icon from '../assets/unicycle-icon.png';
import MarketplacePicker from '../components/MarketplacePicker';

export default function Listings({ onItemClick, onNavigate, currentMarketplace, onMarketplaceChange }) {
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Furniture', 'Textbooks', 'Electronics', 'Appliances', 'Clothing', 'Sports & Outdoors', 'Kitchen', 'Room Decor', 'Other'];

    const listings = [
        {
            id: 1,
            title: "IKEA Desk - Perfect Condition",
            price: 45,
            image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400",
            images: [
                "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800",
                "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&sat=-100",
            ],
            description: "Selling my IKEA desk in excellent condition! Used for only one semester. Very sturdy, perfect for studying. Includes the shelf underneath. No scratches or damage. Moving back home so need to sell before May 1st.",
            seller: { name: "Sarah Chen", verified: true, year: "3rd Year", faculty: "Engineering", rating: 4.9, reviews: 12 },
            safeZone: "McConnell Library",
            safeZoneAddress: "3459 McTavish St, Main Floor Lobby",
            category: "Furniture",
            condition: "Like New",
            posted: "2 days ago",
            views: 47,
            verified: true
        },
        {
            id: 2,
            title: "Calculus Textbook - 9th Edition",
            price: 80,
            image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
            images: [
                "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800",
            ],
            description: "Calculus textbook in great condition. All pages intact, minimal highlighting. Perfect for MATH 140/141. Includes solution manual.",
            seller: { name: "Mike Johnson", verified: true, year: "2nd Year", faculty: "Science", rating: 4.8, reviews: 8 },
            safeZone: "Redpath Library",
            safeZoneAddress: "3461 McTavish St, Ground Floor",
            category: "Textbooks",
            condition: "Good",
            posted: "1 day ago",
            views: 32,
            verified: true
        },
        {
            id: 3,
            title: "Mini Fridge - Works Great",
            price: 60,
            image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400",
            images: [
                "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800",
            ],
            description: "Compact mini fridge, perfect for dorm rooms. Energy efficient, quiet operation. Small freezer compartment included. Clean and well-maintained.",
            seller: { name: "Ahmed Hassan", verified: true, year: "4th Year", faculty: "Management", rating: 5.0, reviews: 15 },
            safeZone: "SSMU Building",
            safeZoneAddress: "3480 McTavish St, Main Entrance",
            category: "Appliances",
            condition: "Good",
            posted: "3 days ago",
            views: 55,
            verified: true
        },
        {
            id: 4,
            title: "Wireless Computer Mouse",
            price: 25,
            image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
            images: [
                "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800",
            ],
            description: "Logitech wireless mouse. Batteries included. Works perfectly, very responsive. Great for studying and gaming.",
            seller: { name: "Emma Liu", verified: true, year: "1st Year", faculty: "Engineering", rating: 4.7, reviews: 5 },
            safeZone: "Trottier Building",
            safeZoneAddress: "3630 University St, Lobby",
            category: "Electronics",
            condition: "Like New",
            posted: "1 week ago",
            views: 28,
            verified: true
        },
        {
            id: 5,
            title: "Desk Lamp - Modern Design",
            price: 15,
            image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400",
            images: [
                "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800",
            ],
            description: "Sleek modern desk lamp with adjustable brightness. LED bulb included. Perfect lighting for late-night study sessions.",
            seller: { name: "David Park", verified: true, year: "3rd Year", faculty: "Arts", rating: 4.6, reviews: 7 },
            safeZone: "McConnell Library",
            safeZoneAddress: "3459 McTavish St, Main Floor Lobby",
            category: "Furniture",
            condition: "Good",
            posted: "4 days ago",
            views: 19,
            verified: true
        },
        {
            id: 6,
            title: "Chemistry Lab Coat",
            price: 20,
            image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400",
            images: [
                "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800",
            ],
            description: "Standard white lab coat, size medium. Freshly washed. Required for CHEM labs. Only used for one semester.",
            seller: { name: "Lisa Wong", verified: true, year: "2nd Year", faculty: "Science", rating: 4.9, reviews: 11 },
            safeZone: "Otto Maass Chemistry",
            safeZoneAddress: "801 Sherbrooke St W, Main Entrance",
            category: "Clothing",
            condition: "Like New",
            posted: "5 days ago",
            views: 22,
            verified: true
        },
        {
            id: 7,
            title: "Microwave - Like New",
            price: 35,
            image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400",
            images: [
                "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800",
            ],
            description: "Compact microwave, barely used. Perfect for heating meals in your dorm or apartment. Easy to clean, all functions working perfectly.",
            seller: { name: "James Kim", verified: true, year: "4th Year", faculty: "Engineering", rating: 4.8, reviews: 9 },
            safeZone: "New Residence Hall",
            safeZoneAddress: "3625 Park Ave, Lobby",
            category: "Appliances",
            condition: "Like New",
            posted: "1 week ago",
            views: 41,
            verified: true
        },
        {
            id: 8,
            title: "Winter Jacket - Size M",
            price: 50,
            image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
            images: [
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
            ],
            description: "Warm winter jacket, perfect for Montreal winters. Size medium. North Face brand. Moving to warmer climate so don't need it anymore.",
            seller: { name: "Carlos Rodriguez", verified: true, year: "3rd Year", faculty: "Management", rating: 4.7, reviews: 6 },
            safeZone: "SSMU Building",
            safeZoneAddress: "3480 McTavish St, Main Entrance",
            category: "Clothing",
            condition: "Good",
            posted: "2 days ago",
            views: 38,
            verified: true
        },
        {
            id: 9,
            title: "Standing Desk Converter",
            price: 70,
            image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400",
            images: [
                "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800",
            ],
            description: "Adjustable standing desk converter. Great for posture and health. Fits on any desk. Easy height adjustment. Barely used.",
            seller: { name: "Rachel Green", verified: true, year: "2nd Year", faculty: "Science", rating: 5.0, reviews: 14 },
            safeZone: "Redpath Library",
            safeZoneAddress: "3461 McTavish St, Ground Floor",
            category: "Furniture",
            condition: "Like New",
            posted: "3 days ago",
            views: 52,
            verified: true
        },
        {
            id: 10,
            title: "Bluetooth Headphones",
            price: 55,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
            images: [
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
            ],
            description: "Sony wireless headphones with noise cancellation. Perfect for studying in the library. Battery lasts 20+ hours. Comes with charging cable.",
            seller: { name: "Alex Thompson", verified: true, year: "1st Year", faculty: "Arts", rating: 4.6, reviews: 8 },
            safeZone: "McLennan Library",
            safeZoneAddress: "3459 McTavish St, Main Entrance",
            category: "Electronics",
            condition: "Good",
            posted: "3 days ago",
            views: 62,
            verified: true
        },
    ];

    const filteredListings = selectedCategory === 'All'
        ? listings
        : listings.filter(item => item.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ─── HEADER ─── */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">

                {/* Mobile Header */}
                <div className="lg:hidden max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center gap-3 mb-3">
                        <img
                            src={icon}
                            alt="UniCycle"
                            className="w-10 h-10 object-contain"
                        />
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-gray-900">UniCycle</h1>
                            <MarketplacePicker currentMarketplace={currentMarketplace} onMarketplaceChange={onMarketplaceChange} compact={true} />
                        </div>
                        {/* Messages Icon */}
                        <button
                            onClick={() => onNavigate('messages')}
                            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                        >
                            <MessageCircle className="w-6 h-6 text-gray-700" />
                            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                        </button>
                    </div>
                    {/* Mobile Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search furniture, books, electronics..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        />
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:flex items-center px-6 py-4">
                    <div className="flex-1 max-w-2xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search furniture, books, electronics..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── CATEGORY TABS ─── */}
            <div className="bg-white border-b border-gray-200 overflow-x-auto">
                <div className="max-w-md lg:max-w-none mx-auto px-4 lg:px-6">
                    <div className="flex gap-3 py-3">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                                        ? 'bg-unicycle-green text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── LISTINGS GRID ─── */}
            <div className="max-w-md lg:max-w-none mx-auto px-4 lg:px-6 py-4">
                {filteredListings.length === 0 && (
                    <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-16">
                        <p className="text-gray-400 text-lg mb-2">No items in {selectedCategory} yet</p>
                        <p className="text-gray-400 text-sm">Be the first to sell something!</p>
                    </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                    {filteredListings.map((listing, index) => (
                        <div
                            key={listing.id}
                            onClick={() => onItemClick(listing)}
                            className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer animate-slideUp"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            {/* Image */}
                            <div className="relative h-36 lg:h-44 bg-gray-200">
                                <img
                                    src={listing.image}
                                    alt={listing.title}
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                    loading="lazy"
                                />
                                <div className="absolute top-2 right-2 bg-unicycle-green text-white px-2 py-0.5 rounded text-xs font-semibold shadow-md">
                                    ${listing.price}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-3">
                                <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 min-h-[40px]">
                                    {listing.title}
                                </h3>
                                {/* Seller Info */}
                                <div className="flex items-center gap-1 mb-2">
                                    <span className="text-xs text-gray-600">{listing.seller.name}</span>
                                    {listing.verified && (
                                        <ShieldCheck className="w-3.5 h-3.5 text-unicycle-blue" />
                                    )}
                                </div>
                                {/* Safe Zone */}
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{listing.safeZone}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}