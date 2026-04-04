import { useEffect, useRef, useState } from 'react';
import Navbar from "../../Components/Common/Navbar";
import Footer from "../../Components/Common/Footer";
import Button from "../../Components/Common/Button";
import AIChat from "../../Components/AI/AIChat";

// Main FAQ Component
export default function FAQ() {
    const [expandedId, setExpandedId] = useState(null);
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
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        Object.values(sectionRefs.current).forEach(ref => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    const faqs = [
        {
            category: 'Getting Started',
            id: 'gs',
            icon: '🚀',
            questions: [
                {
                    id: 'gs1',
                    q: 'How do I sign up for Youth Money Bank?',
                    a: 'Sign up is simple! Visit our app or website and choose your account tier. Tier 1 requires just your phone number or Gmail. Tier 2 needs a Student ID, and Tier 3 requires a valid Government ID (18+). The entire process takes less than 5 minutes.'
                },
                {
                    id: 'gs2',
                    q: 'Do I need an ID to open an account?',
                    a: 'No! Our Tier 1 accounts don\'t require any ID—just your phone number or Gmail. As you grow, you can upgrade to Tier 2 with a Student ID or Tier 3 with a Government ID for higher limits.'
                },
                {
                    id: 'gs3',
                    q: 'What\'s the minimum age to use Youth Money Bank?',
                    a: 'There\'s no strict minimum age! Minors can start with Tier 1 or Tier 2, but may need parental/guardian consent. At 18+, you can access Tier 3 with full banking features.'
                },
                {
                    id: 'gs4',
                    q: 'Can parents help manage their child\'s account?',
                    a: 'Yes! Parents can create a parent account and send allowances directly to their child\'s account. They can set spending limits and monitor activity with our spending summaries feature.'
                }
            ]
        },
        {
            category: 'Account & Tiers',
            id: 'at',
            icon: '🎯',
            questions: [
                {
                    id: 'at1',
                    q: 'What are the differences between the three tiers?',
                    a: 'Tier 1 (Starter) has a ₱3,000 limit and is cash-in only. Tier 2 (Student) supports cash-in/out with a ₱5,000 limit. Tier 3 (Advanced) allows ₱5,000 to ₱20,000 for users 18+ with full banking features.'
                },

                {
                    id: 'tm2',
                    q: 'How do I withdraw my money?',
                    a: 'Tier 2 and Tier 3 users can cash-out through our integrated partner bank channels. Tier 1 accounts do not support instant withdrawal but may request guardian-assisted release subject to manual review.'
                },

                {
                    id: 'at3',
                    q: 'What happens if I exceed my tier limit?',
                    a: 'You won\'t be able to deposit additional funds until your balance drops below your tier\'s limit. We recommend upgrading to a higher tier if you need more capacity.'
                },

                {
                    id: 'at4',
                    q: 'Is there a monthly fee?',
                    a: 'There are no monthly maintenance fees. Registration is completely free, though minimal fees may apply for certain services like cash-out transactions to cover partner bank processing costs.'
                }
            ]
        },
        {
            category: 'Transactions & Money Management',
            id: 'tm',
            icon: '💰',
            questions: [
                {
                    id: 'tm1',
                    q: 'How do I deposit money into my account?',
                    a: 'Cash-in is simple through our partner channels: bank transfers, over-the-counter deposits, or mobile wallet integration. All deposits are processed instantly with zero transfer fees.'
                },
                {
                    id: 'tm2',
                    q: 'How long does it take to withdraw my money?',
                    a: 'Withdrawals are usually processed within 24 hours. You can withdraw at any partner bank branch or ATM (Tier 3). Check the app for withdrawal locations near you.'
                },
                {
                    id: 'tm3',
                    q: 'Can I send money to other Youth Money Bank users?',
                    a: 'Yes! You can transfer money between accounts using our in-app transfer feature. It\'s fast, secure, and free for most transfers.'
                },
                {
                    id: 'tm4',
                    q: 'How do parent allowance transfers work?',
                    a: 'Parents can set up recurring allowance transfers through their parent account. Children receive notifications when money arrives, and parents can view spending activity.'
                }
            ]
        },
        {
            category: 'Security & Privacy',
            id: 'sp',
            icon: '🔒',
            questions: [
                {
                    id: 'sp1',
                    q: 'Is my money safe with Youth Money Bank?',
                    a: 'Yes! All funds are held by our licensed partner bank regulated by the Bangko Sentral ng Pilipinas (BSP). Your money is insured and protected with bank-level security.'
                },
                {
                    id: 'sp2',
                    q: 'What security features does Youth Money Bank have?',
                    a: 'We use end-to-end encryption, two-factor authentication, fraud monitoring, and continuous security updates. Your data is never shared without your consent.'
                },
                {
                    id: 'sp3',
                    q: 'How is my personal information protected?',
                    a: 'We comply with all data privacy laws and never sell your information. Your data is encrypted and stored securely. Read our Privacy Policy for complete details.'
                },
                {
                    id: 'sp4',
                    q: 'What should I do if I suspect fraudulent activity?',
                    a: 'Contact our support team immediately through the app. We\'ll investigate and take action to protect your account. Enable notifications to stay informed of all transactions.'
                }
            ]
        },
        {
            category: 'Features & Tools',
            id: 'ft',
            icon: '⚙️',
            questions: [
                {
                    id: 'ft1',
                    q: 'How do savings goals work?',
                    a: 'Create a goal (like "Summer Vacation Fund") and set a target amount and deadline. Track your progress visually and receive motivation notifications to help you reach your goal.'
                },
                {
                    id: 'ft2',
                    q: 'What are spending summaries?',
                    a: 'Spending summaries show monthly breakdowns of your cash-ins and cash-outs by category. This helps you understand your money habits and budget better.'
                },
                {
                    id: 'ft3',
                    q: 'Can I set spending limits?',
                    a: 'Parents can set spending limits on child accounts in Tier 2. Children can also track their spending against self-imposed limits.'
                },
                {
                    id: 'ft4',
                    q: 'Do you offer debit cards?',
                    a: 'Debit cards are a planned feature for future releases. Currently, you can access your funds through withdrawals at partner outlets or transfers.'
                }
            ]
        },
        {
            category: 'Support & Troubleshooting',
            id: 'st',
            icon: '🛟',
            questions: [
                {
                    id: 'st1',
                    q: 'How do I contact customer support?',
                    a: 'You can reach our support team 24/7 through the in-app chat, email, or phone. We\'re here to help with any questions or issues.'
                },
                {
                    id: 'st2',
                    q: 'What do I do if I forget my password?',
                    a: 'Tap "Forgot Password" on the login screen and follow the verification steps. You\'ll receive a reset link via email or SMS.'
                },
                {
                    id: 'st3',
                    q: 'Can I delete my account?',
                    a: 'Yes, you can delete your account anytime through Account Settings. Your balance must be zero before deletion. Contact support if you need assistance.'
                },
                {
                    id: 'st4',
                    q: 'Is Youth Money Bank available on iOS and Android?',
                    a: 'Yes! Download the app from the App Store (iOS) or Google Play (Android). Web access is also available through our website.'
                }
            ]
        }
    ];

    const toggleExpanded = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const leftFaqs = faqs.slice(0, 3);
    const rightFaqs = faqs.slice(3);

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
            
             <Navbar />

            {/* HERO SECTION WITH BACKGROUND */}
            <div 
                className="w-full px-8 py-20 relative overflow-hidden"
                style={{
                    backgroundImage: 'url("/images/FAQs.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/80 to-purple-900/80"></div>
                
                {/* Animated decorative elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-float-delayed"></div>
                </div>
                
                <div className="max-w-6xl mx-auto relative z-10">
                    <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in-up">Frequently Asked Questions</h1>
                    <p className="text-xl text-blue-100 animate-fade-in-up-delayed">
                        Find answers to common questions about Youth Money Bank
                    </p>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <main className="flex-1 px-8 py-16">
                <div className="max-w-7xl mx-auto">
                    {/* TWO COLUMN LAYOUT */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        
                        {/* LEFT COLUMN */}
                        <div className="space-y-8">
                            {leftFaqs.map((section, sidx) => (
                                <section 
                                    key={sidx} 
                                    ref={el => sectionRefs.current[section.id] = el}
                                    id={section.id}
                                    className={`transition-all duration-1000 ease-out ${
                                        isVisible[section.id] 
                                            ? 'opacity-100 translate-x-0' 
                                            : 'opacity-0 -translate-x-20'
                                    }`}
                                    style={{ transitionDelay: `${sidx * 100}ms` }}
                                >
                                    <h2 className="text-2xl font-bold text-blue-900 mb-6 pb-3 border-b-4 border-blue-300 flex items-center gap-3 group">
                                        <span className="text-3xl transform group-hover:scale-125 transition-transform duration-300">
                                            {section.icon}
                                        </span>
                                        <span className="group-hover:text-blue-600 transition-colors duration-300">
                                            {section.category}
                                        </span>
                                    </h2>

                                    <div className="space-y-3">
                                        {section.questions.map((item, qidx) => (
                                            <div
                                                key={item.id}
                                                className={`border-2 rounded-xl overflow-hidden transition-all duration-500 cursor-pointer ${
                                                    expandedId === item.id 
                                                        ? 'border-blue-600 shadow-lg scale-[1.02] bg-gradient-to-r from-blue-50 to-purple-50' 
                                                        : 'border-blue-200 hover:border-blue-400 hover:shadow-md bg-white'
                                                } ${
                                                    isVisible[section.id] 
                                                        ? 'opacity-100 translate-y-0' 
                                                        : 'opacity-0 translate-y-10'
                                                }`}
                                                style={{ transitionDelay: `${(sidx * 100) + (qidx * 80)}ms` }}
                                            >
                                                <button
                                                    onClick={() => toggleExpanded(item.id)}
                                                    className="w-full px-5 py-4 flex items-center justify-between transition-all duration-300 group"
                                                >
                                                    <h3 className="text-left font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                                                        {item.q}
                                                    </h3>
                                                    <span className={`text-2xl font-bold flex-shrink-0 ml-3 transition-all duration-500 ${
                                                        expandedId === item.id 
                                                            ? 'rotate-[135deg] text-purple-600 scale-125' 
                                                            : 'rotate-0 text-blue-600 group-hover:scale-110 group-hover:rotate-90'
                                                    }`}>
                                                        +
                                                    </span>
                                                </button>

                                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                                    expandedId === item.id 
                                                        ? 'max-h-96 opacity-100' 
                                                        : 'max-h-0 opacity-0'
                                                }`}>
                                                    <div className="px-5 py-4 border-t-2 border-blue-200 text-gray-700 leading-relaxed bg-gradient-to-b from-blue-50 to-white">
                                                        {item.a}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-8">
                            {rightFaqs.map((section, sidx) => (
                                <section 
                                    key={sidx + 3}
                                    ref={el => sectionRefs.current[section.id] = el}
                                    id={section.id}
                                    className={`transition-all duration-1000 ease-out ${
                                        isVisible[section.id] 
                                            ? 'opacity-100 translate-x-0' 
                                            : 'opacity-0 translate-x-20'
                                    }`}
                                    style={{ transitionDelay: `${sidx * 100}ms` }}
                                >
                                    <h2 className="text-2xl font-bold text-blue-900 mb-6 pb-3 border-b-4 border-blue-300 flex items-center gap-3 group">
                                        <span className="text-3xl transform group-hover:scale-125 transition-transform duration-300">
                                            {section.icon}
                                        </span>
                                        <span className="group-hover:text-blue-600 transition-colors duration-300">
                                            {section.category}
                                        </span>
                                    </h2>

                                    <div className="space-y-3">
                                        {section.questions.map((item, qidx) => (
                                            <div
                                                key={item.id}
                                                className={`border-2 rounded-xl overflow-hidden transition-all duration-500 cursor-pointer ${
                                                    expandedId === item.id 
                                                        ? 'border-blue-600 shadow-lg scale-[1.02] bg-gradient-to-r from-blue-50 to-purple-50' 
                                                        : 'border-blue-200 hover:border-blue-400 hover:shadow-md bg-white'
                                                } ${
                                                    isVisible[section.id] 
                                                        ? 'opacity-100 translate-y-0' 
                                                        : 'opacity-0 translate-y-10'
                                                }`}
                                                style={{ transitionDelay: `${(sidx * 100) + (qidx * 80)}ms` }}
                                            >
                                                <button
                                                    onClick={() => toggleExpanded(item.id)}
                                                    className="w-full px-5 py-4 flex items-center justify-between transition-all duration-300 group"
                                                >
                                                    <h3 className="text-left font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                                                        {item.q}
                                                    </h3>
                                                    <span className={`text-2xl font-bold flex-shrink-0 ml-3 transition-all duration-500 ${
                                                        expandedId === item.id 
                                                            ? 'rotate-[135deg] text-purple-600 scale-125' 
                                                            : 'rotate-0 text-blue-600 group-hover:scale-110 group-hover:rotate-90'
                                                    }`}>
                                                        +
                                                    </span>
                                                </button>

                                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                                    expandedId === item.id 
                                                        ? 'max-h-96 opacity-100' 
                                                        : 'max-h-0 opacity-0'
                                                }`}>
                                                    <div className="px-5 py-4 border-t-2 border-blue-200 text-gray-700 leading-relaxed bg-gradient-to-b from-blue-50 to-white">
                                                        {item.a}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>

                    {/* CONTACT SECTION */}
                    <section 
                        ref={el => sectionRefs.current.contact = el}
                        id="contact"
                        className={`bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl p-10 border-2 border-blue-300 mt-16 shadow-xl transition-all duration-1000 ${
                            isVisible.contact 
                                ? 'opacity-100 scale-100 translate-y-0' 
                                : 'opacity-0 scale-95 translate-y-10'
                        }`}
                    >
                        <h3 className="text-3xl font-bold text-blue-900 mb-4">Still have questions?</h3>
                        <p className="text-gray-700 mb-8 text-lg">
                            Our support team is available 24/7 to help. Reach out through any of these channels:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl p-6 text-center border-2 border-blue-200 hover:border-blue-600 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 group cursor-pointer">
                                <div className="text-5xl mb-3 group-hover:scale-125 transition-transform duration-300">💬</div>
                                <p className="font-bold text-gray-900 text-lg mb-1">AI Chat Support</p>
                                <p className="text-sm text-gray-600">Try our AI assistant</p>
                            </div>
                            <div className="bg-white rounded-xl p-6 text-center border-2 border-blue-200 hover:border-blue-600 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 group">
                                <div className="text-5xl mb-3 group-hover:scale-125 transition-transform duration-300">📧</div>
                                <p className="font-bold text-gray-900 text-lg mb-1">Email</p>
                                <p className="text-sm text-gray-600">help@ymb.com</p>
                            </div>
                        </div>
                    </section>

                </div>
            </main>

            <Footer />
            
                        {/* AI CHAT COMPONENT */}
                        <AIChat />

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-20px) scale(1.1); }
                }

                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(20px) scale(1.05); }
                }

                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }

                .animate-float-delayed {
                    animation: float-delayed 8s ease-in-out infinite;
                }

                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out;
                }

                .animate-fade-in-up-delayed {
                    animation: fade-in-up 0.8s ease-out 0.2s both;
                }

                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}