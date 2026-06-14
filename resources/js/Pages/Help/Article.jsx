// resources/js/Pages/Help/Article.jsx
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, ArrowRight, FileText, Headphones, AlertCircle, Info,
} from 'lucide-react';

const colorMap = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    purple: 'bg-purple-600',
    amber: 'bg-amber-600',
    slate: 'bg-slate-700',
};

export default function HelpArticle({ article, category, relatedArticles = [] }) {
    const headerBg = colorMap[category.color] || 'bg-slate-700';

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={`${article.title} | Help`} />

            {/* Colored header — back button + title side by side */}
                <div className={`${headerBg} text-white py-5 px-4`}>
                    <div className="max-w-3xl mx-auto flex items-start gap-4">
                        <Link
                            href={`/help/${category.slug}`}
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/80 hover:text-white cursor-pointer transition-colors shrink-0 mt-1 whitespace-nowrap"
                        >
                            <ArrowLeft size={12} strokeWidth={2.5} />
                            Back to {category.name}
                        </Link>
                        
                        <div className="flex-1 min-w-0 border-l border-white/20 pl-4">
                            <h1 className="text-xl font-black">{article.title}</h1>
                            <p className="text-[12px] text-white/80 font-medium mt-1">{article.summary}</p>
                        </div>
                    </div>
                </div>

            {/* Article content */}
            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                    {(article.content || []).map((block, idx) => (
                        <ContentBlock key={idx} block={block} />
                    ))}
                </div>

               {/* Compact contact support CTA — centered */}
                <div className="mt-5 flex flex-col items-center gap-2">
                    <p className="text-xs font-bold text-slate-600">Still need help?</p>
                    <Link
                        href="/support/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer transition-all"
                    >
                        <Headphones size={14} strokeWidth={2.5} />
                        Contact Us
                    </Link>
                </div>

                {/* Related articles */}
                {relatedArticles.length > 0 && (
                    <div className="mt-5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                            Related Articles
                        </p>
                        <div className="space-y-2">
                            {relatedArticles.map(rel => (
                                <Link
                                    key={rel.slug}
                                    href={`/help/${rel.category_slug}/${rel.slug}`}
                                    className="block p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all group"
                                >
                                    <div className="flex items-start gap-3">
                                        <FileText size={13} className="text-slate-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">{rel.title}</p>
                                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{rel.summary}</p>
                                        </div>
                                        <ArrowRight size={11} className="text-slate-400 group-hover:translate-x-0.5 shrink-0 mt-1 transition-all" strokeWidth={2.5} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ContentBlock({ block }) {
    if (block.type === 'paragraph') {
        return <p className="text-sm text-slate-700 leading-relaxed">{block.text}</p>;
    }
    
    if (block.type === 'heading') {
        return <h3 className="text-base font-black text-slate-900 mt-4">{block.text}</h3>;
    }
    
    if (block.type === 'list') {
        return (
            <ul className="space-y-1.5 pl-1">
                {block.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-blue-600 font-black mt-0.5 shrink-0">•</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        );
    }
    
    if (block.type === 'callout') {
        const variants = {
            info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: Info, iconColor: 'text-blue-600' },
            warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', icon: AlertCircle, iconColor: 'text-amber-600' },
        };
        const v = variants[block.variant] || variants.info;
        const Icon = v.icon;
        return (
            <div className={`${v.bg} border ${v.border} rounded-lg p-3 flex items-start gap-2`}>
                <Icon size={13} className={`${v.iconColor} shrink-0 mt-0.5`} strokeWidth={2.5} />
                <p className={`text-xs ${v.text} font-medium`}>{block.text}</p>
            </div>
        );
    }
    
    return null;
}