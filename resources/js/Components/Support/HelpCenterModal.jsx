// resources/js/Components/Support/HelpCenterModal.jsx
import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    X, ArrowRight, Headphones, ExternalLink,
} from 'lucide-react';

const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

export default function HelpCenterModal({ onClose, isAuthenticated = false, onChatOpen = null }) {
    const [categories] = useState([
        { slug: 'deposit', name: 'Deposit', description: 'Adding money to your wallet', color: 'blue', article_count: 7 },
        { slug: 'savings', name: 'Savings & Goals', description: 'Saving money and tracking goals', color: 'emerald', article_count: 7 },
        { slug: 'account', name: 'Account & KYC', description: 'Verification and account settings', color: 'purple', article_count: 7 },
        { slug: 'security', name: 'Security & Privacy', description: 'Account safety and protection', color: 'amber', article_count: 7 },
        { slug: 'about', name: 'About Youth MoneyBank', description: 'How YMB works', color: 'slate', article_count: 6 },
    ]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Compact header */}
                <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <Headphones size={18} className="text-white" strokeWidth={2.5} />
                        <h2 className="text-sm font-black">Customer Service</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 hover:bg-white/10 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                        aria-label="Close"
                    >
                        <X size={14} className="text-white" strokeWidth={2.5} />
                    </button>
                </div>

                {/* Categories list — compact */}
                <div className="flex-1 overflow-y-auto p-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                        Browse by topic
                    </p>
                    <div className="space-y-1.5">
                        {categories.map(cat => {
                            const colors = colorMap[cat.color] || colorMap.slate;
                            return (
                                <Link
                                    key={cat.slug}
                                    href={`/help/${cat.slug}`}
                                    onClick={onClose}
                                    className={`block p-3 rounded-lg border ${colors.border} ${colors.bg} hover:shadow-sm cursor-pointer transition-all group`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-black ${colors.text}`}>{cat.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium truncate">{cat.description}</p>
                                        </div>
                                        <ArrowRight size={12} className="text-slate-400 group-hover:translate-x-0.5 shrink-0 transition-all" strokeWidth={2.5} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* View all link */}
                    <Link
                        href="/help"
                        onClick={onClose}
                        className="mt-3 flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                    >
                        View All Help Articles
                        <ExternalLink size={10} strokeWidth={2.5} />
                    </Link>
                </div>

                {/* Compact footer — highlighted button */}
                <div className="border-t border-slate-100 bg-slate-50 p-3">
                    {isAuthenticated ? (
                        <button
                            onClick={() => {
                                onClose();
                                onChatOpen && onChatOpen();
                            }}
                            className="block w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black text-center rounded-lg shadow-md cursor-pointer transition-all"
                        >
                            Contact Support
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            onClick={onClose}
                            className="block w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black text-center rounded-lg shadow-md cursor-pointer transition-all"
                        >
                            Sign In to Contact Support
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}