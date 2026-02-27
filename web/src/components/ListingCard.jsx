import { ShieldCheck, Heart } from 'lucide-react';

export default function ListingCard({ item, onClick, isSaved = false, onToggleSave }) {
    const handleHeartClick = (e) => {
        e.stopPropagation();
        if (onToggleSave) onToggleSave(item.id);
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
            {/* Image */}
            <div className="relative aspect-[3/2]">
                <img
                    src={item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                />
                {item.condition && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                        {item.condition}
                    </div>
                )}
                {onToggleSave && (
                    <button
                        onClick={handleHeartClick}
                        className="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform"
                        aria-label={isSaved ? 'Remove from saved' : 'Save item'}
                    >
                        <Heart
                            className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                        />
                    </button>
                )}
            </div>

            {/* Details */}
            <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                    {item.title}
                </h3>

                <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-unicycle-green">
                        {item.price === 0 ? 'Free' : `$${item.price}`}
                    </span>
                    <span className="text-xs text-gray-500">{item.category}</span>
                </div>

                {/* Seller Info */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-unicycle-blue to-unicycle-green flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                        {item.seller?.avatar_url
                            ? <img src={item.seller.avatar_url} alt={item.seller.name} className="w-full h-full object-cover" />
                            : (item.seller?.name?.charAt(0) || '?')
                        }
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-1">
                        <span className="text-xs text-gray-600 truncate">
                            {item.seller?.name || 'Unknown'}
                        </span>
                        {item.seller?.is_verified && (
                            <ShieldCheck className="w-3 h-3 text-unicycle-blue flex-shrink-0" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
