// resources/js/Pages/User/Transactions.jsx
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '../../Components/Layouts/UserLayout';
import { Search, ArrowDownRight, ArrowUpRight, Receipt, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Transactions({ auth, transactions = [] }) {
    const user = auth?.user;
    
    // UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    
    // CUSTOM DATE RANGE STATES (Maya/GCash Style)
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const displayData = transactions; 

    // Frontend Filtering Logic (Updated to match DB structure)
    const filteredData = displayData.filter(item => {
        const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesFilter = true;
        if (activeFilter === 'in') {
            matchesFilter = item.is_positive == 1;
        } else if (activeFilter === 'out') {
            matchesFilter = item.is_positive == 0;
        }

        // Add date range filtering if dates are selected
        let matchesDate = true;
        if (startDate && endDate) {
            const itemDate = new Date(item.created_at).getTime();
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime() + 86400000; // Add 1 day to include end date fully
            matchesDate = itemDate >= start && itemDate <= end;
        }

        return matchesSearch && matchesFilter && matchesDate;
    });

    return (
        <UserLayout user={user} header="Transactions">
            <Head title="Transactions | Youth MoneyBank" />

            <div className="max-w-4xl mx-auto">
                {/* 1. HEADER, SEARCH & FILTERS SECTION */}
                <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-5 sm:p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Transactions</h2>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Track your money in and out.</p>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Filter Pills & Custom Date Range */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Transaction Type Filters */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide shrink-0">
                            <button 
                                onClick={() => setActiveFilter('all')}
                                className={`px-4 py-1.5 rounded-lg text-[11px] uppercase tracking-wide font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${activeFilter === 'all' ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                <Filter size={12} /> All
                            </button>
                            <button 
                                onClick={() => setActiveFilter('in')}
                                className={`px-4 py-1.5 rounded-lg text-[11px] uppercase tracking-wide font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${activeFilter === 'in' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                            >
                                <ArrowDownRight size={14} strokeWidth={2.5} /> In
                            </button>
                            <button 
                                onClick={() => setActiveFilter('out')}
                                className={`px-4 py-1.5 rounded-lg text-[11px] uppercase tracking-wide font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${activeFilter === 'out' ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}
                            >
                                <ArrowUpRight size={14} strokeWidth={2.5} /> Out
                            </button>
                        </div>

                        {/* GCash/Maya Style Custom Date Range */}
                        <div className="flex items-center gap-2">
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                            <span className="text-xs font-bold text-slate-400">to</span>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. TRANSACTIONS LIST WITH PAGINATION FOOTER */}
                <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    {filteredData.length > 0 ? (
                        <>
                            <div className="divide-y divide-slate-100 flex-1">
                                {filteredData.map((transaction) => {
                                    const isIncome = transaction.is_positive == 1;
                                    const formattedDate = new Date(transaction.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

                                    return (
                                        <div key={transaction.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                                    isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                    {isIncome ? <ArrowDownRight size={24} strokeWidth={2} /> : <ArrowUpRight size={24} strokeWidth={2} />}
                                                </div>
                                                
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900">{transaction.title}</h4>
                                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{formattedDate}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                <p className={`text-sm font-black tracking-tight ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                    {isIncome ? '+' : '-'}₱{Number(transaction.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{transaction.status}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Pagination Footer */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-xs text-slate-500 font-medium">
                                    Showing <span className="font-bold text-slate-700">{filteredData.length > 0 ? 1 : 0}</span> to <span className="font-bold text-slate-700">{filteredData.length}</span> of <span className="font-bold text-slate-700">{filteredData.length}</span> transactions
                                </p>
                                <div className="flex items-center gap-2">
                                    <button disabled className="p-1.5 rounded-lg border border-slate-200 text-slate-400 bg-slate-100/50 cursor-not-allowed">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button disabled className="p-1.5 rounded-lg border border-slate-200 text-slate-400 bg-slate-100/50 cursor-not-allowed">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* EMPTY STATE */
                        <div className="p-16 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                <Receipt size={32} strokeWidth={1.5} />
                            </div>
                            <p className="text-slate-900 font-bold text-lg">No transactions found.</p>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed font-medium">
                                Select a different date range or clear your search filters.
                            </p>
                        </div>
                    )}
                </div>
            </div>

        </UserLayout>
    );
}