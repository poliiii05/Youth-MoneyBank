// resources/js/Pages/User/Dashboard.jsx
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import UserLayout from '../../Components/Layouts/UserLayout';
import { Wallet, Target, ArrowRight, Lightbulb, ChevronRight, TrendingUp } from 'lucide-react';
import AddMoneyModal from '../../Components/Wallet/AddMoneyModal';
import RecentTransactionsCard from '../../Components/Transactions/RecentTransactionsCard';
import SavingsTrendChart from '../../Components/Wallet/SavingsTrendChart';
import StreakCard from '../../Components/Wallet/StreakCard';
import Spotlight from '../../Components/Common/Spotlight';

/**
 * Coach marks. Targets are matched by data-tour attribute; a step whose
 * element is not on the page is skipped, so the tour adapts to whatever the
 * account actually has rather than pointing at gaps.
 */
const TOUR_STEPS = [
    {
        // No target: renders as a centred intro rather than a coach mark. This
        // replaced a five-slide welcome modal that repeated what the marks
        // below already say — seventeen screens before the first click.
        title: 'Youth MoneyBank',
        body: 'A savings app for Filipino teens. Set a target, move money towards it, and build the habit. Here is where everything lives.',
    },
    // Where things live, then what is on this page. Each line is deliberately
    // one sentence: a twelve-step tour is only tolerable if every step can be
    // read at a glance.
    {
        target: 'nav-dashboard',
        title: 'Dashboard',
        body: 'Your balance, recent activity and progress at a glance.',
    },
    {
        target: 'nav-transactions',
        title: 'Transactions',
        body: 'Every movement in and out, searchable and exportable.',
    },
    {
        target: 'nav-savings',
        title: 'Savings',
        body: 'Set goals and move money into them from your savings pool.',
    },
    {
        target: 'nav-insights',
        title: 'Insights',
        body: 'Your streak calendar, badges and saving patterns.',
    },
    {
        target: 'nav-settings',
        title: 'Settings',
        body: 'Your profile, and where you apply to raise your tier.',
    },
    {
        target: 'tier-progress',
        title: 'Your tier',
        body: 'Three tiers, each with a higher balance limit. Verify to move up.',
    },
    {
        target: 'wallet',
        title: 'Your wallet',
        body: 'Spendable money. Savings you set aside are tracked separately.',
    },
    {
        target: 'add-money',
        title: 'Add money',
        body: 'Funds come in through PayPal Sandbox — nothing real is charged.',
    },
    {
        target: 'money-tip',
        title: 'Money tips',
        body: 'Short pointers that rotate as you use the app.',
    },
    {
        target: 'savings-trend',
        title: 'Savings trend',
        body: 'How much you set aside each month, once you get going.',
    },
    {
        target: 'streak',
        title: 'Savings streak',
        body: 'Save on consecutive days to build it. Milestones at 7, 14 and 30.',
    },
    {
        target: 'recent-activity',
        title: 'Recent activity',
        body: 'Your latest transactions. Tap any of them for the full record.',
    },
];

export default function Dashboard({ auth, finances, active_goal, kyc_tier, recent_transactions = [], streak_preview = null, savings_trend = [], is_new_user = false }) {
    const user = auth?.user;
    // One pass for new users: a branded intro card, then coach marks on the
    // things that actually exist. The separate welcome modal it replaced was
    // covering the same ground a second time.
    const [showTour, setShowTour] = useState(is_new_user);

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
    // Marks onboarding done server-side. Closing without this would bring the
    // tour back on the next visit with no explanation.
    const completeTour = async () => {
        setShowTour(false);
        try {
            await fetch('/api/onboarding/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
        } catch (err) {
            console.error('Could not save onboarding state:', err);
        }
    };

    const savedThisMonth = savings_trend?.[savings_trend.length - 1]?.saved ?? 0;

    const getTierName = (tier) => {
        if (Number(tier) === 3) return 'Achiever';
        if (Number(tier) === 2) return 'Builder';
        return 'Starter';
    };

    // --- DYNAMIC MONEY TIPS ---
    const moneyTips = useMemo(() => (mainBalance === 0 ? [
        "Start small. Even ₱50 is a real first step. 🌱",
        "Saving ₱50 a week adds up to ₱2,600 by the end of the year.",
        "Pay yourself first — move part of your allowance to savings the day it arrives.",
        "A goal with a name gets saved for. A goal without one gets spent.",
        "The habit matters more than the amount. Start where you can.",
    ] : [
        "Saving ₱50 a week adds up to ₱2,600 by the end of the year.",
        "Tracking where your money goes is how you find the leaks.",
        "Keep spending money and saved money in separate places.",
        "Round up. Spent ₱85? Move the ₱15 to savings.",
        "Waiting a day before buying kills most impulse purchases.",
        "Your streak is worth protecting — even ₱20 keeps it alive.",
    ]), [mainBalance === 0]);

    const [tipIndex, setTipIndex] = useState(0);
    const [tipVisible, setTipVisible] = useState(true);

    const goToTip = useCallback((next) => {
        // Fade the old line out before swapping the text, so the change reads
        // as one movement rather than a flicker.
        setTipVisible(false);
        setTimeout(() => {
            setTipIndex(next);
            setTipVisible(true);
        }, 250);
    }, []);

    const nextTip = () => goToTip((tipIndex + 1) % moneyTips.length);

    // Auto-advance. Resets whenever the index changes, so pressing Next gives
    // a full interval rather than a rushed one.
    useEffect(() => {
        const timer = setTimeout(() => {
            goToTip((tipIndex + 1) % moneyTips.length);
        }, 6000);
        return () => clearTimeout(timer);
    }, [tipIndex, moneyTips.length, goToTip]);

    return (
        <UserLayout user={user} header="Dashboard Overview">
            <Head title="Dashboard | Youth MoneyBank" />

            {/* 1. WELCOME BANNER */}
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-border p-5 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-0.5">Hello, {user?.name?.split(' ')[0] || 'User'}! 👋</h2>
                    <p className="text-primary text-sm font-medium">Let's grow your money today.</p>
                </div>
                <button 
                    data-tour="add-money"
                    onClick={() => setIsAddMoneyOpen(true)}
                    className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 shadow-md shadow-primary/20 cursor-pointer transition-all flex items-center gap-2 text-sm"
                >
                    <span className="text-lg leading-none mb-0.5">+</span> Add Money
                </button>
            </div>

            {/* 2. THE LEARNING LAYER (Interactive Money Tip — amber accent preserved) */}
            <div data-tour="money-tip" className="bg-gradient-to-r from-amber-50 to-amber-100/30 border border-amber-100 rounded-2xl py-3 px-4 mb-4 flex items-center justify-between gap-3 group transition-colors hover:border-amber-200">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                        <Lightbulb size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-amber-900/80 uppercase tracking-wider mb-0.5">Money Tip</p>
                        {/* Fixed height stops the row from jolting as tips of
                            different lengths swap in. */}
                        <div className="h-8 flex items-center">
                            <p
                                className={`text-xs text-amber-800 font-medium transition-all duration-250 ${
                                    tipVisible
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-1'
                                }`}
                            >
                                {moneyTips[tipIndex]}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {/* Position markers — also show that rotation is automatic */}
                    <div className="hidden sm:flex items-center gap-1">
                        {moneyTips.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => i !== tipIndex && goToTip(i)}
                                aria-label={`Tip ${i + 1}`}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                    i === tipIndex
                                        ? 'w-4 bg-amber-500'
                                        : 'w-1.5 bg-amber-300 hover:bg-amber-400'
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextTip}
                        className="text-[10px] uppercase tracking-wide font-bold text-amber-700 hover:text-amber-900 flex items-center gap-0.5 bg-amber-100/50 hover:bg-amber-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                        Next <ChevronRight size={12} />
                    </button>
                </div>
            </div>

            {/* 3. OVERVIEW SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {/* MAIN WALLET — TEAL GRADIENT */}
                <div className="lg:col-span-2 bg-gradient-to-br from-primary via-primary to-emerald-800 rounded-[1.5rem] p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[180px]">
                    {/* Decorative blurs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                    <div className="relative z-10 flex justify-between items-start mb-2" data-tour="wallet">
                        <div>
                            <p className="text-white/70 text-[11px] font-semibold mb-1 uppercase tracking-widest">Main Wallet</p>
                            <h3 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm">₱{mainBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</h3>

                            {/* Net movement this month, read off the same series the
                                trend chart plots — so the headline figure and the
                                chart can never disagree. */}
                            {savedThisMonth !== 0 && (
                                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-white/90">
                                    <TrendingUp size={13} className={savedThisMonth < 0 ? 'rotate-180' : ''} />
                                    <span className="font-medium tabular-nums">
                                        {savedThisMonth > 0 ? '+' : '−'}₱{Math.abs(savedThisMonth).toLocaleString('en-PH')} this month
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
                            <Wallet size={24} className="text-white" />
                        </div>
                    </div>

                    <div className="relative z-10 mt-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-xl py-2.5 px-3 space-y-2">
                        {/* Top row: balance ratio + tier ceiling */}
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-semibold text-white/90">
                                <span className="text-white/60 uppercase tracking-wider text-[9px]">Wallet:</span> 
                                <span className="font-bold text-white ml-1">₱{mainBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                            </p>
                            <p className="text-[8px] text-white/60 font-medium uppercase tracking-wider">
                                <span className="text-white/80">{getTierName(kyc_tier)}</span> Tier
                            </p>
                        </div>

                        {/* Tier capacity row */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-[9px] font-semibold text-white/70 uppercase tracking-wider">
                                    Tier Capacity
                                </p>
                                <p className="text-[9px] font-medium text-white/90">
                                    <span className={`font-bold ${remainingCapacity < 500 ? 'text-amber-300' : 'text-white'}`}>
                                        ₱{remainingCapacity.toLocaleString('en-PH')}
                                    </span> remaining
                                </p>
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                                <div 
                                    className={`h-1.5 rounded-full transition-all duration-1000 ${
                                        tierUsagePercentage >= 90 ? 'bg-red-400' 
                                        : tierUsagePercentage >= 70 ? 'bg-amber-400' 
                                        : 'bg-emerald-300'
                                    }`} 
                                    style={{ width: `${Math.min(tierUsagePercentage, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-[8px] text-white/60 font-medium mt-1 text-right uppercase tracking-wider">
                                ₱{totalHoldings.toLocaleString('en-PH')} of ₱{maxLimit.toLocaleString('en-PH')} ({tierUsagePercentage.toFixed(0)}% used)
                            </p>
                        </div>
                    </div>
                </div>

                {/* SAVINGS TEASER — TEAL ACCENTS */}
                <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-border flex flex-col justify-between min-h-[180px]">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-secondary rounded-lg">
                                <Target size={16} className="text-primary" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-[11px] font-semibold text-primary uppercase tracking-widest">Total Savings</h3>
                        </div>
                        
                        {finances?.total_savings === 0 ? (
                            <div className="mb-2">
                                <p className="text-2xl font-black text-foreground tracking-tight">₱0.00</p>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">No savings yet. Start with ₱50 🌱</p>
                            </div>
                        ) : (
                            <div className="mb-2">
                                <p className="text-2xl font-black text-foreground tracking-tight">₱{(finances?.total_savings || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                                <p className="text-[9px] text-slate-400 font-medium mt-0.5">Includes funds in active goals</p>
                                
                                {/* Breakdown */}
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                        <p className="text-[9px] text-slate-500 font-medium">
                                            In Goals: <span className="font-bold text-foreground">₱{allocatedToGoals.toLocaleString('en-PH')}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div>
                                        <p className="text-[9px] text-slate-500 font-medium">
                                            Available: <span className="font-bold text-foreground">₱{unallocatedSavings.toLocaleString('en-PH')}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {active_goal ? (
                            <div className="bg-secondary rounded-xl p-2.5 border border-border hover:border-primary/40 transition-colors cursor-pointer group mt-1">
                                <div className="flex justify-between items-center text-xs font-bold text-foreground mb-1.5">
                                    <span className="truncate pr-2 group-hover:text-primary transition-colors">
                                        {active_goal.title} {active_goal.icon_name === 'Smartphone' ? '📱' : active_goal.icon_name === 'ShoppingBag' ? '🛍️' : '🎯'}
                                    </span>
                                    <span className="shrink-0 text-primary text-[10px] font-bold">
                                        {((active_goal.current_amount / active_goal.target_amount) * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5 mb-1 overflow-hidden">
                                    <div 
                                        className="bg-primary h-1.5 rounded-full transition-all duration-700" 
                                        style={{ width: `${Math.min((active_goal.current_amount / active_goal.target_amount) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-[8px] text-muted-foreground font-medium uppercase tracking-wider text-right">
                                    ₱{Number(active_goal.current_amount).toLocaleString()} / ₱{Number(active_goal.target_amount).toLocaleString()}
                                </p>
                            </div>
                        ) : (
                            <div className="mt-3 flex flex-col items-center gap-2 bg-gradient-to-br from-secondary to-secondary/40 rounded-xl p-4 border border-dashed border-border">
                                <span className="text-[11px] font-medium text-primary text-center">
                                    What are you saving for?
                                </span>
                                <Link 
                                    href="/goals" 
                                    className="w-full text-center py-2 bg-primary hover:bg-primary text-white text-[11px] font-bold rounded-lg transition-all shadow-md shadow-primary/20 cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <span className="text-sm">+</span> Set Your First Goal
                                </Link>
                            </div>
                        )}
                    </div>

                    {(active_goal || (finances?.total_savings > 0)) && (
                        <Link 
                            href="/goals" 
                            className="mt-2 w-full py-2 bg-secondary text-primary text-[11px] font-semibold rounded-xl hover:bg-muted transition-colors flex items-center justify-center gap-1.5 border border-border"
                        >
                            Grow your savings <ArrowRight size={12} />
                        </Link>
                    )}
                </div>
            </div>

            {/* 4. SAVINGS TREND + STREAK */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                <div className="lg:col-span-2" data-tour="savings-trend">
                    <SavingsTrendChart data={savings_trend} />
                </div>
                <div data-tour="streak"><StreakCard streak={streak_preview} /></div>
            </div>

            {/* 5. RECENT TRANSACTIONS */}
            <div data-tour="recent-activity">
                <RecentTransactionsCard 
                    transactions={recent_transactions}
                />
            </div>

            {/* MODALS */}
            <AddMoneyModal 
                isOpen={isAddMoneyOpen} 
                onClose={() => setIsAddMoneyOpen(false)} 
            />

            <Spotlight
                isOpen={showTour}
                onComplete={completeTour}
                steps={TOUR_STEPS}
            />

        </UserLayout>
    );
}