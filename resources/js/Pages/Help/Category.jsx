// resources/js/Pages/Help/Category.jsx
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, ArrowRight, FileText, MessageCircle,
    ArrowDownToLine, Target, UserCircle, Shield, Info,
} from 'lucide-react';

const iconMap = { ArrowDownToLine, Target, UserCircle, Shield, Info };
const colorMap = {
    blue: { text: 'text-blue-700', icon: 'bg-blue-100', accent: 'bg-blue-600' },
    emerald: { text: 'text-emerald-700', icon: 'bg-emerald-100', accent: 'bg-emerald-600' },
    purple: { text: 'text-purple-700', icon: 'bg-purple-100', accent: 'bg-purple-600' },
    amber: { text: 'text-amber-700', icon: 'bg-amber-100', accent: 'bg-amber-600' },
    slate: { text: 'text-slate-700', icon: 'bg-slate-100', accent: 'bg-slate-600' },
};

export default function HelpCategory({ category, articles = [], allCategories = [] }) {
    const Icon = iconMap[category.icon] || Info;
    const colors = colorMap[category.color] || colorMap.slate;

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={`${category.name} | Help Center`} />

            {/* Header */}
            <div className="bg-white border-b border-slate-200 py-6 px-4">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/help"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-3 cursor-pointer"
                    >
                        <ArrowLeft size={13} strokeWidth={2.5} />
                        Back to Help Center
                    </Link>
                    
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center`}>
                            <Icon size={22} className={colors.text} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">{category.name}</h1>
                            <p className="text-xs text-slate-500 font-medium">{category.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Articles */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                    {articles.length} {articles.length === 1 ? 'article' : 'articles'} in this category
                </p>
                <div className="space-y-2">
                    {articles.map(article => (
                        <Link
                            key={article.slug}
                            href={`/help/${category.slug}/${article.slug}`}
                            className="block p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                    <FileText size={16} className="text-slate-600" strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{article.title}</p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{article.summary}</p>
                                </div>
                                <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-600 shrink-0 mt-1 transition-colors" strokeWidth={2.5} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}