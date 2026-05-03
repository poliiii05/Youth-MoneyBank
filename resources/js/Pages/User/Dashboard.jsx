// resources/js/Pages/User/Dashboard.jsx
import { Head, Link } from '@inertiajs/react';
import UserLayout from '../../Layouts/UserLayout';
import { Wallet, Target, Send, Download, Plus, ArrowUpCircle, Gift, Receipt } from 'lucide-react';

export default function Dashboard({ auth }) {
    // Safety net for user data
    const user = auth?.user;
    
    // Simulated Database Values (Papalitan natin ito ng totoong data mula sa database soon)
    const balance = {
        unallocated: 1500.00, // Spendable money
        allocated: 4500.00    // Locked in Savings Goals
    };

    return (
        <UserLayout user={user} header="Dashboard Overview">
            <Head title="Dashboard | Youth MoneyBank" />

            {/* 1. WELCOME BANNER WITH CASH-IN */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hello, {user?.name?.split(' ')[0] || 'User'}! 👋</h2>
                    <p className="text-gray-500 text-sm mt-1">Ready to manage your wealth today?</p>
                </div>
                <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 cursor-pointer transition-all flex items-center gap-2">
                    <span className="text-xl leading-none mb-0.5">+</span> Cash-In
                </button>
            </div>

            {/* 2. BALANCE CARDS (UNALLOCATED VS ALLOCATED) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                
                {/* Spendable Money */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <p className="text-blue-100 text-sm font-medium mb-1">Unallocated Balance</p>
                    <p className="text-3xl font-bold tracking-tight">₱{balance.unallocated.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                    <div className="mt-8 flex justify-between items-center opacity-50">
                        <p className="text-xs font-bold uppercase tracking-widest italic">Spendable</p>
                        <Wallet size={32} />
                    </div>
                </div>

                {/* Locked/Saved Money */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <p className="text-emerald-100 text-sm font-medium mb-1">Allocated to Goals</p>
                    <p className="text-3xl font-bold tracking-tight">₱{balance.allocated.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                    <div className="mt-8 flex justify-between items-center opacity-50">
                        <p className="text-xs font-bold uppercase tracking-widest italic">Saved</p>
                        <Target size={32} />
                    </div>
                </div>

                {/* Create Goal Action Card (Naka-link papuntang /goals) */}
                <Link href="/goals" className="bg-white border-2 border-dashed border-gray-200 p-6 rounded-2xl flex flex-col justify-center items-center text-center hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                    </div>
                    <p className="font-bold text-gray-800 uppercase tracking-tighter text-sm">Create New Goal</p>
                </Link>
            </div>

            {/* 3. QUICK ACTIONS (Youth Bank Specific Features) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-tight">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    
                    {/* Transfer */}
                    <button className="flex flex-col items-center gap-3 group cursor-pointer">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-md">
                            <Send size={32} />
                        </div>
                        <span className="font-bold text-sm text-gray-700">Transfer</span>
                    </button>
                    
                    {/* Request Allowance */}
                    <button className="flex flex-col items-center gap-3 group cursor-pointer">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-md">
                            <Download size={32} />
                        </div>
                        <span className="font-bold text-sm text-gray-700">Request</span>
                    </button>

                    {/* Controlled Cash-Out */}
                    <button className="flex flex-col items-center gap-3 group cursor-pointer">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-md">
                            <ArrowUpCircle size={32} />
                        </div>
                        <span className="font-bold text-sm text-gray-700">Cash-Out</span>
                    </button>
                    
                    {/* Earn/Rewards */}
                    <button className="flex flex-col items-center gap-3 group cursor-pointer">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-md">
                            <Gift size={32} />
                        </div>
                        <span className="font-bold text-sm text-gray-700">Rewards</span>
                    </button>

                </div>
            </div>

            {/* 4. RECENT TRANSACTIONS EMPTY STATE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
                    <Link href="/transactions" className="text-blue-600 font-bold text-sm hover:underline cursor-pointer">View All</Link>
                </div>
                
                {/* Empty State UI */}
                <div className="p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 border-2 border-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-4">
                        <Receipt size={32} strokeWidth={1.5} />
                    </div>
                    <p className="text-gray-700 font-bold text-lg">No transactions yet</p>
                    <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                        Your recent deposits, transfers, and activities will appear here. Click <span className="font-semibold text-gray-500">Cash-In</span> to get started!
                    </p>
                </div>
            </div>

        </UserLayout>
    );
}