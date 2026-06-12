// resources/js/Pages/Admin/TransactionsList.jsx
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import Avatar from '../../Components/Admin/Avatar';
import { 
    Search, ChevronLeft, ChevronRight, Receipt, 
    ArrowUp, ArrowDown, Flag, CheckCircle2, XCircle, Clock,
    TrendingUp, AlertTriangle,
} from 'lucide-react';

export default function TransactionsList({ 
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

    // Debounced auto-search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== (filters.search || '')) {
                router.get('/admin/transactions', { ...filters, search: searchInput, page: 1 }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const setStatusFilter = (status) => {
        router.get('/admin/transactions', { ...filters, status, page: 1 }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const setFlagFilter = (flagged) => {
        router.get('/admin/transactions', { ...filters, flagged, page: 1 }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const goToPage = (page) => {
        router.get('/admin/transactions', { ...filters, page }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatPeso = (amount) => '₱' + Number(amount).toLocaleString('en-PH', { 
        minimumFractionDigits: 2, maximumFractionDigits: 2 
    });

    const formatPesoShort = (amount) => {
        if (amount >= 1000000) return '₱' + (amount / 1000000).toFixed(1) + 'M';
        if (amount >= 1000) return '₱' + (amount / 1000).toFixed(1) + 'K';
        return '₱' + amount.toFixed(0);
    };

    return (
        <AdminLayout user={user} header="Transaction Monitor" pendingCounts={pendingCounts}>
            <Head title="Transactions | Admin" />

            <div className="max-w-7xl space-y-4">
                {/* Quick stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard 
                        label="Total Volume" 
                        value={formatPesoShort(stats.total_volume || 0)} 
                        icon={TrendingUp}
                        color="blue"
                    />
                    <StatCard 
                        label="Total Transactions" 
                        value={(stats.total_count || 0).toLocaleString()} 
                        icon={Receipt}
                        color="slate"
                    />
                    <StatCard 
                        label="Flagged" 
                        value={(stats.flagged_count || 0).toLocaleString()} 
                        icon={Flag}
                        color="red"
                    />
                    <StatCard 
                        label="Failed" 
                        value={(stats.failed_count || 0).toLocaleString()} 
                        icon={XCircle}
                        color="amber"
                    />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {/* Filters bar */}
                    <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-3 flex-wrap">
                            <StatusFilterTabs current={filters.status || 'all'} counts={counts} onChange={setStatusFilter} />
                            <FlagFilterTabs current={filters.flagged || 'all'} flaggedCount={counts.flagged || 0} onChange={setFlagFilter} />
                        </div>
                        
                        {/* Search */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search user, email, or reference..."
                                    className="pl-8 pr-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all w-72"
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
                                <div className="col-span-5">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">User & Transaction</p>
                                </div>
                                <div className="col-span-3 text-center">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Amount</p>
                                </div>
                                <div className="hidden md:block col-span-2 text-center">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Date</p>
                                </div>
                                <div className="col-span-2 text-center">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status</p>
                                </div>
                            </div>
                            
                            {/* Rows */}
                            <div>
                                {transactions.map((tx) => (
                                    <TransactionRow key={tx.id} transaction={tx} formatPeso={formatPeso} />
                                ))}
                            </div>

                            {/* Pagination */}
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
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Receipt size={28} className="text-slate-400" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-bold text-slate-700 mb-1">No transactions found</p>
                            <p className="text-[11px] text-slate-500 font-medium max-w-xs mx-auto">
                                {filters.search 
                                    ? `No matches for "${filters.search}"`
                                    : 'Transactions will appear here.'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ label, value, icon: Icon, color }) {
    const colorStyles = {
        blue: 'bg-blue-50 border-blue-200',
        slate: 'bg-slate-50 border-slate-200',
        red: 'bg-red-50 border-red-200',
        amber: 'bg-amber-50 border-amber-200',
    };
    const iconStyles = {
        blue: 'bg-blue-100 text-blue-700',
        slate: 'bg-slate-100 text-slate-700',
        red: 'bg-red-100 text-red-700',
        amber: 'bg-amber-100 text-amber-700',
    };
    return (
        <div className={`rounded-xl border p-4 ${colorStyles[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">{label}</p>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconStyles[color]}`}>
                    <Icon size={14} strokeWidth={2.5} />
                </div>
            </div>
            <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
    );
}

function StatusFilterTabs({ current, counts, onChange }) {
    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'completed', label: 'Completed' },
        { id: 'failed', label: 'Failed' },
        { id: 'pending', label: 'Pending' },
    ];
    return (
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                        current === tab.id
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

function FlagFilterTabs({ current, flaggedCount, onChange }) {
    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'flagged', label: 'Flagged', count: flaggedCount },
        { id: 'clean', label: 'Clean' },
    ];
    return (
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                        current === tab.id
                            ? tab.id === 'flagged' 
                                ? 'bg-red-500 text-white shadow-sm shadow-red-200'
                                : 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {tab.id === 'flagged' && <Flag size={10} strokeWidth={2.5} />}
                    {tab.label}
                    {tab.count > 0 && current !== tab.id && (
                        <span className="text-[9px] font-black px-1 rounded-full bg-red-200 text-red-700">
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

function TransactionRow({ transaction, formatPeso }) {
    return (
        <Link
            href={`/admin/transactions/${transaction.id}`}
            className="grid grid-cols-12 items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 last:border-b-0"
        >
            {/* Column 1: User + transaction (5 cols) */}
            <div className="col-span-12 sm:col-span-5 flex items-center gap-3 min-w-0">
                <Avatar 
                    src={transaction.user.profile_picture}
                    name={transaction.user.name}
                    size="md"
                />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 truncate">{transaction.user.name}</p>
                        {transaction.is_flagged && (
                            <span className="inline-flex items-center px-1 py-0.5 bg-red-50 border border-red-200 rounded">
                                <Flag size={8} className="text-red-600" strokeWidth={2.5} />
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{transaction.title}</p>
                </div>
            </div>

            {/* Column 2: Amount (3 cols) */}
            <div className="hidden sm:flex flex-col items-center col-span-3">
                <p className={`text-sm font-black ${
                    transaction.is_positive ? 'text-emerald-700' : 'text-red-700'
                }`}>
                    {transaction.is_positive ? '+' : '-'}{formatPeso(transaction.amount)}
                </p>
                <p className="text-[9px] text-slate-500 font-medium uppercase tracking-widest">
                    {transaction.type}
                </p>
            </div>

            {/* Column 3: Date (2 cols) */}
            <div className="hidden md:flex flex-col items-center col-span-2">
                <p className="text-[11px] font-bold text-slate-700">{transaction.created_relative}</p>
            </div>

            {/* Column 4: Status (2 cols) */}
            <div className="col-span-12 sm:col-span-2 flex justify-center items-center gap-1.5">
                <StatusBadge status={transaction.status} />
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
            </div>
        </Link>
    );
}

function StatusBadge({ status }) {
    const styles = {
        completed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Completed' },
        success: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Success' },
        failed: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Failed' },
        pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'Pending' },
    };
    const style = styles[status] || { color: 'bg-slate-50 text-slate-500 border-slate-200', icon: AlertTriangle, label: status };
    const Icon = style.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded border ${style.color}`}>
            <Icon size={9} strokeWidth={2.5} />
            {style.label}
        </span>
    );
}