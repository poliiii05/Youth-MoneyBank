// resources/js/Pages/User/TransactionDetail.jsx
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '../../Components/Layouts/UserLayout';
import { ArrowLeft, ArrowDownRight, ArrowUpRight, Copy, Check } from 'lucide-react';

export default function TransactionDetail({ auth, transaction }) {
    const user = auth?.user;
    const [copied, setCopied] = useState(null);
    
    const isIncome = transaction.is_positive == 1;
    const hasLedgerEntries = transaction.ledger_entries?.length > 0;

    const formattedDateTime = new Date(transaction.created_at).toLocaleDateString('en-PH', { 
        year: 'numeric',
        month: 'short', 
        day: 'numeric', 
    }) + ' · ' + new Date(transaction.created_at).toLocaleTimeString('en-PH', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true,
    });

    // Status indicator
    const getStatusDot = (status) => {
        if (status === 'success' || status === 'completed') return { color: 'text-emerald-600', bg: 'bg-emerald-500', label: 'Completed' };
        if (status === 'pending') return { color: 'text-amber-600', bg: 'bg-amber-500', label: 'Pending' };
        if (status === 'failed' || status === 'cancelled') return { color: 'text-red-600', bg: 'bg-red-500', label: 'Failed' };
        return { color: 'text-slate-600', bg: 'bg-slate-400', label: status };
    };

    const statusInfo = getStatusDot(transaction.status);

    // Type label
    const getTypeLabel = (type) => {
        const labels = {
            cash_in: 'Cash In',
            goal_allocation: 'Goal Allocation',
            goal_deallocation: 'Goal Deallocation',
            savings_transfer: 'Savings Transfer',
            savings_withdrawal: 'Savings Withdrawal',
            goal_deletion_return: 'Goal Deletion Return',
        };
        return labels[type] || type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Flow from ledger
    const debit = transaction.ledger_entries?.find(e => e.direction === 'debit');
    const credit = transaction.ledger_entries?.find(e => e.direction === 'credit');

    // Copy handler
    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 1500);
    };

    return (
        <UserLayout user={user} header="Transaction Details">
            <Head title={`${transaction.public_reference_id || 'Transaction'} | Youth MoneyBank`} />

            <div className="max-w-md mx-auto">
                {/* BACK */}
                <Link 
                    href="/transactions"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-4 cursor-pointer"
                >
                    <ArrowLeft size={14} strokeWidth={2.5} />
                    Back
                </Link>

                {/* SINGLE CARD with all info */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* HERO — minimal, centered */}
                    <div className="px-5 pt-6 pb-5 text-center border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-2">{transaction.title}</p>
                        <p className={`text-3xl font-black tracking-tight mb-3 ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {isIncome ? '+' : '-'}₱{Number(transaction.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex items-center justify-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.bg}`}></span>
                            <span className={`text-[11px] font-bold uppercase tracking-widest ${statusInfo.color}`}>{statusInfo.label}</span>
                        </div>
                    </div>

                    {/* DETAILS — line items */}
                    <div className="divide-y divide-slate-100">
                        <DetailRow label="Type" value={getTypeLabel(transaction.type)} />
                        <DetailRow label="Date & Time" value={formattedDateTime} />
                        
                        {credit && (
                            <DetailRow label="From" value={credit.account_name} />
                        )}
                        {debit && (
                            <DetailRow label="To" value={debit.account_name} />
                        )}

                        <DetailRow 
                            label="Reference No." 
                            value={transaction.public_reference_id || '—'} 
                            mono
                            onCopy={transaction.public_reference_id ? () => copyToClipboard(transaction.public_reference_id, 'public') : null}
                            copied={copied === 'public'}
                        />
                    </div>

                    {/* LEDGER ENTRIES — collapsed if not needed, simple list */}
                    {hasLedgerEntries && (
                        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                                Ledger Breakdown
                            </p>
                            <div className="space-y-1.5">
                                {transaction.ledger_entries.map((entry) => (
                                    <div key={entry.id} className="flex items-center justify-between text-xs">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-slate-700 truncate">{entry.account_name}</p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{entry.direction}</p>
                                        </div>
                                        <p className={`font-bold ml-2 shrink-0 ${entry.direction === 'debit' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                            {entry.direction === 'debit' ? '+' : '-'}₱{entry.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SYSTEM REF — collapsed at bottom */}
                    {transaction.reference_id && (
                        <div className="border-t border-slate-100 px-5 py-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Source Ref.</p>
                                    <p className="text-[10px] font-mono text-slate-500 truncate">{transaction.reference_id}</p>
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(transaction.reference_id, 'internal')}
                                    className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer p-1 shrink-0"
                                >
                                    {copied === 'internal' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* SUPPORT FOOTER */}
                <p className="text-center text-[10px] text-slate-400 font-medium mt-4 pb-6">
                    Need help? <button className="text-blue-600 font-bold hover:underline cursor-pointer">Contact support</button>
                </p>
            </div>
        </UserLayout>
    );
}

// Reusable row component
function DetailRow({ label, value, mono = false, onCopy, copied }) {
    return (
        <div className="px-5 py-3 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500 font-medium shrink-0">{label}</p>
            <div className="flex items-center gap-2 min-w-0">
                <p className={`text-xs font-bold text-slate-900 text-right truncate ${mono ? 'font-mono' : ''}`}>
                    {value}
                </p>
                {onCopy && (
                    <button 
                        onClick={onCopy}
                        className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
                    >
                        {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                )}
            </div>
        </div>
    );
}