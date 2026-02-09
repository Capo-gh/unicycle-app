import { useState } from 'react';
import { Mail, User, Building2, ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';
import { signup, login } from '../api/auth';

// Import logo
import logo from '../assets/unicycle-icon.png';

export default function Signup({ onSignup }) {
    const [isLogin, setIsLogin] = useState(false);
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const universities = [
        { name: 'McGill University', domain: 'mail.mcgill.ca' },
        { name: 'Concordia University', domain: 'concordia.ca' },
        { name: 'Université de Montréal', domain: 'umontreal.ca' },
        { name: 'UQAM', domain: 'uqam.ca' },
        { name: 'HEC Montréal', domain: 'hec.ca' }
    ];

    const selectedUni = universities.find(u => u.name === selectedUniversity);

    const validateEmail = () => {
        if (!selectedUni) return true;
        return email.endsWith(`@${selectedUni.domain}`);
    };

    const handleSubmit = async () => {
        setError('');

        if (isLogin) {
            if (!email || !password) {
                setError('Please fill in all fields');
                return;
            }
        } else {
            if (!selectedUniversity || !email || !name || !password) {
                setError('Please fill in all fields');
                return;
            }
            // TEMPORARY: Disabled for testing with Resend test mode
            // if (!validateEmail()) {
            //     setError(`Email must end with @${selectedUni.domain}`);
            //     return;
            // }
            if (password.length < 6) {
                setError('Password must be at least 6 characters');
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
                    university: selectedUniversity,
                    password: password
                });
            }

            localStorage.setItem('token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            onSignup(response.user);

        } catch (err) {
            console.error('Auth error:', err);
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else {
                setError(isLogin ? 'Login failed. Please check your credentials.' : 'Signup failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4 py-8">
            {/* Logo */}
            <div className="mb-6">
                <img src={logo} alt="UniCycle" className="h-16 w-auto" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Welcome Back!' : 'Welcome to UniCycle'}
            </h1>
            <p className="text-gray-600 mb-8">
                {isLogin ? 'Sign in to your account' : 'The trusted student marketplace'}
            </p>

            {/* Form Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-5">

                {/* University Selector (Signup only) */}
                {!isLogin && (
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Building2 className="w-4 h-4" />
                            Select Your University
                        </label>
                        <select
                            value={selectedUniversity}
                            onChange={(e) => {
                                setSelectedUniversity(e.target.value);
                                setEmail('');
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        >
                            <option value="">Choose your university</option>
                            {universities.map(uni => (
                                <option key={uni.name} value={uni.name}>{uni.name}</option>
                            ))}
                        </select>
                        {selectedUni && (
                            <p className="text-xs text-gray-500 mt-1">
                                Email domain: @{selectedUni.domain}
                            </p>
                        )}
                    </div>
                )}

                {/* Email */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4" />
                        {isLogin ? 'Email' : 'Your University Email'}
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={isLogin ? "your@email.com" : (selectedUni ? `username@${selectedUni.domain}` : "Select university first")}
                        disabled={!isLogin && !selectedUniversity}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green disabled:bg-gray-100"
                    />
                    {!isLogin && (
                        <p className="text-xs text-gray-500 mt-1">We'll verify your student status</p>
                    )}
                </div>

                {/* Name (Signup only) */}
                {!isLogin && (
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <User className="w-4 h-4" />
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="How others will see you"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        />
                    </div>
                )}

                {/* Password */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Lock className="w-4 h-4" />
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
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
                            <p className="text-xs text-gray-600">Email must end with @{selectedUni.domain}</p>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || (!isLogin && (!selectedUniversity || !email || !name || !password)) || (isLogin && (!email || !password))}
                    className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            {isLogin ? 'Signing in...' : 'Creating account...'}
                        </>
                    ) : (
                        isLogin ? 'Sign In' : 'Create Account'
                    )}
                </button>

                {/* Toggle between Login/Signup */}
                <div className="text-center pt-2">
                    <p className="text-sm text-gray-600">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={toggleMode}
                            className="ml-2 text-unicycle-blue font-semibold hover:underline"
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>

            {/* Footer */}
            <p className="text-xs text-gray-500 mt-6 text-center max-w-md">
                By continuing, you agree to UniCycle's Terms of Service and Privacy Policy.
                Only verified students can access the marketplace.
            </p>
        </div>
    );
}