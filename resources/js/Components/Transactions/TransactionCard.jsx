// resources/js/Components/Transactions/TransactionCard.jsx
import { Link } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, ChevronRight } from 'lucide-react';

export default function TransactionCard({ transaction }) {
    const isIncome = transaction.is_positive == 1;

    const formattedDate = new Date(transaction.created_at).toLocaleDateString('en-PH', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    const getStatusStyle = (status) => {
        if (status === 'success' || status === 'completed') 
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (status === 'pending') 
            return 'bg-amber-50 text-amber-700 border-amber-200';
        if (status === 'failed' || status === 'cancelled') 
            return 'bg-red-50 text-red-700 border-red-200';
        return 'bg-slate-50 text-slate-700 border-slate-200';
    };

    return (
        <Link 
            href={`/transactions/${transaction.id}`}
            className="block p-4 sm:p-5 hover:bg-slate-50 transition-colors cursor-pointer group"
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                        {isIncome ? <ArrowDownRight size={24} strokeWidth={2} /> : <ArrowUpRight size={24} strokeWidth={2} />}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{transaction.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <p className="text-[11px] text-slate-500 font-medium">{formattedDate}</p>
                            {transaction.public_reference_id && (
                                <>
                                    <span className="text-[9px] text-slate-300">·</span>
                                    <p className="text-[10px] text-slate-400 font-mono font-bold">{transaction.public_reference_id}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                        <p className={`text-sm font-black tracking-tight ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {isIncome ? '+' : '-'}₱{Number(transaction.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                        <span className={`inline-block text-[9px] font-bold uppercase tracking-widest mt-0.5 px-1.5 py-0.5 rounded border ${getStatusStyle(transaction.status)}`}>
                            {transaction.status}
                        </span>
                    </div>
                    <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
                        <ChevronRight size={18} strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </Link>
    );
}