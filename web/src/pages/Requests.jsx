import { Search, Plus, MessageCircle, Clock, TrendingUp } from 'lucide-react';

export default function Requests({ onSellClick, onBrowseClick, onProfileClick }) {
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

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-md mx-auto px-4 py-4">
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

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white border-b border-gray-200 overflow-x-auto">
                <div className="max-w-md mx-auto px-4">
                    <div className="flex gap-4 py-3">
                        {['All', 'Urgent', 'Furniture', 'Textbooks', 'Electronics'].map((filter) => (
                            <button
                                key={filter}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'All'
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

            {/* Info Banner */}
            <div className="max-w-md mx-auto px-4 py-4">
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

            {/* Requests List */}
            <div className="max-w-md mx-auto px-4 space-y-3 pb-6">
                {requests.map((request) => (
                    <div
                        key={request.id}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {request.urgent && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                            🔥 URGENT
                                        </span>
                                    )}
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                        {request.category}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{request.title}</h3>
                            </div>
                        </div>

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

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
                <div className="max-w-md mx-auto px-4 py-3 flex justify-around">
                    <button
                        onClick={onBrowseClick}
                        className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
                    >
                        <Search className="w-6 h-6" />
                        <span className="text-xs">Browse</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-unicycle-green">
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-xs font-medium">Requests</span>
                    </button>
                    <button
                        onClick={onSellClick}
                        className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
                    >
                        <Plus className="w-6 h-6" />
                        <span className="text-xs">Sell</span>
                    </button>
                    <button
                        onClick={onProfileClick}
                        className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs">Profile</span>
                    </button>
                </div>
            </div>
        </div>
    );
}