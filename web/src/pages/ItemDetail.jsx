import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, ShieldCheck, MessageCircle, Share2, Edit, Star, CheckCircle, ChevronRight, Heart } from 'lucide-react';
import SecurePayModal from './SecurePayModal';
import { getUserReviews } from '../api/reviews';
import { markAsSold, markAsUnsold } from '../api/listings';
import { createTransaction, getMyTransactions } from '../api/transactions';

export default function ItemDetail({ item, onBack, onContactSeller, onNavigate, onViewSellerProfile }) {
    const [showSecurePayModal, setShowSecurePayModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [sellerReviews, setSellerReviews] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSold, setIsSold] = useState(item?.is_sold || false);
    const [updating, setUpdating] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [expressingInterest, setExpressingInterest] = useState(false);
    const [alreadyInterested, setAlreadyInterested] = useState(false);

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

    // Update sold status when item changes
    useEffect(() => {
        setIsSold(item?.is_sold || false);
    }, [item?.is_sold]);

    // Check if user has already expressed interest in this item
    useEffect(() => {
        const checkInterestStatus = async () => {
            if (currentUser && item?.id) {
                try {
                    const myInterests = await getMyTransactions(true); // as_buyer = true
                    const existingInterest = myInterests.find(t => t.listing_id === item.id);
                    if (existingInterest) {
                        setAlreadyInterested(true);
                    }
                } catch (err) {
                    console.error('Error checking interest status:', err);
                }
            }
        };

        checkInterestStatus();
    }, [currentUser, item?.id]);

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

    const handleToggleSold = async () => {
        setUpdating(true);
        try {
            if (isSold) {
                await markAsUnsold(item.id);
                setIsSold(false);
            } else {
                await markAsSold(item.id);
                setIsSold(true);
            }
        } catch (err) {
            console.error('Error updating sold status:', err);
            alert('Failed to update listing status');
        } finally {
            setUpdating(false);
        }
    };

    const handleViewSellerProfile = () => {
        if (onViewSellerProfile) {
            onViewSellerProfile(item.seller_id);
        }
    };

    const handleExpressInterest = async () => {
        if (!currentUser) {
            alert('Please log in to express interest');
            return;
        }

        setExpressingInterest(true);
        try {
            await createTransaction(item.id);
            setAlreadyInterested(true);
            // Interest successfully expressed - button will now show "Message Seller"
        } catch (err) {
            console.error('Error expressing interest:', err);
            if (err.response?.data?.detail && err.response.data.detail.includes('already')) {
                // Already interested - just mark as interested
                setAlreadyInterested(true);
            } else {
                alert(err.response?.data?.detail || 'Failed to express interest. Please try again.');
            }
        } finally {
            setExpressingInterest(false);
        }
    };

    // Touch swipe handlers for image navigation
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && currentImageIndex < images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
        if (isRightSwipe && currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
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

                {/* Left: Image Gallery */}
                <div className="lg:flex-1">
                    <div
                        className="relative h-80 lg:h-auto lg:aspect-square lg:rounded-xl overflow-hidden bg-gray-100 touch-pan-y"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <img
                            src={images[currentImageIndex]}
                            alt={item.title}
                            className="w-full h-full object-contain select-none"
                        />

                        {/* Image counter / navigation */}
                        {images.length > 1 && (
                            <>
                                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                    {currentImageIndex + 1} / {images.length}
                                </div>
                                <div className="absolute bottom-4 left-4 flex gap-1">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Owner badge */}
                        {isOwner && (
                            <div className="absolute top-4 left-4 bg-unicycle-blue text-white px-3 py-1 rounded-full text-sm font-medium">
                                Your Listing
                            </div>
                        )}

                        {/* Sold badge */}
                        {isSold && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                SOLD
                            </div>
                        )}
                    </div>

                    {/* Thumbnail strip for multiple images */}
                    {images.length > 1 && (
                        <div className="flex gap-2 p-2 overflow-x-auto lg:mt-2">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${idx === currentImageIndex ? 'border-unicycle-green' : 'border-transparent'
                                        }`}
                                >
                                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
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
                            <div className={`text-3xl font-bold ${isSold ? 'text-gray-400 line-through' : 'text-unicycle-green'}`}>
                                ${item.price}
                            </div>
                        </div>
                        {isSold && !isOwner && (
                            <p className="text-red-600 text-sm font-medium">This item has been sold</p>
                        )}
                    </div>

                    {/* Seller Info - Clickable */}
                    <button
                        onClick={handleViewSellerProfile}
                        className="w-full bg-white rounded-lg p-4 shadow-sm text-left hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">Seller</h3>
                            <div className="flex items-center gap-1 text-unicycle-blue text-sm">
                                View Profile
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {item.seller?.name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{item.seller?.name || 'Unknown'}</span>
                                    <ShieldCheck className="w-4 h-4 text-unicycle-blue" />
                                    {isOwner && (
                                        <span className="text-xs bg-unicycle-blue/10 text-unicycle-blue px-2 py-0.5 rounded">
                                            You
                                        </span>
                                    )}
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
                    </button>

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

                    {/* Secure-Pay Info (only for buyers, not sold) */}
                    {!isOwner && !isSold && item.price >= 50 && (
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

                    {/* Owner Actions */}
                    {isOwner && (
                        <div className="hidden lg:flex flex-col gap-2">
                            <button
                                onClick={handleEditListing}
                                className="w-full bg-unicycle-blue text-white py-3 rounded-lg font-semibold hover:bg-unicycle-blue/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit className="w-5 h-5" />
                                Edit Listing
                            </button>
                            <button
                                onClick={handleToggleSold}
                                disabled={updating}
                                className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${isSold
                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                <CheckCircle className="w-5 h-5" />
                                {updating ? 'Updating...' : isSold ? 'Mark as Available' : 'Mark as Sold'}
                            </button>
                        </div>
                    )}

                    {/* I'm Interested / Message Seller Button - Desktop (only if not owner and not sold) */}
                    {!isOwner && !isSold && (
                        <button
                            onClick={alreadyInterested ? handleContactSeller : handleExpressInterest}
                            disabled={expressingInterest}
                            className="hidden lg:flex w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {alreadyInterested ? (
                                <>
                                    <MessageCircle className="w-5 h-5" />
                                    Message Seller
                                </>
                            ) : expressingInterest ? (
                                <>
                                    <Heart className="w-5 h-5" />
                                    Expressing Interest...
                                </>
                            ) : (
                                <>
                                    <Heart className="w-5 h-5" />
                                    I'm Interested
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
                <div className="max-w-md mx-auto px-4 py-3">
                    {isOwner ? (
                        <div className="flex gap-2">
                            <button
                                onClick={handleEditListing}
                                className="flex-1 bg-unicycle-blue text-white py-3 rounded-lg font-semibold hover:bg-unicycle-blue/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit className="w-5 h-5" />
                                Edit
                            </button>
                            <button
                                onClick={handleToggleSold}
                                disabled={updating}
                                className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${isSold
                                        ? 'bg-gray-200 text-gray-700'
                                        : 'bg-green-600 text-white'
                                    }`}
                            >
                                <CheckCircle className="w-5 h-5" />
                                {isSold ? 'Relist' : 'Sold'}
                            </button>
                        </div>
                    ) : isSold ? (
                        <div className="text-center py-2 text-gray-500 font-medium">
                            This item has been sold
                        </div>
                    ) : (
                        <button
                            onClick={alreadyInterested ? handleContactSeller : handleExpressInterest}
                            disabled={expressingInterest}
                            className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {alreadyInterested ? (
                                <>
                                    <MessageCircle className="w-5 h-5" />
                                    Message Seller
                                </>
                            ) : expressingInterest ? (
                                <>
                                    <Heart className="w-5 h-5" />
                                    Expressing...
                                </>
                            ) : (
                                <>
                                    <Heart className="w-5 h-5" />
                                    I'm Interested
                                </>
                            )}
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