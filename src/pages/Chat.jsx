import { ArrowLeft, MapPin, Send, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function Chat({ item, onBack }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'them',
            text: `Hi! Thanks for your interest in the ${item?.title || 'item'}!`,
            timestamp: '2:30 PM',
            isSystem: false
        },
        {
            id: 2,
            sender: 'system',
            text: `💡 Recommended Safe Zone: ${item?.safeZone || 'McConnell Library'}`,
            timestamp: '2:30 PM',
            isSystem: true
        }
    ]);

    const quickReplies = [
        "Is this still available?",
        "Can we meet today?",
        "I'm interested!",
        `Meet at ${item?.safeZone || 'Safe Zone'}?`
    ];

    const handleSend = () => {
        if (message.trim()) {
            const newMessage = {
                id: messages.length + 1,
                sender: 'me',
                text: message,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                isSystem: false
            };
            setMessages([...messages, newMessage]);
            setMessage('');
        }
    };

    const handleQuickReply = (reply) => {
        const newMessage = {
            id: messages.length + 1,
            sender: 'me',
            text: reply,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            isSystem: false
        };
        setMessages([...messages, newMessage]);
    };

    if (!item) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-700" />
                        </button>

                        {/* Seller Info */}
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-semibold">
                                {item.seller.name.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-sm font-semibold text-gray-900">{item.seller.name}</h1>
                                    {item.seller.verified && (
                                        <ShieldCheck className="w-4 h-4 text-unicycle-blue" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">Re: {item.title}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Item Preview Banner */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-md mx-auto px-4 py-3">
                    <div className="flex gap-3 items-center">
                        <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h3>
                            <p className="text-lg font-bold text-unicycle-green">${item.price}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
                <div className="max-w-md mx-auto px-4 py-4 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id}>
                            {msg.isSystem ? (
                                // System Message (Safe Zone Suggestion)
                                <div className="flex justify-center">
                                    <div className="bg-gradient-to-r from-unicycle-green/20 to-unicycle-blue/20 rounded-lg px-4 py-3 max-w-[85%] border border-unicycle-green/30">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-unicycle-green mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-medium text-gray-900">{msg.text}</p>
                                                <p className="text-xs text-gray-600 mt-1">{item.safeZoneAddress}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : msg.sender === 'me' ? (
                                // My Message
                                <div className="flex justify-end">
                                    <div className="bg-unicycle-green text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[75%]">
                                        <p className="text-sm">{msg.text}</p>
                                        <p className="text-xs text-white/70 mt-1">{msg.timestamp}</p>
                                    </div>
                                </div>
                            ) : (
                                // Their Message
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[75%]">
                                        <p className="text-sm text-gray-900">{msg.text}</p>
                                        <p className="text-xs text-gray-500 mt-1">{msg.timestamp}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Replies */}
            <div className="bg-white border-t border-gray-200">
                <div className="max-w-md mx-auto px-4 py-2">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {quickReplies.map((reply, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickReply(reply)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 pb-safe">
                <div className="max-w-md mx-auto px-4 py-3">
                    <div className="flex gap-2 items-end">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!message.trim()}
                            className="p-2.5 bg-unicycle-green text-white rounded-full hover:bg-unicycle-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}