import { Settings, ShieldCheck, Package, Star } from 'lucide-react';

export default function Profile({ user: signupUser }) {
    const user = {
        name: signupUser.name,
        email: signupUser.email,
        university: signupUser.university,
        verified: true,
        memberSince: "February 2025",
        rating: 4.8,
        totalReviews: 15,
        itemsSold: 8,
        itemsBought: 12
    };

    const myListings = [
        {
            id: 1,
            title: "Chemistry Lab Coat",
            price: 20,
            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
            status: "Active",
            views: 23
        },
        {
            id: 2,
            title: "Graphing Calculator",
            price: 45,
            image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400",
            status: "Active",
            views: 31
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">

            {/* ─── GRADIENT HEADER ─── */}
            <div className="bg-gradient-to-r from-unicycle-blue to-unicycle-green text-white">
                <div className="max-w-md lg:max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold">Profile</h1>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <Settings className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Profile Info */}
                    <div className="flex items-center gap-4 lg:gap-6">
                        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-full flex items-center justify-center text-unicycle-blue font-bold text-3xl lg:text-4xl flex-shrink-0">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xl lg:text-2xl font-bold">{user.name}</h2>
                                {user.verified && <ShieldCheck className="w-5 h-5" />}
                            </div>
                            <p className="text-sm text-white/80">{user.university}</p>
                            <p className="text-xs text-white/60 mt-1">Member since {user.memberSince}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── BODY: 2-column on desktop, single on mobile ─── */}
            <div className="max-w-md lg:max-w-4xl mx-auto px-4 lg:grid lg:grid-cols-[280px_1fr] lg:gap-6 lg:pt-6">

                {/* ─── LEFT COLUMN: Stats + Verification ─── */}
                <div className="space-y-4">

                    {/* Stats Card - overlaps header on mobile */}
                    <div className="bg-white rounded-lg shadow-md p-4 -mt-6 lg:mt-0">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{user.rating}</div>
                                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    Rating
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{user.itemsSold}</div>
                                <div className="text-xs text-gray-500">Sold</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{user.itemsBought}</div>
                                <div className="text-xs text-gray-500">Bought</div>
                            </div>
                        </div>
                    </div>

                    {/* Verification Badge */}
                    <div className="bg-gradient-to-r from-unicycle-blue/10 to-unicycle-green/10 rounded-lg p-4 border-2 border-unicycle-blue/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-unicycle-blue rounded-lg">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">Verified {user.university} Student</h3>
                                <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── RIGHT COLUMN: Listings + Reviews ─── */}
                <div className="space-y-6 mt-4 lg:mt-0">

                    {/* My Listings */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                My Listings
                            </h3>
                            <span className="text-sm text-gray-500">{myListings.length} active</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {myListings.map((listing) => (
                                <div
                                    key={listing.id}
                                    className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex gap-3"
                                >
                                    <img
                                        src={listing.image}
                                        alt={listing.title}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{listing.title}</h4>
                                        <p className="text-lg font-bold text-unicycle-green">${listing.price}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-gray-500">{listing.views} views</span>
                                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                                {listing.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Reviews */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Star className="w-5 h-5" />
                            Recent Reviews
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Review 1 */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-unicycle-green rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                        S
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-gray-900">Sarah Chen</p>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">2 days ago</span>
                                </div>
                                <p className="text-sm text-gray-700">
                                    "Great seller! Item exactly as described. Met at McConnell Library, very smooth transaction."
                                </p>
                            </div>

                            {/* Review 2 */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-unicycle-blue rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                        M
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-gray-900">Mike Johnson</p>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">1 week ago</span>
                                </div>
                                <p className="text-sm text-gray-700">
                                    "Quick response, honest about condition. Highly recommend!"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── NO BOTTOM NAV — Layout handles it ─── */}
        </div>
    );
}