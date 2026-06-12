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
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                        <ChevronLeft size={14} strokeWidth={2.5} />
                        {fromCS ? 'Back to Customer Support' : 'Back to Transactions'}
                    </Link>
                );
            })()}

                {/* Flagged banner */}
                {transaction.is_flagged && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Flag size={20} className="text-red-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                            <div className="flex-1">
                                <p className="text-sm font-black text-red-900 mb-1">Flagged for Review</p>
                                <p className="text-xs text-red-800">
                                    <span className="font-bold">Reason:</span> {transaction.flag_reason}
                                </p>
                                <p className="text-[10px] text-red-700 font-medium mt-1">
                                    Flagged by {transaction.flagger?.name || 'admin'} on {transaction.flagged_at}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resolution status banner */}
                {transaction.is_resolved && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <ClipboardCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-black text-emerald-900">Resolved</p>
                                    <ResolutionTypeBadge type={transaction.resolution_type} />
                                </div>
                                <p className="text-xs text-emerald-800 mt-1">{transaction.resolution_notes}</p>
                                <p className="text-[10px] text-emerald-700 font-medium mt-2">
                                    Resolved by {transaction.resolver?.name || 'admin'} on {transaction.resolved_at}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transaction header */}
              {/* Transaction header (compact) */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                                transaction.is_positive 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                {transaction.is_positive 
                                    ? <ArrowDown size={28} strokeWidth={2.5} />
                                    : <ArrowUp size={28} strokeWidth={2.5} />
                                }
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-slate-900 tracking-tight">{transaction.title}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{transaction.type}</span>
                                    <span className="text-slate-300">·</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">#{transaction.public_reference_id}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-3xl font-black tracking-tight ${
                                transaction.is_positive ? 'text-emerald-700' : 'text-red-700'
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
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100">
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">Account Holder</h3>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <Avatar 
                                    src={transaction.user.profile_picture}
                                    name={transaction.user.name}
                                    size="lg"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-slate-900 truncate">{transaction.user.name}</p>
                                    <p className="text-[11px] text-slate-500 font-medium truncate">{transaction.user.email}</p>
                                </div>
                            </div>
                            <div className="space-y-2 pt-3 border-t border-slate-100">
                                <InfoRow icon={Hash} label="Account #" value={transaction.user.account_number} />
                                <InfoRow icon={UserIcon} label="KYC Tier" value={`Tier ${transaction.user.kyc_tier}`} />
                            </div>
                            
                            {transaction.user.id && (
                                <Link
                                    href={`/admin/users/${transaction.user.id}`}
                                    className="mt-4 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-lg transition-all cursor-pointer"
                                >
                                    View User Profile
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Transaction details */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100">
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">Transaction Details</h3>
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
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100">
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">Linked Transactions</h3>
                        </div>
                        <div className="p-5 space-y-2">
                            {transaction.parent_transaction && (
                                <Link
                                    href={`/admin/transactions/${transaction.parent_transaction.id}`}
                                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <Link2 size={14} className="text-slate-400" strokeWidth={2.5} />
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Correction For</p>
                                            <p className="text-xs font-bold text-slate-900">{transaction.parent_transaction.title}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-700">#{transaction.parent_transaction.public_reference_id}</span>
                                </Link>
                            )}
                            
                            {transaction.correction_transactions && transaction.correction_transactions.map((corr) => (
                                <Link
                                    key={corr.id}
                                    href={`/admin/transactions/${corr.id}`}
                                    className="flex items-center justify-between p-3 border border-emerald-200 bg-emerald-50/30 rounded-lg hover:bg-emerald-50 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <Banknote size={14} className="text-emerald-600" strokeWidth={2.5} />
                                        <div>
                                            <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">Manual Credit Applied</p>
                                            <p className="text-xs font-bold text-slate-900">
                                                ₱{Number(corr.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-medium">Proof: {corr.correction_proof}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-700">#{corr.public_reference_id}</p>
                                        <p className="text-[9px] text-slate-500 font-medium">{corr.created_relative}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Combined Actions Panel — both CS + Admin actions */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">Actions</h3>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                {transaction.is_resolved 
                                    ? 'Transaction has been resolved' 
                                    : 'Resolve, refund, or flag this transaction'
                                }
                            </p>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 border rounded ${
                            transaction.is_resolved 
                                ? 'bg-emerald-50 border-emerald-200' 
                                : 'bg-blue-50 border-blue-200'
                        }`}>
                            <FileText size={11} className={transaction.is_resolved ? 'text-emerald-700' : 'text-blue-700'} strokeWidth={2.5} />
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${
                                transaction.is_resolved ? 'text-emerald-700' : 'text-blue-700'
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
                                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg shadow-md shadow-emerald-200 transition-all cursor-pointer"
                                    >
                                        <Banknote size={14} strokeWidth={2.5} />
                                        Manual Credit
                                    </button>
                                )}
                                <button
                                    onClick={() => setResolveModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-lg shadow-md shadow-blue-200 transition-all cursor-pointer"
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
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 disabled:hover:bg-emerald-600'
                                        : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 disabled:hover:bg-red-600'
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
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xs font-bold text-slate-900 truncate">{value}</p>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-2.5">
            <Icon size={14} className="text-slate-400 mt-0.5 shrink-0" strokeWidth={2} />
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-xs font-bold text-slate-900 break-words">{value}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        failed: 'bg-red-50 text-red-700 border-red-200',
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return (
        <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
            {status}
        </span>
    );
}

function ResolutionTypeBadge({ type }) {
    const styles = {
        refunded: 'bg-amber-50 text-amber-700 border-amber-200',
        reprocessed: 'bg-blue-50 text-blue-700 border-blue-200',
        cancelled: 'bg-red-50 text-red-700 border-red-200',
        verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        no_action: 'bg-slate-50 text-slate-700 border-slate-200',
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
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-lg shadow-md shadow-amber-200 transition-all cursor-pointer"
        >
            <RefreshCcw size={14} strokeWidth={2.5} />
            Reopen Transaction
        </button>
    );
}