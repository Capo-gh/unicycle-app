import { useState } from 'react';
import { ArrowLeft, MapPin, ShieldCheck, MessageCircle, Share2 } from 'lucide-react';
import SecurePayModal from './SecurePayModal';

export default function ItemDetail({ item, onBack, onContactSeller }) {
    const [showSecurePayModal, setShowSecurePayModal] = useState(false);

    const handleContactSeller = () => {
        if (item.price >= 50) {
            setShowSecurePayModal(true);
        } else {
            onContactSeller();
        }
    };

    const handleSecurePayProceed = () => {
        setShowSecurePayModal(false);
        onContactSeller();
    };

    if (!item) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">

            {/* ─── HEADER ─── */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-md lg:max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={onBack}
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

            {/* ─── BODY: stacked mobile, side-by-side desktop ─── */}
            <div className="max-w-md lg:max-w-5xl mx-auto lg:flex lg:gap-8 lg:p-6">

                {/* ─── LEFT: Image ─── */}
                <div className="lg:flex-1">
                    <div className="relative h-80 lg:h-auto lg:aspect-square lg:rounded-xl overflow-hidden">
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

                {/* ─── RIGHT: Details ─── */}
                <div className="lg:flex-1 px-4 lg:px-0 py-4 lg:py-0 space-y-4">

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
                            {/* TODO: Add ratings later */}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {item.seller.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{item.seller.name}</span>
                                    {item.seller.is_verified && (
                                        <ShieldCheck className="w-4 h-4 text-unicycle-blue" />
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">{item.seller.university}</p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm">
                                <ShieldCheck className="w-4 h-4 text-unicycle-blue" />
                                <span className="text-gray-700">Verified {item.seller.university} Student</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
                    </div>

                    {/* Safe Zone */}
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
                                <button
                                    onClick={() => {
                                        const address = encodeURIComponent(`${item.safeZone}, ${item.safeZoneAddress}, Montreal, QC`);
                                        window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                                    }}
                                    className="mt-3 w-full px-4 py-2 bg-unicycle-blue text-white rounded-lg text-sm font-semibold hover:bg-unicycle-blue/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    <MapPin className="w-4 h-4" />
                                    Get Directions
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Secure-Pay Info */}
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

                    {/* ─── Contact Seller — Desktop (inside details column) ─── */}
                    <button
                        onClick={handleContactSeller}
                        className="hidden lg:flex w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Contact Seller
                    </button>
                </div>
            </div>

            {/* ─── Contact Seller — Mobile fixed bottom (hidden on desktop) ─── */}
            <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
                <div className="max-w-md mx-auto px-4 py-3">
                    <button
                        onClick={handleContactSeller}
                        className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Contact Seller
                    </button>
                </div>
            </div>

            {/* Secure-Pay Modal */}
            {showSecurePayModal && (
                <SecurePayModal
                    item={item}
                    onClose={() => setShowSecurePayModal(false)}
                    onProceed={handleSecurePayProceed}
                />
            )}
        </div>
    );
}