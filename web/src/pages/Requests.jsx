import { useState } from 'react';
import { Search, Plus, MessageCircle, Clock, TrendingUp } from 'lucide-react';

export default function Requests() {
    const [selectedFilter, setSelectedFilter] = useState('All');

    const filters = ['All', 'Urgent', 'Furniture', 'Textbooks', 'Electronics', 'Appliances', 'Clothing', 'Sports & Outdoors', 'Kitchen', 'Room Decor', 'Other'];

    const requests = [
        {
            id: 1,
            title: "ISO: Mini Fridge under $70",
            description: "Looking for a mini fridge in good condition. Moving into dorms next week and need one ASAP. Budget is $50-70.",
            author: "Emma Liu",
            timeAgo: "2 hours ago",
            responses: 3,
            category: "Appliances",
            urgent: true
        },
        {
            id: 2,
            title: "WTB: Calculus Textbook (9th or 10th edition)",
            description: "Need for MATH 140. Willing to pay up to $80 for good condition.",
            author: "David Park",
            timeAgo: "5 hours ago",
            responses: 7,
            category: "Textbooks",
            urgent: false
        },
        {
            id: 3,
            title: "Looking for: Desk lamp",
            description: "Simple desk lamp for studying. Budget around $15-20. Let me know what you have!",
            author: "Lisa Wong",
            timeAgo: "1 day ago",
            responses: 2,
            category: "Furniture",
            urgent: false
        },
        {
            id: 4,
            title: "ISO: Winter jacket (size M)",
            description: "International student here, didn't realize how cold Montreal gets! Looking for a warm winter jacket, size medium.",
            author: "Ahmed Hassan",
            timeAgo: "2 days ago",
            responses: 12,
            category: "Clothing",
            urgent: false
        }
    ];

    const filteredRequests = selectedFilter === 'All'
        ? requests
        : selectedFilter === 'Urgent'
            ? requests.filter(r => r.urgent)
            : requests.filter(r => r.category === selectedFilter);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">

            {/* ─── HEADER ─── */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-md lg:max-w-none mx-auto px-4 lg:px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Requests</h1>
                            <p className="text-xs text-gray-500">Students looking to buy</p>
                        </div>
                        <button className="px-4 py-2 bg-unicycle-green text-white rounded-lg text-sm font-semibold hover:bg-unicycle-green/90 transition-colors flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Post
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-md lg:max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        />
                    </div>
                </div>
            </div>

            {/* ─── FILTER TABS ─── */}
            <div className="bg-white border-b border-gray-200 overflow-x-auto">
                <div className="max-w-md lg:max-w-none mx-auto px-4 lg:px-6">
                    <div className="flex gap-3 py-3">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedFilter === filter
                                    ? 'bg-unicycle-green text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {filter === 'Urgent' && '🔥 '}
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── INFO BANNER ─── */}
            <div className="max-w-md lg:max-w-none mx-auto px-4 lg:px-6 py-4">
                <div className="bg-gradient-to-r from-unicycle-blue/10 to-unicycle-green/10 rounded-lg p-3 border border-unicycle-blue/30">
                    <div className="flex items-start gap-2">
                        <TrendingUp className="w-5 h-5 text-unicycle-blue flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-900 font-medium">Have what they're looking for?</p>
                            <p className="text-xs text-gray-600 mt-0.5">Reply to requests or create a listing!</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── REQUESTS GRID ─── */}
            <div className="max-w-md lg:max-w-none mx-auto px-4 lg:px-6 pb-6">
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-400 text-lg mb-2">No requests for {selectedFilter} yet</p>
                        <p className="text-gray-400 text-sm">Check back later!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                        {filteredRequests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                            >
                                {/* Tags */}
                                <div className="flex items-center gap-2 mb-2">
                                    {request.urgent && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                            🔥 URGENT
                                        </span>
                                    )}
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                        {request.category}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="font-semibold text-gray-900 mb-1">{request.title}</h3>

                                {/* Description */}
                                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{request.description}</p>

                                {/* Footer */}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center gap-3">
                                        <span>{request.author}</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {request.timeAgo}
                                        </span>
                                    </div>
                                    <button className="flex items-center gap-1 text-unicycle-blue hover:text-unicycle-blue/80 font-medium">
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        {request.responses} replies
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── NO BOTTOM NAV — Layout handles it ─── */}
        </div>
    );
}