import { useState } from 'react';
import { Search, Plus, MessageCircle, Clock, TrendingUp, ArrowLeft, DollarSign, Send } from 'lucide-react';

export default function Requests() {
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showPostForm, setShowPostForm] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const filters = ['All', 'Urgent', 'Furniture', 'Textbooks', 'Electronics', 'Appliances', 'Clothing', 'Sports & Outdoors', 'Kitchen', 'Room Decor', 'Other'];

    const [requests, setRequests] = useState([
        {
            id: 1,
            title: "ISO: Mini Fridge under $70",
            description: "Looking for a mini fridge in good condition. Moving into dorms next week and need one ASAP. Budget is $50-70.",
            author: "Emma Liu",
            timeAgo: "2 hours ago",
            category: "Appliances",
            urgent: true,
            replies: [
                { id: 1, author: "Carlos Rodriguez", avatar: "C", text: "I have a mini fridge in great condition! Only used one semester. $60 - DM me!", timeAgo: "1 hour ago" },
                { id: 2, author: "Emma Liu", avatar: "E", text: "Thanks Carlos! Is it still available? Can we meet this afternoon?", timeAgo: "45 min ago" },
                { id: 3, author: "Sarah Chen", avatar: "S", text: "I also have one, $65 but like new. Let me know if interested!", timeAgo: "30 min ago" },
            ]
        },
        {
            id: 2,
            title: "WTB: Calculus Textbook (9th or 10th edition)",
            description: "Need for MATH 140. Willing to pay up to $80 for good condition.",
            author: "David Park",
            timeAgo: "5 hours ago",
            category: "Textbooks",
            urgent: false,
            replies: [
                { id: 1, author: "Lisa Wong", avatar: "L", text: "I have the 9th edition! Minimal highlighting. $70 - interested?", timeAgo: "4 hours ago" },
                { id: 2, author: "David Park", avatar: "D", text: "Yes! Does it come with the solution manual?", timeAgo: "3 hours ago" },
                { id: 3, author: "Lisa Wong", avatar: "L", text: "Yes it does! Meet at Redpath Library?", timeAgo: "3 hours ago" },
                { id: 4, author: "Ahmed Hassan", avatar: "A", text: "I have the 10th edition if the 9th doesn't work out. $75.", timeAgo: "2 hours ago" },
                { id: 5, author: "Rachel Green", avatar: "R", text: "Check my listing, I posted the same book yesterday!", timeAgo: "1 hour ago" },
                { id: 6, author: "Mike Johnson", avatar: "M", text: "Still looking? I have a copy in great shape.", timeAgo: "45 min ago" },
                { id: 7, author: "David Park", avatar: "D", text: "Going with Lisa's copy, thanks everyone!", timeAgo: "20 min ago" },
            ]
        },
        {
            id: 3,
            title: "Looking for: Desk lamp",
            description: "Simple desk lamp for studying. Budget around $15-20. Let me know what you have!",
            author: "Lisa Wong",
            timeAgo: "1 day ago",
            category: "Furniture",
            urgent: false,
            replies: [
                { id: 1, author: "James Kim", avatar: "J", text: "I have a modern LED desk lamp, $15. Works perfectly!", timeAgo: "20 hours ago" },
                { id: 2, author: "Lisa Wong", avatar: "L", text: "Perfect! Can we meet at McConnell today?", timeAgo: "18 hours ago" },
            ]
        },
        {
            id: 4,
            title: "ISO: Winter jacket (size M)",
            description: "International student here, didn't realize how cold Montreal gets! Looking for a warm winter jacket, size medium.",
            author: "Ahmed Hassan",
            timeAgo: "2 days ago",
            category: "Clothing",
            urgent: false,
            replies: [
                { id: 1, author: "Carlos Rodriguez", avatar: "C", text: "Montreal winters are no joke! I have a North Face jacket, size M. $50.", timeAgo: "2 days ago" },
                { id: 2, author: "Ahmed Hassan", avatar: "A", text: "That sounds great! Is it warm enough for -20?", timeAgo: "2 days ago" },
                { id: 3, author: "Carlos Rodriguez", avatar: "C", text: "Absolutely, kept me warm all last winter!", timeAgo: "1 day ago" },
                { id: 4, author: "Emma Liu", avatar: "E", text: "I have a Columbia jacket too if the North Face doesn't work. $45.", timeAgo: "1 day ago" },
                { id: 5, author: "Sarah Chen", avatar: "S", text: "Pro tip: layer up! A good hoodie underneath makes any jacket warmer.", timeAgo: "1 day ago" },
                { id: 6, author: "Mike Johnson", avatar: "M", text: "I have a Patagonia fleece for $40 if you want a middle layer.", timeAgo: "12 hours ago" },
                { id: 7, author: "Ahmed Hassan", avatar: "A", text: "Thanks everyone! Going with Carlos's jacket 😄", timeAgo: "10 hours ago" },
                { id: 8, author: "David Park", avatar: "D", text: "Welcome to Montreal winters! You'll get used to it 😄", timeAgo: "8 hours ago" },
                { id: 9, author: "Lisa Wong", avatar: "L", text: "Don't forget to get a good pair of boots too!", timeAgo: "6 hours ago" },
                { id: 10, author: "Rachel Green", avatar: "R", text: "And hand warmers! Game changer.", timeAgo: "5 hours ago" },
                { id: 11, author: "Alex Thompson", avatar: "A", text: "Good luck staying warm! ❄️", timeAgo: "4 hours ago" },
                { id: 12, author: "James Kim", avatar: "J", text: "I also have a spare scarf if you need one.", timeAgo: "2 hours ago" },
            ]
        }
    ]);

    // ─── POST FORM ───
    if (showPostForm) {
        return <PostRequestForm onBack={() => setShowPostForm(false)} onAddRequest={(newRequest) => {
            setRequests([newRequest, ...requests]);
            setShowPostForm(false);
        }} />;
    }

    const filteredRequests = requests.filter(request => {
        const matchesFilter = selectedFilter === 'All' ||
            (selectedFilter === 'Urgent' ? request.urgent : request.category === selectedFilter);
        const matchesSearch = searchQuery === '' ||
            request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.author.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleAddReply = (requestId, replyText) => {
        const newReply = {
            id: Date.now(),
            author: "You",
            avatar: "Y",
            text: replyText,
            timeAgo: "Just now"
        };

        setRequests(prev => prev.map(req => {
            if (req.id === requestId) {
                return { ...req, replies: [...req.replies, newReply] };
            }
            return req;
        }));

        // Update the selected request view too
        setSelectedRequest(prev => ({
            ...prev,
            replies: [...prev.replies, newReply]
        }));
    };

    // ─── MAIN VIEW ───
    return (
        <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row pb-20 lg:pb-0">

            {/* ─── LEFT: Requests List ─── */}
            <div className={`${selectedRequest ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-1/2 lg:border-r lg:border-gray-200 lg:overflow-y-auto`}>

                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                    <div className="px-4 lg:px-6 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Requests</h1>
                                <p className="text-xs text-gray-500">Students looking to buy</p>
                            </div>
                            <button
                                onClick={() => setShowPostForm(true)}
                                className="px-4 py-2 bg-unicycle-green text-white rounded-lg text-sm font-semibold hover:bg-unicycle-green/90 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Post
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search requests..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                            />
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white border-b border-gray-200 overflow-x-auto">
                    <div className="px-4 lg:px-6">
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

                {/* Info Banner */}
                <div className="px-4 lg:px-6 py-4">
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
                <div className="px-4 lg:px-6 pb-6 flex-1">
                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-400 text-lg mb-2">
                                {searchQuery ? `No results for "${searchQuery}"` : `No requests for ${selectedFilter} yet`}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {searchQuery ? 'Try a different search term' : 'Check back later!'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredRequests.map((request) => (
                                <div
                                    key={request.id}
                                    onClick={() => setSelectedRequest(request)}
                                    className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer ${selectedRequest?.id === request.id
                                        ? 'border-unicycle-green ring-2 ring-unicycle-green/20'
                                        : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {request.urgent && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">🔥 URGENT</span>
                                        )}
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">{request.category}</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{request.title}</h3>
                                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{request.description}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-3">
                                            <span>{request.author}</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {request.timeAgo}
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1 text-unicycle-blue font-medium">
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            {request.replies.length} replies
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── RIGHT: Replies View ─── */}
            <div className={`${selectedRequest ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-1/2 lg:h-screen`}>
                {selectedRequest ? (
                    <RequestReplies
                        request={selectedRequest}
                        onBack={() => setSelectedRequest(null)}
                        onAddReply={(text) => handleAddReply(selectedRequest.id, text)}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
                        <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">Select a request</p>
                        <p className="text-gray-400 text-sm mt-1">Read and reply to student requests</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── REQUEST REPLIES ───
function RequestReplies({ request, onBack, onAddReply }) {
    const [replyText, setReplyText] = useState('');

    const handleSend = () => {
        if (replyText.trim()) {
            onAddReply(replyText.trim());
            setReplyText('');
        }
    };

    return (
        <div className="flex flex-col lg:h-full">

            {/* Header */}
            <div className="bg-white border-b border-gray-200 flex-shrink-0 sticky top-0 z-10">
                <div className="px-4 py-3">
                    {/* Back — mobile only */}
                    <button onClick={onBack} className="lg:hidden flex items-center gap-2 text-unicycle-blue mb-2">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                        {request.urgent && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">🔥 URGENT</span>
                        )}
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">{request.category}</span>
                    </div>
                    <h2 className="font-semibold text-gray-900">{request.title}</h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Posted by {request.author} • {request.timeAgo} • {request.replies.length} replies
                    </p>
                </div>
            </div>

            {/* Original Post */}
            <div className="bg-unicycle-green/5 border-b border-gray-200 px-4 py-3 flex-shrink-0">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-semibold text-xs">
                        {request.author.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{request.author}</span>
                    <span className="text-xs text-gray-400">• Original post</span>
                </div>
                <p className="text-sm text-gray-700 ml-9">{request.description}</p>
            </div>

            {/* Replies — scrollable */}
            <div className="flex-1 overflow-y-auto bg-gray-50 pb-28 lg:pb-0">
                <div className="px-4 py-4 space-y-4">
                    {request.replies.map((reply) => (
                        <div key={reply.id} className={`flex gap-3 ${reply.author === 'You' ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 ${reply.author === 'You'
                                ? 'bg-gradient-to-br from-unicycle-green to-unicycle-blue'
                                : 'bg-gradient-to-br from-unicycle-blue to-unicycle-green'
                                }`}>
                                {reply.avatar}
                            </div>
                            {/* Bubble */}
                            <div className={`max-w-[75%] flex flex-col ${reply.author === 'You' ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-center gap-2 mb-1 ${reply.author === 'You' ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-xs font-semibold text-gray-900">{reply.author}</span>
                                    <span className="text-xs text-gray-400">{reply.timeAgo}</span>
                                </div>
                                <div className={`px-3 py-2 rounded-lg text-sm ${reply.author === 'You'
                                    ? 'bg-unicycle-green text-white rounded-tr-sm'
                                    : 'bg-white border border-gray-200 text-gray-900 rounded-tl-sm'
                                    }`}>
                                    {reply.text}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reply Input — fixed on mobile (above nav), inline on desktop */}
            <div className="fixed lg:relative bottom-16 lg:bottom-auto left-0 lg:left-auto right-0 lg:right-auto bg-white border-t border-gray-200 p-4 z-20 lg:z-0 flex-shrink-0">
                <div className="flex gap-2 items-end">
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Write a reply..."
                        className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!replyText.trim()}
                        className="p-2.5 bg-unicycle-green text-white rounded-full hover:bg-unicycle-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── POST REQUEST FORM ───
function PostRequestForm({ onBack, onAddRequest }) {
    const categories = ['Furniture', 'Textbooks', 'Electronics', 'Appliances', 'Clothing', 'Sports & Outdoors', 'Kitchen', 'Room Decor', 'Other'];

    const [formData, setFormData] = useState({
        title: '',
        category: 'Furniture',
        description: '',
        budgetMin: '',
        budgetMax: '',
        urgent: false
    });

    const [submitted, setSubmitted] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = () => {
        onAddRequest({
            id: Date.now(),
            title: formData.title,
            description: formData.description,
            author: "You",
            timeAgo: "Just now",
            category: formData.category,
            urgent: formData.urgent,
            replies: []
        });
        setSubmitted(true);
    };

    // Success screen
    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-unicycle-green to-unicycle-blue rounded-full mb-6">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Posted! 🎉</h2>
                    <p className="text-gray-600 mb-2">Your request is now live.</p>
                    <div className="bg-gray-50 rounded-lg p-3 mb-6 text-left">
                        <p className="text-sm font-semibold text-gray-900">{formData.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.category}
                            {formData.budgetMin && formData.budgetMax ? ` • $${formData.budgetMin} - $${formData.budgetMax}` : ''}
                            {formData.urgent ? ' • 🔥 Urgent' : ''}
                        </p>
                    </div>
                    <button
                        onClick={onBack}
                        className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors"
                    >
                        Back to Requests
                    </button>
                </div>
            </div>
        );
    }

    // Post form
    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-md lg:max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Post a Request</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-md lg:max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* Title */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">What are you looking for?</label>
                    <input
                        type="text"
                        placeholder="e.g., ISO: Mini Fridge under $70"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                    />
                    <p className="text-xs text-gray-400 mt-1">Tip: Start with "ISO:" or "WTB:" to get more replies</p>
                </div>

                {/* Category & Urgency */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Urgency</label>
                        <button
                            onClick={() => handleInputChange('urgent', !formData.urgent)}
                            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${formData.urgent
                                ? 'bg-red-100 text-red-700 border border-red-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                                }`}
                        >
                            🔥 {formData.urgent ? 'Urgent' : 'Not Urgent'}
                        </button>
                    </div>
                </div>

                {/* Budget */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Budget (CAD)</label>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="number"
                                placeholder="Min"
                                value={formData.budgetMin}
                                onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                            />
                        </div>
                        <span className="text-gray-400 font-medium">—</span>
                        <div className="flex-1 relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="number"
                                placeholder="Max"
                                value={formData.budgetMax}
                                onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                    <textarea
                        placeholder="Describe what you're looking for, condition, any specific requirements..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green resize-none"
                    />
                </div>

                {/* Preview */}
                {formData.title && (
                    <div className="bg-gradient-to-r from-unicycle-blue/10 to-unicycle-green/10 rounded-lg p-4 border border-unicycle-blue/30">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Preview</p>
                        <div className="flex items-center gap-2 mb-1">
                            {formData.urgent && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">🔥 URGENT</span>
                            )}
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">{formData.category}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{formData.title}</p>
                        {formData.description && <p className="text-xs text-gray-600 mt-1">{formData.description}</p>}
                        {formData.budgetMin && formData.budgetMax && (
                            <p className="text-xs text-unicycle-green font-medium mt-1">Budget: ${formData.budgetMin} - ${formData.budgetMax}</p>
                        )}
                    </div>
                )}

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={!formData.title || !formData.description}
                    className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Post Request
                </button>
            </div>
        </div>
    );
}