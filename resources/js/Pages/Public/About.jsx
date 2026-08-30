import { useEffect } from 'react';
import Navbar from "../../Components/Common/Navbar";
import Footer from "../../Components/Common/Footer";
import {
    Target, Users, Zap, ShieldCheck, Mail,
    Wallet, GraduationCap, Sparkles, Shield, HeartHandshake
} from 'lucide-react';
import FloatingButton from '../../Components/Support/FloatingButton';

export default function About() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-muted scroll-smooth">
            <Navbar currentPage="about" />

            <main className="flex-1 w-full">

                {/* HERO & BENTO BOX GRID SECTION */}
                <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 lg:py-20">

                    {/* Header Title */}
                    <div className="mb-12">
                        <h1 className="text-4xl lg:text-6xl font-black text-foreground mb-4 tracking-tight">
                            Banking made simple.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                                Designed for your future.
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium max-w-2xl">
                            Learn more about Youth MoneyBank and how we're changing the way young Filipinos save and manage their finances.
                        </p>
                    </div>

                    {/* THE BENTO BOX GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">

                        {/* OUR MISSION */}
                        <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-between md:col-span-2 shadow-sm">
                            <div className="relative z-10 max-w-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <Target className="text-emerald-200" size={32} />
                                    <h2 className="text-3xl font-black text-white tracking-tight">Our Mission</h2>
                                </div>
                                <p className="text-emerald-50 font-medium leading-relaxed text-[15px]">
                                    To show what youth-focused financial onboarding can look like when it is built around a progressive KYC tier system — letting young Filipinos start saving with an email address, then unlock higher limits as they verify. The architecture is designed so fund custody could be handed to a licensed partner bank in a real deployment.
                                </p>
                            </div>
                            <Target className="absolute -bottom-10 -right-10 text-white/10 w-64 h-64 rotate-12" strokeWidth={1} />
                        </div>

                        {/* WHO WE SERVE */}
                        <div className="bg-card rounded-[2rem] p-8 relative overflow-hidden flex flex-col md:row-span-2 border border-border shadow-sm">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-secondary text-primary rounded-2xl flex items-center justify-center mb-6">
                                    <Users size={32} strokeWidth={2.5} />
                                </div>
                                <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">Who We Serve</h2>
                                <p className="text-muted-foreground font-medium leading-relaxed text-[15px]">
                                    Filipino teenagers and students who want to start saving early but do not yet meet the onboarding requirements of a traditional bank. If the paperwork has always been the thing standing in your way, this is built for you — start with an email, verify later.
                                </p>
                            </div>
                        </div>

                        {/* SECURITY */}
                        <div className="bg-emerald-500 rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-between shadow-sm">
                            <div className="relative z-10">
                                <ShieldCheck className="text-white mb-4" size={32} />
                                <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Built on<br />Solid Rails</h3>
                                <p className="text-emerald-50 text-sm font-medium">Row-locked transactions and an append-only ledger.</p>
                            </div>
                            <ShieldCheck className="absolute -bottom-8 -right-8 text-white/20 w-40 h-40 -rotate-12" strokeWidth={1} />
                        </div>

                        {/* LIGHTNING FAST */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-between shadow-sm">
                            <div className="relative z-10">
                                <Zap className="text-emerald-400 mb-4" size={32} />
                                <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Lightning<br />Fast</h3>
                                <p className="text-slate-400 text-sm font-medium">Open an account in under 5 minutes.</p>
                            </div>
                            <Zap className="absolute -bottom-8 -right-8 text-white/5 w-40 h-40 rotate-12" strokeWidth={1} />
                        </div>

                    </div>
                </div>

                {/* HOW IT WORKS SECTION */}
                <section className="px-4 py-20 bg-card border-y border-border">
                    <div className="max-w-7xl mx-auto md:px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-black text-foreground mb-4 tracking-tight">How It Works</h2>
                            <div className="w-20 h-1.5 bg-gradient-to-r from-primary to-emerald-400 rounded-full mx-auto mb-6"></div>
                            <p className="text-muted-foreground font-medium text-lg max-w-2xl mx-auto">Three simple steps to start your financial journey</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                            {[
                                {
                                    step: '01',
                                    icon: <Mail size={40} strokeWidth={1.5} />,
                                    title: 'Sign Up',
                                    desc: 'Register with your email or Google account',
                                    details: ['Starts at Tier 1 (Starter)', 'No documents required', 'Takes under 5 minutes']
                                },
                                {
                                    step: '02',
                                    icon: <Wallet size={40} strokeWidth={1.5} />,
                                    title: 'Start Saving',
                                    desc: 'Set goals and build a saving habit',
                                    details: ['Create custom savings goals', 'Move funds into your savings pool', 'Build daily streaks and earn badges']
                                },
                                {
                                    step: '03',
                                    icon: <GraduationCap size={40} strokeWidth={1.5} />,
                                    title: 'Grow Up',
                                    desc: 'Verify to unlock a higher balance limit',
                                    details: ['Student ID unlocks ₱20,000', 'Government ID unlocks ₱100,000', 'Tier 3 requires age 18+']
                                }
                            ].map((step, idx) => (
                                <div key={idx} className="flex flex-col p-8 bg-muted rounded-[2rem] border border-border relative">
                                    <div className="text-primary mb-6">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-foreground mb-2 tracking-tight">
                                        <span className="text-emerald-500 mr-2">{step.step}.</span>
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground mb-6 font-medium text-sm leading-relaxed">{step.desc}</p>

                                    <div className="space-y-3 w-full text-sm font-medium mt-auto">
                                        {step.details.map((detail, didx) => (
                                            <div key={didx} className="flex items-center gap-3 text-foreground/70">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                                {detail}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* COMMITMENT SECTION */}
                <section className="px-4 py-24 bg-gradient-to-br from-emerald-900 to-slate-900">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Our Commitment to You</h2>
                        <p className="text-lg text-emerald-100 leading-relaxed mb-12 font-medium px-4">
                            Every feature here is built around one idea: that starting early should not require paperwork you do not have yet. We believe in financial inclusion, in being honest about what a platform can and cannot do, and in giving young savers room to grow into it.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 px-4">
                            {[
                                { icon: <Sparkles size={28} />, label: 'Transparency' },
                                { icon: <Shield size={28} />, label: 'Security' },
                                { icon: <HeartHandshake size={28} />, label: 'Empowerment' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white/5 rounded-[1.5rem] p-6 border border-white/10 flex flex-col items-center">
                                    <div className="text-emerald-400 mb-3">
                                        {item.icon}
                                    </div>
                                    <p className="text-white font-bold tracking-wider uppercase text-xs">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PORTFOLIO DISCLOSURE */}
                <section className="px-4 py-12 bg-card border-t border-border">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            <span className="font-bold text-foreground">A note on what this is.</span>{' '}
                            Youth MoneyBank is a technical portfolio project, not a licensed financial
                            institution. It does not hold or process real money — cash-in runs through
                            the PayPal Sandbox, and partner bank integration is demonstrated through a
                            swappable service layer rather than a live connection. A real deployment
                            would require BSP e-money issuer licensing and a licensed sponsor bank.
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
            <FloatingButton isAuthenticated={false} />

            <style>{`
                html {
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    );
}