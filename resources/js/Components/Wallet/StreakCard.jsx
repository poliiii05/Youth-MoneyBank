import { Link } from '@inertiajs/react';
import { Flame, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Dashboard streak summary.
 *
 * Shows the current calendar week, Monday first. The previous version drew a
 * rolling seven days, so the row began on whatever weekday it happened to be
 * and the labels shuffled between visits — you could not tell at a glance
 * which day was which.
 */
export default function StreakCard({ streak }) {
    const current = streak?.current_streak ?? 0;
    const best = streak?.best_streak ?? 0;
    const nextMilestone = streak?.next_milestone ?? 7;
    const week = streak?.this_week ?? [];

    const daysToNext = Math.max(nextMilestone - current, 0);

    return (
        <div className="bg-card rounded-[1.5rem] shadow-sm border border-border p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-accent/10 rounded-lg">
                    <Flame
                        size={16}
                        className="text-accent"
                        fill={current > 0 ? 'currentColor' : 'none'}
                        strokeWidth={2.5}
                    />
                </div>
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Savings Streak
                </h3>
            </div>

            <div className="mb-3">
                <p className="text-2xl font-black text-foreground tracking-tight tabular-nums">
                    {current} {current === 1 ? 'day' : 'days'}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                    {current === 0
                        ? 'Save today to start a streak'
                        : daysToNext === 0
                            ? 'Milestone reached!'
                            : `${daysToNext} more to hit ${nextMilestone} days`}
                </p>
            </div>

            {/* This week, Monday first */}
            <div className="flex justify-between gap-1 mb-3">
                {week.map((day) => (
                    <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
                        <div
                            className={cn(
                                'h-8 w-full rounded-md flex items-center justify-center transition-colors',
                                day.saved
                                    ? 'bg-accent text-accent-foreground'
                                    // Days that haven't happened read as neutral rather
                                    // than as missed — you can't miss tomorrow.
                                    : day.is_future
                                        ? 'bg-muted/50 border border-dashed border-border'
                                        : 'bg-muted',
                                day.is_today && !day.saved && 'ring-2 ring-accent/40'
                            )}
                            title={day.saved ? `Saved on ${day.date}` : day.date}
                        >
                            {day.saved && <Flame size={13} fill="currentColor" strokeWidth={2.5} />}
                        </div>
                        <span
                            className={cn(
                                'text-[8px] font-bold',
                                day.is_today ? 'text-accent-foreground' : 'text-muted-foreground'
                            )}
                        >
                            {day.label}
                        </span>
                    </div>
                ))}
            </div>

            {best > 0 && (
                <p className="text-[10px] text-muted-foreground font-medium mb-3">
                    Best streak: <span className="font-bold text-foreground tabular-nums">{best} days</span>
                </p>
            )}

            <Link
                href="/insights"
                className="mt-auto w-full py-2 bg-secondary text-secondary-foreground text-[11px] font-semibold rounded-xl hover:bg-secondary/70 transition-colors flex items-center justify-center gap-1.5 border border-border cursor-pointer"
            >
                View insights <ArrowRight size={12} />
            </Link>
        </div>
    );
}