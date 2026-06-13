// resources/js/Components/Support/HelpCenterModal.jsx
import { Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    X, ArrowRight, ArrowDownToLine, Target, UserCircle, Shield, 
    Info, MessageCircle, ExternalLink, Search,
} from 'lucide-react';

const iconMap = {
    ArrowDownToLine, Target, UserCircle, Shield, Info,
};

const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'bg-blue-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'bg-emerald-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: 'bg-purple-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'bg-amber-100' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: 'bg-slate-100' },
};

export default function HelpCenterModal({ onClose, isAuthenticated = false }) {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch categories from help index page data
        // For modal: hard-code from same source as backend
        setCategories([
            { slug: 'deposit', name: 'Deposit', icon: 'ArrowDownToLine', description: 'Adding money to your wallet', color: 'blue', article_count: 3 },
            { slug: 'savings', name: 'Savings & Goals', icon: 'Target', description: 'Saving money and tracking goals', color: 'emerald', article_count: 3 },
            { slug: 'account', name: 'Account & KYC', icon: 'UserCircle', description: 'Verification and account settings', color: 'purple', article_count: 3 },
            { slug: 'security', name: 'Security', icon: 'Shield', description: 'Account safety and login', color: 'amber', article_count: 3 },
            { slug: 'about', name: 'About Youth MoneyBank', icon: 'Info', description: 'How YMB works', color: 'slate', article_count: 2 },
        ]);
        setIsLoading(false);
    }, []);

    const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
    };

    useEffect(() => {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                    
                    <div className="relative z-10 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                                <MessageCircle size={22} className="text-white" strokeWidth={2} />
                            </div>
                            <div>
                                <h2 className="text-base font-black">Help Center</h2>
                                <p className="text-[11px] text-blue-100 font-medium">
                                    How can we help you today?
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                            aria-label="Close"
                        >
                            <X size={16} className="text-white" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex-1 overflow-y-auto p-5">
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-400 text-sm">Loading...</div>
                    ) : (
                        <>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                                Browse by category
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {categories.map(cat => {
                                    const Icon = iconMap[cat.icon] || Info;
                                    const colors = colorMap[cat.color] || colorMap.slate;
                                    return (
                                        <Link
                                            key={cat.slug}
                                            href={`/help/${cat.slug}`}
                                            onClick={onClose}
                                            className={`p-3 rounded-xl border ${colors.border} ${colors.bg} hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all flex items-center gap-3 group`}
                                        >
                                            <div className={`w-10 h-10 ${colors.icon} rounded-lg flex items-center justify-center shrink-0`}>
                                                <Icon size={18} className={colors.text} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-xs font-black ${colors.text} truncate`}>{cat.name}</p>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-medium truncate">{cat.description}</p>
                                                <p className="text-[9px] text-slate-400 font-bold mt-0.5">{cat.article_count} articles</p>
                                            </div>
                                            <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-600 shrink-0 transition-colors" strokeWidth={2.5} />
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* View all link */}
                            <Link
                                href="/help"
                                onClick={onClose}
                                className="mt-3 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer transition-colors"
                            >
                                View Full Help Center
                                <ExternalLink size={12} strokeWidth={2.5} />
                            </Link>
                        </>
                    )}
                </div>

                {/* Footer — Contact Support CTA */}
                <div className="border-t border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-black text-slate-900">Can't find what you need?</p>
                            <p className="text-[10px] text-slate-500 font-medium">
                                {isAuthenticated ? 'Get personalized help from our team' : 'Sign in to talk to our support team'}
                            </p>
                        </div>
                        {isAuthenticated ? (
                            <Link
                                href="/support/new"
                                onClick={onClose}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-xl shadow-md cursor-pointer transition-all whitespace-nowrap"
                            >
                                Contact Support
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                onClick={onClose}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-xl shadow-md cursor-pointer transition-all whitespace-nowrap"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}