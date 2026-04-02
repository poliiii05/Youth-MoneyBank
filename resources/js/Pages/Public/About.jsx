import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import Navbar from "../../Components/Common/Navbar";
import Footer from "../../Components/Common/Footer";
import AIChat from "../../Components/AI/AIChat";

export default function About() {
    const { url } = usePage();
    const [isVisible, setIsVisible] = useState({});
    const sectionRefs = useRef({});

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(prev => ({
                            ...prev,
                            [entry.target.id]: true
                        }));
                    }
                    // Keep visibility true even when scrolling away (maintain animation)
                });
            },
            { threshold: 0.05 }
        );

        Object.values(sectionRefs.current).forEach(ref => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            
            <Navbar currentPage="about" />

            {/* HERO SECTION WITH BACKGROUND */}
            <div 
                className="relative flex-1 w-full"
                style={{
                    backgroundImage: 'url("/images/AboutBackground.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* DARK OVERLAY - 60% TRANSPARENT */}
                <div className="absolute inset-0 bg-black" style={{ opacity: 0.6 }}></div>

                {/* CONTENT - BALANCED TWO COLUMNS */}
                <div className="relative z-10 flex items-center justify-center px-8 py-12 min-h-[700px]">
                    <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* LEFT SIDE - ABOUT HEADER */}
                        <div className="flex flex-col space-y-6 justify-center">
                            
                            {/* HEADER */}
                            <div className="opacity-0 w-full" style={{ animation: 'fadeInUp 0.8s ease-out forwards' }}>
                                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                                    About Youth Money Bank
                                </h1>
                                <div className="w-20 h-1 bg-gradient-to-r from-blue-300 to-blue-100 rounded-full mb-4"></div>
                                <p className="text-lg text-blue-100 font-light">
                                    Banking made simple. Designed for your future.
                                </p>
                            </div>

                            {/* MISSION CARD */}
                            <div 
                                className="bg-white bg-opacity-95 rounded-2xl p-8 shadow-2xl opacity-0 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] w-full backdrop-blur-sm border border-white border-opacity-20 animate-float"
                                style={{ animation: 'fadeInUp 0.8s ease-out 0.2s forwards, floatAnim 3s ease-in-out infinite 1s' }}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="text-3xl">🎯</span>
                                    <h2 className="text-2xl font-bold text-blue-900">Our Mission</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                    We believe every young Filipino deserves access to safe financial tools. Youth Money Bank removes barriers to saving by letting you start with just your phone—no complicated ID requirements, no minimum age restrictions that leave you out. We're your financial partner as you grow from a saver into a full banking customer.
                                </p>
                            </div>

                            {/* WHO WE SERVE CARD */}
                            <div 
                                className="bg-white bg-opacity-95 rounded-2xl p-8 shadow-2xl opacity-0 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] w-full backdrop-blur-sm border border-white border-opacity-20 animate-float"
                                style={{ animation: 'fadeInUp 0.8s ease-out 0.4s forwards, floatAnim 3s ease-in-out infinite 1.3s' }}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="text-3xl">👥</span>
                                    <h2 className="text-2xl font-bold text-blue-900">Who We Serve</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                    Whether you're a student, young professional, or just someone who wants to save money early—we're here for you. If traditional banks have turned you away or their requirements seem impossible, Youth Money Bank welcomes you. Your financial journey starts here, at your own pace.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT SIDE - WHY CHOOSE US */}
                        <div className="flex flex-col space-y-6 justify-center">
                            <div className="opacity-0 w-full" style={{ animation: 'fadeInUp 0.8s ease-out 0.1s forwards' }}>
                                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                                    Why Choose Us?
                                </h2>
                                <div className="w-20 h-1 bg-gradient-to-r from-blue-300 to-blue-100 rounded-full"></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                                {[
                                    { icon: '🚀', title: 'Lightning Fast', desc: 'Open an account in under 5 minutes', delay: '0.2s' },
                                    { icon: '🔒', title: 'Bank-Level Security', desc: 'Your money is protected like it\'s in a real bank', delay: '0.3s' },
                                    { icon: '📱', title: 'Mobile Powered', desc: 'Everything you need is in your phone', delay: '0.4s' },
                                    { icon: '🎁', title: 'Zero Hidden Costs', desc: 'No surprise fees, ever', delay: '0.5s' },
                                ].map((feature, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white bg-opacity-95 rounded-xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.05] hover:-translate-y-1 opacity-0 flex flex-col items-center text-center backdrop-blur-sm border border-white border-opacity-20 group"
                                        style={{ animation: `fadeInUp 0.8s ease-out ${feature.delay} forwards` }}
                                    >
                                        <div className="text-5xl mb-3 transform group-hover:scale-125 transition-transform duration-300">{feature.icon}</div>
                                        <h3 className="font-bold text-blue-900 text-lg mb-2">{feature.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* HOW IT WORKS SECTION */}
            <section 
                ref={el => sectionRefs.current.howItWorks = el}
                id="howItWorks"
                className="px-8 py-20 bg-gradient-to-b from-white via-blue-50 to-white relative overflow-hidden"
            >
                {/* Background decorative circles */}
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-100 rounded-full opacity-30 blur-3xl"></div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className={`text-center mb-12 transition-all duration-1000 ${isVisible.howItWorks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <h2 className="text-4xl lg:text-5xl font-bold text-blue-900 mb-3">How It Works</h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">Three simple steps to start your financial journey</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connection line */}
                        <div className="hidden md:block absolute top-24 left-0 w-full h-1 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 opacity-30"></div>

                        {[
                            {
                                step: '01',
                                icon: '📱',
                                title: 'Sign Up',
                                desc: 'Just your phone or Gmail—no ID needed',
                                details: ['Quick registration', 'No documents required', 'Takes 2 minutes']
                            },
                            {
                                step: '02',
                                icon: '💰',
                                title: 'Start Saving',
                                desc: 'Deposit and track your money safely',
                                details: ['Easy deposits', 'Real-time tracking', 'Secure storage']
                            },
                            {
                                step: '03',
                                icon: '🎓',
                                title: 'Grow Up',
                                desc: 'Upgrade to full banking at 18+',
                                details: ['Higher limits', 'Full access', 'Adult features']
                            }
                        ].map((step, idx) => (
                            <div
                                key={idx}
                                ref={el => sectionRefs.current[`step${idx}`] = el}
                                id={`step${idx}`}
                                className={`relative transition-all duration-1000 ${isVisible[`step${idx}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                                style={{ transitionDelay: `${idx * 200}ms` }}
                            >
                                <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border-2 border-blue-100 hover:border-blue-600 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group h-full relative z-10">
                                    {/* Step number badge */}
                                    <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        {step.step}
                                    </div>

                                    <div className="text-7xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">{step.icon}</div>
                                    <h3 className="text-2xl font-bold text-blue-900 mb-3">{step.title}</h3>
                                    <p className="text-gray-600 mb-6 font-medium">{step.desc}</p>
                                    
                                    {/* Details list */}
                                    <div className="space-y-2 w-full text-sm">
                                        {step.details.map((detail, didx) => (
                                            <div key={didx} className="flex items-center justify-center gap-2 text-gray-700">
                                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                                {detail}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* COMMITMENT SECTION */}
            <section 
                ref={el => sectionRefs.current.commitment = el}
                id="commitment"
                className="px-8 py-20 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden"
            >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>

                <div className={`max-w-4xl mx-auto relative z-10 text-center transition-all duration-1000 ${isVisible.commitment ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Our Commitment to You</h2>
                    <p className="text-xl text-blue-100 leading-relaxed mb-8">
                        We're not just a banking app—we're your financial ally. Every feature we build, every decision we make, centers on your future. We believe in financial inclusion, transparency, and growth. Your success is our success.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
                        {[
                            { icon: '✨', label: 'Transparency' },
                            { icon: '🛡️', label: 'Security' },
                            { icon: '💪', label: 'Empowerment' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-blue-500 bg-opacity-30 backdrop-blur-md rounded-lg p-4 border border-white border-opacity-40 hover:bg-opacity-50 transition-all duration-300 group">
                                <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                                <p className="text-white font-bold text-sm">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />

            {/* AI CHAT COMPONENT */}
            <AIChat />

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes floatAnim {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-8px);
                    }
                }

                @keyframes pulse-glow {
                    0%, 100% {
                        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
                    }
                    50% {
                        box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
                    }
                }

                .animate-float {
                    animation: floatAnim 3s ease-in-out infinite;
                }

                .animate-pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }

                scroll-behavior: smooth;
            `}</style>
        </div>
    );
}