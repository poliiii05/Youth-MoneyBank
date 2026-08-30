import { useState, useEffect, useRef } from 'react';
import { Card } from '@/Components/ui/card';
import { Flame, Target, TrendingUp, ArrowDownLeft } from 'lucide-react';

/**
 * SavingsShowcase
 *
 * Animated hero visual for the landing page. Loops through the app's real
 * core loop — money coming in, a goal filling up, a streak building — so the
 * marketing visual reflects features that actually exist in the product.
 *
 * Intentionally NOT market/stock data: investment portals are out of scope
 * for this platform, so showing tickers would misrepresent what YMB does.
 *
 * Pure CSS transitions + React state. No animation library.
 */

const GOAL_TARGET = 3000;
const BALANCE_TARGET = 4250;
const STREAK_TARGET = 27;

// Weekly deposit ticks that drive the "recent activity" strip.
const DEPOSITS = [
    { label: 'Allowance saved', amount: 250 },
    { label: 'Baon left over', amount: 120 },
    { label: 'Birthday money', amount: 500 },
    { label: 'Weekend job', amount: 340 },
];

function useCountUp(target, { duration = 1400, start = false }) {
    const [value, setValue] = useState(0);
    const frameRef = useRef();

    useEffect(() => {
        if (!start) {
            setValue(0);
            return;
        }

        const startedAt = performance.now();

        const tick = (now) => {
            const elapsed = now - startedAt;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic — fast at first, settles gently
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(target * eased));

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(tick);
            }
        };

        frameRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameRef.current);
    }, [target, duration, start]);

    return value;
}

export default function SavingsShowcase() {
    const [visible, setVisible] = useState(false);
    const [depositIndex, setDepositIndex] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);

    // Respect the OS "reduce motion" setting — show final values, skip the animation.
    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(query.matches);

        const onChange = (e) => setReducedMotion(e.matches);
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);

    // Kick off once mounted so the count-up is visible on load.
    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 200);
        return () => clearTimeout(timer);
    }, []);

    // Rotate the activity feed.
    useEffect(() => {
        if (reducedMotion) return;
        const interval = setInterval(() => {
            setDepositIndex((i) => (i + 1) % DEPOSITS.length);
        }, 2600);
        return () => clearInterval(interval);
    }, [reducedMotion]);

    const animate = visible && !reducedMotion;

    const balance = useCountUp(BALANCE_TARGET, { start: visible, duration: 1600 });
    const goalSaved = useCountUp(2100, { start: visible, duration: 1800 });
    const streak = useCountUp(STREAK_TARGET, { start: visible, duration: 1200 });

    const displayBalance = reducedMotion ? BALANCE_TARGET : balance;
    const displayGoal = reducedMotion ? 2100 : goalSaved;
    const displayStreak = reducedMotion ? STREAK_TARGET : streak;

    const goalPercent = Math.round((displayGoal / GOAL_TARGET) * 100);
    const activeDeposit = DEPOSITS[depositIndex];

    return (
        <Card className="w-full max-w-md shadow-lg overflow-hidden">

            {/* BALANCE HEADER */}
            <div className="bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground p-6 relative overflow-hidden">
                <div
                    className={`absolute -top-10 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl ${
                        animate ? 'animate-pulse' : ''
                    }`}
                />

                <div className="relative z-10">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1">
                        Total Balance
                    </p>
                    <p className="text-4xl font-bold tabular-nums leading-none mb-3">
                        ₱{displayBalance.toLocaleString()}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-white/90">
                        <TrendingUp size={13} />
                        <span className="font-medium">₱1,210 saved this month</span>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-4">

                {/* GOAL PROGRESS */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Target size={15} className="text-primary" />
                            <span className="text-sm font-semibold text-foreground">New Laptop</span>
                        </div>
                        <span className="text-xs font-bold tabular-nums text-primary">
                            {goalPercent}%
                        </span>
                    </div>

                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-[width] duration-[1800ms] ease-out"
                            style={{ width: `${goalPercent}%` }}
                        />
                    </div>

                    <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground tabular-nums">
                        <span>₱{displayGoal.toLocaleString()} saved</span>
                        <span>₱{GOAL_TARGET.toLocaleString()} goal</span>
                    </div>
                </div>

                {/* STREAK */}
                <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 p-3">
                    <div className="relative">
                        <Flame
                            size={22}
                            className={`text-accent ${animate ? 'animate-pulse' : ''}`}
                            fill="currentColor"
                        />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-foreground tabular-nums leading-tight">
                            {displayStreak}-day streak
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                            3 more days to your next badge
                        </p>
                    </div>

                    {/* Mini week dots */}
                    <div className="flex gap-1">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-accent"
                                style={{
                                    opacity: animate ? undefined : 1,
                                    animation: animate
                                        ? `showcase-dot 2.4s ease-in-out ${i * 0.12}s infinite`
                                        : undefined,
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* ROTATING ACTIVITY */}
                <div className="border-t border-border pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Recent Activity
                    </p>

                    <div
                        key={depositIndex}
                        className="flex items-center justify-between"
                        style={{ animation: animate ? 'showcase-slide 0.5s ease-out' : undefined }}
                    >
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10">
                                <ArrowDownLeft size={13} className="text-success" />
                            </span>
                            <span className="text-sm text-foreground">{activeDeposit.label}</span>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-success">
                            +₱{activeDeposit.amount}
                        </span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes showcase-dot {
                    0%, 100% { opacity: 0.25; transform: scale(1); }
                    50%      { opacity: 1;    transform: scale(1.3); }
                }
                @keyframes showcase-slide {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </Card>
    );
}