import { useNavigate } from 'react-router-dom';
import logo from '../assets/unicycle-logo.png';
import icon from '../assets/unicycle-icon.png';

const UNIVERSITIES = [
    'McGill University',
    'Concordia University',
    'École de technologie supérieure (ÉTS)',
    'Polytechnique Montréal',
    'Université de Montréal',
    'UQAM',
    'HEC Montréal',
    'Université Laval',
    'Université de Sherbrooke',
];

const FEATURES = [
    {
        icon: '🛒',
        title: 'Browse & Buy',
        desc: 'Find textbooks, electronics, furniture, and more — listed by students at your university.',
    },
    {
        icon: '📦',
        title: 'Sell in Seconds',
        desc: 'Post a listing in under a minute. Set a price, add photos, and start receiving messages.',
    },
    {
        icon: '💬',
        title: 'Chat Safely',
        desc: 'Message buyers and sellers directly within the app. No phone numbers needed.',
    },
    {
        icon: '🔒',
        title: 'Secure Pay',
        desc: 'Optional escrow payments hold funds safely until you confirm your item arrived.',
    },
    {
        icon: '🆓',
        title: 'Free Listings',
        desc: 'Giving something away? Post it for free — no price required.',
    },
    {
        icon: '🏫',
        title: 'All Montreal',
        desc: 'Browse your own campus or open it up to all Montreal universities at once.',
    },
];

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Nav */}
            <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <img src={logo} alt="UniCycle" className="h-8" onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                }} />
                <div className="hidden items-center gap-2" style={{ display: 'none' }}>
                    <img src={icon} alt="" className="w-7 h-7" />
                    <span className="font-bold text-xl text-gray-900">UniCycle</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/signup', { state: { mode: 'login' } })}
                        className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2"
                    >
                        Log in
                    </button>
                    <button
                        onClick={() => navigate('/signup')}
                        className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                        Sign up free
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-b from-green-50 to-white">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                    <span>🎓</span> Built for Montreal students
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 max-w-3xl leading-tight mb-6">
                    Buy and sell{' '}
                    <span className="text-green-500">on campus</span>,<br />
                    not on Kijiji.
                </h1>
                <p className="text-lg text-gray-500 max-w-xl mb-10">
                    UniCycle is the student marketplace for Montreal universities.
                    Sell your old textbooks, find cheap furniture, and do it all safely
                    with people from your campus.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate('/signup')}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors shadow-sm"
                    >
                        Get started — it's free
                    </button>
                    <button
                        onClick={() => navigate('/signup', { state: { mode: 'login' } })}
                        className="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors"
                    >
                        Log in
                    </button>
                </div>
                <p className="text-sm text-gray-400 mt-4">No credit card required. Verified student emails only.</p>
            </section>

            {/* Features */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">
                        Everything you need for campus trading
                    </h2>
                    <p className="text-gray-500 text-center mb-12">Simple, safe, and built for students.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((f) => (
                            <div key={f.title} className="bg-gray-50 rounded-2xl p-6">
                                <div className="text-3xl mb-3">{f.icon}</div>
                                <h3 className="font-semibold text-gray-900 text-lg mb-1">{f.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Universities */}
            <section className="py-16 px-6 bg-green-50">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Available at 9 Montreal universities</h2>
                    <p className="text-gray-500 mb-8">Sign up with your institutional email to get started.</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {UNIVERSITIES.map((uni) => (
                            <span key={uni} className="bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-full border border-gray-200">
                                {uni}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12">How it works</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {[
                            { step: '1', title: 'Sign up', desc: 'Create a free account with your university email. Takes 30 seconds.' },
                            { step: '2', title: 'Browse or post', desc: 'Search for what you need, or snap a photo and list your item.' },
                            { step: '3', title: 'Connect & trade', desc: 'Message the seller, agree on a meetup, and trade safely on campus.' },
                        ].map((s) => (
                            <div key={s.step} className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-green-500 text-white font-bold text-xl flex items-center justify-center mb-4">
                                    {s.step}
                                </div>
                                <h3 className="font-semibold text-gray-900 text-lg mb-2">{s.title}</h3>
                                <p className="text-gray-500 text-sm">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* App download CTA */}
            <section className="py-16 px-6 bg-gray-900 text-white text-center">
                <div className="max-w-xl mx-auto">
                    <img src={icon} alt="" className="w-16 h-16 rounded-2xl mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-3">Available on iOS & Android</h2>
                    <p className="text-gray-400 mb-8">
                        Get the UniCycle app for the full experience — instant notifications,
                        faster browsing, and photo uploads from your camera roll.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
                        >
                            Use the web app now →
                        </button>
                    </div>
                    <p className="text-gray-500 text-sm mt-4">Mobile apps coming soon to the App Store and Google Play.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 px-6 py-8">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <img src={icon} alt="" className="w-6 h-6" />
                        <span className="text-sm font-semibold text-gray-700">UniCycle</span>
                        <span className="text-sm text-gray-400">· Montreal student marketplace</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                        <button onClick={() => navigate('/terms')} className="hover:text-gray-700 transition-colors">
                            Terms
                        </button>
                        <button onClick={() => navigate('/privacy')} className="hover:text-gray-700 transition-colors">
                            Privacy
                        </button>
                        <a href="mailto:hello@unicycleapp.ca" className="hover:text-gray-700 transition-colors">
                            Contact
                        </a>
                    </div>
                    <span className="text-sm text-gray-400">© {new Date().getFullYear()} UniCycle</span>
                </div>
            </footer>
        </div>
    );
}
