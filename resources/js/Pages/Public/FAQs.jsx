import { useEffect, useState } from 'react';
import Navbar from "../../Components/Common/Navbar";
import Footer from "../../Components/Common/Footer";
import { Rocket, Target, Wallet, ShieldCheck, Settings, LifeBuoy, Plus, MessageSquare, Mail } from 'lucide-react';
import FloatingButton from '../../Components/Support/FloatingButton';

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
                { id: 'gs1', q: 'How do I sign up for Youth MoneyBank?', a: 'Sign up with your email address and a password, or continue with your Google account. Every new account starts at Tier 1 (Starter) — no documents needed. You can apply to upgrade later from inside the app.' },
                { id: 'gs2', q: 'Do I need an ID to open an account?', a: 'No. Tier 1 (Starter) needs only an email address. If you want a higher balance limit, you can submit a Student ID to reach Tier 2 (Builder), or a government ID to reach Tier 3 (Achiever).' },
                { id: 'gs3', q: 'Who is this platform designed for?', a: 'Youth MoneyBank is built around the needs of Filipino teenagers who are starting to save but do not yet meet traditional bank onboarding requirements. Tier 3 requires a government ID and is intended for users aged 18 and above.' },
                { id: 'gs4', q: 'How do I upgrade my tier?', a: 'Go to the KYC section in your account and submit the document required for the tier you want. Your application goes to an admin review queue, and your limit updates once it is approved.' }
            ]
        },
        {
            category: 'Account & Tiers',
            id: 'at',
            icon: <Target size={24} />,
            questions: [
                { id: 'at1', q: 'What are the differences between the three tiers?', a: 'Tier 1 (Starter) caps your balance at ₱5,000 and needs only an email. Tier 2 (Builder) raises it to ₱20,000 with a verified Student ID. Tier 3 (Achiever) reaches ₱100,000 for fully verified users aged 18 and above.' },
                { id: 'at2', q: 'What happens if I reach my tier limit?', a: 'You will not be able to add more funds until your balance drops below your tier maximum. If you need more room, submit a tier upgrade application from the KYC section.' },
                { id: 'at3', q: 'Why was my upgrade application rejected?', a: 'The most common reasons are an unreadable document photo, a document that does not match the tier requirement, or details that do not match your account. You can review the reason in your KYC status page and submit again.' },
                { id: 'at4', q: 'Is there a monthly fee?', a: 'No. This is a portfolio demonstration platform and no fees of any kind are charged.' }
            ]
        },
        {
            category: 'Money & Savings',
            id: 'tm',
            icon: <Wallet size={24} />,
            questions: [
                { id: 'tm1', q: 'How do I add money to my account?', a: 'Cash-in runs through the PayPal Sandbox environment. This is a developer test environment — no real money moves and nothing is charged to any real account.' },
                { id: 'tm2', q: 'How do savings goals work?', a: 'Create a goal with a name and a target amount, then allocate money from your wallet into it. Allocated funds are tracked separately from your spendable balance, and you can deallocate them back at any time.' },
                { id: 'tm3', q: 'What is the difference between my wallet and my savings?', a: 'Your wallet holds spendable funds. Your savings pool is money you have deliberately set aside — you move funds between the two yourself, and your goals draw from the savings side.' },
                { id: 'tm4', q: 'Can I withdraw money to a real bank account?', a: 'No. Cash-out to external bank accounts is out of scope for this demonstration. A production deployment would route this through InstaPay or PESONet with a licensed sponsor bank.' }
            ]
        },
        {
            category: 'Security & Privacy',
            id: 'sp',
            icon: <ShieldCheck size={24} />,
            questions: [
                { id: 'sp1', q: 'Is my money safe with Youth MoneyBank?', a: 'This is a developer portfolio project and no real funds are held or processed. In a production deployment, user funds would sit with a BSP-licensed partner bank, and the platform itself would require e-money issuer licensing.' },
                { id: 'sp2', q: 'What security measures are in place?', a: 'Passwords are hashed with bcrypt, sessions are encrypted, forms are CSRF protected, and sensitive endpoints are rate limited. Access to tier-restricted actions is enforced by authorization middleware on the server, not just hidden in the interface.' },
                { id: 'sp3', q: 'How is my personal information handled?', a: 'The project follows the principles of the Philippine Data Privacy Act of 2012. Because this is a demonstration environment, please upload only dummy documents or mock images — never a real government ID.' },
                { id: 'sp4', q: 'What happens to documents I upload?', a: 'KYC documents are stored on private disk storage and are automatically deleted after 24 hours. They are not validated against any real government identity system.' }
            ]
        },
        {
            category: 'Features & Tools',
            id: 'ft',
            icon: <Settings size={24} />,
            questions: [
                { id: 'ft1', q: 'How do savings streaks work?', a: 'Saving consistently builds a daily streak, with milestones at 7, 14, 30, 60, 100, 180 and 365 days. Reaching a milestone unlocks an achievement badge on your Insights page.' },
                { id: 'ft2', q: 'What is the Insights page?', a: 'Insights summarises your saving behaviour: a monthly calendar view of your activity, your achievement badges, a savings personality classification (Slow & Steady, Goal Chaser, or Streak Master), and AI-generated tips based on your habits.' },
                { id: 'ft3', q: 'Are there debit cards or QR payments?', a: 'Not currently. QR code payments and debit card issuance are listed as future phases and are not part of this build.' },
                { id: 'ft4', q: 'Is there an investment feature?', a: 'No. Investment products such as UITFs, stocks, and crypto are explicitly out of scope. Youth MoneyBank is a savings platform.' }
            ]
        },
        {
            category: 'Support & Troubleshooting',
            id: 'st',
            icon: <LifeBuoy size={24} />,
            questions: [
                { id: 'st1', q: 'How do I get help?', a: 'Open the support chat from the button in the corner of any page. It answers common questions from the help articles first, falls back to an AI assistant, and can escalate to a human agent if your question needs one.' },
                { id: 'st2', q: 'What do I do if I forget my password?', a: 'Use the "Forgot password?" link on the login page. A reset link is sent to your registered email address.' },
                { id: 'st3', q: 'What if I signed up with Google?', a: 'Accounts created through Google sign-in do not have a password of their own — just use the "Sign in with Google" button again rather than the email and password form.' },
                { id: 'st4', q: 'Can I delete my account?', a: 'You can request account deletion through Account Settings. Note that in this demo environment, test accounts and uploaded files may also be reset periodically by the developer.' }
            ]
        }
    ];

    const toggleExpanded = (id) => setExpandedId(expandedId === id ? null : id);
    const leftFaqs = faqs.slice(0, 3);
    const rightFaqs = faqs.slice(3);

    const renderSection = (section, key) => (
        <section key={key} id={section.id}>
            <h2 className="text-2xl font-black text-foreground mb-6 flex items-center gap-3">
                <span className="text-primary">{section.icon}</span>{section.category}
            </h2>
            <div className="space-y-4">
                {section.questions.map((item) => (
                    <div
                        key={item.id}
                        className={`border rounded-2xl overflow-hidden transition-all duration-300 bg-card ${
                            expandedId === item.id
                                ? 'border-primary shadow-md'
                                : 'border-border hover:border-primary/40'
                        }`}
                    >
                        <button
                            onClick={() => toggleExpanded(item.id)}
                            className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
                        >
                            <h3
                                className={`font-bold transition-colors duration-300 ${
                                    expandedId === item.id ? 'text-primary' : 'text-foreground'
                                }`}
                            >
                                {item.q}
                            </h3>
                            <span className="text-primary ml-4 flex-shrink-0">
                                <Plus
                                    size={20}
                                    className={`transition-transform duration-300 ${
                                        expandedId === item.id ? 'rotate-45' : ''
                                    }`}
                                />
                            </span>
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                expandedId === item.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                            <div className="px-6 pb-5 pt-1 text-muted-foreground font-medium text-sm leading-relaxed">
                                {item.a}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );

    return (
        <div className="flex flex-col min-h-screen bg-muted scroll-smooth">
            <Navbar currentPage="faq" />

            <div className="w-full px-4 py-16 lg:py-24 bg-gradient-to-br from-primary to-emerald-800 border-b border-primary">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 tracking-tight">Frequently Asked Questions</h1>
                    <p className="text-lg text-emerald-100 font-medium max-w-2xl mx-auto">
                        Everything you need to know about Youth MoneyBank, from setting up your account to managing your savings.
                    </p>
                </div>
            </div>

            <main className="flex-1 px-4 py-16 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                        <div className="space-y-12">
                            {leftFaqs.map((section, sidx) => renderSection(section, sidx))}
                        </div>
                        <div className="space-y-12">
                            {rightFaqs.map((section, sidx) => renderSection(section, sidx + 3))}
                        </div>
                    </div>

                    {/* CONTACT BENTO */}
                    <section className="mt-20 bg-card rounded-[2rem] p-10 border border-border shadow-sm text-center max-w-4xl mx-auto">
                        <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">Still have questions?</h3>
                        <p className="text-muted-foreground mb-8 font-medium">Reach out through either of these channels:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            <div className="bg-secondary rounded-2xl p-6 border border-border flex flex-col items-center">
                                <MessageSquare className="text-primary mb-3" size={32} />
                                <p className="font-bold text-foreground mb-1">AI Chat Support</p>
                                <p className="text-sm text-muted-foreground font-medium">Try our AI assistant</p>
                            </div>
                            <div className="bg-secondary rounded-2xl p-6 border border-border flex flex-col items-center">
                                <Mail className="text-primary mb-3" size={32} />
                                <p className="font-bold text-foreground mb-1">Email</p>
                                <p className="text-sm text-muted-foreground font-medium">help@ymb.com</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
            <FloatingButton isAuthenticated={false} />
        </div>
    );
}