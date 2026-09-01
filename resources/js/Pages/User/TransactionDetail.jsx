// resources/js/Pages/User/TransactionDetail.jsx
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '../../Components/Layouts/UserLayout';
import { ArrowLeft, ArrowDownRight, ArrowUpRight, Copy, Check, ChevronDown, Headphones  } from 'lucide-react';

export default function TransactionDetail({ auth, transaction }) {
    const user = auth?.user;
    const [copied, setCopied] = useState(null);
    const [showLedger, setShowLedger] = useState(false);

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
        if (status === 'success' || status === 'completed') return { color: 'text-success', bg: 'bg-success', label: 'Completed' };
        if (status === 'pending') return { color: 'text-accent-foreground', bg: 'bg-accent', label: 'Pending' };
        if (status === 'failed' || status === 'cancelled') return { color: 'text-destructive', bg: 'bg-destructive', label: 'Failed' };
        return { color: 'text-muted-foreground', bg: 'bg-muted-foreground', label: status };
    };

    const statusInfo = getStatusDot(transaction.status);

    // Map account display name — clean account labels for user view
    const getAccountDisplayName = (accountName, accountType) => {
        if (accountType === 'user_wallet') {
            return 'Main Wallet';
        }
        if (accountType === 'savings_pool') {
            return 'Savings';
        }
        if (accountType === 'savings_goal') {
            // Remove "Goal: " prefix if exists, just show goal name
            return accountName.replace(/^Goal:\s*/, '');
        }
        return accountName;
    };
    // Type label
        const getTypeLabel = (type) => {
        const labels = {
            cash_in: 'Cash In',
            goal_allocation: 'Goal Allocation',
            goal_deallocation: 'Goal Deallocation',
            savings_deposit: 'Savings Deposit',
            savings_withdraw: 'Savings Withdrawal',
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
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer"
                >
                    <ArrowLeft size={14} strokeWidth={2.5} />
                    Back
                </Link>

                {/* SINGLE CARD with all info */}
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                    
                    {/* HERO — minimal, centered */}
                    <div className="px-5 pt-6 pb-5 text-center border-b border-border">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">{transaction.title}</p>
                        <p className={`text-3xl font-black tracking-tight mb-3 ${isIncome ? 'text-success' : 'text-foreground'}`}>
                            {isIncome ? '+' : '-'}₱{Number(transaction.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex items-center justify-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.bg}`}></span>
                            <span className={`text-[11px] font-bold uppercase tracking-widest ${statusInfo.color}`}>{statusInfo.label}</span>
                        </div>
                    </div>

                    {/* DETAILS — line items */}
                    <div className="divide-y divide-border">
                        <DetailRow label="Type" value={getTypeLabel(transaction.type)} />
                        <DetailRow label="Date & Time" value={formattedDateTime} />
                        
                        {credit && (
                            <DetailRow label="From" value={getAccountDisplayName(credit.account_name, credit.account_type)} />
                        )}
                        {debit && (
                            <DetailRow label="To" value={getAccountDisplayName(debit.account_name, debit.account_type)} />
                        )}

                        <DetailRow 
                            label="Reference No." 
                            value={transaction.public_reference_id || '—'} 
                            mono
                            onCopy={transaction.public_reference_id ? () => copyToClipboard(transaction.public_reference_id, 'public') : null}
                            copied={copied === 'public'}
                        />
                    </div>

                    {/* LEDGER ENTRIES — collapsible (technical details) */}
                        {hasLedgerEntries && (
                            <div className="border-t border-border">
                                <button
                                    onClick={() => setShowLedger(!showLedger)}
                                    className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-muted transition-colors cursor-pointer group"
                                >
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            {showLedger ? 'Hide technical details' : 'Show technical details'}
                                        </p>
                                        <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Ledger breakdown for audit</p>
                                    </div>
                                    <ChevronDown 
                                        size={14} 
                                        className={`text-muted-foreground transition-transform group-hover:text-muted-foreground ${showLedger ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {showLedger && (
                                    <div className="px-5 py-4 bg-muted/50 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="space-y-1.5">
                                            {transaction.ledger_entries.map((entry) => (
                                                <div key={entry.id} className="flex items-center justify-between text-xs">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-foreground truncate">{getAccountDisplayName(entry.account_name, entry.account_type)}</p>
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{entry.direction}</p>
                                                    </div>
                                                    <p className={`font-bold ml-2 shrink-0 ${entry.direction === 'debit' ? 'text-success' : 'text-orange-600'}`}>
                                                        {entry.direction === 'debit' ? '+' : '-'}₱{entry.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    {/* SYSTEM REF — collapsed at bottom */}
                    {transaction.reference_id && (
                        <div className="border-t border-border px-5 py-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Source Ref.</p>
                                    <p className="text-[10px] font-mono text-muted-foreground truncate">{transaction.reference_id}</p>
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(transaction.reference_id, 'internal')}
                                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-1 shrink-0"
                                >
                                    {copied === 'internal' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* SUPPORT FOOTER — opens the existing chat with the reference
                    already typed in. The old link pointed at /support/new, a route
                    that was never registered, so this button 404'd. */}
                    <div className="flex justify-center mt-4 pb-6">
                        <button
                            type="button"
                            onClick={() => window.openYmbChat?.(
                                `I need help with transaction ${transaction.public_reference_id || transaction.id}. `
                            )}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/70 text-secondary-foreground text-xs font-bold rounded-xl border border-border cursor-pointer transition-colors"
                        >
                            <Headphones size={13} strokeWidth={2.5} />
                            Get help with this transaction
                        </button>
                    </div>
                
            </div>
        </UserLayout>
    );
}

// Reusable row component
function DetailRow({ label, value, mono = false, onCopy, copied }) {
    return (
        <div className="px-5 py-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground font-medium shrink-0">{label}</p>
            <div className="flex items-center gap-2 min-w-0">
                <p className={`text-xs font-bold text-foreground text-right truncate ${mono ? 'font-mono' : ''}`}>
                    {value}
                </p>
                {onCopy && (
                    <button 
                        onClick={onCopy}
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
                    >
                        {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    </button>
                )}
            </div>
        </div>
    );
}