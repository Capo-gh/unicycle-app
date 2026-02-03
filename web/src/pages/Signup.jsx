import { useState } from 'react';
import { ShieldCheck, Mail, Building2, User } from 'lucide-react';
import logo from '../assets/unicycle-logo.png';
import VerificationSuccess from './VerificationSuccess';

export default function Signup({ onSignup }) {
    const [step, setStep] = useState(1); // 1 = signup form, 2 = verification success
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const universities = [
        { name: 'McGill University', domain: '@mail.mcgill.ca' },
        { name: 'Concordia University', domain: '@live.concordia.ca' },
        { name: 'École de technologie supérieure (ÉTS)', domain: '@ens.etsmtl.ca' },
        { name: 'Polytechnique Montréal', domain: '@polymtl.ca' },
        { name: 'Université de Montréal (UdeM)', domain: '@umontreal.ca' },
        { name: 'Université du Québec à Montréal (UQAM)', domain: '@courrier.uqam.ca' },
        { name: 'Université Laval', domain: '@ulaval.ca' },
        { name: 'Université de Sherbrooke', domain: '@usherbrooke.ca' }
    ];

    const handleUniversitySelect = (e) => {
        const uni = universities.find(u => u.name === e.target.value);
        if (uni) {
            setSelectedUniversity(uni);
            setEmail(''); // Clear email when switching universities
            setError('');
        }
    };

    const handleEmailSubmit = () => {
        if (!selectedUniversity) {
            setError('Please select your university');
            return;
        }

        const emailDomain = email.substring(email.lastIndexOf('@'));

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        if (emailDomain !== selectedUniversity.domain) {
            setError(`Email must end with ${selectedUniversity.domain}`);
            return;
        }

        if (!name.trim() || name.trim().length < 2) {
            setError('Please enter your full name');
            return;
        }

        // Success! Show verification success screen
        setStep(2);
    };

    // Step 2: Verification Success
    if (step === 2) {
        return (
            <VerificationSuccess
                userData={{ email, university: selectedUniversity.name, name }}
                onContinue={() => onSignup({ email, university: selectedUniversity.name, name })}
            />
        );
    }

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
                    <h1 className="text-3xl font-bold text-gray-900">Welcome to UniCycle</h1>
                    <p className="text-gray-600 mt-2">The trusted student marketplace</p>
                </div>

                {/* Single Step Form */}
                <div className="bg-white rounded-2xl shadow-xl p-6 animate-fadeIn">
                    {/* University Selection */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Building2 className="w-5 h-5 text-unicycle-blue" />
                            <label className="text-sm font-semibold text-gray-900">Select Your University</label>
                        </div>

                        <select
                            value={selectedUniversity.name || ''}
                            onChange={handleUniversitySelect}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green focus:border-transparent bg-white text-gray-900"
                        >
                            <option value="">Choose your university...</option>
                            {universities.map((uni) => (
                                <option key={uni.name} value={uni.name}>
                                    {uni.name}
                                </option>
                            ))}
                        </select>

                        {/* Show selected domain */}
                        {selectedUniversity && (
                            <p className="text-xs text-gray-500 mt-2">
                                Email domain: {selectedUniversity.domain}
                            </p>
                        )}
                    </div>

                    {/* Email Input - Only enabled after university selection */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Mail className="w-5 h-5 text-unicycle-blue" />
                            <label className="text-sm font-semibold text-gray-900">Your University Email</label>
                        </div>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            disabled={!selectedUniversity}
                            placeholder={
                                selectedUniversity
                                    ? `your.name${selectedUniversity.domain}`
                                    : 'Select university first'
                            }
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${selectedUniversity
                                ? 'border-gray-200 focus:ring-2 focus:ring-unicycle-green focus:border-transparent bg-white'
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                                }`}
                        />

                        {selectedUniversity && (
                            <p className="text-xs text-gray-500 mt-2">
                                We'll send a verification link to your email
                            </p>
                        )}
                    </div>

                    {/* Name Input */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <User className="w-5 h-5 text-unicycle-blue" />
                            <label className="text-sm font-semibold text-gray-900">Your Name</label>
                        </div>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError('');
                            }}
                            disabled={!selectedUniversity}
                            placeholder="e.g., Sarah Chen"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${selectedUniversity
                                ? 'border-gray-200 focus:ring-2 focus:ring-unicycle-green focus:border-transparent bg-white'
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                                }`}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* University Badge - Shows after selection */}
                    {selectedUniversity && (
                        <div className="bg-unicycle-blue/10 rounded-lg p-3 mb-6 border border-unicycle-blue/30">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-unicycle-blue" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{selectedUniversity.name}</p>
                                    <p className="text-xs text-gray-600">Email must end with {selectedUniversity.domain}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Continue Button */}
                    <button
                        onClick={handleEmailSubmit}
                        disabled={!selectedUniversity || !email || !name.trim()}
                        className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Continue
                    </button>
                </div>

                {/* Trust Badge */}
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                        <ShieldCheck className="w-4 h-4 text-unicycle-blue" />
                        <span>Verified students only • Safe & secure</span>
                    </div>
                </div>
            </div>
        </div>
    );
}