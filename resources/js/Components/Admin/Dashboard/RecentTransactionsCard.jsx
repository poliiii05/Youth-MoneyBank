// resources/js/Components/Admin/Dashboard/RecentTransactionsCard.jsx
import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowUp, ArrowDown, Receipt, ArrowRight } from 'lucide-react';

export default function RecentTransactionsCard({ initialTransactions = [] }) {
    const [transactions, setTransactions] = useState(initialTransactions);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const formatPeso = (amount) => '₱' + Number(amount).toLocaleString('en-PH', { 
        minimumFractionDigits: 0, maximumFractionDigits: 0 
    });

    const getTimeSinceUpdate = () => {
        const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        return `${Math.floor(seconds / 60)}m ago`;
    };

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await fetch('/admin/api/recent-transactions');
                if (res.ok) {
                    const data = await res.json();
                    setTransactions(data.transactions);
                    setLastUpdated(new Date());
                }
            } catch (e) {
                console.error('Failed to fetch recent transactions:', e);
            }
        };

        const interval = setInterval(fetchRecent, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">Recent Transactions</h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Auto-refresh · {getTimeSinceUpdate()}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">Live</span>
                    </div>
                    <Link 
                        href="/admin/transactions"
                        className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] uppercase tracking-wider rounded-md transition-all cursor-pointer"
                    >
                        View All
                        <ArrowRight size={10} strokeWidth={2.5} />
                    </Link>
                </div>
            </div>

            {transactions.length > 0 ? (
                <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-72">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                        tx.is_positive 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {tx.is_positive 
                                            ? <ArrowDown size={12} strokeWidth={2.5} />
                                            : <ArrowUp size={12} strokeWidth={2.5} />
                                        }
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-slate-900 truncate">{tx.user_name}</p>
                                        <p className="text-[10px] text-slate-500 font-medium truncate">
                                            {tx.title} · {tx.created_relative}
                                        </p>
                                    </div>
                                </div>
                                <p className={`text-xs font-black shrink-0 ${
                                    tx.is_positive ? 'text-emerald-700' : 'text-red-700'
                                }`}>
                                    {tx.is_positive ? '+' : '-'}{formatPeso(tx.amount)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                        <Receipt size={28} className="text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
                        <p className="text-xs font-bold text-slate-700">No transactions yet</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Activity will appear here</p>
                    </div>
                </div>
            )}
        </div>
    );
}