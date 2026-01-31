import { useState } from 'react';
import { ShieldCheck, Mail, Building2 } from 'lucide-react';
import logo from '../assets/unicycle-logo.png';

export default function Signup({ onSignup }) {
    const [step, setStep] = useState(1); // 1 = select university, 2 = enter email
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [email, setEmail] = useState('');
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
            setError('');
        }
    };

    const handleContinue = () => {
        if (!selectedUniversity) {
            setError('Please select your university');
            return;
        }
        setStep(2);
    };

    const handleEmailSubmit = () => {
        const emailDomain = email.substring(email.lastIndexOf('@'));

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        if (emailDomain !== selectedUniversity.domain) {
            setError(`Email must end with ${selectedUniversity.domain}`);
            return;
        }

        // Success!
        onSignup({ email, university: selectedUniversity.name });
    };

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

                {/* Step 1: University Selection */}
                {step === 1 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 animate-fadeIn">
                        <div className="flex items-center gap-2 mb-6">
                            <Building2 className="w-6 h-6 text-unicycle-blue" />
                            <h2 className="text-xl font-semibold text-gray-900">Select Your University</h2>
                        </div>

                        {/* DROPDOWN INSTEAD OF BUTTONS */}
                        <div className="mb-6">
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

                        {error && (
                            <p className="text-red-500 text-sm mb-4">{error}</p>
                        )}

                        <button
                            onClick={handleContinue}
                            disabled={!selectedUniversity}
                            className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Step 2: Email Entry */}
                {step === 2 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 animate-fadeIn">
                        <button
                            onClick={() => setStep(1)}
                            className="text-sm text-unicycle-blue hover:underline mb-4"
                        >
                            ← Change University
                        </button>

                        <div className="flex items-center gap-2 mb-2">
                            <Mail className="w-6 h-6 text-unicycle-blue" />
                            <h2 className="text-xl font-semibold text-gray-900">Verify Your Email</h2>
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                            Enter your {selectedUniversity.name} email address
                        </p>

                        {/* University Badge */}
                        <div className="bg-unicycle-blue/10 rounded-lg p-3 mb-6 border border-unicycle-blue/30">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-unicycle-blue" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{selectedUniversity.name}</p>
                                    <p className="text-xs text-gray-600">Email must end with {selectedUniversity.domain}</p>
                                </div>
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="mb-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                placeholder={`your.name${selectedUniversity.domain}`}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green focus:border-transparent"
                            />
                            {error && (
                                <p className="text-red-500 text-sm mt-2">{error}</p>
                            )}
                        </div>

                        <button
                            onClick={handleEmailSubmit}
                            className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors"
                        >
                            Continue
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            We'll send a verification link to your email
                        </p>
                    </div>
                )}

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