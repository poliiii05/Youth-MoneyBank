// resources/js/Pages/Admin/CustomerSupport.jsx
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import Avatar from '../../Components/Admin/Avatar';
import { 
    Search, ChevronLeft, ChevronRight, Headphones, 
    Flag, CheckCircle2, XCircle, Clock,
    AlertTriangle, ClipboardCheck, Inbox,
} from 'lucide-react';

export default function CustomerSupport({ 
    auth, 
    transactions = [], 
    pagination = {}, 
    filters = {}, 
    counts = {},
    stats = {},
    pendingCounts = {} 
}) {
    const user = auth?.user;
    const [searchInput, setSearchInput] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== (filters.search || '')) {
                router.get('/admin/customer-support', { ...filters, search: searchInput, page: 1 }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const setCategoryFilter = (category) => {
        router.get('/admin/customer-support', { ...filters, category, page: 1 }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const goToPage = (page) => {
        router.get('/admin/customer-support', { ...filters, page }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatPeso = (amount) => '₱' + Number(amount).toLocaleString('en-PH', { 
        minimumFractionDigits: 2, maximumFractionDigits: 2 
    });

    const currentCategory = filters.category || 'open';

    return (
        <AdminLayout user={user} header="Customer Support" pendingCounts={pendingCounts}>
            <Head title="Customer Support | Admin" />

            <div className="max-w-7xl space-y-4">
                {/* Simplified stats — just 2 */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard 
                        label="Open Cases" 
                        value={(stats.open_cases || 0).toLocaleString()} 
                        icon={Inbox}
                        color="red"
                        subtitle="Need action"
                    />
                    <StatCard 
                        label="Resolved Today" 
                        value={(stats.resolved_today || 0).toLocaleString()} 
                        icon={ClipboardCheck}
                        color="emerald"
                        subtitle="Closed cases"
                    />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {/* Filters bar */}
                    <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-slate-100">
                        {/* Just 2 tabs */}
                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                           <button
                                onClick={() => setCategoryFilter('open')}
                                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                                    currentCategory === 'open'
                                        ? counts.open > 0 
                                            ? 'bg-red-500 text-white shadow-sm shadow-red-200'
                                            : 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Open Cases
                            </button>

                           <button
                                onClick={() => setCategoryFilter('resolved')}
                                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                                    currentCategory === 'resolved'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Resolved
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search user or reference..."
                                    className="pl-8 pr-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all w-64"
                                />
                            </div>
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={() => setSearchInput('')}
                                    className="px-2 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {transactions.length > 0 ? (
                        <>
                            {/* Table header */}
                                <div className="hidden sm:grid grid-cols-12 items-center gap-3 px-5 py-2.5 bg-slate-50 border-b border-slate-200">
                                    <div className="col-span-3">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">User</p>
                                    </div>
                                    <div className={`col-span-${currentCategory === 'resolved' ? '3' : '4'}`}>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Issue</p>
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Type</p>
                                    </div>
                                    <div className="hidden md:block col-span-2 text-center">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Amount</p>
                                    </div>
                                    <div className="hidden md:block col-span-1 text-center">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Reported</p>
                                    </div>
                                    {currentCategory === 'resolved' && (
                                        <div className="hidden md:block col-span-1 text-center">
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Resolved</p>
                                        </div>
                                    )}
                                    <div className="col-span-1 text-center">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status</p>
                                    </div>
                                </div>
                            
                            <div>
                                {transactions.map((tx) => (
                                    <SupportCaseRow 
                                        key={tx.id} 
                                        transaction={tx} 
                                        formatPeso={formatPeso}
                                        isResolvedView={currentCategory === 'resolved'}
                                    />
                                ))}
                            </div>

                            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
                                <p className="text-[11px] text-slate-500 font-medium">
                                    Showing <span className="font-bold text-slate-900">{pagination.from}-{pagination.to}</span> of <span className="font-bold text-slate-900">{pagination.total_count}</span>
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => goToPage(pagination.current_page - 1)}
                                        disabled={pagination.current_page <= 1}
                                        className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                    >
                                        <ChevronLeft size={12} />
                                    </button>
                                    <span className="text-[11px] font-bold text-slate-700 px-2">
                                        Page {pagination.current_page} of {pagination.total_pages}
                                    </span>
                                    <button
                                        onClick={() => goToPage(pagination.current_page + 1)}
                                        disabled={pagination.current_page >= pagination.total_pages}
                                        className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                    >
                                        <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={28} className="text-emerald-500" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-bold text-slate-700 mb-1">All caught up!</p>
                            <p className="text-[11px] text-slate-500 font-medium max-w-xs mx-auto">
                                {currentCategory === 'open' 
                                    ? 'No open cases. Great job!'
                                    : 'No resolved cases yet.'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ label, value, icon: Icon, color, subtitle }) {
    const colorStyles = {
        red: 'bg-red-50 border-red-200',
        emerald: 'bg-emerald-50 border-emerald-200',
    };
    const iconStyles = {
        red: 'bg-red-100 text-red-700',
        emerald: 'bg-emerald-100 text-emerald-700',
    };
    return (
        <div className={`rounded-xl border p-5 ${colorStyles[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconStyles[color]}`}>
                    <Icon size={16} strokeWidth={2.5} />
                </div>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            {subtitle && <p className="text-[10px] text-slate-500 font-medium mt-1">{subtitle}</p>}
        </div>
    );
}

function SupportCaseRow({ transaction, formatPeso, isResolvedView }) {
    return (
        <Link
            href={`/admin/transactions/${transaction.id}?from=cs`}
            className="grid grid-cols-12 items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 last:border-b-0"
        >
            {/* User — 3 cols */}
            <div className="col-span-12 sm:col-span-3 flex items-center gap-2.5 min-w-0">
                <Avatar 
                    src={transaction.user.profile_picture}
                    name={transaction.user.name}
                    size="sm"
                />
                <p className="text-xs font-bold text-slate-900 truncate">{transaction.user.name}</p>
            </div>

            {/* Issue — 3 cols (resolved) or 4 cols (open) */}
            <div className={`hidden sm:block min-w-0 ${isResolvedView ? 'col-span-3' : 'col-span-4'}`}>
                <p className="text-[11px] font-bold text-slate-700 truncate">{transaction.title}</p>
            </div>

            {/* Type — 1 col */}
            <div className="hidden sm:flex justify-center col-span-1">
                <IssueTypeBadge transaction={transaction} />
            </div>

            {/* Amount — 2 cols */}
            <div className="hidden md:flex justify-center col-span-2">
                <p className={`text-xs font-black ${
                    transaction.is_positive ? 'text-emerald-700' : 'text-red-700'
                }`}>
                    {transaction.is_positive ? '+' : '-'}{formatPeso(transaction.amount)}
                </p>
            </div>

            {/* Reported — 1 col */}
            <div className="hidden md:flex justify-center col-span-1">
                <p className="text-[10px] font-bold text-slate-700">{transaction.created_short}</p>
            </div>

            {/* Resolved — 1 col (only sa resolved view) */}
            {isResolvedView && (
                <div className="hidden md:flex justify-center col-span-1">
                    <p className="text-[10px] font-bold text-emerald-700">{transaction.resolved_at_short || '—'}</p>
                </div>
            )}

            {/* Status — 1 col */}
            <div className="col-span-12 sm:col-span-1 flex justify-center items-center gap-1">
                <CaseStatusBadge transaction={transaction} />
            </div>
        </Link>
    );
}

function IssueTypeBadge({ transaction }) {
    if (transaction.is_flagged && !transaction.is_resolved) {
        return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold uppercase tracking-widest rounded">
                Fraud
            </span>
        );
    }
    if (transaction.status === 'failed') {
        return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold uppercase tracking-widest rounded">
                Failed
            </span>
        );
    }
    if (transaction.status === 'pending') {
        return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold uppercase tracking-widest rounded">
                Stuck
            </span>
        );
    }
    return null;
}

function CaseStatusBadge({ transaction }) {
    if (transaction.is_resolved) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase tracking-widest rounded">
                <ClipboardCheck size={9} strokeWidth={2.5} />
                Resolved
            </span>
        );
    }
    
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold uppercase tracking-widest rounded">
            <AlertTriangle size={9} strokeWidth={2.5} />
            Open
        </span>
    );
}