import { ArrowLeft, MapPin, ShieldCheck, MessageCircle, Share2 } from 'lucide-react';

export default function ItemDetail({ item, onBack, onContactSeller }) {
    const handleBack = () => {
        onBack();
    };

    // If no item is passed, show a loading or error state
    if (!item) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Item Details</h1>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Share2 className="w-5 h-5 text-gray-700" />
                    </button>
                </div>
            </div>

            {/* Image Gallery */}
            <div className="bg-white">
                <div className="max-w-md mx-auto">
                    <div className="relative h-80">
                        <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                            1 / {item.images.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto px-4 py-4 space-y-4">
                {/* Price & Title */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">{item.title}</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{item.category}</span>
                                <span>•</span>
                                <span>{item.condition}</span>
                                <span>•</span>
                                <span>{item.posted}</span>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-unicycle-green">${item.price}</div>
                    </div>
                </div>

                {/* Seller Info */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">Seller</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <span>⭐ {item.seller.rating}</span>
                            <span>({item.seller.reviews} reviews)</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {item.seller.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{item.seller.name}</span>
                                {item.seller.verified && (
                                    <ShieldCheck className="w-4 h-4 text-unicycle-blue" />
                                )}
                            </div>
                            <p className="text-sm text-gray-600">{item.seller.year} • {item.seller.faculty}</p>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm">
                            <ShieldCheck className="w-4 h-4 text-unicycle-blue" />
                            <span className="text-gray-700">Verified McGill Student</span>
                        </div>
                    </div>
                </div>

                {/* Safe Zone - THIS IS YOUR KEY DIFFERENTIATOR! */}
                <div className="bg-gradient-to-r from-unicycle-green/10 to-unicycle-blue/10 rounded-lg p-4 border-2 border-unicycle-green/30">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-unicycle-green rounded-lg">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Recommended Safe Zone</h3>
                            <p className="text-sm font-medium text-gray-900">{item.safeZone}</p>
                            <p className="text-xs text-gray-600 mt-1">{item.safeZoneAddress}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                ✓ Well-lit public area • Security cameras • Student traffic
                            </p>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
                </div>

                {/* Payment Info - Show escrow for items >$50 */}
                {item.price >= 50 && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-unicycle-blue rounded-lg">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Secure-Pay Protected</h3>
                                <p className="text-xs text-gray-600">
                                    This item qualifies for escrow protection. Your payment is held securely until you verify the item in person at the Safe Zone.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
                <div className="max-w-md mx-auto px-4 py-3 flex gap-3">
                    <button
                        onClick={onContactSeller}
                        className="flex-1 bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Contact Seller
                    </button>
                </div>
            </div>
        </div>
    );
}