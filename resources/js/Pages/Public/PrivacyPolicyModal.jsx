import React from 'react';
import Button from '../../Components/Common/Button';

export default function PrivacyPolicyModal({ isOpen, onClose }) {
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
                        <h1 className="text-2xl font-bold">Privacy Policy</h1>
                        <Button variant="close" onClick={onClose} />
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto flex-1 px-8 py-6 custom-scrollbar pb-8">
                        <div className="space-y-5">
                            
                            {/* Introduction */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Welcome to Youth MoneyBank</h2>
                                <p className="text-gray-700 leading-relaxed text-sm">
                                    Youth MoneyBank ("YMB," "we," "us," or "our") is committed to protecting your privacy. 
                                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                                    when you use our digital savings platform. We comply with the Philippine Data Privacy Act 
                                    of 2012 (Republic Act No. 10173) and all applicable regulations.
                                </p>
                            </section>

                            {/* Information We Collect */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Information We Collect</h2>
                                
                                <div className="space-y-2 mb-3">
                                    <div className="hover-card">
                                        <h3 className="font-semibold text-gray-800 text-sm">📱 Tier 1 Accounts (Basic)</h3>
                                        <ul className="list-disc list-inside text-gray-700 space-y-0.5 mt-1 text-xs">
                                            <li>Phone number or Google account credentials</li>
                                            <li>Email address</li>
                                            <li>Basic profile information (name, age range)</li>
                                        </ul>
                                    </div>

                                    <div className="hover-card">
                                        <h3 className="font-semibold text-gray-800 text-sm">🎓 Tier 2 Accounts (Student Verified)</h3>
                                        <ul className="list-disc list-inside text-gray-700 space-y-0.5 mt-1 text-xs">
                                            <li>All Tier 1 information</li>
                                            <li>Student ID and school information</li>
                                            <li>Date of birth</li>
                                            <li>Full legal name</li>
                                        </ul>
                                    </div>

                                    <div className="hover-card">
                                        <h3 className="font-semibold text-gray-800 text-sm">🏦 Tier 3 Accounts (Fully Verified)</h3>
                                        <ul className="list-disc list-inside text-gray-700 space-y-0.5 mt-1 text-xs">
                                            <li>All Tier 2 information</li>
                                            <li>Government-issued ID</li>
                                            <li>Complete address</li>
                                            <li>Selfie for identity verification</li>
                                        </ul>
                                    </div>
                                </div>

                                <h3 className="font-semibold text-gray-800 text-sm">🔄 Automatically Collected Information</h3>
                                <ul className="list-disc list-inside text-gray-700 space-y-0.5 mt-1 text-xs">
                                    <li>Device information</li>
                                    <li>IP address and location data</li>
                                    <li>Transaction history and account activity</li>
                                    <li>Usage patterns and app interactions</li>
                                </ul>
                            </section>

                            {/* How We Use Your Information */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">How We Use Your Information</h2>
                                <ul className="list-disc list-inside text-gray-700 space-y-0.5 text-xs">
                                    <li>To create and manage your YMB account</li>
                                    <li>To process transactions</li>
                                    <li>To verify your identity (KYC compliance)</li>
                                    <li>To comply with BSP regulations</li>
                                    <li>To provide customer support</li>
                                    <li>To prevent fraud and enhance security</li>
                                    <li>To improve our services</li>
                                </ul>
                            </section>

                            {/* Partner Bank Information */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Partner Bank Integration</h2>
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded hover:shadow-md transition-shadow">
                                    <p className="text-gray-700 leading-relaxed text-xs">
                                        <strong>Important:</strong> YMB is not a licensed bank. All funds are held by our partner bank. Your information is shared with our partner bank for account creation, transaction processing, and compliance.
                                    </p>
                                </div>
                            </section>

                            {/* Minors' Privacy */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Protection of Minors</h2>
                                <ul className="list-disc list-inside text-gray-700 space-y-0.5 text-xs">
                                    <li>Minors may require parent/guardian consent</li>
                                    <li>Parents can view account activity</li>
                                    <li>We do not share minors' data for marketing</li>
                                    <li>Parents can request account deletion</li>
                                </ul>
                            </section>

                            {/* Data Security */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Data Security</h2>
                                <ul className="list-disc list-inside text-gray-700 space-y-0.5 text-xs">
                                    <li>Encryption of data in transit and at rest</li>
                                    <li>Secure authentication protocols</li>
                                    <li>Regular security audits</li>
                                    <li>Access controls limiting staff access</li>
                                    <li>Fraud detection systems</li>
                                </ul>
                            </section>

                            {/* Your Rights */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Your Privacy Rights</h2>
                                <ul className="list-disc list-inside text-gray-700 space-y-0.5 text-xs">
                                    <li>Access your personal information</li>
                                    <li>Request correction of inaccurate data</li>
                                    <li>Request deletion of your account</li>
                                    <li>Receive a copy of your data</li>
                                    <li>File a complaint with the National Privacy Commission</li>
                                </ul>
                                <p className="text-gray-700 leading-relaxed mt-2 text-xs">
                                    Contact: <a href="mailto:help@ymb.com" className="text-blue-600 hover:underline hover:text-blue-800 transition-colors">help@ymb.com</a>
                                </p>
                            </section>

                            {/* Data Retention */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Data Retention</h2>
                                <p className="text-gray-700 leading-relaxed text-xs">
                                    We retain information for as long as needed. After closure, we retain certain information per legal obligations (5-7 years per banking regulations).
                                </p>
                            </section>

                            {/* Contact Section */}
                            <section className="bg-blue-50 border-2 border-blue-200 p-3 rounded-lg hover:shadow-lg transition-all animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Contact Us</h2>
                                <div className="text-gray-700 space-y-1 text-xs">
                                    <p><strong>Email:</strong> <a href="mailto:help@ymb.com" className="text-blue-600 hover:underline hover:text-blue-800 transition-colors">help@ymb.com</a></p>
                                </div>
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

                /* Hover card effect */
                .hover-card {
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    transition: all 0.3s ease;
                }

                .hover-card:hover {
                    background: #eff6ff;
                    transform: translateX(4px);
                }
            `}</style>
        </>
    );
}