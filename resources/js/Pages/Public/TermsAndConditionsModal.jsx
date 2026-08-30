import React from 'react';
import { Button } from '@/Components/ui/button';
import {
    Scale, FileText, LayoutList, Sprout, GraduationCap, Building2,
    AlertTriangle, Coins, CheckCircle2, Bot, UserX, X
} from 'lucide-react';

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
                    className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full my-4 flex flex-col animate-slideUp max-h-[90vh] pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-gradient-to-r from-primary to-emerald-600 text-white py-6 px-8 rounded-t-2xl flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <Scale className="text-emerald-200" size={28} />
                            <h1 className="text-2xl font-bold">Terms &amp; Conditions</h1>
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
                                <AlertTriangle size={16} />
                                CONCEPTUAL PROJECT NOTICE
                            </p>
                            <p className="text-muted-foreground text-xs leading-relaxed ml-6">
                                By using this application, you acknowledge that Youth MoneyBank is a <strong className="text-foreground">Developer Portfolio Project</strong>. It is not a licensed financial institution. No real money is deposited, held, or transferred.
                            </p>
                        </div>

                        <div className="space-y-6">

                            {/* Introduction */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText size={20} className="text-primary" />
                                    <h2 className="text-lg font-bold text-foreground">Agreement to Terms</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed text-sm ml-7">
                                    Welcome to the Youth MoneyBank ("YMB") platform demonstration. By accessing this conceptual application, you agree to interact with it solely for demonstration, testing, or portfolio review purposes.
                                </p>
                            </section>

                            {/* Service Description */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <LayoutList size={20} className="text-primary" />
                                    <h2 className="text-lg font-bold text-foreground">What This Platform Does</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed mb-2 text-sm ml-7">
                                    This platform demonstrates a tier-based digital savings system featuring:
                                </p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1 text-xs ml-9">
                                    <li>Tier-based accounts with progressive KYC verification</li>
                                    <li>Simulated cash-in through the PayPal Sandbox environment</li>
                                    <li>Savings goals and a separate savings pool</li>
                                    <li>Streak tracking, achievement badges, and an insights dashboard</li>
                                    <li>An AI-assisted support chat with escalation to a human agent</li>
                                </ul>
                                <p className="text-muted-foreground leading-relaxed mt-2 text-xs ml-7">
                                    Cash-out to external bank accounts, peer-to-peer transfers, QR payments, debit cards, and investment products are <strong className="text-foreground">not part of this build</strong>.
                                </p>
                            </section>

                            {/* Account Tiers */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                                <h2 className="text-lg font-bold text-foreground mb-3 ml-7">Account Tiers</h2>
                                <p className="text-muted-foreground leading-relaxed mb-3 text-xs ml-7">
                                    The following limits are enforced within the application:
                                </p>
                                <div className="space-y-3 ml-7">
                                    <div className="border border-border rounded-xl p-3 bg-secondary/50 flex items-center gap-4">
                                        <div className="p-2 bg-tier-1/20 text-tier-1 rounded-lg">
                                            <Sprout size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground text-sm mb-0.5">Tier 1: Starter (Email only)</p>
                                            <p className="text-muted-foreground text-xs">Maximum balance: <span className="font-semibold text-tier-1">₱5,000</span></p>
                                        </div>
                                    </div>
                                    <div className="border border-border rounded-xl p-3 bg-secondary/50 flex items-center gap-4">
                                        <div className="p-2 bg-tier-2/20 text-tier-2 rounded-lg">
                                            <GraduationCap size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground text-sm mb-0.5">Tier 2: Builder (Verified Student)</p>
                                            <p className="text-muted-foreground text-xs">Maximum balance: <span className="font-semibold text-tier-2">₱20,000</span></p>
                                        </div>
                                    </div>
                                    <div className="border border-border rounded-xl p-3 bg-secondary/50 flex items-center gap-4">
                                        <div className="p-2 bg-tier-3/20 text-tier-3 rounded-lg">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground text-sm mb-0.5">Tier 3: Achiever (Verified, 18+)</p>
                                            <p className="text-muted-foreground text-xs">Maximum balance: <span className="font-semibold text-tier-3">₱100,000</span></p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* AI DISCLAIMER */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Bot size={20} className="text-primary" />
                                    <h2 className="text-lg font-bold text-foreground">About the AI Features</h2>
                                </div>
                                <div className="bg-accent/10 border-l-4 border-accent p-4 rounded ml-7">
                                    <p className="text-muted-foreground leading-relaxed text-xs">
                                        The savings tips and support chat answers are generated by an AI model and may be inaccurate or incomplete. <strong className="text-foreground">They are not financial advice</strong> and should not be relied on for real financial decisions. Messages you send to the support chat are processed by Google's Gemini API — see the Privacy Policy for details.
                                    </p>
                                </div>
                            </section>

                            {/* Demo Guidelines */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={20} className="text-destructive" />
                                    <h2 className="text-lg font-bold text-foreground">Demo Guidelines</h2>
                                </div>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1.5 text-xs ml-7">
                                    <li>Do not attempt to link real bank accounts or credit cards</li>
                                    <li>Do not upload real, unredacted government IDs</li>
                                    <li>Do not put confidential information into the support chat</li>
                                    <li>Do not attempt to probe, attack, or overload the demo environment</li>
                                </ul>
                            </section>

                            {/* Account suspension */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <UserX size={20} className="text-primary" />
                                    <h2 className="text-lg font-bold text-foreground">Account Suspension &amp; Reset</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed text-xs ml-7">
                                    Administrators can suspend an account that abuses the demo environment, and suspended accounts cannot sign in. Administrative actions are recorded in an audit log. The developer may also reset or delete test accounts and uploaded files at any time, without notice — please do not treat this demo as durable storage for anything you need.
                                </p>
                            </section>

                            {/* Transactions */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Coins size={20} className="text-primary" />
                                    <h2 className="text-lg font-bold text-foreground">Balances Hold No Real Value</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed text-xs ml-7">
                                    All balances and transactions shown within the app use simulated data. Amounts displayed as "PHP" or "₱" hold no real-world value and cannot be redeemed, withdrawn, or transferred to any financial institution.
                                </p>
                            </section>

                            {/* No warranty */}
                            <section className="animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Scale size={20} className="text-primary" />
                                    <h2 className="text-lg font-bold text-foreground">No Warranty</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed text-xs ml-7">
                                    This platform is provided as-is, without warranty of any kind. It may be unavailable, contain bugs, or lose data without notice. The developer accepts no liability for any loss arising from use of this demonstration.
                                </p>
                            </section>

                            {/* Acknowledgment */}
                            <section className="bg-secondary border border-border p-4 rounded-xl hover:shadow-sm transition-all animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <CheckCircle2 size={18} className="text-success" />
                                    <p className="text-foreground font-bold text-sm">
                                        Acknowledgment
                                    </p>
                                </div>
                                <p className="text-muted-foreground text-xs ml-6 leading-relaxed">
                                    By proceeding to register or log in, you confirm that you understand this is a demonstration application built to showcase software development work, and that nothing here constitutes a real financial service.
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
            `}</style>
        </>
    );
}