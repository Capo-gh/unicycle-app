import { Mail, RefreshCw } from 'lucide-react';
import { resendVerification } from '../api/auth';
import { useState } from 'react';

export default function CheckEmail({ userEmail, onNavigate }) {
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState('');

    const handleResend = async () => {
        setResending(true);
        setMessage('');
        try {
            await resendVerification();
            setMessage('Verification email resent! Check your inbox.');
        } catch (err) {
            setMessage('Failed to resend email. Please try again.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-unicycle-blue to-unicycle-green flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                {/* Icon */}
                <div className="w-20 h-20 bg-unicycle-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-10 h-10 text-unicycle-blue" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Check Your Email!
                </h1>

                {/* Message */}
                <p className="text-gray-600 mb-2">
                    We've sent a verification link to:
                </p>
                <p className="text-unicycle-blue font-semibold mb-6">
                    {userEmail}
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm text-gray-700 mb-2">
                        <strong>Next steps:</strong>
                    </p>
                    <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                        <li>Check your inbox (and spam folder)</li>
                        <li>Click the verification link in the email</li>
                        <li>You'll be redirected back to browse listings!</li>
                    </ol>
                </div>

                {/* Resend button */}
                <button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-unicycle-blue text-unicycle-blue hover:bg-unicycle-blue hover:text-white rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                </button>

                {message && (
                    <p className={`mt-4 text-sm ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                        {message}
                    </p>
                )}

                {/* Back to login */}
                <button
                    onClick={() => onNavigate('login')}
                    className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
}
