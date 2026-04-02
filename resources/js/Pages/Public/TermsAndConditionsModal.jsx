import React from 'react';
import Button from '../../Components/Common/Button';

export default function TermsAndConditionsModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <>
            {/* BACKDROP WITH BLUR - Blocks clicks, doesn't close modal */}
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            />

            {/* MODAL - Z-50 - Prevents click propagation */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div 
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-4 flex flex-col animate-slideUp max-h-[90vh] pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    
                    {/* Header - Sticky */}
                    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white py-6 px-8 rounded-t-2xl flex justify-between items-center flex-shrink-0">
                        <h1 className="text-2xl font-bold">Terms & Conditions</h1>
                        <Button variant="close" onClick={onClose} />
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto flex-1 px-8 py-6 custom-scrollbar pb-8">
                        <div className="space-y-5">
                            
                            {/* Introduction */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Agreement to Terms</h2>
                                <p className="text-gray-700 leading-relaxed text-sm">
                                    Welcome to Youth MoneyBank ("YMB"). By accessing or using our digital savings platform, 
                                    you agree to be bound by these Terms and Conditions.
                                </p>
                                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mt-2 rounded hover:shadow-md transition-shadow">
                                    <p className="text-gray-700 font-medium text-xs">
                                        If you do not agree, you must not use Youth MoneyBank.
                                    </p>
                                </div>
                            </section>

                            {/* Service Description */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Service Description</h2>
                                <p className="text-gray-700 leading-relaxed mb-2 text-sm">
                                    Youth MoneyBank is a digital savings and financial onboarding platform:
                                </p>
                                <ul className="list-disc list-inside text-gray-700 space-y-0.5 text-xs mb-2">
                                    <li>Tier-based digital savings accounts</li>
                                    <li>Cash-in and cash-out services</li>
                                    <li>Savings goal tracking</li>
                                    <li>Parent/guardian allowance management</li>
                                    <li>Spending summaries and financial tools</li>
                                </ul>
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded hover:shadow-md transition-shadow">
                                    <p className="text-gray-700 text-xs">
                                        <strong>Important:</strong> YMB is NOT a licensed bank. Funds are held by our partner bank regulated by the BSP.
                                    </p>
                                </div>
                            </section>

                            {/* Eligibility */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Eligibility</h2>
                                <ul className="list-disc list-inside text-gray-700 space-y-0.5 text-xs">
                                    <li>Be a resident of the Philippines</li>
                                    <li>Provide accurate information</li>
                                    <li>Meet age requirements for your tier</li>
                                    <li>Obtain parent/guardian consent if under 18</li>
                                    <li>Comply with all applicable laws</li>
                                </ul>
                            </section>

                            {/* Account Tiers */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Account Tiers</h2>
                                <div className="space-y-2">
                                    <div className="border-2 border-blue-200 rounded p-2 bg-blue-50">
                                        <p className="font-semibold text-gray-800 text-xs mb-1">📱 Tier 1: Basic</p>
                                        <p className="text-gray-700 text-xs"><strong>Max:</strong> ₱3,000 | <strong>Features:</strong> Cash-in only</p>
                                    </div>
                                    <div className="border-2 border-indigo-200 rounded p-2 bg-indigo-50">
                                        <p className="font-semibold text-gray-800 text-xs mb-1">🎓 Tier 2: Student</p>
                                        <p className="text-gray-700 text-xs"><strong>Max:</strong> ₱5,000 | <strong>Features:</strong> Cash-in & cash-out</p>
                                    </div>
                                    <div className="border-2 border-purple-200 rounded p-2 bg-purple-50">
                                        <p className="font-semibold text-gray-800 text-xs mb-1">🏦 Tier 3: Verified (18+)</p>
                                        <p className="text-gray-700 text-xs"><strong>Max:</strong> ₱5,000–₱20,000 | <strong>Features:</strong> Full access</p>
                                    </div>
                                </div>
                            </section>

                            {/* Parent/Guardian */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Parent/Guardian Involvement</h2>
                                <ul className="list-disc list-inside text-gray-700 space-y-0.5 text-xs">
                                    <li>Parents must provide consent for minors</li>
                                    <li>Parents can monitor account activity</li>
                                    <li>Parents can set allowances</li>
                                    <li>Parents may close the account</li>
                                </ul>
                            </section>

                            {/* Responsibilities */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Your Responsibilities</h2>
                                <ul className="list-disc list-inside text-gray-700 space-y-0.5 text-xs">
                                    <li>Provide accurate information</li>
                                    <li>Keep login credentials secure</li>
                                    <li>Report unauthorized access immediately</li>
                                    <li>Use only for lawful purposes</li>
                                    <li>Review transactions regularly</li>
                                </ul>
                            </section>

                            {/* Prohibited Activities */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Prohibited Activities</h2>
                                <ul className="list-disc list-inside text-gray-700 space-y-0.5 text-xs">
                                    <li>Fraudulent or illegal activities</li>
                                    <li>False identity documents</li>
                                    <li>Create multiple accounts to circumvent limits</li>
                                    <li>Hack or disrupt platform</li>
                                    <li>Violate applicable laws</li>
                                </ul>
                            </section>

                            {/* Transactions */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Transactions & Fees</h2>
                                <p className="text-gray-700 leading-relaxed text-xs">
                                    All transactions via partner bank. Processing times vary. We reserve right to decline suspicious transactions.
                                </p>
                            </section>

                            {/* Termination */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Account Suspension & Termination</h2>
                                <p className="text-gray-700 leading-relaxed text-xs">
                                    We may suspend/terminate for violating terms, false info, suspicious activity, or legal requirement. Close anytime with support.
                                </p>
                            </section>

                            {/* Governing Law */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '1s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Governing Law</h2>
                                <p className="text-gray-700 leading-relaxed text-xs">
                                    Governed by Philippine laws. Legal action in Philippine courts.
                                </p>
                            </section>

                            {/* Contact */}
                            <section className="bg-blue-50 border-2 border-blue-200 p-3 rounded-lg hover:shadow-lg transition-all animate-fadeInUp" style={{ animationDelay: '1.1s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Questions?</h2>
                                <div className="text-gray-700 space-y-1 text-xs">
                                    <p><strong>Email:</strong> <a href="mailto:help@ymb.com" className="text-blue-600 hover:underline hover:text-blue-800 transition-colors">help@ymb.com</a></p>
                                    <p><strong>Support:</strong> Mon-Fri, 9 AM - 6 PM (PHT)</p>
                                </div>
                            </section>

                            {/* Acknowledgment */}
                            <section className="bg-blue-100 border-2 border-blue-300 p-3 rounded-lg hover:shadow-lg transition-all animate-fadeInUp" style={{ animationDelay: '1.2s' }}>
                                <p className="text-gray-800 font-semibold text-xs mb-1">
                                    By using YMB, you acknowledge reading and agreeing to these Terms.
                                </p>
                                <p className="text-gray-700 text-xs">
                                    If you are a minor, your parent/guardian has reviewed and agreed on your behalf.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                /* Fade in animation for backdrop */
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                /* Slide up animation for modal */
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                /* Fade in up for content sections */
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-slideUp {
                    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .animate-fadeInUp {
                    animation: fadeInUp 0.5s ease-out forwards;
                    opacity: 0;
                }

                /* Custom scrollbar */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                    transition: background 0.3s;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </>
    );
}