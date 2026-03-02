import { useState } from 'react';
import { Mail, User, Building2, ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { signup, login, forgotPassword } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import LanguageToggle from '../components/LanguageToggle';

// Import logo
import logo from '../assets/unicycle-icon.png';

export default function Signup() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setUser } = useAuthStore();
    const [isLogin, setIsLogin] = useState(false);
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotSent, setForgotSent] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);

    const universities = [
        { name: 'McGill University', domains: ['mail.mcgill.ca'] },
        { name: 'Concordia University', domains: ['live.concordia.ca', 'concordia.ca'] },
        { name: 'École de technologie supérieure (ÉTS)', domains: ['ens.etsmtl.ca'] },
        { name: 'Polytechnique Montréal', domains: ['polymtl.ca'] },
        { name: 'Université de Montréal (UdeM)', domains: ['umontreal.ca', 'iro.umontreal.ca'] },
        { name: 'Université du Québec à Montréal (UQAM)', domains: ['courrier.uqam.ca', 'uqam.ca'] },
        { name: 'Université Laval', domains: ['ulaval.ca'] },
        { name: 'Université de Sherbrooke', domains: ['usherbrooke.ca'] },
        { name: 'HEC Montréal', domains: ['hec.ca'] },
    ];

    const selectedUni = universities.find(u => u.name === selectedUniversity);

    const validateEmail = () => {
        if (!selectedUni) return true;
        return selectedUni.domains.some(d => email.endsWith(`@${d}`));
    };

    const handleSubmit = async () => {
        setError('');

        if (isLogin) {
            if (!email || !password) {
                setError(t('auth.fillAllFields'));
                return;
            }
        } else {
            if (!selectedUniversity || !email || !name) {
                setError(t('auth.fillAllFields'));
                return;
            }
            if (!validateEmail()) {
                setError(`Email must end with ${selectedUni.domains.map(d => `@${d}`).join(' or ')}`);
                return;
            }
        }

        setLoading(true);

        try {
            let response;

            if (isLogin) {
                response = await login({
                    email: email,
                    password: password
                });
            } else {
                response = await signup({
                    email: email,
                    name: name,
                    university: selectedUniversity
                });
            }

            if (!isLogin) {
                localStorage.setItem('pendingVerificationEmail', email);
                navigate('/check-email', { state: { email } });
            } else {
                localStorage.setItem('token', response.access_token);
                setUser(response.user);
                navigate('/browse', { replace: true });
            }

        } catch (err) {
            console.error('Auth error:', err);
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else {
                setError(isLogin ? t('auth.loginFailed') : t('auth.signupFailed'));
            }

        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
    };

    const handleForgotPassword = async () => {
        if (!forgotEmail) return;
        setForgotLoading(true);
        try {
            await forgotPassword(forgotEmail);
            setForgotSent(true);
        } catch {
            setForgotSent(true); // Always show success to avoid email enumeration
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4 py-8">
            {/* Language Toggle */}
            <div className="absolute top-4 right-4">
                <LanguageToggle />
            </div>

            {/* Logo */}
            <div className="mb-6">
                <img src={logo} alt="UniCycle" className="h-16 w-auto" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isLogin ? t('auth.welcomeBack') : t('auth.welcomeTo')}
            </h1>
            <p className="text-gray-600 mb-8">
                {isLogin ? t('auth.signInToAccount') : t('auth.trustedMarketplace')}
            </p>

            {/* Form Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-5">

                {showForgotPassword ? (
                    /* Forgot Password View */
                    <>
                        <h2 className="text-lg font-bold text-gray-900">Reset Password</h2>
                        {forgotSent ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                                If an account exists with that email, you will receive a reset link shortly. Check your inbox.
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-600">Enter your university email and we&apos;ll send you a reset link.</p>
                                <input
                                    type="email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    placeholder="your@university.ca"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                                />
                                <button
                                    onClick={handleForgotPassword}
                                    disabled={forgotLoading || !forgotEmail}
                                    className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors disabled:opacity-50"
                                >
                                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => { setShowForgotPassword(false); setForgotSent(false); setForgotEmail(''); }}
                            className="w-full text-center text-sm text-unicycle-blue hover:underline"
                        >
                            Back to Login
                        </button>
                    </>
                ) : (
                    /* Main Login / Signup View */
                    <>
                        {/* University Selector (Signup only) */}
                        {!isLogin && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Building2 className="w-4 h-4" />
                                    {t('auth.selectUniversity')}
                                </label>
                                <select
                                    value={selectedUniversity}
                                    onChange={(e) => {
                                        setSelectedUniversity(e.target.value);
                                        setEmail('');
                                    }}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                                >
                                    <option value="">{t('auth.chooseUniversity')}</option>
                                    {universities.map(uni => (
                                        <option key={uni.name} value={uni.name}>{uni.name}</option>
                                    ))}
                                </select>
                                {selectedUni && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {t('auth.emailDomain')}: {selectedUni.domains.map(d => `@${d}`).join(' or ')}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Mail className="w-4 h-4" />
                                {isLogin ? 'Email' : t('auth.universityEmail')}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={isLogin ? "your@email.com" : (selectedUni ? `username@${selectedUni.domains[0]}` : t('auth.chooseUniversity'))}
                                disabled={!isLogin && !selectedUniversity}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green disabled:bg-gray-100"
                            />
                            {!isLogin && (
                                <p className="text-xs text-gray-500 mt-1">{t('auth.emailVerification')}</p>
                            )}
                        </div>

                        {/* Name (Signup only) */}
                        {!isLogin && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4" />
                                    {t('auth.yourName')}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t('auth.howOthersSeeYou')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                                />
                            </div>
                        )}

                        {/* Password (Login only) */}
                        {isLogin && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Lock className="w-4 h-4" />
                                        {t('auth.password')}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotPassword(true)}
                                        className="text-xs text-unicycle-blue hover:underline"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t('auth.enterPassword')}
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
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Verified Badge (Signup only) */}
                        {!isLogin && selectedUni && (
                            <div className="flex items-center gap-3 bg-unicycle-blue/10 p-3 rounded-lg border border-unicycle-blue/30">
                                <ShieldCheck className="w-5 h-5 text-unicycle-blue" />
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{selectedUni.name}</p>
                                    <p className="text-xs text-gray-600">Email: {selectedUni.domains.map(d => `@${d}`).join(' or ')}</p>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || (!isLogin && (!selectedUniversity || !email || !name)) || (isLogin && (!email || !password))}
                            className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    {isLogin ? t('auth.signingIn') : t('auth.creatingAccount')}
                                </>
                            ) : (
                                isLogin ? t('auth.signIn') : t('auth.createAccount')
                            )}
                        </button>

                        {/* Toggle between Login/Signup */}
                        <div className="text-center pt-2">
                            <p className="text-sm text-gray-600">
                                {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
                                <button
                                    onClick={toggleMode}
                                    className="ml-2 text-unicycle-blue font-semibold hover:underline"
                                >
                                    {isLogin ? t('auth.signUp') : t('auth.signIn')}
                                </button>
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Footer */}
            <p className="text-xs text-gray-500 mt-6 text-center max-w-md">
                By continuing, you agree to UniCycle's{' '}
                <a href="/terms" className="underline hover:text-gray-700">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="underline hover:text-gray-700">Privacy Policy</a>.
                Only verified students can access the marketplace.
            </p>
        </div>
    );
}
