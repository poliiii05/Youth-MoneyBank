// resources/js/Pages/Admin/TransactionDetail.jsx
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import Avatar from '../../Components/Admin/Avatar';
import FlagTransactionModal from '../../Components/Admin/Transactions/FlagTransactionModal';
import ResolveTransactionModal from '../../Components/Admin/Transactions/ResolveTransactionModal';
import ManualCreditModal from '../../Components/Admin/Transactions/ManualCreditModal';
import { 
    ChevronLeft, Flag, CheckCircle2, XCircle, Clock, 
    ArrowUp, ArrowDown, Receipt, User as UserIcon,
    Calendar, Hash, AlertTriangle,
    ClipboardCheck, RefreshCcw, FileText,
    Banknote, Link2,
} from 'lucide-react';

export default function TransactionDetail({ auth, transaction, pendingCounts = {} }) {
    const user = auth?.user;
    const [flagModalOpen, setFlagModalOpen] = useState(false);
    const [resolveModalOpen, setResolveModalOpen] = useState(false);
    const [creditModalOpen, setCreditModalOpen] = useState(false);
    
    const isSuperAdmin = user?.admin_role === 'super_admin';
    
    // Can do manual credit: any admin, transaction must be failed/pending, must be incoming, not yet resolved
   const canManualCredit = !transaction.is_resolved 
    && ['failed', 'pending'].includes(transaction.status)
    && user?.admin_role;
    
    const formatPeso = (amount) => '₱' + Number(amount).toLocaleString('en-PH', { 
        minimumFractionDigits: 2, maximumFractionDigits: 2 
    });

    return (
        <AdminLayout user={user} header={`Transaction #${transaction.public_reference_id || transaction.id}`} pendingCounts={pendingCounts}>
            <Head title={`Transaction Detail | Admin`} />

            <div className="max-w-5xl space-y-4">
                {(() => {
                const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
                const fromCS = params.get('from') === 'cs';
                return (
                    <Link 
                        href={fromCS ? '/admin/customer-support' : '/admin/transactions'}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <ChevronLeft size={14} strokeWidth={2.5} />
                        {fromCS ? 'Back to Customer Support' : 'Back to Transactions'}
                    </Link>
                );
            })()}

                {/* Flagged banner */}
                {transaction.is_flagged && (
                    <div className="bg-destructive/10 border border-destructive/25 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Flag size={20} className="text-destructive shrink-0 mt-0.5" strokeWidth={2.5} />
                            <div className="flex-1">
                                <p className="text-sm font-black text-red-900 mb-1">Flagged for Review</p>
                                <p className="text-xs text-destructive">
                                    <span className="font-bold">Reason:</span> {transaction.flag_reason}
                                </p>
                                <p className="text-[10px] text-destructive font-medium mt-1">
                                    Flagged by {transaction.flagger?.name || 'admin'} on {transaction.flagged_at}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resolution status banner */}
                {transaction.is_resolved && (
                    <div className="bg-success/10 border border-success/25 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <ClipboardCheck size={20} className="text-success shrink-0 mt-0.5" strokeWidth={2.5} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-black text-emerald-900">Resolved</p>
                                    <ResolutionTypeBadge type={transaction.resolution_type} />
                                </div>
                                <p className="text-xs text-success mt-1">{transaction.resolution_notes}</p>
                                <p className="text-[10px] text-success font-medium mt-2">
                                    Resolved by {transaction.resolver?.name || 'admin'} on {transaction.resolved_at}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transaction header */}
              {/* Transaction header (compact) */}
                <div className="bg-card rounded-xl border border-border p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                                transaction.is_positive 
                                    ? 'bg-success/15 text-success' 
                                    : 'bg-destructive/15 text-destructive'
                            }`}>
                                {transaction.is_positive 
                                    ? <ArrowDown size={28} strokeWidth={2.5} />
                                    : <ArrowUp size={28} strokeWidth={2.5} />
                                }
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-foreground tracking-tight">{transaction.title}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{transaction.type}</span>
                                    <span className="text-muted-foreground/50">·</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">#{transaction.public_reference_id}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-3xl font-black tracking-tight ${
                                transaction.is_positive ? 'text-success' : 'text-destructive'
                            }`}>
                                {transaction.is_positive ? '+' : '-'}{formatPeso(transaction.amount)}
                            </p>
                            <StatusBadge status={transaction.status} />
                        </div>
                    </div>
                </div>

                {/* Two-column: User card + Transaction details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    
                    {/* User card */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="px-5 py-3 border-b border-border">
                            <h3 className="text-sm font-black text-foreground tracking-tight">Account Holder</h3>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <Avatar 
                                    src={transaction.user.profile_picture}
                                    name={transaction.user.name}
                                    size="lg"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-foreground truncate">{transaction.user.name}</p>
                                    <p className="text-[11px] text-muted-foreground font-medium truncate">{transaction.user.email}</p>
                                </div>
                            </div>
                            <div className="space-y-2 pt-3 border-t border-border">
                                <InfoRow icon={Hash} label="Account #" value={transaction.user.account_number} />
                                <InfoRow icon={UserIcon} label="KYC Tier" value={`Tier ${transaction.user.kyc_tier}`} />
                            </div>
                            
                            {transaction.user.id && (
                                <Link
                                    href={`/admin/users/${transaction.user.id}`}
                                    className="mt-4 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary text-white text-xs font-black rounded-lg transition-all cursor-pointer"
                                >
                                    View User Profile
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Transaction details */}
                    <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
                        <div className="px-5 py-3 border-b border-border">
                            <h3 className="text-sm font-black text-foreground tracking-tight">Transaction Details</h3>
                        </div>
                        <div className="p-5 grid grid-cols-2 gap-x-5 gap-y-3">
                            <InfoRow icon={Calendar} label="Created" value={transaction.created_formatted} />
                            <InfoRow icon={Calendar} label="Last Updated" value={transaction.updated_formatted} />
                            <InfoRow icon={Hash} label="Internal ID" value={`#${transaction.id}`} />
                            <InfoRow icon={Receipt} label="Reference" value={transaction.public_reference_id || 'Not assigned'} />
                            <InfoRow icon={Banknote} label="Amount (cents)" value={transaction.amount_cents?.toLocaleString() || '—'} />
                            <InfoRow 
                                icon={transaction.is_positive ? ArrowDown : ArrowUp} 
                                label="Direction" 
                                value={transaction.is_positive ? 'Inflow (credit)' : 'Outflow (debit)'} 
                            />
                            {transaction.correction_proof && (
                                <div className="col-span-2">
                                    <InfoRow 
                                        icon={Banknote} 
                                        label="External Proof" 
                                        value={transaction.correction_proof} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Linked transactions */}
                {(transaction.parent_transaction || (transaction.correction_transactions && transaction.correction_transactions.length > 0)) && (
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="px-5 py-3 border-b border-border">
                            <h3 className="text-sm font-black text-foreground tracking-tight">Linked Transactions</h3>
                        </div>
                        <div className="p-5 space-y-2">
                            {transaction.parent_transaction && (
                                <Link
                                    href={`/admin/transactions/${transaction.parent_transaction.id}`}
                                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/40 hover:bg-primary/10 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <Link2 size={14} className="text-muted-foreground" strokeWidth={2.5} />
                                        <div>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Correction For</p>
                                            <p className="text-xs font-bold text-foreground">{transaction.parent_transaction.title}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-foreground">#{transaction.parent_transaction.public_reference_id}</span>
                                </Link>
                            )}
                            
                            {transaction.correction_transactions && transaction.correction_transactions.map((corr) => (
                                <Link
                                    key={corr.id}
                                    href={`/admin/transactions/${corr.id}`}
                                    className="flex items-center justify-between p-3 border border-success/25 bg-success/10/30 rounded-lg hover:bg-success/10 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <Banknote size={14} className="text-success" strokeWidth={2.5} />
                                        <div>
                                            <p className="text-[9px] font-bold text-success uppercase tracking-widest">Manual Credit Applied</p>
                                            <p className="text-xs font-bold text-foreground">
                                                ₱{Number(corr.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-medium">Proof: {corr.correction_proof}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-foreground">#{corr.public_reference_id}</p>
                                        <p className="text-[9px] text-muted-foreground font-medium">{corr.created_relative}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Combined Actions Panel — both CS + Admin actions */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-foreground tracking-tight">Actions</h3>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                {transaction.is_resolved 
                                    ? 'Transaction has been resolved' 
                                    : 'Resolve, refund, or flag this transaction'
                                }
                            </p>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 border rounded ${
                            transaction.is_resolved 
                                ? 'bg-success/10 border-success/25' 
                                : 'bg-primary/10 border-primary/25'
                        }`}>
                            <FileText size={11} className={transaction.is_resolved ? 'text-success' : 'text-primary'} strokeWidth={2.5} />
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${
                                transaction.is_resolved ? 'text-success' : 'text-primary'
                            }`}>
                                {transaction.is_resolved ? 'Resolved' : 'Open'}
                            </span>
                        </div>
                    </div>
                    <div className="p-5 flex items-center gap-2 flex-wrap">
                        {!transaction.is_resolved ? (
                            <>
                                {canManualCredit && (
                                    <button
                                        onClick={() => setCreditModalOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-success hover:bg-success/90 text-white text-xs font-black rounded-lg shadow-md shadow-success/25 transition-all cursor-pointer"
                                    >
                                        <Banknote size={14} strokeWidth={2.5} />
                                        Manual Credit
                                    </button>
                                )}
                                <button
                                    onClick={() => setResolveModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-black rounded-lg shadow-md shadow-primary/25 transition-all cursor-pointer"
                                >
                                    <ClipboardCheck size={14} strokeWidth={2.5} />
                                    Mark Resolved
                                </button>
                            </>
                        ) : (
                            isSuperAdmin && <ReopenButton transactionId={transaction.id} />
                        )}
                        
                        {/* Flag — super admin only, always visible */}
                        <div className="ml-auto">
                            <button
                                onClick={() => isSuperAdmin && setFlagModalOpen(true)}
                                disabled={!isSuperAdmin}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 font-bold text-xs ${
                                    transaction.is_flagged
                                        ? 'bg-success hover:bg-success/90 text-white shadow-md shadow-success/25 disabled:hover:bg-success'
                                        : 'bg-destructive hover:bg-destructive/90 text-white shadow-md shadow-destructive/25 disabled:hover:bg-destructive'
                                }`}
                                title={!isSuperAdmin ? 'Super Admin only' : ''}
                            >
                                <Flag size={14} strokeWidth={2.5} />
                                {transaction.is_flagged ? 'Remove Flag' : 'Flag'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ResolveTransactionModal 
                isOpen={resolveModalOpen}
                onClose={() => setResolveModalOpen(false)}
                transaction={transaction}
            />

            <ManualCreditModal 
                isOpen={creditModalOpen}
                onClose={() => setCreditModalOpen(false)}
                transaction={transaction}
            />

            {isSuperAdmin && (
                <FlagTransactionModal 
                    isOpen={flagModalOpen}
                    onClose={() => setFlagModalOpen(false)}
                    transaction={transaction}
                />
            )}
        </AdminLayout>
    );
}

function Stat({ label, value }) {
    return (
        <div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xs font-bold text-foreground truncate">{value}</p>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-2.5">
            <Icon size={14} className="text-muted-foreground mt-0.5 shrink-0" strokeWidth={2} />
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-xs font-bold text-foreground break-words">{value}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        completed: 'bg-success/10 text-success border-success/25',
        success: 'bg-success/10 text-success border-success/25',
        failed: 'bg-destructive/10 text-destructive border-destructive/25',
        pending: 'bg-accent/10 text-accent-foreground border-accent/30',
    };
    return (
        <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${styles[status] || 'bg-muted text-foreground border-border'}`}>
            {status}
        </span>
    );
}

function ResolutionTypeBadge({ type }) {
    const styles = {
        refunded: 'bg-accent/10 text-accent-foreground border-accent/30',
        reprocessed: 'bg-primary/10 text-primary border-primary/25',
        cancelled: 'bg-destructive/10 text-destructive border-destructive/25',
        verified: 'bg-success/10 text-success border-success/25',
        no_action: 'bg-muted text-foreground border-border',
    };
    const labels = {
        refunded: 'Refunded',
        reprocessed: 'Reprocessed',
        cancelled: 'Cancelled',
        verified: 'Verified',
        no_action: 'No Action',
    };
    return (
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${styles[type] || styles.no_action}`}>
            {labels[type] || type}
        </span>
    );
}

function ReopenButton({ transactionId }) {
    const handleReopen = () => {
        if (!confirm('Reopen this resolved transaction? This will clear the resolution data.')) return;
        router.post(`/admin/transactions/${transactionId}/reopen`);
    };
    return (
        <button
            onClick={handleReopen}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white text-xs font-black rounded-lg shadow-md shadow-accent/25 transition-all cursor-pointer"
        >
            <RefreshCcw size={14} strokeWidth={2.5} />
            Reopen Transaction
        </button>
    );
}