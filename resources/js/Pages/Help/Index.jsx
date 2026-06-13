// resources/js/Pages/Help/Index.jsx
import { Head, Link } from '@inertiajs/react';
import { 
    MessageCircle, ArrowDownToLine, Target, UserCircle, Shield, 
    Info, ArrowRight,
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

export default function HelpIndex({ categories = [] }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Help Center | Youth MoneyBank" />

            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-12 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mx-auto mb-4">
                        <MessageCircle size={28} className="text-white" strokeWidth={2} />
                    </div>
                    <h1 className="text-3xl font-black mb-2">Help Center</h1>
                    <p className="text-sm text-blue-100 font-medium">
                        Find answers to common questions and learn how to use Youth MoneyBank
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-white/80 hover:text-white transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Browse by category
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categories.map(cat => {
                        const Icon = iconMap[cat.icon] || Info;
                        const colors = colorMap[cat.color] || colorMap.slate;
                        return (
                            <Link
                                key={cat.slug}
                                href={`/help/${cat.slug}`}
                                className={`p-4 rounded-2xl border ${colors.border} bg-white hover:shadow-md hover:scale-[1.01] cursor-pointer transition-all flex items-center gap-3 group`}
                            >
                                <div className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center shrink-0`}>
                                    <Icon size={22} className={colors.text} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-900">{cat.name}</p>
                                    <p className="text-[11px] text-slate-500 font-medium">{cat.description}</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1">{cat.article_count} articles</p>
                                </div>
                                <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-600 shrink-0 transition-colors" strokeWidth={2.5} />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}