import { ShieldCheck, ArrowRight } from 'lucide-react';
import logo from '../assets/unicycle-logo.png';

export default function VerificationSuccess({ userData, onContinue }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-unicycle-blue/10 to-unicycle-green/10 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <img
                            src={logo}
                            alt="UniCycle"
                            className="h-16 w-auto"
                        />
                    </div>
                </div>

                {/* Success Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fadeIn">
                    {/* Success Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-unicycle-green to-unicycle-blue rounded-full mb-6">
                        <ShieldCheck className="w-12 h-12 text-white" />
                    </div>

                    {/* Success Message */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">You're Verified! 🎉</h2>
                    <p className="text-gray-600 mb-6">
                        Welcome to {userData.university}'s trusted student marketplace
                    </p>

                    {/* Verification Details */}
                    <div className="bg-gradient-to-r from-unicycle-blue/10 to-unicycle-green/10 rounded-lg p-4 mb-6 border-2 border-unicycle-green/30">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <ShieldCheck className="w-5 h-5 text-unicycle-blue" />
                            <span className="font-semibold text-gray-900">Verified {userData.university} Student</span>
                        </div>
                        <p className="text-sm text-gray-700">{userData.email}</p>
                        <p className="text-xs text-gray-600 mt-1">{userData.university}</p>
                    </div>

                    {/* Benefits */}
                    <div className="text-left mb-6 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-unicycle-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Buy & sell with verified students only</p>
                                <p className="text-xs text-gray-600">No scammers, no strangers</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-unicycle-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Meet at Safe Zones on campus</p>
                                <p className="text-xs text-gray-600">Well-lit, public, secure locations</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-unicycle-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Secure-Pay protection for high-value items</p>
                                <p className="text-xs text-gray-600">Your payment is protected until verified</p>
                            </div>
                        </div>
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={onContinue}
                        className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors flex items-center justify-center gap-2"
                    >
                        Start Browsing
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Trust Badge */}
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                        <ShieldCheck className="w-4 h-4 text-unicycle-blue" />
                        <span>Part of {userData.university}'s trusted student community</span>
                    </div>
                </div>
            </div>
        </div>
    );
}