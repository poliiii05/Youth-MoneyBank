import { Link } from '@inertiajs/react';
import { Flame, ArrowRight } from 'lucide-react';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * Dashboard streak summary.
 *
 * The controller was already computing streak_preview and the dashboard was
 * discarding it. Streaks are the habit hook in this product, so they belong
 * on the page the user opens daily — not only inside Insights.
 */
export default function StreakCard({ streak }) {
    const current = streak?.current_streak ?? 0;
    const best = streak?.best_streak ?? 0;
    const nextMilestone = streak?.next_milestone ?? 7;
    const last7 = streak?.last_7_days ?? [];

    const daysToNext = Math.max(nextMilestone - current, 0);

    // Align the labels so the rightmost dot is today.
    const todayIndex = new Date().getDay();
    const labels = Array.from({ length: 7 }, (_, i) => DAY_LABELS[(todayIndex - 6 + i + 7) % 7]);

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

            {/* Last seven days */}
            <div className="flex justify-between gap-1 mb-3">
                {labels.map((label, i) => {
                    const savedThatDay = Boolean(last7[i]);
                    return (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                            <div
                                className={`h-7 w-full rounded-md transition-colors ${
                                    savedThatDay ? 'bg-accent' : 'bg-muted'
                                }`}
                                title={savedThatDay ? 'Saved' : 'No activity'}
                            />
                            <span className="text-[8px] font-bold text-muted-foreground">
                                {label}
                            </span>
                        </div>
                    );
                })}
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