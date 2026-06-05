// resources/js/Components/Transactions/RecentTransactionsCard.jsx
import { Link } from '@inertiajs/react';
import { ChevronRight, ArrowDownRight, ArrowUpRight } from 'lucide-react';

// Group transactions by date
function groupByDate(transactions) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = { 'Today': [], 'Yesterday': [], 'Earlier': [] };
    
    transactions.forEach(txn => {
        const txnDate = new Date(txn.created_at);
        if (txnDate >= today) {
            groups['Today'].push(txn);
        } else if (txnDate >= yesterday) {
            groups['Yesterday'].push(txn);
        } else {
            groups['Earlier'].push(txn);
        }
    });
    
    return groups;
}

// Format time based on group
function formatTime(createdAt, group) {
    const date = new Date(createdAt);
    
    if (group === 'Today' || group === 'Yesterday') {
        return date.toLocaleTimeString('en-PH', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true,
        });
    }
    
    return date.toLocaleDateString('en-PH', { 
        month: 'short', 
        day: 'numeric',
    }) + ' · ' + date.toLocaleTimeString('en-PH', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true,
    });
}

export default function RecentTransactionsCard({ transactions = [] }) {
    const hasTransactions = transactions.length > 0;
    const groups = groupByDate(transactions);
    
    const getStatusStyle = (status) => {
        if (status === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
        if (status === 'failed' || status === 'cancelled') return 'bg-red-50 text-red-700 border-red-200';
        return 'bg-slate-50 text-slate-700 border-slate-200';
    };

    return (
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 overflow-hidden mb-8">
            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-slate-200">
                <h2 className="text-sm font-black text-slate-900 tracking-tight">Recent Transactions</h2>
                {hasTransactions && (
                    <Link 
                        href="/transactions" 
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer group"
                    >
                        View All 
                        <ChevronRight size={12} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                )}
            </div>
            
            {hasTransactions ? (
                <div>
                    {Object.entries(groups).map(([groupName, txns]) => {
                        if (txns.length === 0) return null;
                        
                        return (
                            <div key={groupName}>
                                {/* Date group label */}
                                <div className="px-5 py-2 bg-slate-50/60 border-b border-slate-100">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                        {groupName}
                                    </p>
                                </div>
                                
                                {/* Transactions in this group */}
                                <div className="divide-y divide-slate-100">
                                    {txns.map((transaction) => {
                                        const isIncome = transaction.is_positive == 1;
                                        const showStatus = transaction.status !== 'completed' && transaction.status !== 'success';
                                        
                                        return (
                                            <Link
                                                key={transaction.id}
                                                href={`/transactions/${transaction.id}`}
                                                className="block px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer group"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                            {/* Color-coded arrow indicator with background container */}
                                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                                                    isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                                                                }`}>
                                                                    {isIncome 
                                                                        ? <ArrowDownRight size={16} strokeWidth={2.5} />
                                                                        : <ArrowUpRight size={16} strokeWidth={2.5} />}
                                                                </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                                                                    {transaction.title}
                                                                </h4>
                                                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                                    {formatTime(transaction.created_at, groupName)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    <div className="text-right shrink-0">
                                                        <p className={`text-sm font-black tracking-tight ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                            {isIncome ? '+' : '-'}₱{Number(transaction.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                        </p>
                                                        {showStatus && (
                                                            <span className={`inline-block text-[8px] font-bold uppercase tracking-widest mt-0.5 px-1.5 py-0.5 rounded border ${getStatusStyle(transaction.status)}`}>
                                                                {transaction.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* MINIMAL EMPTY STATE — just text */
                <div className="px-5 py-10 text-center">
                    <p className="text-sm font-bold text-slate-500">No transactions yet</p>
                </div>
            )}
        </div>
    );
}