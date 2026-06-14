// resources/js/Pages/Help/Index.jsx
import { Head, Link } from '@inertiajs/react';
import { Headphones, ArrowRight, ArrowLeft } from 'lucide-react';

const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

export default function HelpIndex({ auth, categories = [] }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Help Center | Youth MoneyBank" />

           {/* Compact header — back button + title side by side */}
            <div className="bg-blue-600 text-white py-5 px-4">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                   <Link
                        href={auth?.user ? "/dashboard" : "/"}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/80 hover:text-white cursor-pointer transition-colors shrink-0 whitespace-nowrap"
                    >
                        <ArrowLeft size={12} strokeWidth={2.5} />
                        Back to {auth?.user ? 'Dashboard' : 'Home'}
                    </Link>
                                        
                    <div className="flex-1 min-w-0 border-l border-white/20 pl-4 flex items-center gap-3">
                        <Headphones size={24} className="text-white shrink-0" strokeWidth={2.5} />
                        <div>
                            <h1 className="text-xl font-black">Help Center</h1>
                            <p className="text-[11px] text-blue-100 font-medium">Find answers to common questions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-3xl mx-auto px-4 py-6">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Browse by topic
                </p>
                <div className="space-y-2">
                    {categories.map(cat => {
                        const colors = colorMap[cat.color] || colorMap.slate;
                        return (
                            <Link
                                key={cat.slug}
                                href={`/help/${cat.slug}`}
                                className={`block p-4 rounded-xl border ${colors.border} bg-white hover:shadow-md cursor-pointer transition-all group`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-black ${colors.text}`}>{cat.name}</p>
                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{cat.description}</p>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 shrink-0 transition-all" strokeWidth={2.5} />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}