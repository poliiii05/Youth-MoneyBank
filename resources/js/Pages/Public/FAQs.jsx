import { useEffect, useState } from 'react';
import Navbar from "../../Components/Common/Navbar";
import Footer from "../../Components/Common/Footer";
import AIChat from "../../Components/AI/AIChat";
import { Rocket, Target, Wallet, ShieldCheck, Settings, LifeBuoy, Plus, MessageSquare, Mail } from 'lucide-react';

export default function FAQ() {
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const faqs = [
        {
            category: 'Getting Started',
            id: 'gs',
            icon: <Rocket size={24} />,
            questions: [
                { id: 'gs1', q: 'How do I sign up for Youth MoneyBank?', a: 'Sign up is simple! Visit our app and choose your account tier. Tier 1 requires just your phone number or Gmail. Tier 2 needs a Student ID, and Tier 3 requires a valid Government ID (18+). The entire process takes less than 5 minutes.' },
                { id: 'gs2', q: 'Do I need an ID to open an account?', a: 'No! Our Tier 1 accounts don\'t require any ID—just your phone number or Gmail. As you grow, you can upgrade to Tier 2 with a Student ID or Tier 3 with a Government ID for higher limits.' },
                { id: 'gs3', q: 'What\'s the minimum age to use Youth MoneyBank?', a: 'The platform is designed for youth aged 13 and above. Minors (13-17) can start with Tier 1 or Tier 2 with parental/guardian consent. At 18+, you can verify for Tier 3 to access full banking features.' },
                { id: 'gs4', q: 'Can parents help manage their child\'s account?', a: 'Yes! Parents can use the platform to send allowances directly to their child\'s account. They can also set spending controls and monitor activity through our allowance management features.' }
            ]
        },
        {
            category: 'Account & Tiers',
            id: 'at',
            icon: <Target size={24} />,
            questions: [
                { id: 'at1', q: 'What are the differences between the three tiers?', a: 'Tier 1 (Starter) has a simulated ₱5,000 limit and is cash-in only. Tier 2 (Student) supports cash-in/out with a ₱20,000 limit. Tier 3 (Advanced) allows up to ₱100,000 for verified users 18+ with full access.' },
                { id: 'at2', q: 'How do I withdraw my money?', a: 'Tier 2 and Tier 3 users can cash-out through our integrated partner bank channels. Tier 1 accounts do not support instant withdrawal but may request a guardian-assisted release subject to manual review.' },
                { id: 'at3', q: 'What happens if I exceed my tier limit?', a: 'You won\'t be able to deposit additional funds until your balance drops below your tier\'s maximum limit. We recommend upgrading to a higher tier if you need more capacity.' },
                { id: 'at4', q: 'Is there a monthly fee?', a: 'There are no monthly maintenance fees. Registration is completely free, though minimal fees may apply for certain cash-out services to cover partner bank processing costs.' }
            ]
        },
        {
            category: 'Transactions & Money Management',
            id: 'tm',
            icon: <Wallet size={24} />,
            questions: [
                { id: 'tm1', q: 'How do I deposit money into my account?', a: 'For this platform demonstration, cash-in is simulated securely using developer sandbox environments (like PayPal Sandbox). No real-world currency is charged to your accounts.' },
                { id: 'tm2', q: 'How long does it take to withdraw my money?', a: 'Withdrawals are usually processed efficiently. You can withdraw through partner bank channels and outlets once you are upgraded to Tier 2 or Tier 3.' },
                { id: 'tm3', q: 'Can I send money to other Youth MoneyBank users?', a: 'Yes! You can transfer money between accounts using our fast, secure, and free peer-to-peer transfer feature within the network.' },
                { id: 'tm4', q: 'How do parent allowance transfers work?', a: 'Parents can set up recurring allowance transfers. Children receive real-time push notifications when money arrives, and parents can view spending activity and summaries.' }
            ]
        },
        {
            category: 'Security & Privacy',
            id: 'sp',
            icon: <ShieldCheck size={24} />,
            questions: [
                { id: 'sp1', q: 'Is my money safe with Youth MoneyBank?', a: 'As this is a conceptual developer portfolio project, no actual funds are processed. However, in a live production environment, all user funds would be securely held by a BSP-regulated partner bank.' },
                { id: 'sp2', q: 'What security features do you have?', a: 'We use password hashing, OTP for sensitive operations, secure sessions, and progressive KYC verification matching your account tier.' },
                { id: 'sp3', q: 'How is my personal information protected?', a: 'We follow the principles of the Philippine Data Privacy Act of 2012. We highly advise users to only upload dummy data or mock images during this demonstration phase.' },
                { id: 'sp4', q: 'What should I do if I suspect fraudulent activity?', a: 'Contact our support team immediately. We encourage users to enable notifications to monitor all simulated transactions on their accounts.' }
            ]
        },
        {
            category: 'Features & Tools',
            id: 'ft',
            icon: <Settings size={24} />,
            questions: [
                { id: 'ft1', q: 'How do savings goals work?', a: 'You can create custom goals with target amounts and deadlines. The app provides visual progress tracking and motivation notifications to help you reach your goals.' },
                { id: 'ft2', q: 'What are spending summaries?', a: 'Spending summaries provide monthly analytics with category breakdowns and budget recommendations, helping you understand your financial habits.' },
                { id: 'ft3', q: 'Can I set spending limits?', a: 'Yes. Parents can set spending controls on their children\'s allowances, and users can use the spending summaries to track their own budgets.' },
                { id: 'ft4', q: 'Do you offer debit cards?', a: 'Virtual and physical debit cards, along with QR code payments, are planned for future Phase 3 releases. Currently, transactions are managed purely digitally.' }
            ]
        },
        {
            category: 'Support & Troubleshooting',
            id: 'st',
            icon: <LifeBuoy size={24} />,
            questions: [
                { id: 'st1', q: 'How do I contact customer support?', a: 'You can reach our support team through the in-app AI chat for quick answers, or via email for specific account inquiries.' },
                { id: 'st2', q: 'What do I do if I forget my password?', a: 'Tap "Forgot Password" on the login screen and follow the verification steps. You\'ll receive a reset link via your registered email or phone.' },
                { id: 'st3', q: 'Can I delete my account?', a: 'Yes, you can request account deletion through Account Settings. In this demo environment, test accounts and uploaded files may also be periodically reset by the developer.' }
            ]
        }
    ];

    const toggleExpanded = (id) => setExpandedId(expandedId === id ? null : id);
    const leftFaqs = faqs.slice(0, 3);
    const rightFaqs = faqs.slice(3);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 scroll-smooth">
            <Navbar currentPage="faq" />

            <div className="w-full px-4 py-16 lg:py-24 bg-gradient-to-br from-blue-900 to-slate-900 border-b border-blue-800">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 tracking-tight">Frequently Asked Questions</h1>
                    <p className="text-lg text-blue-200 font-medium max-w-2xl mx-auto">
                        Everything you need to know about Youth MoneyBank, from setting up your account to managing your savings.
                    </p>
                </div>
            </div>

            <main className="flex-1 px-4 py-16 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                        
                        {/* LEFT COLUMN */}
                        <div className="space-y-12">
                            {leftFaqs.map((section, sidx) => (
                                <section key={sidx} id={section.id}>
                                    <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                        <span className="text-blue-600">{section.icon}</span>{section.category}
                                    </h2>
                                    <div className="space-y-4">
                                        {section.questions.map((item) => (
                                            <div key={item.id} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${expandedId === item.id ? 'border-blue-600 shadow-md bg-white' : 'border-slate-200 hover:border-blue-300 bg-white'}`}>
                                                <button onClick={() => toggleExpanded(item.id)} className="w-full px-6 py-5 flex items-center justify-between text-left">
                                                    <h3 className={`font-bold transition-colors duration-300 ${expandedId === item.id ? 'text-blue-700' : 'text-slate-800'}`}>{item.q}</h3>
                                                    <span className="text-blue-600 ml-4 flex-shrink-0">
                                                        <Plus size={20} className={`transition-transform duration-300 ${expandedId === item.id ? 'rotate-45' : ''}`} />
                                                    </span>
                                                </button>
                                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedId === item.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                    <div className="px-6 pb-5 pt-1 text-slate-600 font-medium text-sm leading-relaxed">{item.a}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-12">
                            {rightFaqs.map((section, sidx) => (
                                <section key={sidx + 3} id={section.id}>
                                    <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                        <span className="text-blue-600">{section.icon}</span>{section.category}
                                    </h2>
                                    <div className="space-y-4">
                                        {section.questions.map((item) => (
                                            <div key={item.id} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${expandedId === item.id ? 'border-blue-600 shadow-md bg-white' : 'border-slate-200 hover:border-blue-300 bg-white'}`}>
                                                <button onClick={() => toggleExpanded(item.id)} className="w-full px-6 py-5 flex items-center justify-between text-left">
                                                    <h3 className={`font-bold transition-colors duration-300 ${expandedId === item.id ? 'text-blue-700' : 'text-slate-800'}`}>{item.q}</h3>
                                                    <span className="text-blue-600 ml-4 flex-shrink-0">
                                                        <Plus size={20} className={`transition-transform duration-300 ${expandedId === item.id ? 'rotate-45' : ''}`} />
                                                    </span>
                                                </button>
                                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedId === item.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                    <div className="px-6 pb-5 pt-1 text-slate-600 font-medium text-sm leading-relaxed">{item.a}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>

                    {/* CONTACT BENTO */}
                    <section className="mt-20 bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm text-center max-w-4xl mx-auto">
                        <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Still have questions?</h3>
                        <p className="text-slate-500 mb-8 font-medium">Our support team is available 24/7 to help. Reach out through any of these channels:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center">
                                <MessageSquare className="text-blue-600 mb-3" size={32} />
                                <p className="font-bold text-slate-900 mb-1">AI Chat Support</p>
                                <p className="text-sm text-slate-500 font-medium">Try our AI assistant</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center">
                                <Mail className="text-cyan-500 mb-3" size={32} />
                                <p className="font-bold text-slate-900 mb-1">Email</p>
                                <p className="text-sm text-slate-500 font-medium">help@ymb.com</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
            <AIChat />
        </div>
    );
}