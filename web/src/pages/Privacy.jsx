import { useNavigate } from 'react-router-dom';
import logo from '../assets/unicycle-icon.png';

export default function Privacy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        ← Back
                    </button>
                    <img src={logo} alt="UniCycle" className="w-7 h-7" />
                    <span className="font-semibold text-gray-800">UniCycle</span>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                <p className="text-sm text-gray-500 mb-8">Last updated: March 1, 2026</p>

                <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
                        <p>
                            UniCycle ("we", "us", or "our") is committed to protecting your privacy. This Privacy
                            Policy explains how we collect, use, disclose, and safeguard your information when you
                            use the UniCycle platform (web and mobile app).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
                        <h3 className="text-base font-semibold text-gray-800 mb-2">Information you provide:</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Name and institutional email address (required at registration)</li>
                            <li>Profile photo (optional)</li>
                            <li>Listing content: title, description, photos, price, category</li>
                            <li>Messages sent through the platform</li>
                            <li>Payment information (processed directly by Stripe — we do not store card details)</li>
                        </ul>
                        <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">Information collected automatically:</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Device type and operating system</li>
                            <li>IP address and approximate location (city-level)</li>
                            <li>Pages visited and features used within the app</li>
                            <li>Timestamps of activity (login, listing creation, messages)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>To create and manage your account</li>
                            <li>To display your listings to other users in your university community</li>
                            <li>To facilitate messaging between buyers and sellers</li>
                            <li>To send transactional emails (verification, new messages, listing expiry reminders)</li>
                            <li>To process payments through Stripe Secure Pay</li>
                            <li>To detect and prevent fraud and abuse</li>
                            <li>To improve the Platform and understand how users interact with it</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Information Sharing</h2>
                        <p>We do not sell your personal information. We share it only in these circumstances:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>
                                <strong>With other users:</strong> Your name, university, profile photo, and listings
                                are visible to other authenticated users on the Platform.
                            </li>
                            <li>
                                <strong>With service providers:</strong> We use Cloudinary (image hosting),
                                Stripe (payments), SendGrid (email), and Supabase (database) — each bound by
                                their own privacy policies and our data processing agreements.
                            </li>
                            <li>
                                <strong>Legal requirements:</strong> We may disclose information if required by law
                                or to protect the rights and safety of users.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Retention</h2>
                        <p>
                            We retain your account data for as long as your account is active. Listings are stored
                            indefinitely (even after expiry) so owners can reference past transactions. Messages are
                            retained to support dispute resolution. You may request deletion of your account and
                            associated data by contacting us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies and Local Storage</h2>
                        <p>
                            The web app uses browser local storage to persist your authentication token and preferences
                            (language, onboarding state). We do not use third-party advertising cookies. The mobile app
                            uses AsyncStorage for the same purpose.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Security</h2>
                        <p>
                            We use industry-standard security measures including HTTPS, JWT authentication with
                            7-day token expiry, and bcrypt password hashing. However, no system is completely
                            secure. You are responsible for keeping your credentials confidential.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Your Rights</h2>
                        <p>Under applicable Canadian privacy law (PIPEDA and Quebec Law 25), you have the right to:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Access the personal information we hold about you</li>
                            <li>Correct inaccurate information</li>
                            <li>Request deletion of your account and data</li>
                            <li>Withdraw consent where processing is based on consent</li>
                            <li>File a complaint with the Office of the Privacy Commissioner of Canada</li>
                        </ul>
                        <p className="mt-2">
                            To exercise these rights, contact us at{' '}
                            <a href="mailto:hello@unicycleapp.ca" className="text-green-600 hover:underline">
                                hello@unicycleapp.ca
                            </a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Children's Privacy</h2>
                        <p>
                            UniCycle is not intended for users under the age of 13. We do not knowingly collect
                            personal information from children under 13. If we learn that we have collected such
                            information, we will delete it promptly.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy periodically. We will notify you of significant changes
                            via email or a prominent notice in the app. Continued use after changes constitutes
                            acceptance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact</h2>
                        <p>
                            Privacy questions or requests:{' '}
                            <a href="mailto:hello@unicycleapp.ca" className="text-green-600 hover:underline">
                                hello@unicycleapp.ca
                            </a>
                            <br />
                            UniCycle, Montreal, Quebec, Canada
                        </p>
                    </section>
                </div>
            </main>

            <footer className="border-t border-gray-200 mt-12 py-6 text-center text-sm text-gray-400">
                © {new Date().getFullYear()} UniCycle. All rights reserved.
            </footer>
        </div>
    );
}
