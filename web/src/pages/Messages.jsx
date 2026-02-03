import { useState } from 'react';
import { Search, ShieldCheck, MessageCircle } from 'lucide-react';

export default function Messages() {
    const [selectedConv, setSelectedConv] = useState(null);

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
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            <div className="flex lg:min-h-screen">

                {/* ─── LEFT: Conversation List ─── */}
                <div className="w-full lg:w-96 lg:border-r lg:border-gray-200 bg-white flex flex-col">

                    {/* Header */}
                    <div className="border-b border-gray-200 sticky top-0 z-10 bg-white">
                        <div className="px-4 py-3">
                            <h1 className="text-lg font-semibold text-gray-900 mb-3">Messages</h1>
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

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto">
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
                                        onClick={() => setSelectedConv(conv)}
                                        className={`px-4 py-4 cursor-pointer transition-colors ${selectedConv?.id === conv.id
                                                ? 'bg-unicycle-green/10'
                                                : 'hover:bg-gray-50'
                                            }`}
                                    >
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
                                                <div className="text-xs text-gray-500 mb-1">
                                                    Re: {conv.item} • ${conv.itemPrice}
                                                </div>
                                                <p className={`text-sm truncate ${conv.unread > 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                                    {conv.lastMessage}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── RIGHT: Selected Conversation (Desktop only) ─── */}
                <div className="hidden lg:flex lg:flex-1 flex-col">
                    {selectedConv ? (
                        <>
                            {/* Conversation Header */}
                            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-semibold">
                                    {selectedConv.avatar}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{selectedConv.name}</p>
                                    <p className="text-xs text-gray-500">Re: {selectedConv.item} • ${selectedConv.itemPrice}</p>
                                </div>
                            </div>

                            {/* Chat area placeholder */}
                            <div className="flex-1 flex items-center justify-center bg-gray-50">
                                <p className="text-gray-400">Chat messages will appear here</p>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
                            <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg font-medium">Select a conversation</p>
                            <p className="text-gray-400 text-sm mt-1">Choose from the left to start chatting</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Safety Tips (mobile only) ─── */}
            <div className="lg:hidden max-w-md mx-auto px-4 mt-6 pb-6">
                <div className="bg-gradient-to-r from-unicycle-green/10 to-unicycle-blue/10 rounded-lg p-4 border border-unicycle-green/30">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">🛡️ Safety Tips</h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                        <li>• Always meet at campus Safe Zones</li>
                        <li>• Verify items before completing payment</li>
                        <li>• Use Secure-Pay for items over $50</li>
                        <li>• Never share personal financial information</li>
                    </ul>
                </div>
            </div>

            {/* ─── NO BOTTOM NAV — Layout handles it ─── */}
        </div>
    );
}