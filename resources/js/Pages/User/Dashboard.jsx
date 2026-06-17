// resources/js/Pages/User/Dashboard.jsx
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '../../Components/Layouts/UserLayout';
import { Wallet, Target, ArrowRight, Lightbulb, ChevronRight, Headphones, Send, HandCoins, Landmark, Gift } from 'lucide-react';
import AddMoneyModal from '../../Components/Wallet/AddMoneyModal';
import RecentTransactionsCard from '../../Components/Transactions/RecentTransactionsCard';
import WelcomeModal from '../../Components/Modals/WelcomeModal';

export default function Dashboard({ auth, finances, active_goal, kyc_tier, recent_transactions = [], is_new_user = false }) {
    const user = auth?.user;
    const [showWelcome, setShowWelcome] = useState(is_new_user);

    // --- MODAL STATES ---
    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);

    // --- COMPUTATIONS ---
    const mainBalance = finances?.main_balance || 0;
    const maxLimit = finances?.max_limit || 5000;
    const totalHoldings = finances?.total_holdings ?? mainBalance;
    const remainingCapacity = finances?.remaining_capacity ?? (maxLimit - totalHoldings);
    const tierUsagePercentage = maxLimit > 0 ? (totalHoldings / maxLimit) * 100 : 0;
    const allocatedToGoals = finances?.allocated_to_goals ?? 0;
    const unallocatedSavings = finances?.unallocated_savings ?? 0;

    const getTierName = (tier) => {
        if (Number(tier) === 3) return 'Achiever';
        if (Number(tier) === 2) return 'Builder';
        return 'Starter';
    };

    // --- DYNAMIC MONEY TIPS ---
    const [tipIndex, setTipIndex] = useState(0);
    const moneyTips = mainBalance === 0 ? [
        "Start small! Even ₱50 is a great first step. 🌱",
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

            {/* 1. WELCOME BANNER */}
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-blue-50 p-5 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-0.5">Hello, {user?.name?.split(' ')[0] || 'User'}! 👋</h2>
                    <p className="text-gray-500 text-sm font-medium">Let's grow your money today.</p>
                </div>
                <button 
                    onClick={() => setIsAddMoneyOpen(true)}
                    className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200/50 cursor-pointer transition-all flex items-center gap-2 text-sm"
                >
                    <span className="text-lg leading-none mb-0.5">+</span> Add Money
                </button>
            </div>

            {/* 2. THE LEARNING LAYER (Interactive Money Tip) */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-100/60 rounded-2xl py-3 px-4 mb-4 flex items-center justify-between gap-3 group transition-colors hover:border-amber-200">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-amber-100/80 text-amber-600 rounded-lg shrink-0">
                        <Lightbulb size={18} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-amber-900/80 uppercase tracking-wider mb-0.5">Money Tip</p>
                        <p className="text-xs text-amber-800 font-medium transition-all duration-300">
                            {moneyTips[tipIndex]}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={nextTip}
                    className="text-[10px] uppercase tracking-wide font-bold text-amber-700 hover:text-amber-900 flex items-center gap-0.5 bg-amber-100/50 hover:bg-amber-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                    Next <ChevronRight size={12} />
                </button>
            </div>

            {/* 3. OVERVIEW SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {/* MAIN WALLET */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-[1.5rem] p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[180px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                    <div className="relative z-10 flex justify-between items-start mb-2">
                        <div>
                            <p className="text-blue-200/70 text-[11px] font-semibold mb-1 uppercase tracking-widest">Main Wallet</p>
                            <h3 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm">₱{mainBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5 shadow-inner">
                            <Wallet size={24} className="text-blue-50" />
                        </div>
                    </div>

                   <div className="relative z-10 mt-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-xl py-2.5 px-3 space-y-2">
                        {/* Top row: balance ratio + tier ceiling */}
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-semibold text-blue-100/90">
                                <span className="text-blue-200/60 uppercase tracking-wider text-[9px]">Wallet:</span> 
                                <span className="font-bold text-white ml-1">₱{mainBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                            </p>
                            <p className="text-[8px] text-blue-200/50 font-medium uppercase tracking-wider">
                                <span className="text-blue-100">{getTierName(kyc_tier)}</span> Tier
                            </p>
                        </div>

                        {/* Tier capacity row */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-[9px] font-semibold text-blue-200/70 uppercase tracking-wider">
                                    Tier Capacity
                                </p>
                                <p className="text-[9px] font-medium text-blue-100/90">
                                    <span className={`font-bold ${remainingCapacity < 500 ? 'text-amber-300' : 'text-white'}`}>
                                        ₱{remainingCapacity.toLocaleString('en-PH')}
                                    </span> remaining
                                </p>
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                                <div 
                                    className={`h-1.5 rounded-full transition-all duration-1000 ${tierUsagePercentage >= 90 ? 'bg-red-400' : tierUsagePercentage >= 70 ? 'bg-amber-400' : 'bg-cyan-400/80'}`} 
                                    style={{ width: `${Math.min(tierUsagePercentage, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-[8px] text-blue-200/50 font-medium mt-1 text-right uppercase tracking-wider">
                                ₱{totalHoldings.toLocaleString('en-PH')} of ₱{maxLimit.toLocaleString('en-PH')} ({tierUsagePercentage.toFixed(0)}% used)
                            </p>
                        </div>
                    </div>
    
                </div>

                {/* SAVINGS TEASER */}
                <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[180px]">
                    <div>
                       <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-emerald-50 rounded-lg">
                                    <Target size={16} className="text-emerald-500" />
                                </div>
                             <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Total Savings</h3>
                            </div>
                        
                        {finances?.total_savings === 0 ? (
                            <div className="mb-2">
                                <p className="text-2xl font-black text-gray-900 tracking-tight">₱0.00</p>
                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">No savings yet. Start with ₱50 🌱</p>
                            </div>
                       ) : (
                                <div className="mb-2">
                                    <p className="text-2xl font-black text-gray-900 tracking-tight">₱{(finances?.total_savings || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">Includes funds in active goals</p>
                                    
                                    {/* Breakdown */}
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                           <p className="text-[9px] text-slate-500 font-medium">
                                                In Goals: <span className="font-bold text-slate-700">₱{allocatedToGoals.toLocaleString('en-PH')}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            <p className="text-[9px] text-slate-500 font-medium">
                                                Available: <span className="font-bold text-slate-700">₱{unallocatedSavings.toLocaleString('en-PH')}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                        {active_goal ? (
                            <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer group mt-1">
                                <div className="flex justify-between items-center text-xs font-bold text-gray-800 mb-1.5">
                                    <span className="truncate pr-2 group-hover:text-emerald-700 transition-colors">{active_goal.title} {active_goal.icon_name === 'Smartphone' ? '📱' : active_goal.icon_name === 'ShoppingBag' ? '🛍️' : '🎯'}</span>
                                    <span className="shrink-0 text-emerald-600 text-[10px] font-bold">
                                        {((active_goal.current_amount / active_goal.target_amount) * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200/80 rounded-full h-1.5 mb-1 overflow-hidden">
                                    <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${Math.min((active_goal.current_amount / active_goal.target_amount) * 100, 100)}%` }}></div>
                                </div>
                                <p className="text-[8px] text-gray-400 font-medium uppercase tracking-wider text-right">
                                    ₱{Number(active_goal.current_amount).toLocaleString()} / ₱{Number(active_goal.target_amount).toLocaleString()}
                                </p>
                            </div>
                   ) : (
                            <div className="mt-3 flex flex-col items-center gap-2 bg-gradient-to-br from-emerald-50/40 to-blue-50/30 rounded-xl p-4 border border-dashed border-slate-200">
                                <span className="text-[11px] font-medium text-slate-600 text-center">
                                    What are you saving for?
                                </span>
                                <Link 
                                    href="/goals" 
                                    className="w-full text-center py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-lg transition-all shadow-md shadow-emerald-200/40 cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <span className="text-sm">+</span> Set Your First Goal
                                </Link>
                            </div>
                        )}
                    </div>

                    {(active_goal || (finances?.total_savings > 0)) && (
                            <Link href="/goals" className="mt-2 w-full py-2 bg-emerald-50/50 text-emerald-600 text-[11px] font-semibold rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5 border border-emerald-100/50">
                                Grow your savings <ArrowRight size={12} />
                            </Link>
                        )}
                </div>
            </div>

          {/* 4. QUICK ACTIONS — Roadmap features (all coming soon) */}
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-5 mb-5">
                {/* Header with "Coming Soon" text-only badge */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">Quick Actions</h2>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 uppercase tracking-widest">
                        Coming Soon
                    </span>
                </div>
                
                {/* 4 action grid — grayed out placeholder style */}
                <div className="grid grid-cols-4 gap-3">
                    {/* Send Money */}
                    <div className="flex flex-col items-center gap-2 cursor-not-allowed select-none">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                            <Send size={22} className="text-slate-400" strokeWidth={2} />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">Send Money</span>
                    </div>

                    {/* Request Money */}
                    <div className="flex flex-col items-center gap-2 cursor-not-allowed select-none">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                            <HandCoins size={22} className="text-slate-400" strokeWidth={2} />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">Request</span>
                    </div>

                    {/* Bank Transfer */}
                    <div className="flex flex-col items-center gap-2 cursor-not-allowed select-none">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                            <Landmark size={22} className="text-slate-400" strokeWidth={2} />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">Transfer</span>
                    </div>

                    {/* Earn Rewards */}
                    <div className="flex flex-col items-center gap-2 cursor-not-allowed select-none">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                            <Gift size={22} className="text-slate-400" strokeWidth={2} />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">Rewards</span>
                    </div>
                </div>
            </div>

           {/* 5. RECENT TRANSACTIONS */}
                <RecentTransactionsCard 
                    transactions={recent_transactions}
                />

            {/* MODAL */}
            <AddMoneyModal 
                isOpen={isAddMoneyOpen} 
                onClose={() => setIsAddMoneyOpen(false)} 
            />

            <WelcomeModal 
            isOpen={showWelcome} 
            onClose={() => setShowWelcome(false)} 
            />

            </UserLayout>
    );
}