// resources/js/Pages/User/Transactions.jsx
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '../../Components/Layouts/UserLayout';
import { Search, ArrowDownRight, ArrowUpRight, Receipt, Filter, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import TransactionCard from '../../Components/Transactions/TransactionCard';

export default function Transactions({ auth, transactions = [], pagination = {}, filters = {} }) {
    const user = auth?.user;
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Frontend filtering (search + direction + date)
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

            <div className="max-w-4xl mx-auto">
                {/* SEARCH & FILTERS */}
                <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 p-5 sm:p-6 mb-6">
                    {/* Search */}
                    <div className="relative w-full mb-5">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by title or reference ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 outline-none"
                        />
                    </div>

                    {/* Filter Pills + Date Range */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide shrink-0">
                            <button 
                                onClick={() => setActiveFilter('all')}
                                className={`px-4 py-1.5 rounded-lg text-[11px] uppercase tracking-wide font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${activeFilter === 'all' ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                <Filter size={12} /> All
                            </button>
                            <button 
                                onClick={() => setActiveFilter('in')}
                                className={`px-4 py-1.5 rounded-lg text-[11px] uppercase tracking-wide font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${activeFilter === 'in' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                            >
                                <ArrowDownRight size={14} strokeWidth={2.5} /> Money In
                            </button>
                            <button 
                                onClick={() => setActiveFilter('out')}
                                className={`px-4 py-1.5 rounded-lg text-[11px] uppercase tracking-wide font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${activeFilter === 'out' ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}
                            >
                                <ArrowUpRight size={14} strokeWidth={2.5} /> Money Out
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                            />
                            <span className="text-xs font-bold text-slate-400">to</span>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                            />
                            {(startDate || endDate) && (
                                <button
                                    onClick={() => { setStartDate(''); setEndDate(''); }}
                                    className="text-[10px] font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer px-2"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* SCOPE INDICATOR */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <Clock size={14} className="text-blue-600 shrink-0" strokeWidth={2.5} />
                        <p className="text-[11px] font-semibold text-blue-900">
                            {filters.show_all 
                                ? 'Showing all transactions' 
                                : 'Showing last 30 days'}
                        </p>
                    </div>
                    {filters.has_older && (
                        <button 
                            onClick={toggleShowAll}
                            className="text-[10px] font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            {filters.show_all ? 'Show last 30 days' : 'Show older →'}
                        </button>
                    )}
                </div>

                {/* TRANSACTIONS LIST */}
                <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    {filteredData.length > 0 ? (
                        <>
                            <div className="divide-y divide-slate-100 flex-1">
                                {filteredData.map((transaction) => (
                                    <TransactionCard 
                                        key={transaction.id} 
                                        transaction={transaction}
                                    />
                                ))}
                            </div>
                            
                            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-xs text-slate-500 font-medium">
                                    Showing <span className="font-bold text-slate-700">{pagination.from || 0}</span> to <span className="font-bold text-slate-700">{pagination.to || 0}</span> of <span className="font-bold text-slate-700">{pagination.total_count || 0}</span> transactions
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
                                    <span className="text-xs font-bold text-slate-600 px-2">
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
                        </>
                    ) : (
                        <div className="p-16 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                                <Receipt size={32} strokeWidth={1.5} />
                            </div>
                            <p className="text-slate-900 font-bold text-lg">No transactions found</p>
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
            </div>
        </UserLayout>
    );
}