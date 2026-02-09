import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Mail, Loader } from 'lucide-react';
import client from '../api/client';

export default function VerifyEmail({ onNavigate }) {
    const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
    const [message, setMessage] = useState('');
    const [resending, setResending] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            // Get token from URL
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link. Please check your email for the correct link.');
                return;
            }

            try {
                const response = await client.post('/auth/verify-email', null, {
                    params: { token }
                });

                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');

                // Update user in localStorage
                if (response.data.user) {
                    const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
                    localStorage.setItem('user', JSON.stringify({
                        ...existingUser,
                        is_verified: true
                    }));
                }

                // Redirect to listings after 2 seconds
                setTimeout(() => {
                    onNavigate('listings');
                }, 2000);

            } catch (err) {
                console.error('Verification error:', err);
                if (err.response?.data?.detail?.includes('expired')) {
                    setStatus('expired');
                    setMessage('Verification link expired. Please request a new one.');
                } else {
                    setStatus('error');
                    setMessage(err.response?.data?.detail || 'Verification failed. Please try again.');
                }
            }
        };

        verifyToken();
    }, [onNavigate]);

    const handleResend = async () => {
        setResending(true);
        try {
            await client.post('/auth/resend-verification');
            setMessage('Verification email sent! Please check your inbox.');
            setStatus('success');
        } catch (err) {
            console.error('Resend error:', err);
            setMessage(err.response?.data?.detail || 'Failed to resend email. Please try again.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-unicycle-blue to-unicycle-green flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">

                {/* Verifying State */}
                {status === 'verifying' && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-unicycle-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Loader className="w-8 h-8 text-unicycle-blue animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Verifying Your Email...
                        </h2>
                        <p className="text-gray-600">
                            Please wait while we confirm your student email address.
                        </p>
                    </div>
                )}

                {/* Success State */}
                {status === 'success' && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Email Verified!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>
                        <p className="text-sm text-gray-500">
                            Redirecting you to the marketplace...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {status === 'error' && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Verification Failed
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>
                        <button
                            onClick={() => onNavigate('signup')}
                            className="w-full py-3 bg-unicycle-blue text-white rounded-lg font-semibold hover:bg-unicycle-blue/90 transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                )}

                {/* Expired State */}
                {status === 'expired' && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Link Expired
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="w-full py-3 bg-unicycle-green text-white rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {resending ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-5 h-5" />
                                    Resend Verification Email
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
