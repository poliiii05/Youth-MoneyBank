// resources/js/Pages/User/Transactions.jsx
import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '../../Components/Layouts/UserLayout';
import { 
    Search, ArrowDownRight, ArrowUpRight, Receipt, Filter, 
    ChevronLeft, ChevronRight, Clock 
} from 'lucide-react';

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
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Frontend filtering
    const filteredData = transactions.filter(item => {
        const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              item.public_reference_id?.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesFilter = true;
        if (activeFilter === 'in') {
            matchesFilter = item.is_positive == 1;
        } else if (activeFilter === 'out') {
            matchesFilter = item.is_positive == 0;
        }

        let matchesDate = true;
        if (startDate && endDate) {
            const itemDate = new Date(item.created_at).getTime();
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime() + 86400000;
            matchesDate = itemDate >= start && itemDate <= end;
        }

        return matchesSearch && matchesFilter && matchesDate;
    });
    // Group by date
    const groupedTransactions = groupByDate(filteredData);

    const goToPage = (page) => {
        if (page < 1 || page > pagination.total_pages) return;
        const params = { page };
        if (filters.show_all) params.show_all = 1;
        router.get('/transactions', params, { preserveState: false, preserveScroll: false });
    };

    const toggleShowAll = () => {
        const newShowAll = !filters.show_all;
        router.get('/transactions', newShowAll ? { show_all: 1 } : {}, { preserveState: false });
    };

    const canGoPrev = pagination.current_page > 1;
    const canGoNext = pagination.current_page < pagination.total_pages;

    return (
        <UserLayout user={user} header="Transactions">
            <Head title="Transactions | Youth MoneyBank" />

            <div className="max-w-5xl mx-auto space-y-5">

                {/* 1. SUMMARY HEADER — 3 cards */}
                <div className="grid grid-cols-3 gap-4">
                    <SummaryCard
                        label="Money In"
                        value={summary.money_in}
                        sign="+"
                        valueColor="text-emerald-700"
                        sub={summary.period_label}
                    />
                    <SummaryCard
                        label="Money Out"
                        value={summary.money_out}
                        sign="−"
                        valueColor="text-amber-700"
                        sub={summary.period_label}
                    />
                    <SummaryCard
                        label="Net"
                        value={summary.net}
                        sign={summary.net >= 0 ? '+' : '−'}
                        valueColor={summary.net >= 0 ? 'text-emerald-700' : 'text-amber-700'}
                        sub={summary.period_label}
                    />
                </div>

                {/* 2. SEARCH + FILTERS */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                    {/* Search bar */}
                    <div className="relative mb-3">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by title or reference ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Filter chips + Date range */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button 
                            onClick={() => setActiveFilter('all')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                activeFilter === 'all' 
                                    ? 'bg-slate-900 text-white' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <Filter size={13} />
                            All
                        </button>
                        <button 
                            onClick={() => setActiveFilter('in')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                activeFilter === 'in' 
                                    ? 'bg-emerald-600 text-white' 
                                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                        >
                            <ArrowDownRight size={13} strokeWidth={2.5} />
                            Money In
                        </button>
                        <button 
                            onClick={() => setActiveFilter('out')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                activeFilter === 'out' 
                                    ? 'bg-amber-600 text-white' 
                                    : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                            }`}
                        >
                            <ArrowUpRight size={13} strokeWidth={2.5} />
                            Money Out
                        </button>

                        <div className="flex-1"></div>

                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 cursor-pointer"
                        />
                        <span className="text-xs text-slate-400">to</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 cursor-pointer"
                        />
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="text-[10px] font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer px-1.5"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* 3. SCOPE INDICATOR */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <Clock size={14} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
                        <p className="text-[11px] font-semibold text-emerald-900">
                            {filters.show_all 
                                ? 'Showing all transactions' 
                                : 'Showing last 30 days'}
                        </p>
                    </div>
                    {filters.has_older && (
                        <button 
                            onClick={toggleShowAll}
                            className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            {filters.show_all ? 'Show last 30 days' : 'Show older →'}
                        </button>
                    )}
                </div>

                {/* 4. TRANSACTIONS GROUPED BY DATE */}
                {filteredData.length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(groupedTransactions).map(([groupName, txns]) => {
                            if (txns.length === 0) return null;
                            
                            return (
                                <div key={groupName}>
                                    {/* Date group label */}
                                    <div className="text-[10px] font-semibold text-slate-400 tracking-widest mb-2 px-2">
                                        {groupName}
                                    </div>
                                    
                                    {/* Transactions list */}
                                    <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                                        {txns.map((transaction) => (
                                            <TransactionRow 
                                                key={transaction.id} 
                                                transaction={transaction}
                                                groupName={groupName}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Pagination */}
                        {pagination.total_pages > 1 && (
                            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-xs text-slate-500 font-medium">
                                    Showing <span className="font-semibold text-slate-700">{pagination.from || 0}</span> to <span className="font-semibold text-slate-700">{pagination.to || 0}</span> of <span className="font-semibold text-slate-700">{pagination.total_count || 0}</span> transactions
                                </p>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => goToPage(pagination.current_page - 1)}
                                        disabled={!canGoPrev}
                                        className={`p-1.5 rounded-lg border transition-colors ${
                                            canGoPrev 
                                                ? 'border-slate-300 text-slate-600 bg-white hover:bg-slate-50 cursor-pointer' 
                                                : 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                                        }`}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-xs font-semibold text-slate-600 px-2">
                                        Page {pagination.current_page || 1} of {pagination.total_pages || 1}
                                    </span>
                                    <button 
                                        onClick={() => goToPage(pagination.current_page + 1)}
                                        disabled={!canGoNext}
                                        className={`p-1.5 rounded-lg border transition-colors ${
                                            canGoNext 
                                                ? 'border-slate-300 text-slate-600 bg-white hover:bg-slate-50 cursor-pointer' 
                                                : 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                                        }`}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                            <Receipt size={32} strokeWidth={1.5} />
                        </div>
                        <p className="text-slate-900 font-semibold text-lg">No transactions found</p>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed font-medium">
                            {searchQuery || startDate || activeFilter !== 'all' 
                                ? 'Try adjusting your filters or search query.' 
                                : filters.has_older 
                                    ? 'No transactions in the last 30 days. Click "Show older" to see all.'
                                    : 'Your transaction history will appear here once you start using the app.'}
                        </p>
                    </div>
                )}

            </div>
        </UserLayout>
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

// Summary card component
function SummaryCard({ label, value, sign, valueColor, sub }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-[10px] font-semibold text-slate-400 tracking-widest">{label.toUpperCase()}</div>
            <div className={`text-xl font-bold mt-1 ${valueColor}`} style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                {sign}₱{Math.abs(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
        </div>
    );
}

// Transaction row component
function TransactionRow({ transaction, groupName }) {
    const isIncome = transaction.is_positive == 1;
    
    const formatTime = (createdAt) => {
        const date = new Date(createdAt);
        const isToday = groupName.startsWith('TODAY');
        const isYesterday = groupName.startsWith('YESTERDAY');
        
        if (isToday || isYesterday) {
            return date.toLocaleTimeString('en-PH', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true,
            });
        }
        
        return date.toLocaleDateString('en-PH', { 
            month: 'short', 
            day: 'numeric',
        }) + ', ' + date.toLocaleTimeString('en-PH', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true,
        });
    };
    
    return (
        <Link
            href={`/transactions/${transaction.id}`}
            className="flex items-center gap-3 p-4 hover:bg-slate-50 transition cursor-pointer"
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
                {isIncome 
                    ? <ArrowDownRight size={18} strokeWidth={2.5} /> 
                    : <ArrowUpRight size={18} strokeWidth={2.5} />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">{transaction.title}</div>
                <div className="text-xs text-slate-400" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatTime(transaction.created_at)}
                </div>
            </div>
            <div className={`text-sm font-bold shrink-0 ${isIncome ? 'text-emerald-700' : 'text-slate-900'}`} style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                {isIncome ? '+' : '−'}₱{Number(transaction.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </div>
            <ChevronRight size={16} className="text-slate-300 ml-1 shrink-0" />
        </Link>
    );
}