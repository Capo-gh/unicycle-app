import { ArrowLeft, Search, ShieldCheck, MessageCircle } from 'lucide-react';

export default function Messages({ onBack }) {
    const conversations = [
        {
            id: 1,
            name: "Sarah Chen",
            verified: true,
            lastMessage: "Sounds good! See you at McConnell at 3pm",
            timestamp: "10 min ago",
            unread: 2,
            avatar: "S",
            item: "IKEA Desk",
            itemPrice: 45
        },
        {
            id: 2,
            name: "Mike Johnson",
            verified: true,
            lastMessage: "Is the textbook still available?",
            timestamp: "1 hour ago",
            unread: 0,
            avatar: "M",
            item: "Calculus Textbook",
            itemPrice: 80
        },
        {
            id: 3,
            name: "Ahmed Hassan",
            verified: true,
            lastMessage: "Perfect! I'll bring cash",
            timestamp: "Yesterday",
            unread: 0,
            avatar: "A",
            item: "Mini Fridge",
            itemPrice: 60
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
                        <div className="w-10"></div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        />
                    </div>
                </div>
            </div>

            {/* Conversations List */}
            <div className="max-w-md mx-auto">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 text-center px-4">
                        <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                        <p className="text-sm text-gray-600">
                            Start buying or selling items to connect with other students!
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className="bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <div className="max-w-md mx-auto px-4 py-4">
                                    <div className="flex gap-3">
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                                {conv.avatar}
                                            </div>
                                            {conv.unread > 0 && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                    {conv.unread}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900 text-sm">{conv.name}</h3>
                                                    {conv.verified && (
                                                        <ShieldCheck className="w-4 h-4 text-unicycle-blue" />
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500">{conv.timestamp}</span>
                                            </div>

                                            {/* Item Info */}
                                            <div className="text-xs text-gray-600 mb-1">
                                                Re: {conv.item} • ${conv.itemPrice}
                                            </div>

                                            {/* Last Message */}
                                            <p className={`text-sm ${conv.unread > 0 ? 'font-medium text-gray-900' : 'text-gray-600'} truncate`}>
                                                {conv.lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tips Section */}
            <div className="max-w-md mx-auto px-4 mt-6">
                <div className="bg-gradient-to-r from-unicycle-green/10 to-unicycle-blue/10 rounded-lg p-4 border border-unicycle-green/30">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">💡 Safety Tips</h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                        <li>• Always meet at campus Safe Zones</li>
                        <li>• Verify items before completing payment</li>
                        <li>• Use Secure-Pay for items over $50</li>
                        <li>• Never share personal financial information</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}