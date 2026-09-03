// resources/js/Pages/Admin/TransactionsList.jsx
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import Avatar from '../../Components/Admin/Avatar';
// Shared with the dashboard, rather than a second copy that drifts out of step.
import StatCard from '../../Components/Admin/StatCard';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { cn } from '@/lib/utils';
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
                        color="neutral"
                    />
                    <StatCard 
                        label="Total Transactions" 
                        value={(stats.total_count || 0).toLocaleString()} 
                        icon={Receipt}
                        color="neutral"
                    />
                    <StatCard 
                        label="Flagged" 
                        value={(stats.flagged_count || 0).toLocaleString()} 
                        icon={Flag}
                        color="destructive"
                    />
                    <StatCard 
                        label="Failed" 
                        value={(stats.failed_count || 0).toLocaleString()} 
                        icon={XCircle}
                        color="amber"
                    />
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    {/* Filters bar */}
                    <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-border">
                        <div className="flex items-center gap-3 flex-wrap">
                            <StatusFilterTabs current={filters.status || 'all'} counts={counts} onChange={setStatusFilter} />
                            <FlagFilterTabs current={filters.flagged || 'all'} flaggedCount={counts.flagged || 0} onChange={setFlagFilter} />
                        </div>
                        
                        {/* Search */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search user, email, or reference..."
                                    className="pl-8 h-8 text-xs w-72 bg-muted/50"
                                />
                            </div>
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={() => setSearchInput('')}
                                    className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {transactions.length > 0 ? (
                        <>
                            {/* Table header */}
                            <div className="hidden sm:grid grid-cols-12 items-center gap-3 px-5 py-2.5 bg-muted border-b border-border">
                                <div className="col-span-5">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">User & Transaction</p>
                                </div>
                                <div className="col-span-3 text-center">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Amount</p>
                                </div>
                                <div className="hidden md:block col-span-2 text-center">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Date</p>
                                </div>
                                <div className="col-span-2 text-center">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                                </div>
                            </div>
                            
                            {/* Rows */}
                            <div>
                                {transactions.map((tx) => (
                                    <TransactionRow key={tx.id} transaction={tx} formatPeso={formatPeso} />
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-3">
                                <p className="text-[11px] text-muted-foreground font-medium">
                                    Showing <span className="font-bold text-foreground">{pagination.from}-{pagination.to}</span> of <span className="font-bold text-foreground">{pagination.total_count}</span>
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => goToPage(pagination.current_page - 1)}
                                        disabled={pagination.current_page <= 1}
                                        className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                    >
                                        <ChevronLeft size={12} />
                                    </button>
                                    <span className="text-[11px] font-bold text-foreground px-2">
                                        Page {pagination.current_page} of {pagination.total_pages}
                                    </span>
                                    <button
                                        onClick={() => goToPage(pagination.current_page + 1)}
                                        disabled={pagination.current_page >= pagination.total_pages}
                                        className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                    >
                                        <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Receipt size={28} className="text-muted-foreground" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-bold text-foreground mb-1">No transactions found</p>
                            <p className="text-[11px] text-muted-foreground font-medium max-w-xs mx-auto">
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



function StatusFilterTabs({ current, counts, onChange }) {
    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'completed', label: 'Completed' },
        { id: 'failed', label: 'Failed' },
        { id: 'pending', label: 'Pending' },
    ];
    return (
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                        current === tab.id
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
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
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                        current === tab.id
                            ? tab.id === 'flagged' 
                                ? 'bg-destructive/100 text-white shadow-sm shadow-red-200'
                                : 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    {tab.id === 'flagged' && <Flag size={10} strokeWidth={2.5} />}
                    {tab.label}
                    {tab.count > 0 && current !== tab.id && (
                        <span className="text-[9px] font-black px-1 rounded-full bg-red-200 text-destructive">
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
            className="grid grid-cols-12 items-center gap-3 px-5 py-3 hover:bg-muted transition-colors cursor-pointer border-b border-border last:border-b-0"
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
                        <p className="text-xs font-bold text-foreground truncate">{transaction.user.name}</p>
                        {transaction.is_flagged && (
                            <span className="inline-flex items-center px-1 py-0.5 bg-destructive/10 border border-destructive/25 rounded">
                                <Flag size={8} className="text-destructive" strokeWidth={2.5} />
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium truncate">{transaction.title}</p>
                </div>
            </div>

            {/* Column 2: Amount (3 cols) */}
            <div className="hidden sm:flex flex-col items-center col-span-3">
                <p className={`text-sm font-black ${
                    transaction.is_positive ? 'text-success' : 'text-destructive'
                }`}>
                    {transaction.is_positive ? '+' : '-'}{formatPeso(transaction.amount)}
                </p>
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                    {transaction.type}
                </p>
            </div>

            {/* Column 3: Date (2 cols) */}
            <div className="hidden md:flex flex-col items-center col-span-2">
                <p className="text-[11px] font-bold text-foreground">{transaction.created_relative}</p>
            </div>

            {/* Column 4: Status (2 cols) */}
            <div className="col-span-12 sm:col-span-2 flex justify-center items-center gap-1.5">
                <StatusBadge status={transaction.status} />
                <ChevronRight size={14} className="text-muted-foreground/50 shrink-0" />
            </div>
        </Link>
    );
}

function StatusBadge({ status }) {
    const styles = {
        completed: { color: 'bg-success/10 text-success border-success/25', icon: CheckCircle2, label: 'Completed' },
        success: { color: 'bg-success/10 text-success border-success/25', icon: CheckCircle2, label: 'Success' },
        failed: { color: 'bg-destructive/10 text-destructive border-destructive/25', icon: XCircle, label: 'Failed' },
        pending: { color: 'bg-accent/10 text-accent-foreground border-accent/30', icon: Clock, label: 'Pending' },
    };
    const style = styles[status] || { color: 'bg-muted text-muted-foreground border-border', icon: AlertTriangle, label: status };
    const Icon = style.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded border ${style.color}`}>
            <Icon size={9} strokeWidth={2.5} />
            {style.label}
        </span>
    );
}