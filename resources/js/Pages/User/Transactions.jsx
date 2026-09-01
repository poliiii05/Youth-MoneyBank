// resources/js/Pages/User/Transactions.jsx
import { Head, router, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import UserLayout from '../../Components/Layouts/UserLayout';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { cn } from '@/lib/utils';
import {
    Search, ArrowDownRight, ArrowUpRight, Receipt,
    ChevronLeft, ChevronRight, Clock, X, Loader2, Download,
} from 'lucide-react';

const STATUS_STYLES = {
    completed: null, // the default case needs no badge
    success: null,
    pending: { label: 'Pending', className: 'bg-accent/15 text-accent-foreground ring-accent/30' },
    processing: { label: 'Processing', className: 'bg-accent/15 text-accent-foreground ring-accent/30' },
    failed: { label: 'Failed', className: 'bg-destructive/10 text-destructive ring-destructive/25' },
    cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground ring-border' },
    flagged: { label: 'Under review', className: 'bg-destructive/10 text-destructive ring-destructive/25' },
};

export default function Transactions({
    auth,
    transactions = [],
    pagination = {},
    filters = {},
    summary = {
        money_in: 0,
        money_out: 0,
        net: 0,
        period_label: 'This month',
    },
}) {
    const user = auth?.user;

    // Local mirrors of the server-side filters, so typing feels instant while
    // the query itself still runs against the whole table.
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeFilter, setActiveFilter] = useState(filters.direction || 'all');
    const [startDate, setStartDate] = useState(filters.from || '');
    const [endDate, setEndDate] = useState(filters.to || '');
    const [isFetching, setIsFetching] = useState(false);

    const isFirstRender = useRef(true);

    const applyFilters = (overrides = {}) => {
        const params = {
            search: searchQuery || undefined,
            direction: activeFilter !== 'all' ? activeFilter : undefined,
            from: startDate || undefined,
            to: endDate || undefined,
            show_all: filters.show_all ? 1 : undefined,
            ...overrides,
        };

        router.get('/transactions', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setIsFetching(true),
            onFinish: () => setIsFetching(false),
        });
    };

    // Debounce the search box — one request when they stop typing, not one per key.
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timer = setTimeout(() => applyFilters({ page: undefined }), 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, activeFilter, startDate, endDate]);

    const groupedTransactions = groupByDate(transactions);
    const hasActiveFilters = searchQuery || startDate || endDate || activeFilter !== 'all';

    const goToPage = (page) => {
        if (page < 1 || page > pagination.total_pages) return;
        applyFilters({ page });
    };

    const exportCsv = () => {
        // Same filters the list is showing, so the file matches the screen.
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (activeFilter !== 'all') params.set('direction', activeFilter);
        if (startDate) params.set('from', startDate);
        if (endDate) params.set('to', endDate);
        if (filters.show_all) params.set('show_all', '1');

        window.location.href = `/transactions/export?${params.toString()}`;
    };

    const clearFilters = () => {
        setSearchQuery('');
        setActiveFilter('all');
        setStartDate('');
        setEndDate('');
    };

    const toggleShowAll = () => {
        router.get('/transactions', filters.show_all ? {} : { show_all: 1 }, { preserveState: false });
    };

    const canGoPrev = pagination.current_page > 1;
    const canGoNext = pagination.current_page < pagination.total_pages;

    return (
        <UserLayout user={user} header="Transactions">
            <Head title="Transactions | Youth MoneyBank" />

            <div className="max-w-5xl mx-auto space-y-5">

                {/* 0. HEADING — names what this page actually is. Every row here
                    is backed by double-entry ledger records, so "ledger" is
                    accurate rather than decorative. */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">
                            Transaction Ledger
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            A record of every movement in and out of your account.
                        </p>
                    </div>

                </div>

                {/* 1. SUMMARY */}
                <div className="grid grid-cols-3 gap-4">
                    <SummaryCard
                        label="Money In"
                        value={summary.money_in}
                        sign="+"
                        valueColor="text-success"
                        sub={summary.period_label}
                    />
                    <SummaryCard
                        label="Money Out"
                        value={summary.money_out}
                        sign="−"
                        valueColor="text-foreground"
                        sub={summary.period_label}
                    />
                    <SummaryCard
                        label="Net"
                        value={summary.net}
                        sign={summary.net >= 0 ? '+' : '−'}
                        valueColor={summary.net >= 0 ? 'text-success' : 'text-destructive'}
                        sub={summary.period_label}
                    />
                </div>

                {/* 2. SEARCH + FILTERS */}
                <Card className="p-4">
                    <div className="relative mb-3">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by title or reference ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10 bg-muted/50"
                        />
                        {isFetching && (
                            <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <FilterChip active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>
                            All
                        </FilterChip>
                        <FilterChip active={activeFilter === 'in'} onClick={() => setActiveFilter('in')}>
                            <ArrowDownRight size={13} strokeWidth={2.5} /> Money In
                        </FilterChip>
                        <FilterChip active={activeFilter === 'out'} onClick={() => setActiveFilter('out')}>
                            <ArrowUpRight size={13} strokeWidth={2.5} /> Money Out
                        </FilterChip>

                        <div className="flex-1" />

                        <input
                            type="date"
                            value={startDate}
                            max={endDate || undefined}
                            onChange={(e) => setStartDate(e.target.value)}
                            aria-label="From date"
                            className="h-8 px-2.5 text-xs border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                        />
                        <span className="text-xs text-muted-foreground">to</span>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            onChange={(e) => setEndDate(e.target.value)}
                            aria-label="To date"
                            className="h-8 px-2.5 text-xs border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                        />

                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                                <X size={12} /> Clear
                            </Button>
                        )}

                        {/* Export sits at the end of the filter row: it acts on
                            whatever these controls have narrowed down. */}
                        <Button
    size="sm"
    onClick={exportCsv}
    disabled={transactions.length === 0}
    className="ml-1"
>
    <Download size={14} /> Export CSV
</Button>
                    </div>
                </Card>

                {/* 3. SCOPE */}
                <div className="bg-secondary border border-border rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <Clock size={14} className="text-primary shrink-0" strokeWidth={2.5} />
                        <p className="text-[11px] font-semibold text-secondary-foreground">
                            {filters.show_all ? 'Showing all transactions' : 'Showing last 30 days'}
                        </p>
                    </div>
                    {filters.has_older && (
                        <button
                            onClick={toggleShowAll}
                            className="text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            {filters.show_all ? 'Show last 30 days' : 'Show older →'}
                        </button>
                    )}
                </div>

                {/* 4. LIST */}
                {transactions.length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(groupedTransactions).map(([groupName, txns]) => {
                            if (txns.length === 0) return null;

                            return (
                                <div key={groupName}>
                                    <div className="text-[10px] font-semibold text-muted-foreground tracking-widest mb-2 px-2">
                                        {groupName}
                                    </div>

                                    <Card className="divide-y divide-border overflow-hidden p-0">
                                        {txns.map((transaction) => (
                                            <TransactionRow
                                                key={transaction.id}
                                                transaction={transaction}
                                                groupName={groupName}
                                            />
                                        ))}
                                    </Card>
                                </div>
                            );
                        })}

                        {pagination.total_pages > 1 && (
                            <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-xs text-muted-foreground font-medium">
                                    Showing <span className="font-semibold text-foreground tabular-nums">{pagination.from || 0}</span>
                                    {' '}to <span className="font-semibold text-foreground tabular-nums">{pagination.to || 0}</span>
                                    {' '}of <span className="font-semibold text-foreground tabular-nums">{pagination.total_count || 0}</span> transactions
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => goToPage(pagination.current_page - 1)}
                                        disabled={!canGoPrev}
                                    >
                                        <ChevronLeft size={16} />
                                    </Button>
                                    <span className="text-xs font-semibold text-muted-foreground px-2 tabular-nums">
                                        Page {pagination.current_page || 1} of {pagination.total_pages || 1}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => goToPage(pagination.current_page + 1)}
                                        disabled={!canGoNext}
                                    >
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>
                ) : (
                    <Card className="p-16 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-4 border border-border">
                            <Receipt size={32} strokeWidth={1.5} />
                        </div>
                        <p className="text-foreground font-semibold text-lg">No transactions found</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed font-medium">
                            {hasActiveFilters
                                ? 'Try adjusting your filters or search query.'
                                : filters.has_older
                                    ? 'No transactions in the last 30 days. Use "Show older" to see all.'
                                    : 'Your transaction history will appear here once you start using the app.'}
                        </p>
                        {hasActiveFilters && (
                            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                                Clear filters
                            </Button>
                        )}
                    </Card>
                )}

            </div>
        </UserLayout>
    );
}

function FilterChip({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer',
                active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
            )}
        >
            {children}
        </button>
    );
}

// Helper: group transactions by date
function groupByDate(transactions) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const todayLabel = `TODAY · ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}`;
    const yesterdayLabel = `YESTERDAY · ${yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}`;

    const groups = {
        [todayLabel]: [],
        [yesterdayLabel]: [],
        'EARLIER THIS WEEK': [],
        'THIS MONTH': [],
        'OLDER': [],
    };

    transactions.forEach(txn => {
        const txnDate = new Date(txn.created_at);
        if (txnDate >= today) {
            groups[todayLabel].push(txn);
        } else if (txnDate >= yesterday) {
            groups[yesterdayLabel].push(txn);
        } else if (txnDate >= sevenDaysAgo) {
            groups['EARLIER THIS WEEK'].push(txn);
        } else if (txnDate >= thirtyDaysAgo) {
            groups['THIS MONTH'].push(txn);
        } else {
            groups['OLDER'].push(txn);
        }
    });

    return groups;
}

function SummaryCard({ label, value, sign, valueColor, sub }) {
    return (
        <Card className="p-4">
            <div className="text-[10px] font-semibold text-muted-foreground tracking-widest">
                {label.toUpperCase()}
            </div>
            <div className={cn('text-xl font-bold mt-1 tabular-nums tracking-tight', valueColor)}>
                {sign}₱{Math.abs(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
        </Card>
    );
}

function TransactionRow({ transaction, groupName }) {
    const isIncome = transaction.is_positive == 1;
    const status = STATUS_STYLES[transaction.status] ?? null;
    const isSettled = !status;

    const formatTime = (createdAt) => {
        const date = new Date(createdAt);
        const isRecent = groupName.startsWith('TODAY') || groupName.startsWith('YESTERDAY');

        const time = date.toLocaleTimeString('en-PH', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

        if (isRecent) return time;

        return `${date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}, ${time}`;
    };

    return (
        <Link
            href={`/transactions/${transaction.id}`}
            className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
        >
            <div
                className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                    isIncome ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                )}
            >
                {isIncome
                    ? <ArrowDownRight size={18} strokeWidth={2.5} />
                    : <ArrowUpRight size={18} strokeWidth={2.5} />}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">
                        {transaction.title}
                    </span>

                    {/* Anything not settled says so. A failed cash-in that looks
                        identical to a successful one is the worst kind of quiet
                        in a money app. */}
                    {status && (
                        <span
                            className={cn(
                                'shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ring-1',
                                status.className
                            )}
                        >
                            {status.label}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
                    <span>{formatTime(transaction.created_at)}</span>
                    {transaction.public_reference_id && (
                        <>
                            <span className="text-muted-foreground/40">·</span>
                            <span className="truncate font-mono text-[11px]">
                                {transaction.public_reference_id}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div
                className={cn(
                    'text-sm font-bold shrink-0 tabular-nums tracking-tight',
                    !isSettled ? 'text-muted-foreground line-through' : isIncome ? 'text-success' : 'text-foreground'
                )}
            >
                {isIncome ? '+' : '−'}₱{Number(transaction.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </div>

            <ChevronRight size={16} className="text-muted-foreground/50 ml-1 shrink-0" />
        </Link>
    );
}