import { useState } from 'react';
import { ShieldCheck, X, Lock, CheckCircle, Loader } from 'lucide-react';
import { createSecurePaySession } from '../api/payments';

export default function SecurePayModal({ item, onClose, onProceed }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSecurePay = async () => {
        setLoading(true);
        setError(null);
        try {
            const { checkout_url } = await createSecurePaySession(item.id);
            window.location.href = checkout_url;
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to start payment. Please try again.');
            setLoading(false);
        }
    };

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
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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

                    {/* Recommendation Banner — shown when opened from "Message Seller" */}
                    {onProceed && (
                        <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 flex items-start gap-3">
                            <span className="text-amber-500 text-lg flex-shrink-0">⭐</span>
                            <div>
                                <p className="font-semibold text-amber-800 text-sm">We recommend Secure-Pay for this item</p>
                                <p className="text-xs text-amber-700 mt-0.5">
                                    {item.price >= 80
                                        ? 'High-value purchases are best protected through escrow. Pay only after you inspect and approve the item in person.'
                                        : 'Escrow protection gives you peace of mind. Pay only after you inspect and approve the item in person.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Why Secure-Pay */}
                    <div className="bg-gradient-to-r from-unicycle-blue/10 to-unicycle-green/10 rounded-lg p-4 border border-unicycle-blue/30">
                        <div className="flex items-start gap-3">
                            <Lock className="w-5 h-5 text-unicycle-blue flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Why Secure-Pay?</h4>
                                <p className="text-sm text-gray-700">
                                    Your money is held securely in escrow and only released to the seller after you verify the item in person.
                                    {item.price >= 80
                                        ? ' We especially recommend it for this item.'
                                        : ' We recommend it for items over $80, but you can use it anytime.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">How It Works</h4>
                        <div className="space-y-4">
                            {[
                                { label: 'You pay through UniCycle', sub: 'Your payment is held securely in escrow' },
                                { label: 'Meet at the Safe Zone', sub: `Inspect the item at ${item.safeZone || item.safe_zone || 'a safe location'}` },
                                { label: 'Confirm or decline', sub: 'Accept if satisfied, or get a full refund' },
                                { label: 'Seller gets paid', sub: 'Payment released after your confirmation' },
                            ].map((step, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-8 h-8 bg-unicycle-green rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{i + 1}</div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 mb-1">{step.label}</p>
                                        <p className="text-sm text-gray-600">{step.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Protection Features */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        {[
                            'Full refund if item doesn\'t match description',
                            'Seller doesn\'t get paid until you approve',
                            'Dispute resolution if issues arise',
                        ].map((f) => (
                            <div key={f} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-gray-700">{f}</span>
                            </div>
                        ))}
                    </div>

                    {/* Fee Info */}
                    <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="font-medium text-gray-700 mb-1">Service Fee: 7% (${(item.price * 0.07).toFixed(2)})</p>
                        <p>This covers escrow protection, dispute resolution, and platform security.</p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 space-y-2">
                    {onProceed ? (
                        /* Opened from "Message Seller" — informational, payment is on the listing page */
                        <>
                            <button
                                onClick={onProceed}
                                className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors"
                            >
                                Continue to Chat
                            </button>
                            <button onClick={onClose} className="w-full text-gray-500 py-1.5 text-sm hover:text-gray-700 transition-colors">
                                Maybe Later
                            </button>
                        </>
                    ) : (
                        /* Opened from "Pay Securely" button on listing — full payment flow */
                        <>
                            {error && <p className="text-red-600 text-xs text-center">{error}</p>}
                            <button
                                onClick={handleSecurePay}
                                disabled={loading}
                                className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {loading && <Loader className="w-4 h-4 animate-spin" />}
                                {loading ? 'Redirecting to payment...' : `Pay Securely ($${((item.price || 0) * 1.07).toFixed(2)} CAD)`}
                            </button>
                            <button onClick={onClose} className="w-full text-gray-500 py-1.5 text-sm hover:text-gray-700 transition-colors">
                                Maybe Later
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
