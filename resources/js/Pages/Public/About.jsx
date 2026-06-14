import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Navbar from "../../Components/Common/Navbar";
import Footer from "../../Components/Common/Footer";
import { 
    Target, Users, Zap, ShieldCheck, Smartphone, 
    Wallet, GraduationCap, Sparkles, Shield, HeartHandshake
} from 'lucide-react';
import FloatingButton from '../../Components/Support/FloatingButton';

export default function About() {
    const { url } = usePage();

    useEffect(() => {
        // Simple scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 scroll-smooth">
            <Navbar currentPage="about" />

            <main className="flex-1 w-full">
                
               {/* HERO & BENTO BOX GRID SECTION */}
                <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 lg:py-20">

                        {/* Header Title */}
                        <div className="mb-12">
                            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-4 tracking-tight">
                                Banking made simple.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                                    Designed for your future.
                                </span>
                            </h1>
                            <p className="text-lg text-slate-500 font-medium max-w-2xl">
                                Learn more about Youth MoneyBank and how we're changing the way young Filipinos save and manage their finances.
                            </p>
                        </div>

                    {/* THE BENTO BOX GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
                        
                        {/* OUR MISSION */}
                            <div className="bg-gradient-to-br from-blue-800 to-blue-600 rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-between md:col-span-2 shadow-sm">
                                <div className="relative z-10 max-w-xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Target className="text-cyan-300" size={32} />
                                        <h2 className="text-3xl font-black text-white tracking-tight">Our Mission</h2>
                                    </div>
                                    <p className="text-blue-100 font-medium leading-relaxed text-[15px]">
                                        We provide a secure and youth-focused financial onboarding platform. We enable minors to save responsibly through a tier-based system that integrates directly with licensed partner banks for fund custody and regulatory compliance.
                                    </p>
                                </div>
                                {/* Static Watermark Icon */}
                                <Target className="absolute -bottom-10 -right-10 text-white/10 w-64 h-64 rotate-12" strokeWidth={1} />
                            </div>

                        {/* WHO WE SERVE */}
                            <div className="bg-white rounded-[2rem] p-8 relative overflow-hidden flex flex-col md:row-span-2 border border-slate-200 shadow-sm">
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                                        <Users size={32} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Who We Serve</h2>
                                    <p className="text-slate-500 font-medium leading-relaxed text-[15px]">
                                        Whether you're a student, young professional, or just someone who wants to save money early—we're here for you. If traditional banks have turned you away or their requirements seem impossible, Youth MoneyBank welcomes you. Your financial journey starts here.
                                    </p>
                                </div>
                            </div>

                        {/* SECURITY */}
                            <div className="bg-cyan-500 rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-between shadow-sm">
                                <div className="relative z-10">
                                    <ShieldCheck className="text-white mb-4" size={32} />
                                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Bank-Level<br/>Security</h3>
                                    <p className="text-cyan-50 text-sm font-medium">Your money is strictly protected.</p>
                                </div>
                                <ShieldCheck className="absolute -bottom-8 -right-8 text-white/20 w-40 h-40 -rotate-12" strokeWidth={1} />
                            </div>

                        {/* LIGHTNING FAST */}
                            <div className="bg-slate-900 rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-between shadow-sm">
                                <div className="relative z-10">
                                    <Zap className="text-blue-400 mb-4" size={32} />
                                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Lightning<br/>Fast</h3>
                                    <p className="text-slate-400 text-sm font-medium">Open an account in under 5 minutes.</p>
                                </div>
                                <Zap className="absolute -bottom-8 -right-8 text-white/5 w-40 h-40 rotate-12" strokeWidth={1} />
                            </div>

                    </div>
                </div>

               {/* HOW IT WORKS SECTION */}
                    <section className="px-4 py-20 bg-white border-y border-slate-100">
                        <div className="max-w-7xl mx-auto md:px-4">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">How It Works</h2>
                                <div className="w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full mx-auto mb-6"></div>
                                <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Three simple steps to start your financial journey</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                                {[
                                    {
                                        step: '01',
                                        icon: <Smartphone size={40} strokeWidth={1.5} />,
                                        title: 'Sign Up',
                                        desc: 'Register with just your phone or Gmail',
                                        details: ['Quick Starter Account access', 'No documents required', 'Takes 2 minutes']
                                    },
                                    {
                                        step: '02',
                                        icon: <Wallet size={40} strokeWidth={1.5} />,
                                        title: 'Start Saving',
                                        desc: 'Add money and use youth-centered tools',
                                        details: ['Track your goals progress', 'Manage your allowance', 'Earn rewards as you save']
                                    },
                                    {
                                        step: '03',
                                        icon: <GraduationCap size={40} strokeWidth={1.5} />,
                                        title: 'Grow Up',
                                        desc: 'Upgrade to Builder or Achiever accounts',
                                        details: ['Balance limits up to ₱100,000', 'Cash-out access', 'Adult features at 18+']
                                    }
                                ].map((step, idx) => (
                                    <div key={idx} className="flex flex-col p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative">
                                        <div className="text-blue-600 mb-6">
                                            {step.icon}
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                                            <span className="text-cyan-500 mr-2">{step.step}.</span>
                                            {step.title}
                                        </h3>
                                        <p className="text-slate-500 mb-6 font-medium text-sm leading-relaxed">{step.desc}</p>
                                        
                                        <div className="space-y-3 w-full text-sm font-medium mt-auto">
                                            {step.details.map((detail, didx) => (
                                                <div key={didx} className="flex items-center gap-3 text-slate-600">
                                                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
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
                    <section className="px-4 py-24 bg-gradient-to-br from-blue-900 to-slate-900">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Our Commitment to You</h2>
                            <p className="text-lg text-blue-100 leading-relaxed mb-12 font-medium px-4">
                                We're not just a banking app—we're your financial ally. Every feature we build, every decision we make, centers on your future. We believe in financial inclusion, transparency, and growth. Your success is our success.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 px-4">
                                {[
                                    { icon: <Sparkles size={28} />, label: 'Transparency' },
                                    { icon: <Shield size={28} />, label: 'Security' },
                                    { icon: <HeartHandshake size={28} />, label: 'Empowerment' }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-[1.5rem] p-6 border border-white/10 flex flex-col items-center">
                                        <div className="text-cyan-400 mb-3">
                                            {item.icon}
                                        </div>
                                        <p className="text-white font-bold tracking-wider uppercase text-xs">{item.label}</p>
                                    </div>
                                ))}
                            </div>
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