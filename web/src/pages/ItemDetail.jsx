import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, ShieldCheck, MessageCircle, Share2, Edit, Star } from 'lucide-react';
import SecurePayModal from './SecurePayModal';
import { getUserReviews } from '../api/reviews';

export default function ItemDetail({ item, onBack, onContactSeller, onNavigate }) {
    const [showSecurePayModal, setShowSecurePayModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [sellerReviews, setSellerReviews] = useState(null);

    // Get current user from localStorage
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setCurrentUser(JSON.parse(userStr));
            } catch (e) {
                console.error('Error parsing user:', e);
            }
        }
    }, []);

    // Fetch seller reviews
    useEffect(() => {
        if (item?.seller_id) {
            fetchSellerReviews();
        }
    }, [item?.seller_id]);

    const fetchSellerReviews = async () => {
        try {
            const data = await getUserReviews(item.seller_id);
            setSellerReviews(data);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    };

    // Check if current user is the seller
    const isOwner = currentUser && item?.seller_id === currentUser.id;

    const handleContactSeller = () => {
        if (item.price >= 50) {
            setShowSecurePayModal(true);
        } else {
            onContactSeller({
                listingId: item.id,
                initialMessage: `Hi! Is "${item.title}" still available?`
            });
        }
    };

    const handleSecurePayProceed = () => {
        setShowSecurePayModal(false);
        onContactSeller({
            listingId: item.id,
            initialMessage: `Hi! I'm interested in "${item.title}" ($${item.price}). Is it still available?`
        });
    };

    const handleEditListing = () => {
        if (onNavigate) {
            onNavigate('edit-listing', item);
        }
    };

    // Get images from comma-separated list
    const getImages = () => {
        if (!item.images) return ['https://via.placeholder.com/400x400?text=No+Image'];
        return item.images.split(',').filter(img => img.trim());
    };

    const images = getImages();

    // Render stars
    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
        ));
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

            {/* Header */}
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

            {/* Body */}
            <div className="max-w-md lg:max-w-5xl mx-auto lg:flex lg:gap-8 lg:p-6">

                {/* Left: Image */}
                <div className="lg:flex-1">
                    <div className="relative h-80 lg:h-auto lg:aspect-square lg:rounded-xl overflow-hidden">
                        <img
                            src={images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                        {images.length > 1 && (
                            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                1 / {images.length}
                            </div>
                        )}
                        {isOwner && (
                            <div className="absolute top-4 left-4 bg-unicycle-blue text-white px-3 py-1 rounded-full text-sm font-medium">
                                Your Listing
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Details */}
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
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-unicycle-green">${item.price}</div>
                        </div>
                    </div>

                    {/* Seller Info with Reviews */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">Seller</h3>
                            {isOwner && (
                                <span className="text-xs bg-unicycle-blue/10 text-unicycle-blue px-2 py-1 rounded">
                                    This is you
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {item.seller?.name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{item.seller?.name || 'Unknown'}</span>
                                    <ShieldCheck className="w-4 h-4 text-unicycle-blue" />
                                </div>
                                <p className="text-sm text-gray-600">{item.seller?.university || ''}</p>

                                {/* Rating */}
                                {sellerReviews && sellerReviews.review_count > 0 && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="flex">{renderStars(sellerReviews.avg_rating)}</div>
                                        <span className="text-sm text-gray-600">
                                            ({sellerReviews.avg_rating.toFixed(1)}) • {sellerReviews.review_count} review{sellerReviews.review_count !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm">
                                <ShieldCheck className="w-4 h-4 text-unicycle-blue" />
                                <span className="text-gray-700">Verified Student</span>
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
                                <p className="text-sm font-medium text-gray-900">{item.safeZone || item.safe_zone}</p>
                                <p className="text-xs text-gray-600 mt-1">{item.safeZoneAddress || item.safe_zone_address}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    ✓ Well-lit public area • Security cameras • Student traffic
                                </p>
                                <button
                                    onClick={() => {
                                        const address = encodeURIComponent(`${item.safeZone || item.safe_zone}, ${item.safeZoneAddress || item.safe_zone_address}, Montreal, QC`);
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

                    {/* Secure-Pay Info (only for buyers) */}
                    {!isOwner && item.price >= 50 && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-unicycle-blue rounded-lg">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">Secure-Pay Protected</h3>
                                    <p className="text-xs text-gray-600">
                                        This item qualifies for escrow protection. Your payment is held securely until you verify the item in person.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons – Desktop */}
                    {isOwner ? (
                        <button
                            onClick={handleEditListing}
                            className="hidden lg:flex w-full bg-unicycle-blue text-white py-3 rounded-lg font-semibold hover:bg-unicycle-blue/90 transition-colors items-center justify-center gap-2"
                        >
                            <Edit className="w-5 h-5" />
                            Edit Listing
                        </button>
                    ) : (
                        <button
                            onClick={handleContactSeller}
                            className="hidden lg:flex w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Contact Seller
                        </button>
                    )}
                </div>
            </div>

            {/* Action Buttons – Mobile */}
            <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
                <div className="max-w-md mx-auto px-4 py-3">
                    {isOwner ? (
                        <button
                            onClick={handleEditListing}
                            className="w-full bg-unicycle-blue text-white py-3 rounded-lg font-semibold hover:bg-unicycle-blue/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <Edit className="w-5 h-5" />
                            Edit Listing
                        </button>
                    ) : (
                        <button
                            onClick={handleContactSeller}
                            className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Contact Seller
                        </button>
                    )}
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