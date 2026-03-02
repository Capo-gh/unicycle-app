import { useNavigate } from 'react-router-dom';
import logo from '../assets/unicycle-icon.png';

export default function Terms() {
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
                <p className="text-sm text-gray-500 mb-8">Last updated: March 1, 2026</p>

                <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using UniCycle ("the Platform"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use the Platform.
                            UniCycle is a student marketplace connecting buyers and sellers at Montreal-area universities.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Eligibility</h2>
                        <p>
                            UniCycle is exclusively for students, faculty, and staff of participating Montreal-area
                            universities. You must register with a valid institutional email address. You must be at
                            least 13 years of age to use the Platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
                        <p>
                            You are responsible for maintaining the confidentiality of your account credentials and
                            for all activity that occurs under your account. You agree to provide accurate information
                            and to update it as necessary. You may not share your account with others.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Listings and Transactions</h2>
                        <p>
                            UniCycle is a venue that enables peer-to-peer transactions. We are not a party to any
                            transaction between buyers and sellers. We do not guarantee the quality, safety, legality,
                            or accuracy of any listing. Buyers and sellers transact at their own risk.
                        </p>
                        <p className="mt-2">
                            You agree not to list items that are:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Illegal under Canadian law</li>
                            <li>Counterfeit or infringing on intellectual property rights</li>
                            <li>Weapons, controlled substances, or hazardous materials</li>
                            <li>Stolen or obtained through fraudulent means</li>
                            <li>Adult content or services</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Secure Pay</h2>
                        <p>
                            UniCycle offers an optional escrow payment feature ("Secure Pay") powered by Stripe.
                            Funds are held in escrow until the buyer confirms receipt of the item. UniCycle collects
                            a service fee on Secure Pay transactions. All payment processing is handled by Stripe and
                            subject to Stripe's terms of service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Prohibited Conduct</h2>
                        <p>You agree not to:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Harass, threaten, or abuse other users</li>
                            <li>Post false, misleading, or deceptive listings</li>
                            <li>Scrape, crawl, or use automated tools to access the Platform</li>
                            <li>Attempt to circumvent security measures</li>
                            <li>Use the Platform for commercial solicitation unrelated to student transactions</li>
                            <li>Create multiple accounts or impersonate others</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Content</h2>
                        <p>
                            You retain ownership of content you post. By posting content on UniCycle, you grant us
                            a non-exclusive, royalty-free licence to display, store, and use that content solely to
                            operate and improve the Platform. We may remove any content that violates these Terms or
                            that we deem harmful.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Listing Expiry</h2>
                        <p>
                            Listings automatically expire 60 days after posting. You may renew a listing or use the
                            free "bump" feature (once per 7 days per listing) to refresh it. Expired listings are
                            hidden from browse but remain accessible to their owner.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Disclaimer of Warranties</h2>
                        <p>
                            The Platform is provided "as is" without warranty of any kind. UniCycle does not warrant
                            that the Platform will be uninterrupted, error-free, or free from viruses or harmful
                            components. We are not responsible for transactions that go wrong between users.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, UniCycle shall not be liable for any indirect,
                            incidental, special, consequential, or punitive damages arising from your use of the
                            Platform or any transactions conducted through it.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Account Suspension</h2>
                        <p>
                            We reserve the right to suspend or terminate accounts that violate these Terms, engage
                            in fraudulent activity, or pose a risk to the community. Suspended users' listings will
                            be hidden and access to the Platform will be restricted.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Changes to Terms</h2>
                        <p>
                            We may update these Terms from time to time. Continued use of the Platform after changes
                            are posted constitutes acceptance of the updated Terms. We will notify users of material
                            changes via email.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Governing Law</h2>
                        <p>
                            These Terms are governed by the laws of the Province of Quebec and the federal laws of
                            Canada applicable therein. Any disputes shall be resolved in the courts of Montreal, Quebec.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Contact</h2>
                        <p>
                            For questions about these Terms, contact us at{' '}
                            <a href="mailto:hello@unicycleapp.ca" className="text-green-600 hover:underline">
                                hello@unicycleapp.ca
                            </a>.
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
