import { ShieldCheck, X, Lock, CheckCircle } from 'lucide-react';

export default function SecurePayModal({ item, onClose, onProceed }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-unicycle-blue/10 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-unicycle-blue" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Secure-Pay Protection</h3>
                            <p className="text-xs text-gray-600">Escrow for your safety</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* Item Info */}
                    <div className="flex gap-3 items-center pb-4 border-b border-gray-200">
                        <img
                            src={item.images ? item.images.split(',')[0] : 'https://via.placeholder.com/64'}
                            alt={item.title}
                            className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                            <p className="text-2xl font-bold text-unicycle-green">${item.price}</p>
                        </div>
                    </div>

                    {/* Why Secure-Pay */}
                    <div className="bg-gradient-to-r from-unicycle-blue/10 to-unicycle-green/10 rounded-lg p-4 border border-unicycle-blue/30">
                        <div className="flex items-start gap-3 mb-3">
                            <Lock className="w-5 h-5 text-unicycle-blue flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Why Secure-Pay?</h4>
                                <p className="text-sm text-gray-700">
                                    This item qualifies for escrow protection because it's over $80. Your money stays safe until you verify the item in person.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">How It Works</h4>
                        <div className="space-y-4">
                            {/* Step 1 */}
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-unicycle-green rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    1
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 mb-1">You pay through UniCycle</p>
                                    <p className="text-sm text-gray-600">Your payment is held securely in escrow</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-unicycle-green rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    2
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 mb-1">Meet at the Safe Zone</p>
                                    <p className="text-sm text-gray-600">Inspect the item at {item.safeZone || item.safe_zone}</p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-unicycle-green rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    3
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 mb-1">Confirm or decline</p>
                                    <p className="text-sm text-gray-600">Accept if satisfied, or get a full refund</p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-unicycle-green rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    4
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 mb-1">Seller gets paid</p>
                                    <p className="text-sm text-gray-600">Payment released after your confirmation</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Protection Features */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">Full refund if item doesn't match description</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">Seller doesn't get paid until you approve</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">Dispute resolution if issues arise</span>
                        </div>
                    </div>

                    {/* Fee Info */}
                    <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="font-medium text-gray-700 mb-1">Service Fee: 7% (${(item.price * 0.07).toFixed(2)})</p>
                        <p>This covers escrow protection, dispute resolution, and platform security.</p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 space-y-2">
                    <button
                        onClick={onProceed}
                        className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors"
                    >
                        Contact Seller (Secure-Pay)
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
}