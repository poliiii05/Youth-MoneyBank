// resources/js/Pages/User/Insights.jsx
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import UserLayout from '../../Components/Layouts/UserLayout';
import { Card } from '@/Components/ui/card';
import { cn } from '@/lib/utils';
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
    dynamic_tip,
    savings_trend = [],
}) {
    const user = auth?.user;

    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
    const [monthData, setMonthData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Aborts the previous month request when the user pages on. Without it,
    // clicking through months quickly can let an earlier response arrive last
    // and paint the wrong month's grid.
    useEffect(() => {
        const controller = new AbortController();
        setIsLoading(true);

        fetch(`/api/insights/monthly?year=${currentYear}&month=${currentMonth}`, {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            signal: controller.signal,
        })
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Request failed'))))
            .then((data) => {
                setMonthData(data);
                setIsLoading(false);
            })
            .catch((err) => {
                if (err.name === 'AbortError') return;
                console.error('Failed to load month:', err);
                setIsLoading(false);
            });

        return () => controller.abort();
    }, [currentYear, currentMonth]);

    const goToPrevMonth = () => {
        if (currentMonth === 1) {
            setCurrentYear(currentYear - 1);
            setCurrentMonth(12);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    // Nothing has happened in a month that hasn't started yet, so paging
    // forward past today only ever shows an empty grid.
    const isCurrentMonth =
        currentYear === today.getFullYear() && currentMonth === today.getMonth() + 1;

    const goToNextMonth = () => {
        if (isCurrentMonth) return;
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
    
    // PERSONALITY COLORS — all on-palette (emerald + amber + slate only)
    const personalityColors = {
        new: { bg: 'bg-muted', border: 'border-border', text: 'text-foreground', accent: 'text-muted-foreground' },
        slow_steady: { bg: 'bg-secondary', border: 'border-primary/25', text: 'text-foreground', accent: 'text-primary' },
        goal_chaser: { bg: 'bg-secondary', border: 'border-primary/40', text: 'text-foreground', accent: 'text-primary' },
        streak_master: { bg: 'bg-accent/10', border: 'border-accent/40', text: 'text-foreground', accent: 'text-accent-foreground' },
    };
    const pColor = personalityColors[personality?.type] || personalityColors.new;

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const nextLocked = achievements.find(a => !a.unlocked);

    // Straight-line projection from the recent weekly average. Deliberately
    // simple: it is an encouragement, not a forecast, and dressing it up as
    // one would overstate what a four-week average can tell you.
    const weeklyPace = Math.round(smart_insights?.weekly_avg || 0);
    const projectedYear = weeklyPace * 52;

    return (
        <UserLayout user={user} header="Savings Insights">
            <Head title="Insights | Youth MoneyBank" />

            <div className="max-w-4xl mx-auto">
                
                {/* BENTO GRID — 12-col, multi-row */}
                <div className="grid grid-cols-12 gap-2.5 auto-rows-min">

                    {/* PERSONALITY — the headline read on the page, so it gets
                        filled colour and room rather than a tinted footnote. */}
                    <div className={cn(
                        'col-span-12 lg:col-span-7 relative overflow-hidden rounded-2xl p-4 text-white',
                        'bg-gradient-to-br',
                        personality?.type === 'streak_master'
                            ? 'from-accent via-accent to-amber-600'
                            : 'from-primary via-primary to-emerald-800'
                    )}>
                        <span className="absolute -right-4 -bottom-6 text-[110px] leading-none opacity-20 select-none pointer-events-none">
                            {pEmoji}
                        </span>

                        <div className="relative">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">
                                Savings personality
                            </p>
                            <p className="text-2xl font-black tracking-tight leading-none mb-1.5">
                                {personality?.label || 'New Saver'}
                            </p>
                            <p className="text-xs text-white/85 leading-relaxed max-w-sm">
                                {personality?.description || 'Start your savings journey today.'}
                            </p>
                        </div>
                    </div>

                    {/* Smart Cards 2x2 — 5 cols (ALL EMERALD except Best Month = AMBER for special metric) */}
                    <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-2">
                        <SmartCard
                            icon={Wallet}
                            iconColor="text-primary"
                            label="This Month"
                            value={`₱${formatCompact(smart_insights?.this_month_total || 0)}`}
                            sub={`${smart_insights?.this_month_count || 0} deposits`}
                        />
                        <SmartCard
                            icon={Calendar}
                            iconColor="text-primary"
                            label="Weekly Avg"
                            value={`₱${formatCompact(smart_insights?.weekly_avg || 0)}`}
                            sub="Per week"
                        />
                        <SmartCard
                            icon={Target}
                            iconColor="text-primary"
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
                            iconColor="text-accent-foreground"
                            label="Best Month"
                            value={smart_insights?.best_month 
                                ? `₱${formatCompact(smart_insights.best_month.amount)}`
                                : '—'
                            }
                            sub={smart_insights?.best_month 
                                ? smart_insights.best_month.label
                                : 'No data'
                            }
                        />
                    </div>

                    {/* ACTIVITY CALENDAR — the reference put a trend panel in this
                        slot; the calendar is the truer version of it here, since
                        this product rewards showing up daily rather than amount. */}
                    <Card className="col-span-12 lg:col-span-7 p-4">
                        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                            <div>
                                <h2 className="text-sm font-bold text-foreground">Savings Activity</h2>
                                <p className="text-[11px] text-muted-foreground">
                                    <span className="font-semibold text-primary tabular-nums">
                                        {displayData.active_days_in_month}
                                    </span>{' '}
                                    active {displayData.active_days_in_month === 1 ? 'day' : 'days'} this month
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Streak figures live beside the grid that produced
                                    them, rather than as separate cards elsewhere. */}
                                <div className="hidden sm:flex items-center gap-3 text-[10px] font-semibold text-muted-foreground mr-1">
                                    <span className="flex items-center gap-1.5">
                                        <Flame size={11} className="text-accent" fill="currentColor" strokeWidth={2.5} />
                                        {displayData.current_streak}-day streak
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Trophy size={11} className="text-accent" strokeWidth={2.5} />
                                        Best {displayData.best_streak}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                                    <button 
                                        onClick={goToPrevMonth} 
                                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground cursor-pointer transition-colors active:scale-95"
                                        aria-label="Previous month"
                                    >
                                        <ChevronLeft size={14} strokeWidth={2.5} />
                                    </button>
                                    <span className="text-[11px] font-bold text-foreground px-1.5 min-w-[92px] text-center">
                                        {displayData.month_label || `${currentMonth}/${currentYear}`}
                                    </span>
                                    <button 
                                        onClick={goToNextMonth} 
                                        disabled={isCurrentMonth}
                                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground cursor-pointer transition-colors active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                                        aria-label="Next month"
                                    >
                                        <ChevronRight size={14} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {isLoading ? (
                            <div className="h-32 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <MonthlyCalendar cells={displayData.cells} />
                        )}
                    </Card>

                    {/* ROW 3: Achievements (12 — full width) */}
                    <Card className="col-span-12 lg:col-span-5 p-4 flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h2 className="text-sm font-bold text-foreground">Unlocks &amp; Badges</h2>
                                <p className="text-[11px] text-muted-foreground">Milestones you've reached</p>
                            </div>
                            <span className="text-[9px] font-bold text-primary tabular-nums">
                                {unlockedCount} / {achievements.length} badges
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-6 gap-2 mb-3">
                            {achievements.map((ach) => (
                                <AchievementBadge key={ach.key} achievement={ach} />
                            ))}
                        </div>

                        {/* Naming what comes next turns a row of locked icons
                            into something to aim at. */}
                        {nextLocked && (
                            <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                                Next up: <span className="font-bold text-foreground">{nextLocked.label}</span>
                                {nextLocked.description ? ` — ${nextLocked.description}` : ''}
                            </p>
                        )}

                        {/* Streak milestone. mt-auto pins it to the bottom so the
                            card fills the row rather than trailing off into space,
                            and the track is tinted — it was muted-on-muted, which
                            made an empty bar look like no bar at all. */}
                        <div className="mt-auto rounded-xl border border-accent/25 bg-accent/5 px-3 py-2.5">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-semibold text-muted-foreground">
                                    Next: {displayData.next_milestone}-day streak
                                </span>
                                <span className="text-[10px] font-black text-accent-foreground tabular-nums">
                                    {displayData.progress_to_next}%
                                </span>
                            </div>
                            <div className="w-full bg-accent/15 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="h-2 bg-accent rounded-full transition-all duration-700"
                                    style={{ width: `${displayData.progress_to_next}%` }}
                                ></div>
                            </div>
                        </div>
                    </Card>

                    {/* PACE PROJECTION — the tip, plus what the current rate
                        actually adds up to. A rate on its own is abstract; the
                        year-end figure is the part worth reading. */}
                    <div className="col-span-12 bg-secondary border border-primary/25 rounded-2xl p-4 flex items-start gap-3">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
                            <TipIcon size={15} className="text-white" strokeWidth={2.5} />
                        </div>

                        <div className="flex-1 min-w-0">
                            {weeklyPace > 0 ? (
                                <>
                                    <p className="text-sm font-bold text-foreground leading-snug">
                                        You're saving ₱{weeklyPace.toLocaleString('en-PH')}/week.
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                        Keep this pace and you'll have put away{' '}
                                        <span className="font-bold text-primary tabular-nums">
                                            ₱{projectedYear.toLocaleString('en-PH')}
                                        </span>{' '}
                                        by this time next year.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-bold text-foreground leading-snug">
                                        {dynamic_tip?.tip || 'Start saving today'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                        {dynamic_tip?.message || 'Every peso counts.'}
                                    </p>
                                </>
                            )}
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
        <Card className="rounded-xl p-2.5">
            <div className="flex items-center gap-1 mb-0.5">
                <Icon size={10} className={cn('shrink-0', iconColor)} strokeWidth={2.5} />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">{label}</span>
            </div>
            <p className="text-sm font-black text-foreground leading-tight tabular-nums">
                {value}
            </p>
            <p className="text-[9px] text-muted-foreground font-medium mt-0.5 truncate">{sub}</p>
        </Card>
    );
}

function MonthlyCalendar({ cells = [] }) {
    const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="max-w-[300px] mx-auto">
            <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                {weekdayLabels.map((day, idx) => (
                    <div key={idx} className="text-center">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">{day}</span>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
                {cells.map((cell, idx) => {
                    const isActive = cell.is_active;
                    const isToday = cell.is_today;
                    const isOutOfMonth = !cell.is_current_month;
                    const isFuture = cell.is_future;

                    let bgClass = 'bg-muted';
                    let textClass = 'text-muted-foreground';

                    if (isOutOfMonth) {
                        bgClass = 'bg-transparent';
                        textClass = 'text-muted-foreground/50';
                    } else if (isFuture) {
                        bgClass = 'bg-muted';
                        textClass = 'text-muted-foreground';
                    } else if (isActive) {
                        // PURE AMBER (no orange)
                        bgClass = 'bg-gradient-to-br from-accent to-accent';
                        textClass = 'text-foreground';
                    }

                    return (
                        <div
                            key={idx}
                            className={`aspect-square rounded-sm relative flex items-center justify-center transition-all ${bgClass} ${
                                isToday ? 'ring-1 ring-accent ring-offset-1' : ''
                            } ${isOutOfMonth ? 'opacity-40' : 'cursor-help'}`}
                            title={isOutOfMonth ? '' : `${cell.month_label} ${cell.day}${isActive ? ' · Saved' : ''}${isToday ? ' · Today' : ''}`}
                        >
                            {isActive && !isOutOfMonth && (
                                <Flame 
                                    size={8} 
                                    className="absolute top-0 right-0 text-accent-foreground" 
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
                        ? 'bg-accent/10 border-accent/40 hover:bg-accent/15 hover:scale-110' 
                        : 'bg-muted border-border opacity-50 hover:opacity-80 hover:scale-110'
                }`}
            >
                <Icon 
                    size={14} 
                    className={unlocked ? 'text-accent-foreground' : 'text-muted-foreground'} 
                    strokeWidth={2.5} 
                />
            </div>
            
            {/* Custom tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-foreground text-white text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-lg">
                {achievement.label}
                <div className={`text-[9px] font-medium mt-0.5 ${
                    unlocked ? 'text-emerald-300' : 'text-muted-foreground'
                }`}>
                    {unlocked ? '✓ Unlocked' : '🔒 Locked'}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground"></div>
            </div>
        </div>
    );
}