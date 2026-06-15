// resources/js/Pages/Help/Category.jsx
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, ArrowRight, FileText, Headphones,
} from 'lucide-react';
import FloatingButton from '../../Components/Support/FloatingButton';

const colorMap = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    purple: 'bg-purple-600',
    amber: 'bg-amber-600',
    slate: 'bg-slate-700',
};

export default function HelpCategory({ auth, category, articles = [], allCategories = [] }) {
    const headerBg = colorMap[category.color] || 'bg-slate-700';

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={`${category.name} | Help Center`} />

           {/* Colored header — back button + title side by side */}
                <div className={`${headerBg} text-white py-5 px-4`}>
                    <div className="max-w-3xl mx-auto flex items-center gap-4">
                        <Link
                            href="/help"
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/80 hover:text-white cursor-pointer transition-colors shrink-0 whitespace-nowrap"
                        >
                            <ArrowLeft size={12} strokeWidth={2.5} />
                            Back to Help Center
                        </Link>
                        
                        <div className="flex-1 min-w-0 border-l border-white/20 pl-4">
                            <h1 className="text-xl font-black">{category.name}</h1>
                        </div>
                    </div>
                </div>

            {/* Articles */}
            <div className="max-w-3xl mx-auto px-4 py-6">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Articles
                </p>
                <div className="space-y-2">
                    {articles.map(article => (
                        <Link
                            key={article.slug}
                            href={`/help/${category.slug}/${article.slug}`}
                            className="block p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group"
                        >
                            <div className="flex items-start gap-3">
                                <FileText size={14} className="text-slate-400 shrink-0 mt-1" strokeWidth={2.5} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{article.title}</p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{article.summary}</p>
                                </div>
                                <ArrowRight size={12} className="text-slate-400 group-hover:translate-x-0.5 shrink-0 mt-1.5 transition-all" strokeWidth={2.5} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <FloatingButton 
    isAuthenticated={!!auth?.user} 
    currentUser={auth?.user || null} 
/>
        </div>
    );
}