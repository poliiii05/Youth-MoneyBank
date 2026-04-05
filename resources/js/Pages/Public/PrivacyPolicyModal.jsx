import React from 'react';
import Button from '../../Components/Common/Button';
import { ShieldCheck, Smartphone, GraduationCap, Building2, RefreshCw, Lock, FileText, Clock, Mail } from 'lucide-react';

export default function PrivacyPolicyModal({ isOpen, onClose }) {
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
                            <ShieldCheck className="text-cyan-300" size={28} />
                            <h1 className="text-2xl font-bold">Privacy Policy</h1>
                        </div>
                        <Button variant="close" onClick={onClose} />
                    </div>

                    <div className="overflow-y-auto flex-1 px-8 py-6 custom-scrollbar pb-8">
                        
                        {/* PORTFOLIO DISCLAIMER BOX */}
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r shadow-sm">
                            <p className="text-amber-800 text-sm font-bold mb-1 flex items-center gap-2">
                                <span className="text-amber-600">⚠️</span> PORTFOLIO DEMONSTRATION ONLY
                            </p>
                            <p className="text-amber-700 text-xs leading-relaxed">
                                Youth MoneyBank is a conceptual developer portfolio project. It is NOT a real bank, and no actual financial transactions occur. <strong>Please DO NOT enter real financial data, real government IDs, or highly sensitive personal information into this system.</strong>
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Introduction */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText size={20} className="text-blue-600" />
                                    <h2 className="text-lg font-bold text-gray-800">Welcome to Youth MoneyBank</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed text-sm">
                                    This simulated Privacy Policy explains how a platform like Youth MoneyBank ("YMB") would theoretically collect, use, and safeguard information in a real-world scenario. While this is a conceptual project, it is designed with the principles of the Philippine Data Privacy Act of 2012 in mind.
                                </p>
                            </section>

                            {/* Information We Collect */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <RefreshCw size={20} className="text-blue-600" />
                                    <h2 className="text-lg font-bold text-gray-800">Simulated Data Collection</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed text-xs mb-3">
                                    For demonstration purposes, the platform simulates the collection of the following data based on account tiers:
                                </p>
                                
                                <div className="space-y-3 mb-4">
                                    <div className="hover-card border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Smartphone size={18} className="text-blue-500" />
                                            <h3 className="font-semibold text-gray-800 text-sm">Tier 1 Accounts (Basic)</h3>
                                        </div>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-6 text-xs">
                                            <li>Phone number or Google account credentials</li>
                                            <li>Basic profile information (name, birth date)</li>
                                        </ul>
                                    </div>

                                    <div className="hover-card border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <GraduationCap size={18} className="text-indigo-500" />
                                            <h3 className="font-semibold text-gray-800 text-sm">Tier 2 & 3 (Verified)</h3>
                                        </div>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-6 text-xs">
                                            <li>Simulated ID verification data</li>
                                            <li>Mock address and identity details</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Partner Bank Information */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Building2 size={20} className="text-blue-600" />
                                    <h2 className="text-lg font-bold text-gray-800">Partner Bank Concept</h2>
                                </div>
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded hover:shadow-sm transition-shadow">
                                    <p className="text-gray-700 leading-relaxed text-xs">
                                        <strong>Concept Note:</strong> In a live production environment, YMB would not hold funds directly. All user data and funds would be securely managed by a BSP-licensed partner bank. For this demo, no actual banking integrations or real data sharing exists.
                                    </p>
                                </div>
                            </section>

                            {/* Data Security */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Lock size={20} className="text-blue-600" />
                                    <h2 className="text-lg font-bold text-gray-800">System Security</h2>
                                </div>
                                <ul className="list-disc list-inside text-gray-700 space-y-1.5 text-xs ml-2">
                                    <li>Passwords are securely hashed in the database</li>
                                    <li>Authentication protocols are implemented</li>
                                    <li>Any uploaded test data is periodically cleared from the demo server</li>
                                </ul>
                            </section>

                            {/* Contact Section */}
                            <section className="bg-slate-50 border border-slate-200 p-4 rounded-xl hover:shadow-sm transition-all animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Mail size={18} className="text-slate-700" />
                                    <h2 className="text-sm font-bold text-gray-800">Developer Contact</h2>
                                </div>
                                <p className="text-gray-600 text-xs leading-relaxed">
                                    This platform is built for portfolio demonstration. For technical inquiries regarding the development of this project, please contact the developer at <a href="mailto:help@ymb.com" className="text-blue-600 hover:underline">help@ymb.com</a>.
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
                .hover-card { padding: 1rem; border-radius: 0.75rem; transition: all 0.3s ease; }
                .hover-card:hover { background: #f8fafc; transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
            `}</style>
        </>
    );
}