import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Mail, Loader, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../api/client';
import { setPassword } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setUser } = useAuthStore();
    const [status, setStatus] = useState('verifying'); // verifying, success, error, expired, set_password
    const [message, setMessage] = useState('');
    const [resending, setResending] = useState(false);
    const [verificationToken, setVerificationToken] = useState('');
    const [password, setPasswordInput] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [settingPassword, setSettingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            // Get token from URL and clean it
            let token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link. Please check your email for the correct link.');
                return;
            }

            // Clean token: trim whitespace and decode if needed
            token = decodeURIComponent(token.trim());

            try {
                const response = await client.post('/auth/verify-email', null, {
                    params: { token }
                });

                // Check if user needs to set password
                if (response.data.needs_password) {
                    setStatus('set_password');
                    setMessage(response.data.message || 'Email verified! Now set your password.');
                    setVerificationToken(response.data.token);
                } else {
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

                    setTimeout(() => {
                        navigate('/browse', { replace: true });
                    }, 2000);
                }

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
    }, []);

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

    const handleSetPassword = async () => {
        setPasswordError('');

        // Validate password
        if (!password || password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        setSettingPassword(true);

        try {
            const response = await setPassword(verificationToken, password);

            // Save token and user
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));

            // Show success and login
            setStatus('success');
            setMessage('Password set successfully! Logging you in...');

            setTimeout(() => {
                setUser(response.user);
                navigate('/browse', { replace: true });
            }, 1500);

        } catch (err) {
            console.error('Set password error:', err);
            setPasswordError(err.response?.data?.detail || 'Failed to set password. Please try again.');
        } finally {
            setSettingPassword(false);
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
                            onClick={() => navigate('/signup')}
                            className="w-full py-3 bg-unicycle-blue text-white rounded-lg font-semibold hover:bg-unicycle-blue/90 transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                )}

                {/* Set Password State */}
                {status === 'set_password' && (
                    <div>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                            Email Verified!
                        </h2>
                        <p className="text-gray-600 mb-6 text-center">
                            {message}
                        </p>

                        {/* Password Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Lock className="w-4 h-4" />
                                    Create Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPasswordInput(e.target.value)}
                                        placeholder="Min 6 characters"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Lock className="w-4 h-4" />
                                    Confirm Password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                                />
                            </div>

                            {passwordError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-red-600 text-sm">{passwordError}</p>
                                </div>
                            )}

                            <button
                                onClick={handleSetPassword}
                                disabled={settingPassword || !password || !confirmPassword}
                                className="w-full py-3 bg-unicycle-green text-white rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {settingPassword ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Setting Password...
                                    </>
                                ) : (
                                    'Set Password & Continue'
                                )}
                            </button>
                        </div>
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
