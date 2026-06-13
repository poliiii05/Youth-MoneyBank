// resources/js/Pages/Help/Article.jsx
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, ArrowRight, FileText, MessageCircle, AlertCircle, Info,
} from 'lucide-react';

export default function HelpArticle({ article, category, relatedArticles = [] }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={`${article.title} | Help`} />

            {/* Header */}
            <div className="bg-white border-b border-slate-200 py-6 px-4">
                <div className="max-w-3xl mx-auto">
                    <Link
                        href={`/help/${category.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-3 cursor-pointer"
                    >
                        <ArrowLeft size={13} strokeWidth={2.5} />
                        Back to {category.name}
                    </Link>
                    
                    <h1 className="text-2xl font-black text-slate-900">{article.title}</h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">{article.summary}</p>
                </div>
            </div>

            {/* Article content */}
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                    {(article.content || []).map((block, idx) => (
                        <ContentBlock key={idx} block={block} />
                    ))}
                </div>

                {/* Contact support CTA */}
                <div className="mt-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-5 text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <MessageCircle size={22} className="text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 mb-1">Still need help?</h3>
                    <p className="text-xs text-slate-600 font-medium mb-4">
                        Our support team is ready to assist you with any questions
                    </p>
                    <Link
                        href="/support/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer transition-all"
                    >
                        Contact Support
                        <ArrowRight size={13} strokeWidth={2.5} />
                    </Link>
                </div>

                {/* Related articles */}
                {relatedArticles.length > 0 && (
                    <div className="mt-6">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                            Related Articles
                        </p>
                        <div className="space-y-2">
                            {relatedArticles.map(rel => (
                                <Link
                                    key={rel.slug}
                                    href={`/help/${rel.category_slug}/${rel.slug}`}
                                    className="block p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all group"
                                >
                                    <div className="flex items-start gap-3">
                                        <FileText size={14} className="text-slate-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">{rel.title}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{rel.summary}</p>
                                        </div>
                                        <ArrowRight size={12} className="text-slate-400 group-hover:text-slate-600 shrink-0 mt-1 transition-colors" strokeWidth={2.5} />
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
        return (
            <p className="text-sm text-slate-700 leading-relaxed">{block.text}</p>
        );
    }
    
    if (block.type === 'heading') {
        return (
            <h3 className="text-base font-black text-slate-900 mt-4">{block.text}</h3>
        );
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
            <div className={`${v.bg} border ${v.border} rounded-xl p-3 flex items-start gap-2`}>
                <Icon size={14} className={`${v.iconColor} shrink-0 mt-0.5`} strokeWidth={2.5} />
                <p className={`text-xs ${v.text} font-medium`}>{block.text}</p>
            </div>
        );
    }
    
    return null;
}