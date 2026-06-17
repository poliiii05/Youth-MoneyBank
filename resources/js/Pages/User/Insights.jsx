// resources/js/Pages/User/Insights.jsx
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import UserLayout from '../../Components/Layouts/UserLayout';
import { 
    Flame, Trophy, Target, ChevronLeft, ChevronRight, Sparkles,
    PiggyBank, Coins, DollarSign, CheckCircle2, Shield, Crown,
    Lightbulb, Rocket, TrendingUp, Award, Calendar, Wallet,
} from 'lucide-react';

const ACHIEVEMENT_ICONS = {
    piggy: PiggyBank,
    coins: Coins,
    cash: DollarSign,
    trophy: Trophy,
    flame: Flame,
    target: Target,
    check: CheckCircle2,
    shield: Shield,
    crown: Crown,
};

const TIP_ICONS = {
    trending_up: TrendingUp,
    sparkles: Sparkles,
    rocket: Rocket,
};

const PERSONALITY_EMOJI = {
    new: '🌱',
    slow_steady: '🐢',
    goal_chaser: '🚀',
    streak_master: '🔥',
};

export default function Insights({ 
    auth, 
    streak: initialStreak, 
    smart_insights, 
    personality, 
    achievements = [], 
    dynamic_tip 
}) {
    const user = auth?.user;

    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
    const [monthData, setMonthData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadMonth = async (year, month) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/insights/monthly?year=${year}&month=${month}`, {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (response.ok) {
                const data = await response.json();
                setMonthData(data);
            }
        } catch (err) {
            console.error('Failed to load month:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMonth(currentYear, currentMonth);
    }, [currentYear, currentMonth]);

    const goToPrevMonth = () => {
        if (currentMonth === 1) {
            setCurrentYear(currentYear - 1);
            setCurrentMonth(12);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentYear(currentYear + 1);
            setCurrentMonth(1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const displayData = monthData || {
        current_streak: initialStreak?.current_streak || 0,
        best_streak: initialStreak?.best_streak || 0,
        next_milestone: initialStreak?.next_milestone || 7,
        progress_to_next: initialStreak?.progress_to_next || 0,
        saved_today: initialStreak?.saved_today || false,
        cells: [],
        active_days_in_month: 0,
        month_label: '',
    };

    const TipIcon = TIP_ICONS[dynamic_tip?.icon] || Lightbulb;
    const pEmoji = PERSONALITY_EMOJI[personality?.type] || '🌱';
    
    const personalityColors = {
        new: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', accent: 'text-slate-600' },
        slow_steady: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', accent: 'text-emerald-700' },
        goal_chaser: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', accent: 'text-blue-700' },
        streak_master: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-900', accent: 'text-amber-700' },
    };
    const pColor = personalityColors[personality?.type] || personalityColors.new;

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <UserLayout user={user} header="Savings Insights">
            <Head title="Insights | Youth MoneyBank" />

            <div className="max-w-4xl mx-auto">
                
                {/* BENTO GRID — 12-col, multi-row */}
                <div className="grid grid-cols-12 gap-2.5 auto-rows-min">
                    
                    {/* ROW 1: Streak (3) + Personality (6) + Best (3) */}
                    
                    {/* Current Streak — 3 cols */}
                    <div className="col-span-12 sm:col-span-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Flame size={11} className="text-amber-700" strokeWidth={2.5} />
                            <span className="text-[9px] font-bold text-amber-800 uppercase tracking-widest">Current</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <p className="text-2xl font-black text-amber-900 leading-none">{displayData.current_streak}</p>
                            <p className="text-[10px] text-amber-700 font-bold">days</p>
                        </div>
                        {displayData.saved_today ? (
                            <p className="text-[9px] text-emerald-700 font-bold mt-1">✨ Saved today!</p>
                        ) : (
                            <p className="text-[9px] text-amber-700 font-bold mt-1">Save today!</p>
                        )}
                    </div>

                    {/* Personality — 6 cols */}
                    <div className={`col-span-12 sm:col-span-6 ${pColor.bg} border ${pColor.border} rounded-2xl p-3`}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{pEmoji}</span>
                            <div className="flex-1 min-w-0">
                                <p className={`text-[9px] font-bold ${pColor.accent} uppercase tracking-widest`}>Your Style</p>
                                <p className={`text-sm font-black ${pColor.text} truncate`}>{personality?.label || 'New Saver'}</p>
                            </div>
                        </div>
                        <p className={`text-[10px] font-medium ${pColor.accent} leading-relaxed line-clamp-2`}>
                            {personality?.description || 'Start your savings journey today!'}
                        </p>
                    </div>

                    {/* Best Streak — 3 cols */}
                    <div className="col-span-12 sm:col-span-3 bg-white border border-slate-200 rounded-2xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Trophy size={11} className="text-amber-700" strokeWidth={2.5} />
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Best Ever</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <p className="text-2xl font-black text-slate-900 leading-none">{displayData.best_streak}</p>
                            <p className="text-[10px] text-slate-500 font-bold">days</p>
                        </div>
                        <p className="text-[9px] text-slate-500 font-medium mt-1">All-time</p>
                    </div>

                    {/* ROW 2: Calendar (7) + Smart Cards 2x2 (5) */}

                    {/* Calendar — 7 cols */}
                    <div className="col-span-12 sm:col-span-7 bg-white border border-slate-200 rounded-2xl p-3">
                        <div className="flex items-center justify-between mb-2">
                            <button 
                                onClick={goToPrevMonth} 
                                className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                                aria-label="Previous month"
                            >
                                <ChevronLeft size={12} strokeWidth={2.5} />
                            </button>
                            <div className="text-center">
                                <p className="text-xs font-black text-slate-900">{displayData.month_label || `${currentMonth}/${currentYear}`}</p>
                                <p className="text-[9px] font-bold text-emerald-700">
                                    {displayData.active_days_in_month} active
                                </p>
                            </div>
                            <button 
                                onClick={goToNextMonth} 
                                className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                                aria-label="Next month"
                            >
                                <ChevronRight size={12} strokeWidth={2.5} />
                            </button>
                        </div>
                        
                        {isLoading ? (
                            <div className="h-32 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <MonthlyCalendar cells={displayData.cells} />
                        )}
                    </div>

                    {/* Smart Cards 2x2 — 5 cols */}
                    <div className="col-span-12 sm:col-span-5 grid grid-cols-2 gap-2">
                        <SmartCard
                            icon={Wallet}
                            iconColor="text-emerald-700"
                            label="This Month"
                            value={`₱${formatCompact(smart_insights?.this_month_total || 0)}`}
                            sub={`${smart_insights?.this_month_count || 0} deposits`}
                        />
                        <SmartCard
                            icon={Calendar}
                            iconColor="text-blue-700"
                            label="Weekly Avg"
                            value={`₱${formatCompact(smart_insights?.weekly_avg || 0)}`}
                            sub="Per week"
                        />
                        <SmartCard
                            icon={Target}
                            iconColor="text-amber-700"
                            label="Goals"
                            value={smart_insights?.total_goals > 0 
                                ? `${smart_insights?.goals_completed || 0}/${smart_insights?.total_goals}`
                                : '—'
                            }
                            sub={smart_insights?.total_goals > 0
                                ? `${smart_insights?.total_goals - (smart_insights?.goals_completed || 0)} active`
                                : 'No goals yet'
                            }
                        />
                       <SmartCard
                            icon={Award}
                            iconColor="text-purple-700"
                            label="Best Month"
                            value={smart_insights?.best_month 
                                ? `₱${formatCompact(smart_insights.best_month.amount)}`
                                : '—'
                            }
                            sub={smart_insights?.best_month 
                                ? smart_insights.best_month.label // "June 2026" instead of just "June"
                                : 'No data'
                            }
                        />
                    </div>

                    {/* ROW 3: Achievements (12 — full width) */}
                    <div className="col-span-12 bg-white border border-slate-200 rounded-2xl p-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                <Trophy size={11} className="text-amber-600" strokeWidth={2.5} />
                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Achievements</span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-500">
                                {unlockedCount}/{achievements.length} unlocked
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 mb-2">
                            {achievements.map((ach) => (
                                <AchievementBadge key={ach.key} achievement={ach} />
                            ))}
                        </div>

                        {/* Streak progress bar inline */}
                        <div className="bg-slate-50 rounded-lg px-2 py-1.5">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-bold text-slate-600">Next: {displayData.next_milestone}-day streak</span>
                                <span className="text-[9px] font-black text-amber-700">{displayData.progress_to_next}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                                <div 
                                    className="h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700"
                                    style={{ width: `${displayData.progress_to_next}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* ROW 4: Dynamic Tip — Full width */}
                    <div className="col-span-12 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                            <TipIcon size={13} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-emerald-900 leading-tight">{dynamic_tip?.tip || 'Start saving today!'}</p>
                            <p className="text-[10px] text-emerald-800 font-medium mt-0.5 leading-tight">
                                {dynamic_tip?.message || 'Every peso counts.'}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </UserLayout>
    );
}

function formatCompact(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString('en-PH', { maximumFractionDigits: 0 });
}

function SmartCard({ icon: Icon, iconColor, label, value, sub }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-2.5">
            <div className="flex items-center gap-1 mb-0.5">
                <Icon size={10} className={iconColor} strokeWidth={2.5} />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{label}</span>
            </div>
            <p className="text-sm font-black text-slate-900 leading-tight">{value}</p>
            <p className="text-[9px] text-slate-500 font-medium mt-0.5 truncate">{sub}</p>
        </div>
    );
}

function MonthlyCalendar({ cells = [] }) {
    const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="max-w-[300px] mx-auto">
            <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                {weekdayLabels.map((day, idx) => (
                    <div key={idx} className="text-center">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">{day}</span>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
                {cells.map((cell, idx) => {
                    const isActive = cell.is_active;
                    const isToday = cell.is_today;
                    const isOutOfMonth = !cell.is_current_month;
                    const isFuture = cell.is_future;

                    let bgClass = 'bg-slate-100';
                    let textClass = 'text-slate-500';

                    if (isOutOfMonth) {
                        bgClass = 'bg-transparent';
                        textClass = 'text-slate-300';
                    } else if (isFuture) {
                        bgClass = 'bg-slate-50';
                        textClass = 'text-slate-400';
                    } else if (isActive) {
                        bgClass = 'bg-gradient-to-br from-amber-300 to-orange-400';
                        textClass = 'text-amber-900';
                    }

                  return (
                    <div
                        key={idx}
                        className={`aspect-square rounded-sm relative flex items-center justify-center transition-all ${bgClass} ${
                            isToday ? 'ring-1 ring-amber-700 ring-offset-1' : ''
                        } ${isOutOfMonth ? 'opacity-40' : 'cursor-help'}`}
                        title={isOutOfMonth ? '' : `${cell.month_label} ${cell.day}${isActive ? ' · Saved' : ''}${isToday ? ' · Today' : ''}`}
                    >
                        {isActive && !isOutOfMonth && (
                            <Flame 
                                size={8} 
                                className="absolute top-0 right-0 text-amber-800" 
                                strokeWidth={2.5} 
                                fill="currentColor"
                            />
                        )}
                        <span className={`text-[8px] font-bold ${textClass}`}>
                            {cell.day}
                        </span>
                    </div>
                );
                })}
            </div>
        </div>
    );
}

function AchievementBadge({ achievement }) {
    const Icon = ACHIEVEMENT_ICONS[achievement.icon] || Trophy;
    const unlocked = achievement.unlocked;
    
    return (
        <div className="relative group">
            <div 
                className={`aspect-square rounded-lg border flex items-center justify-center transition-all cursor-help ${
                    unlocked 
                        ? 'bg-amber-50 border-amber-300 hover:bg-amber-100 hover:scale-110' 
                        : 'bg-slate-50 border-slate-200 opacity-50 hover:opacity-80 hover:scale-110'
                }`}
            >
                <Icon 
                    size={14} 
                    className={unlocked ? 'text-amber-700' : 'text-slate-400'} 
                    strokeWidth={2.5} 
                />
            </div>
            
            {/* Custom tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-lg">
                {achievement.label}
                <div className={`text-[9px] font-medium mt-0.5 ${
                    unlocked ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                    {unlocked ? '✓ Unlocked' : '🔒 Locked'}
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
            </div>
        </div>
    );
}