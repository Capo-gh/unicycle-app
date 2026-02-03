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
            text: `🛡️ Recommended Safe Zone: ${item?.safeZone || 'McConnell Library'}`,
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
        <div className="h-screen flex flex-col lg:flex-row overflow-hidden">

            {/* ─── LEFT SIDEBAR: Item Details (Desktop only) ─── */}
            <div className="hidden lg:flex lg:w-80 bg-white border-r border-gray-200 flex-col">
                {/* Back to Item */}
                <div className="p-6 border-b border-gray-200">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Item</span>
                    </button>

                    {/* Item Image + Info */}
                    <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-xl font-bold text-unicycle-green mt-1">${item.price}</p>
                </div>

                {/* Seller + Safe Zone */}
                <div className="p-6 space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-semibold">
                            {item.seller.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-900 text-sm">{item.seller.name}</span>
                                {item.seller.verified && <ShieldCheck className="w-4 h-4 text-unicycle-blue" />}
                            </div>
                            <p className="text-xs text-gray-500">{item.seller.year} • {item.seller.faculty}</p>
                        </div>
                    </div>

                    <div className="bg-unicycle-green/10 rounded-lg p-3 border border-unicycle-green/30">
                        <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-unicycle-green" />
                            <span className="font-medium text-gray-900 text-sm">Safe Zone</span>
                        </div>
                        <p className="text-sm text-gray-700">{item.safeZone}</p>
                        <p className="text-xs text-gray-500">{item.safeZoneAddress}</p>
                        <button
                            onClick={() => {
                                const address = encodeURIComponent(`${item.safeZone}, ${item.safeZoneAddress}, Montreal, QC`);
                                window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                            }}
                            className="mt-2 text-xs text-unicycle-blue font-medium hover:underline"
                        >
                            Get Directions →
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── RIGHT: Chat Area (full width on mobile) ─── */}
            <div className="flex-1 flex flex-col min-h-0">

                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 flex-shrink-0">
                    <div className="px-4 py-3 flex items-center gap-3">
                        {/* Back button — mobile only */}
                        <button
                            onClick={onBack}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
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

                {/* Item Preview Banner — mobile only */}
                <div className="lg:hidden bg-white border-b border-gray-200 flex-shrink-0">
                    <div className="px-4 py-3 flex gap-3 items-center">
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

                {/* ─── Messages (scrollable) ─── */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id}>
                                {msg.isSystem ? (
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
                                    <div className="flex justify-end gap-2 items-end">
                                        <div className="bg-unicycle-green text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[75%]">
                                            <p className="text-sm">{msg.text}</p>
                                            <p className="text-xs text-white/70 mt-1">{msg.timestamp}</p>
                                        </div>
                                        <div className="w-8 h-8 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                            You
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-start gap-2 items-end">
                                        <div className="w-8 h-8 bg-gradient-to-br from-unicycle-green to-unicycle-blue rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                            {item.seller.name.charAt(0)}
                                        </div>
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

                {/* ─── Quick Replies ─── */}
                <div className="bg-white border-t border-gray-200 flex-shrink-0">
                    <div className="max-w-2xl mx-auto px-4 py-2">
                        <div className="flex gap-2 overflow-x-auto pb-1">
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

                {/* ─── Message Input ─── */}
                <div className="bg-white border-t border-gray-200 flex-shrink-0">
                    <div className="max-w-2xl mx-auto px-4 py-3">
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
        </div>
    );
}