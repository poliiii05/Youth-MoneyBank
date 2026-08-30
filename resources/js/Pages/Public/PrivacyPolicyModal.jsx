import React from 'react';
import { Button } from '@/Components/ui/button';
import {
    ShieldCheck, Mail, GraduationCap, Building2, RefreshCw,
    Lock, FileText, Clock, Bot, X, Server
} from 'lucide-react';

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
                    className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full my-4 flex flex-col animate-slideUp max-h-[90vh] pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-gradient-to-r from-primary to-emerald-600 text-white py-6 px-8 rounded-t-2xl flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-emerald-200" size={28} />
                            <h1 className="text-2xl font-bold">Privacy Policy</h1>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-full"
                            aria-label="Close"
                        >
                            <X size={22} />
                        </Button>
                    </div>

                    <div className="overflow-y-auto flex-1 px-8 py-6 custom-scrollbar pb-8">

                        {/* PORTFOLIO DISCLAIMER BOX */}
                        <div className="bg-accent/10 border-l-4 border-accent p-4 mb-6 rounded-r shadow-sm">
                            <p className="text-foreground text-sm font-bold mb-1 flex items-center gap-2">
                                <span>⚠️</span> PORTFOLIO DEMONSTRATION ONLY
                            </p>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                Youth MoneyBank is a conceptual developer portfolio project. It is NOT a real bank, and no actual financial transactions occur. <strong className="text-foreground">Please DO NOT enter real financial data, real government IDs, or highly sensitive personal information into this system.</strong>
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Introduction */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText size={20} className="text-primary" />
                                    <h2 className="text-lg font-bold text-foreground">Welcome to Youth MoneyBank</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    This Privacy Policy explains what information Youth MoneyBank ("YMB") actually collects during this demonstration, where it goes, and how long it is kept. While this is a conceptual project, it is designed with the principles of the Philippine Data Privacy Act of 2012 in mind.
                                </p>
                            </section>

                            {/* Information We Collect */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <RefreshCw size={20} className="text-primary" />
                                    <h2 className="text-lg font-bold text-foreground">What We Collect</h2>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="hover-card border border-border">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Mail size={18} className="text-primary" />
                                            <h3 className="font-semibold text-foreground text-sm">Tier 1: Starter Accounts</h3>
                                        </div>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-6 text-xs">
                                            <li>Email address and a hashed password</li>
                                            <li>Your name and date of birth</li>
                                            <li>If you sign in with Google: your name, email address, and profile picture from your Google account</li>
                                        </ul>
                                    </div>

                                    <div className="hover-card border border-border">
                                        <div className="flex items-center gap-2 mb-1">
                                            <GraduationCap size={18} className="text-primary" />
                                            <h3 className="font-semibold text-foreground text-sm">Tier 2 (Builder) &amp; Tier 3 (Achiever)</h3>
                                        </div>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-6 text-xs">
                                            <li>Document images you upload for verification (Student ID or government ID)</li>
                                            <li>The status and review history of your upgrade application</li>
                                        </ul>
                                    </div>

                                    <div className="hover-card border border-border">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Server size={18} className="text-primary" />
                                            <h3 className="font-semibold text-foreground text-sm">Automatically Collected</h3>
                                        </div>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-6 text-xs">
                                            <li>Your IP address and browser user agent, used for session security and rate limiting</li>
                                            <li>Session cookies required to keep you logged in</li>
                                            <li>Your transaction history within the platform</li>
                                            <li>Messages you send to support, which are stored and readable by administrators</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Third parties */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Bot size={20} className="text-primary" />
                                    <h2 className="text-lg font-bold text-foreground">Third-Party Services</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed text-xs mb-3">
                                    Some features send data outside this application. Please keep this in mind when using them:
                                </p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1.5 text-xs ml-2">
                                    <li>
                                        <strong className="text-foreground">Google Gemini (AI).</strong> The support chat and the personalised savings tips send your message text and relevant account context to Google's Gemini API for processing. Do not put anything confidential into the support chat.
                                    </li>
                                    <li>
                                        <strong className="text-foreground">Google Sign-In.</strong> If you choose to sign in with Google, Google authenticates you and returns your basic profile details to us.
                                    </li>
                                    <li>
                                        <strong className="text-foreground">PayPal Sandbox.</strong> Cash-in runs through PayPal's developer sandbox environment. This is a test environment and no real payment is processed.
                                    </li>
                                </ul>
                            </section>

                            {/* Retention */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock size={20} className="text-primary" />
                                    <h2 className="text-lg font-bold text-foreground">How Long We Keep It</h2>
                                </div>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1.5 text-xs ml-2">
                                    <li>Uploaded KYC documents are stored on private disk storage and automatically deleted after 24 hours</li>
                                    <li>Account details, transaction records, and support messages persist for as long as the account exists</li>
                                    <li>Administrative actions taken on your account are recorded in an audit log for accountability</li>
                                    <li>Test accounts and uploaded files may be reset by the developer at any time</li>
                                </ul>
                            </section>

                            {/* Partner Bank Information */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Building2 size={20} className="text-primary" />
                                    <h2 className="text-lg font-bold text-foreground">Partner Bank Concept</h2>
                                </div>
                                <div className="bg-secondary border-l-4 border-primary p-4 rounded hover:shadow-sm transition-shadow">
                                    <p className="text-muted-foreground leading-relaxed text-xs">
                                        <strong className="text-foreground">Concept Note:</strong> In a live production environment, YMB would not hold funds directly — user funds and data would sit with a BSP-licensed partner bank. For this demonstration, no banking integration exists and no data is shared with any bank.
                                    </p>
                                </div>
                            </section>

                            {/* Data Security */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Lock size={20} className="text-primary" />
                                    <h2 className="text-lg font-bold text-foreground">System Security</h2>
                                </div>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1.5 text-xs ml-2">
                                    <li>Passwords are hashed with bcrypt and never stored in readable form</li>
                                    <li>Sessions are encrypted and forms are protected against cross-site request forgery</li>
                                    <li>Sensitive endpoints are rate limited to prevent abuse</li>
                                    <li>Tier restrictions are enforced by server-side authorization, not hidden UI</li>
                                </ul>
                            </section>

                            {/* Contact Section */}
                            <section className="bg-secondary border border-border p-4 rounded-xl hover:shadow-sm transition-all animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Mail size={18} className="text-primary" />
                                    <h2 className="text-sm font-bold text-foreground">Developer Contact</h2>
                                </div>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                    This platform is built for portfolio demonstration. For technical inquiries regarding this project, or to request deletion of your test data, contact the developer at <a href="mailto:help@ymb.com" className="text-primary hover:underline font-medium">help@ymb.com</a>.
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
                .custom-scrollbar::-webkit-scrollbar-track { background: var(--muted); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; transition: background 0.3s; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--muted-foreground); }
                .hover-card { padding: 1rem; border-radius: 0.75rem; transition: all 0.3s ease; }
                .hover-card:hover { background: var(--muted); transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
            `}</style>
        </>
    );
}