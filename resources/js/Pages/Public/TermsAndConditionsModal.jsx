import React from 'react';
import Button from '../../Components/Common/Button';
import { Scale, FileText, LayoutList, Smartphone, GraduationCap, Building2, AlertTriangle, Coins, CheckCircle2 } from 'lucide-react';

export default function TermsAndConditionsModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div 
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-4 flex flex-col animate-slideUp max-h-[90vh] pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white py-6 px-8 rounded-t-2xl flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <Scale className="text-cyan-300" size={28} />
                            <h1 className="text-2xl font-bold">Terms & Conditions</h1>
                        </div>
                        <Button variant="close" onClick={onClose} />
                    </div>

                    <div className="overflow-y-auto flex-1 px-8 py-6 custom-scrollbar pb-8">
                        
                        {/* PORTFOLIO DISCLAIMER BOX */}
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r shadow-sm">
                            <p className="text-amber-800 text-sm font-bold mb-1 flex items-center gap-2">
                                <AlertTriangle size={16} className="text-amber-600" />
                                CONCEPTUAL PROJECT NOTICE
                            </p>
                            <p className="text-amber-700 text-xs leading-relaxed ml-6">
                                By using this application, you acknowledge that Youth MoneyBank is a <strong>Developer Portfolio Project</strong>. It is not a licensed financial institution. No real money is deposited, held, or transferred. 
                            </p>
                        </div>

                        <div className="space-y-6">
                            
                            {/* Introduction */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText size={20} className="text-blue-600" />
                                    <h2 className="text-lg font-bold text-gray-800">Agreement to Terms</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed text-sm ml-7">
                                    Welcome to the Youth MoneyBank ("YMB") platform demonstration. By accessing this conceptual application, you agree to interact with it solely for demonstration, testing, or portfolio review purposes.
                                </p>
                            </section>

                            {/* Service Description */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <LayoutList size={20} className="text-blue-600" />
                                    <h2 className="text-lg font-bold text-gray-800">Simulated Service Description</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-2 text-sm ml-7">
                                    This platform simulates a digital savings and financial onboarding ecosystem featuring:
                                </p>
                                <ul className="list-disc list-inside text-gray-700 space-y-1 text-xs ml-9">
                                    <li>Tier-based digital savings accounts</li>
                                    <li>Simulated cash-in and cash-out services</li>
                                    <li>Savings goal tracking</li>
                                    <li>Mock parent/guardian allowance management</li>
                                </ul>
                            </section>

                            {/* Account Tiers */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                                <h2 className="text-lg font-bold text-gray-800 mb-3 ml-7">Conceptual Account Tiers</h2>
                                <p className="text-gray-700 leading-relaxed mb-3 text-xs ml-7">
                                    The following limits and features are simulated within the application:
                                </p>
                                <div className="space-y-3 ml-7">
                                    <div className="border border-blue-100 rounded-xl p-3 bg-blue-50/50 flex items-center gap-4">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <Smartphone size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm mb-0.5">Tier 1: Basic</p>
                                            <p className="text-gray-600 text-xs">Simulated Max: <span className="font-semibold text-blue-700">₱5,000</span></p>
                                        </div>
                                    </div>
                                    <div className="border border-indigo-100 rounded-xl p-3 bg-indigo-50/50 flex items-center gap-4">
                                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                            <GraduationCap size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm mb-0.5">Tier 2: Student</p>
                                            <p className="text-gray-600 text-xs">Simulated Max: <span className="font-semibold text-indigo-700">₱20,000</span></p>
                                        </div>
                                    </div>
                                    <div className="border border-purple-100 rounded-xl p-3 bg-purple-50/50 flex items-center gap-4">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm mb-0.5">Tier 3: Verified (18+)</p>
                                            <p className="text-gray-600 text-xs">Simulated Max: <span className="font-semibold text-purple-700">₱100,000</span></p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Prohibited Activities */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={20} className="text-red-500" />
                                    <h2 className="text-lg font-bold text-gray-800">Demo Guidelines</h2>
                                </div>
                                <ul className="list-disc list-inside text-gray-700 space-y-1.5 text-xs ml-7">
                                    <li>Do not attempt to link real bank accounts or credit cards.</li>
                                    <li>Do not upload real, unredacted government IDs.</li>
                                    <li>The developer reserves the right to reset or delete test accounts at any time.</li>
                                </ul>
                            </section>

                            {/* Transactions */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Coins size={20} className="text-blue-600" />
                                    <h2 className="text-lg font-bold text-gray-800">Transactions & Fake Currency</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed text-xs ml-7">
                                    All balances and transactions shown within the app use mock data. The numbers represented as "PHP" or "₱" hold no real-world value and cannot be redeemed, withdrawn, or transferred to actual financial institutions.
                                </p>
                            </section>

                            {/* Acknowledgment */}
                            <section className="bg-slate-50 border border-slate-200 p-4 rounded-xl hover:shadow-sm transition-all animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                    <p className="text-gray-800 font-bold text-sm">
                                        Acknowledgment
                                    </p>
                                </div>
                                <p className="text-gray-600 text-xs ml-6 leading-relaxed">
                                    By proceeding to register or log in, you confirm that you understand this is a mock application built to demonstrate software development capabilities.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; transition: background 0.3s; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </>
    );
}