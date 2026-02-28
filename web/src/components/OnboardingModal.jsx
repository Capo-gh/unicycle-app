import { useState } from 'react';
import { Search, Tag, MessageCircle, X, ChevronRight } from 'lucide-react';

const STEPS = [
    {
        icon: Search,
        color: 'bg-blue-100 text-blue-600',
        title: 'Browse listings',
        description: 'Find textbooks, furniture, electronics, and more from students at your university.',
    },
    {
        icon: Tag,
        color: 'bg-green-100 text-unicycle-green',
        title: 'Post for free',
        description: 'List anything you no longer need. No fees, no commissions — just local, student-to-student.',
    },
    {
        icon: MessageCircle,
        color: 'bg-purple-100 text-purple-600',
        title: 'Message safely',
        description: 'Chat directly with buyers and sellers. Meet on campus to exchange.',
    },
];

export default function OnboardingModal({ onDismiss }) {
    const [step, setStep] = useState(0);

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            handleDismiss();
        }
    };

    const handleDismiss = () => {
        localStorage.setItem('hasSeenOnboarding', '1');
        onDismiss();
    };

    const { icon: Icon, color, title, description } = STEPS[step];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
                {/* Skip button */}
                <div className="flex justify-end px-4 pt-4">
                    <button
                        onClick={handleDismiss}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Skip"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Step content */}
                <div className="px-8 pb-6 text-center">
                    <div className={`w-20 h-20 rounded-2xl ${color} flex items-center justify-center mx-auto mb-5`}>
                        <Icon className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                </div>

                {/* Dots + CTA */}
                <div className="px-8 pb-8 flex items-center justify-between">
                    {/* Step dots */}
                    <div className="flex gap-1.5">
                        {STEPS.map((_, i) => (
                            <span
                                key={i}
                                className={`block h-2 rounded-full transition-all ${i === step ? 'w-6 bg-unicycle-green' : 'w-2 bg-gray-200'}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-1 px-5 py-2.5 bg-unicycle-green text-white rounded-xl font-semibold text-sm hover:bg-unicycle-green/90 transition-colors"
                    >
                        {step < STEPS.length - 1 ? (
                            <>Next <ChevronRight className="w-4 h-4" /></>
                        ) : (
                            "Let's go"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
