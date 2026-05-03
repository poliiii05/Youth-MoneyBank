// resources/js/Pages/User/Transactions.jsx
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { ArrowDownCircle, ArrowUpCircle, Send, Download, Search, Filter } from 'lucide-react';

export default function Transactions({ auth }) {
    const [filter, setFilter] = useState('All');

    // Dummy data para may makita tayong listahan
    const transactions = [
        { id: 1, type: 'cash-in', title: 'Cash-In via PayPal', date: 'May 4, 2026', time: '10:30 AM', amount: 1500.00, isPositive: true },
        { id: 2, type: 'transfer', title: 'Transfer to Alex', date: 'May 3, 2026', time: '02:15 PM', amount: 500.00, isPositive: false },
        { id: 3, type: 'goal', title: 'Added to Dream Phone Goal', date: 'May 1, 2026', time: '09:00 AM', amount: 1000.00, isPositive: false },
        { id: 4, type: 'request', title: 'Allowance from Mom', date: 'April 30, 2026', time: '06:00 PM', amount: 2000.00, isPositive: true },
        { id: 5, type: 'cash-out', title: 'Withdrawal', date: 'April 28, 2026', time: '11:20 AM', amount: 1000.00, isPositive: false },
    ];

    const getIcon = (type) => {
        switch(type) {
            case 'cash-in': return <ArrowDownCircle className="text-emerald-500" />;
            case 'cash-out': return <ArrowUpCircle className="text-orange-500" />;
            case 'transfer': return <Send className="text-blue-500" />;
            case 'request': return <Download className="text-purple-500" />;
            default: return <ArrowDownCircle className="text-gray-500" />;
        }
    };

    return (
        <UserLayout user={auth?.user} header="Transaction History">
            <Head title="Transactions | Youth MoneyBank" />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* Search & Filter Header */}
                <div className="p-6 border-b border-gray-100 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-auto flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Search transactions..." 
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {['All', 'Cash-In', 'Transfers', 'Goals'].map((f) => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transactions List */}
                <div className="divide-y divide-gray-50">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    {getIcon(tx.type)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm md:text-base">{tx.title}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">{tx.date} • {tx.time}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-black ${tx.isPositive ? 'text-emerald-600' : 'text-gray-900'}`}>
                                    {tx.isPositive ? '+' : '-'}₱{tx.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Completed</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </UserLayout>
    );
}