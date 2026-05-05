// resources/js/Pages/User/Dashboard.jsx
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { Wallet, Target, Send, Download, ArrowUpCircle, Gift, Receipt, ArrowRight, Lightbulb, ChevronRight } from 'lucide-react';

export default function Dashboard({ auth, finances, active_goal, kyc_tier }) {
    const user = auth?.user;

    // --- COMPUTATIONS ---
    const mainBalance = finances?.main_balance || 0;
    const maxLimit = finances?.max_limit || 5000;
    const remainingLimit = maxLimit - mainBalance;
    const limitPercentage = maxLimit > 0 ? (mainBalance / maxLimit) * 100 : 0;

    const getTierName = (tier) => {
        if (Number(tier) === 3) return 'Achiever';
        if (Number(tier) === 2) return 'Builder';
        return 'Starter';
    };

    // --- DYNAMIC MONEY TIPS ---
    const [tipIndex, setTipIndex] = useState(0);
    const moneyTips = mainBalance === 0 ? [
        "Start small! Even ₱20 is a great first step. 🌱",
        "Saving just ₱50 a week gives you ₱2,600 by the end of the year!",
        "Pay yourself first: Put a portion of your allowance into savings immediately."
    ] : [
        "Saving just ₱50 a week gives you ₱2,600 by the end of the year!",
        "Tracking your expenses helps you find 'leaks' in your budget.",
        "Don't spend out of your main wallet if you can save it instead!"
    ];

    const nextTip = () => {
        setTipIndex((prev) => (prev + 1) % moneyTips.length);
    };

    return (
        <UserLayout user={user} header="Dashboard Overview">
            <Head title="Dashboard | Youth MoneyBank" />

            {/* 1. WELCOME BANNER (Tighter spacing) */}
            <div className="bg-white rounded-3xl shadow-sm border border-blue-100 p-5 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-0.5">Hello, {user?.name?.split(' ')[0] || 'User'}! 👋</h2>
                    <p className="text-gray-500 text-sm">Let's grow your money today.</p>
                </div>
                <button className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 cursor-pointer transition-all flex items-center gap-2 text-sm">
                    <span className="text-lg leading-none mb-0.5">+</span> Add Money
                </button>
            </div>

            {/* 2. THE LEARNING LAYER (Reduced vertical padding, muted button) */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl py-3 px-4 mb-4 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                        <Lightbulb size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-amber-900 leading-tight">Money Tip 💡</p>
                        <p className="text-[11px] text-amber-800 font-medium transition-all duration-300 mt-0.5">
                            {moneyTips[tipIndex]}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={nextTip}
                    className="text-[10px] uppercase tracking-wide font-bold text-amber-700 hover:text-amber-900 flex items-center gap-0.5 bg-amber-100/50 hover:bg-amber-200 px-2 py-1 rounded transition-colors cursor-pointer shrink-0"
                >
                    Next Tip <ChevronRight size={12} />
                </button>
            </div>

            {/* 3. OVERVIEW SECTION (Reduced gap and heights) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                
                {/* MAIN WALLET (p-6 instead of p-8, min-h-[200px]) */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/30 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                    <div className="relative z-10 flex justify-between items-start mb-4">
                        <div>
                            <p className="text-blue-200/80 text-xs font-bold mb-1 uppercase tracking-widest">Main Wallet</p>
                            <h3 className="text-4xl md:text-5xl font-black tracking-tight">₱{mainBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
                            <Wallet size={24} className="text-white" />
                        </div>
                    </div>

                    {/* DYNAMIC LIMITS (p-3, subtle opacity on numbers) */}
                    <div className="relative z-10 mt-auto bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-[10px] font-bold text-blue-200/80 uppercase tracking-wider mb-0.5">
                                    <span className="text-white">{getTierName(kyc_tier)}</span> Limit
                                </p>
                                <p className="text-[11px] font-medium text-blue-100">
                                    Remaining: <span className="font-bold text-white">₱{remainingLimit.toLocaleString('en-PH')}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-bold text-blue-100/90">
                                    ₱{mainBalance.toLocaleString('en-PH')} / ₱{maxLimit.toLocaleString('en-PH')}
                                </p>
                                <p className="text-[9px] text-blue-200/70 font-medium mt-0.5 uppercase tracking-wider">Used {limitPercentage.toFixed(0)}%</p>
                            </div>
                        </div>
                        <div className="w-full bg-blue-900/50 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className={`h-1.5 rounded-full transition-all duration-1000 ${limitPercentage >= 90 ? 'bg-red-400' : 'bg-cyan-400'}`} 
                                style={{ width: `${Math.min(limitPercentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* SAVINGS TEASER (Dominant Goal Tracker) */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[200px]">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-emerald-50 rounded-lg">
                                <Target size={16} className="text-emerald-500" />
                            </div>
                            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">My Savings</h3>
                        </div>
                        
                        {finances?.total_savings === 0 ? (
                            <div className="mb-3">
                                <p className="text-2xl font-black text-gray-900 mb-1">₱0.00</p>
                                <p className="text-[10px] text-gray-500 font-bold bg-gray-50 inline-block px-2 py-1 rounded">No savings yet. Start with ₱50 🌱</p>
                            </div>
                        ) : (
                            <div className="mb-3">
                                <p className="text-2xl font-black text-gray-900 mb-0.5">₱{(finances?.total_savings || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                            </div>
                        )}

                        {/* DOMINANT GOAL TRACKER */}
                        {active_goal ? (
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-2 hover:border-emerald-200 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-center text-sm font-black text-gray-900 mb-1.5">
                                    <span className="truncate pr-2 group-hover:text-emerald-700 transition-colors">{active_goal.title} {active_goal.icon_name === 'Smartphone' ? '📱' : active_goal.icon_name === 'ShoppingBag' ? '🛍️' : '🎯'}</span>
                                    <span className="shrink-0 text-emerald-600 text-xs font-bold">
                                        {((active_goal.current_amount / active_goal.target_amount) * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-1.5 overflow-hidden">
                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min((active_goal.current_amount / active_goal.target_amount) * 100, 100)}%` }}></div>
                                </div>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider text-right">
                                    ₱{Number(active_goal.current_amount).toLocaleString()} / ₱{Number(active_goal.target_amount).toLocaleString()}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-xl p-3 border border-dashed border-slate-200 mb-2 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-500">No active goals</span>
                                <Link href="/goals" className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded">Create a goal 🎯</Link>
                            </div>
                        )}
                    </div>

                    <Link href="/goals" className="mt-1 w-full py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 border border-emerald-100">
                        Grow your savings 🌱 <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            {/* 4. QUICK ACTIONS (Tighter spacing, smaller icons) */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-5">
                <h2 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-widest">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <button className="flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-md">
                            <Send size={26} />
                        </div>
                        <span className="font-bold text-[11px] text-gray-700 uppercase tracking-wide">Pay a Friend</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-md">
                            <Download size={26} />
                        </div>
                        <span className="font-bold text-[11px] text-gray-700 uppercase tracking-wide">Ask Allowance</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-md">
                            <ArrowUpCircle size={26} />
                        </div>
                        <span className="font-bold text-[11px] text-gray-700 uppercase tracking-wide">Withdraw</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-md">
                            <Gift size={26} />
                        </div>
                        <span className="font-bold text-[11px] text-gray-700 uppercase tracking-wide">Rewards</span>
                    </button>
                </div>
            </div>

            {/* 5. RECENT ACTIVITY */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-slate-50/50">
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Activity</h2>
                    <Link href="/transactions" className="text-blue-600 font-bold text-xs hover:underline cursor-pointer">View All</Link>
                </div>
                
                <div className="p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mb-3">
                        <Receipt size={28} strokeWidth={1.5} />
                    </div>
                    <p className="text-gray-900 font-bold text-base">You're just getting started! 🚀</p>
                    <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                        Add your first ₱100 to begin your financial journey. Your transactions and allowances will appear here.
                    </p>
                </div>
            </div>

        </UserLayout>
    );
}