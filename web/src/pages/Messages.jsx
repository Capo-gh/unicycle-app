import { useState, useEffect } from 'react';
import { Search, ShieldCheck, MessageCircle, Send, ArrowLeft } from 'lucide-react';

export default function Messages({ incomingRequest, user }) {
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [conversations, setConversations] = useState([
        {
            id: 1,
            name: "Sarah Chen",
            verified: true,
            lastMessage: "Sounds good! See you at McConnell at 3pm",
            timestamp: "10 min ago",
            unread: 2,
            avatar: "S",
            item: "IKEA Desk - Perfect Condition",
            itemPrice: 45,
            history: [
                { id: 1, text: "Is this still available?", sender: "me", time: "2:00 PM" },
                { id: 2, text: "Yes it is! When can you pick it up?", sender: "them", time: "2:05 PM" },
                { id: 3, text: "Sounds good! See you at McConnell at 3pm", sender: "them", time: "2:10 PM" }
            ]
        },
        {
            id: 2,
            name: "Mike Johnson",
            verified: true,
            lastMessage: "Is the textbook still available?",
            timestamp: "1 hour ago",
            unread: 0,
            avatar: "M",
            item: "Calculus Textbook - 9th Edition",
            itemPrice: 80,
            history: [
                { id: 1, text: "Hi, I'm interested in the textbook.", sender: "them", time: "1:00 PM" },
                { id: 2, text: "Is the textbook still available?", sender: "them", time: "1:05 PM" }
            ]
        },
        {
            id: 3,
            name: "Ahmed Hassan",
            verified: true,
            lastMessage: "Perfect! I'll bring cash",
            timestamp: "Yesterday",
            unread: 0,
            avatar: "A",
            item: "Mini Fridge - Works Great",
            itemPrice: 60,
            history: [
                { id: 1, text: "Would you take $50?", sender: "me", time: "Yesterday" },
                { id: 2, text: "Meet me at $60?", sender: "them", time: "Yesterday" },
                { id: 3, text: "Perfect! I'll bring cash", sender: "them", time: "Yesterday" }
            ]
        }
    ]);

    // Auto-open chat when "Contact Seller" sends us here
    useEffect(() => {
        if (incomingRequest?.sellerName) {
            // Check if conversation already exists
            let targetConv = conversations.find(c => c.name === incomingRequest.sellerName);

            // If not, create a new conversation
            if (!targetConv) {
                const newConv = {
                    id: Date.now(),
                    name: incomingRequest.sellerName,
                    verified: true,
                    lastMessage: "Start chatting!",
                    timestamp: "Just now",
                    unread: 0,
                    avatar: incomingRequest.sellerName.charAt(0),
                    item: incomingRequest.itemTitle || "Item",
                    itemPrice: incomingRequest.itemPrice || 0,
                    history: []
                };

                setConversations(prev => [newConv, ...prev]);
                setSelectedConvId(newConv.id);
            } else {
                setSelectedConvId(targetConv.id);
            }
        }
    }, [incomingRequest]);

    const activeConv = conversations.find(c => c.id === selectedConvId);

    const handleSendMessage = () => {
        if (messageText.trim()) {
            console.log('Sending:', messageText);
            setMessageText('');
        }
    };

    return (
        <div className="h-screen flex flex-col lg:flex-row bg-gray-50 overflow-hidden">

            {/* ─── LEFT: Conversation List ─── */}
            <div className={`w-full lg:w-96 bg-white flex flex-col border-r border-gray-200 ${selectedConvId ? 'hidden lg:flex' : 'flex'
                }`}>
                {/* Header */}
                <div className="px-4 py-4 border-b border-gray-200 flex-shrink-0">
                    <h1 className="text-xl font-bold text-gray-900 mb-3">Messages</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedConvId(conv.id)}
                            className={`w-full text-left p-4 flex gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedConvId === conv.id ? 'bg-unicycle-green/10' : ''
                                }`}
                        >
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
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900 text-sm">{conv.name}</h3>
                                        {conv.verified && <ShieldCheck className="w-4 h-4 text-unicycle-blue" />}
                                    </div>
                                    <span className="text-xs text-gray-500">{conv.timestamp}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-1">Re: {conv.item} • ${conv.itemPrice}</p>
                                <p className={`text-sm truncate ${conv.unread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                    {conv.lastMessage}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Safety Tips (mobile only when no chat selected) */}
                {!selectedConvId && (
                    <div className="lg:hidden p-4 flex-shrink-0">
                        <div className="bg-gradient-to-r from-unicycle-green/10 to-unicycle-blue/10 rounded-lg p-4 border border-unicycle-green/30">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm">🛡️ Safety Tips</h4>
                            <ul className="text-xs text-gray-700 space-y-1">
                                <li>• Always meet at campus Safe Zones</li>
                                <li>• Verify items before completing payment</li>
                                <li>• Use Secure-Pay for items over $50</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── RIGHT: Chat Interface ─── */}
            <div className={`flex-1 flex flex-col bg-white ${selectedConvId ? 'flex' : 'hidden lg:flex'
                } ${selectedConvId ? 'lg:relative' : ''}`}>
                {activeConv ? (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
                            <button
                                onClick={() => setSelectedConvId(null)}
                                className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            <div className="w-10 h-10 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-semibold">
                                {activeConv.avatar}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{activeConv.name}</h3>
                                <p className="text-xs text-gray-500">Re: {activeConv.item} • ${activeConv.itemPrice}</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {activeConv.history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                                    <p className="text-gray-400 text-sm">No messages yet</p>
                                    <p className="text-gray-400 text-xs mt-1">Start the conversation below!</p>
                                </div>
                            ) : (
                                activeConv.history.map((msg) => (
                                    <div key={msg.id} className={`flex gap-2 ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 ${msg.sender === 'me'
                                            ? 'bg-gradient-to-br from-unicycle-green to-unicycle-blue'
                                            : 'bg-gradient-to-br from-unicycle-blue to-unicycle-green'
                                            }`}>
                                            {msg.sender === 'me' ? (user?.name?.charAt(0) || 'Y') : activeConv.avatar}
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${msg.sender === 'me'
                                            ? 'bg-unicycle-green text-white rounded-tr-sm'
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                                            }`}>
                                            <p>{msg.text}</p>
                                            <p className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-white/80' : 'text-gray-400'}`}>
                                                {msg.time}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input - Fixed at bottom, safe area aware */}
                        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0 safe-area-inset-bottom">
                            <div className="flex gap-2 items-end">
                                <input
                                    type="text"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green resize-none"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!messageText.trim()}
                                    className="p-2.5 bg-unicycle-green text-white rounded-full hover:bg-unicycle-green/90 disabled:opacity-50 flex-shrink-0"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
                        <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Select a conversation</h3>
                        <p className="text-gray-500 text-sm">Choose from the left to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}