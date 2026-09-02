// resources/js/Components/Modals/ViewDetailsModal.jsx
import { useState, useEffect } from 'react';
import {
    Loader2, Target, ShieldAlert, Smartphone, ShoppingBag, PiggyBank,
    Landmark, Umbrella, GraduationCap, Gamepad2, Plane,
    ArrowDownLeft, ArrowUpRight, Trophy, Plus, Minus, AlertCircle,
    TrendingUp, Activity, Scale,
} from 'lucide-react';
import { useModalEnterKey } from '../../Hooks/useModalEnterKey';
import { resolveGoalTheme } from '@/lib/goalThemes';
import { cn } from '@/lib/utils';
import ModalShell from './ModalShell';
import { Button } from '@/Components/ui/button';

const ICON_MAP = {
    Target, ShieldAlert, Smartphone, ShoppingBag, PiggyBank,
    Landmark, Umbrella, GraduationCap, Gamepad2, Plane,
};

const getIcon = (name) => ICON_MAP[name] || Target;

/** Weekly pace options, shown as a read-only projection. */
const PACES = [500, 1000, 2000, 5000];

/** Entries shown before the list has to be asked for in full. */
const HISTORY_PREVIEW = 5;

export default function ViewDetailsModal({ isOpen, onClose, goalId, onAddFunds, onUnallocate }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [showAllHistory, setShowAllHistory] = useState(false);

    useEffect(() => {
        if (!isOpen || !goalId) {
            setData(null);
            setError('');
            return;
        }

        setLoading(true);
        setError('');
        setShowAllHistory(false);

        // Abort on change: opening one goal then quickly switching could
        // otherwise let the slower first response land last and paint its
        // data under the second goal's title.
        const controller = new AbortController();

        fetch(`/goals/${goalId}/details`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        })
            .then((r) => {
                if (!r.ok) throw new Error('Failed to load details');
                return r.json();
            })
            .then((json) => {
                setData(json);
                setLoading(false);
            })
            .catch((err) => {
                if (err.name === 'AbortError') return;
                setError(err.message || 'An error occurred');
                setLoading(false);
            });

        return () => controller.abort();
    }, [isOpen, goalId]);

    useModalEnterKey({
        isOpen,
        isSuccess: false,
        canSubmit: false,
        isProcessing: false,
        onSuccess: onClose,
        onSubmit: onClose,
    });

    const goal = data?.goal;
    const history = data?.history || [];
    const stats = data?.stats || {};
    const visibleHistory = showAllHistory ? history : history.slice(0, HISTORY_PREVIEW);

    const progress = goal && goal.target_amount > 0
        ? (goal.current_amount / goal.target_amount) * 100
        : 0;

    const isComplete = progress >= 100;
    const remaining = goal ? Math.max(goal.target_amount - goal.current_amount, 0) : 0;
    const theme = resolveGoalTheme(goal?.color_theme);
    const SelectedIcon = goal ? getIcon(goal.icon_name) : Target;

    const handleAddFundsClick = () => {
        if (onAddFunds && goal) {
            onClose();
            setTimeout(() => onAddFunds(goal), 100);
        }
    };

    const handleUnallocateClick = () => {
        if (onUnallocate && goal) {
            onClose();
            setTimeout(() => onUnallocate(goal), 100);
        }
    };

    return (
        <ModalShell
            isOpen={isOpen}
            onClose={onClose}
            eyebrow="Goal details"
            title={goal?.title || 'Loading…'}
            icon={goal ? SelectedIcon : Target}
            className="sm:max-w-lg"
            footer={goal ? (
                <>
                    <Button
                        variant="outline"
                        onClick={handleUnallocateClick}
                        disabled={goal.current_amount <= 0}
                        className="flex-1"
                    >
                        <Minus size={14} strokeWidth={2.5} /> Unallocate
                    </Button>
                    <Button onClick={handleAddFundsClick} disabled={isComplete} className="flex-1">
                        <Plus size={14} strokeWidth={2.5} /> Add Funds
                    </Button>
                </>
            ) : null}
        >
            {loading && (
                <div className="py-14 flex flex-col items-center justify-center">
                    <Loader2 className="w-7 h-7 text-primary animate-spin mb-2" strokeWidth={2.5} />
                    <p className="text-xs font-medium text-muted-foreground">Loading details…</p>
                </div>
            )}

            {error && !loading && (
                <div className="py-14 flex flex-col items-center text-center">
                    <div className="w-11 h-11 bg-destructive/10 rounded-full flex items-center justify-center mb-3">
                        <AlertCircle size={22} className="text-destructive" strokeWidth={2} />
                    </div>
                    <p className="text-sm font-bold text-foreground mb-1">Couldn't load details</p>
                    <p className="text-[11px] text-muted-foreground">{error}</p>
                </div>
            )}

            {data && !loading && !error && (
                <div className="space-y-4">

                    {/* HERO — carries the goal's own colour, so two goals never
                        look like the same screen with different numbers. The
                        icon sits behind as a watermark rather than repeating
                        the one already in the header. */}
                    <div className={cn('relative overflow-hidden rounded-2xl p-4 ring-1', theme.bgSoft, theme.ring, 'ring-opacity-20')}>
                        <SelectedIcon
                            size={110}
                            strokeWidth={1}
                            className={cn('absolute -right-5 -bottom-6 opacity-[0.07] pointer-events-none', theme.text)}
                        />

                        <div className="relative">
                            <div className="flex items-baseline justify-between mb-2">
                                <div>
                                    <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">Saved so far</p>
                                    <p className="text-3xl font-black text-foreground tabular-nums tracking-tight leading-none">
                                        ₱{goal.current_amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>

                                {isComplete ? (
                                    <span className="flex items-center gap-1 rounded-lg bg-accent px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-accent-foreground shadow-sm">
                                        <Trophy size={10} strokeWidth={2.5} /> Reached
                                    </span>
                                ) : (
                                    <span className={cn('text-lg font-black tabular-nums', theme.text)}>
                                        {progress.toFixed(0)}%
                                    </span>
                                )}
                            </div>

                            {/* Quarter markers turn a bar into a scale — you can see
                                you are past halfway without reading the number. */}
                            <div className="relative w-full bg-card/70 rounded-full h-2.5 overflow-hidden mb-2 ring-1 ring-black/[0.04]">
                                <div
                                    className={cn('h-2.5 rounded-full transition-all duration-1000 ease-out', theme.bg)}
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                                {[25, 50, 75].map((mark) => (
                                    <span
                                        key={mark}
                                        className="absolute top-0 h-2.5 w-px bg-foreground/10"
                                        style={{ left: `${mark}%` }}
                                    />
                                ))}
                            </div>

                            <div className="flex justify-between text-[11px] tabular-nums">
                                <span className="text-muted-foreground">
                                    of ₱{goal.target_amount.toLocaleString('en-PH')}
                                </span>
                                {!isComplete && (
                                    <span className={cn('font-bold', theme.text)}>
                                        ₱{remaining.toLocaleString('en-PH')} to go
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* STATS — each figure gets its own mark, so the strip reads
                        as three facts rather than one run-on row of numbers. */}
                    <div className="grid grid-cols-3 gap-2">
                        <Stat
                            icon={TrendingUp}
                            label="Lifetime added"
                            value={`₱${(stats.sum_allocated_lifetime || 0).toLocaleString('en-PH')}`}
                            theme={theme}
                        />
                        <Stat
                            icon={Activity}
                            label="Movements"
                            value={(stats.total_allocations || 0) + (stats.total_deallocations || 0)}
                            theme={theme}
                        />
                        <Stat
                            icon={Scale}
                            label="Average"
                            value={`₱${(stats.avg_allocation || 0).toLocaleString('en-PH')}`}
                            theme={theme}
                        />
                    </div>

                    {/* PACE — read-only projection, so it is phrased as one. */}
                    {!isComplete && remaining > 0 && (
                        <div>
                            <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">
                                Save this much each week and you'd finish in
                            </p>
                            <div className="grid grid-cols-4 gap-1.5">
                                {PACES.map((weekly) => {
                                    const weeks = Math.ceil(remaining / weekly);
                                    const date = new Date();
                                    date.setDate(date.getDate() + weeks * 7);
                                    return (
                                        <div
                                            key={weekly}
                                            className={cn(
                                                'rounded-lg border px-2 py-1.5 text-center transition-colors',
                                                // The fastest option gets the goal's colour — it is
                                                // the one worth noticing in a row of projections.
                                                weekly === PACES[PACES.length - 1]
                                                    ? cn(theme.bgSoft, 'border-transparent')
                                                    : 'border-border bg-card'
                                            )}
                                        >
                                            <p className={cn(
                                                'text-[11px] font-bold tabular-nums leading-tight',
                                                weekly === PACES[PACES.length - 1] ? theme.text : 'text-foreground'
                                            )}>
                                                ₱{weekly.toLocaleString()}
                                            </p>
                                            <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">
                                                {weeks <= 1 ? 'Next week' : `${weeks} weeks`}
                                            </p>
                                            <p className="text-[9px] text-muted-foreground/70 leading-tight">
                                                {date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* HISTORY */}
                    {history.length > 0 && (
                        <div>
                            <div className="flex items-baseline justify-between mb-1.5">
                                <p className="text-[10px] font-semibold text-muted-foreground">
                                    Recent activity
                                </p>
                                {history.length > HISTORY_PREVIEW && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAllHistory(v => !v)}
                                        className={cn('text-[10px] font-bold transition-colors cursor-pointer', theme.text, 'hover:opacity-70')}
                                    >
                                        {showAllHistory ? 'Show less' : `View all ${history.length}`}
                                    </button>
                                )}
                            </div>
                            <div className={cn("rounded-xl border border-border divide-y divide-border overflow-hidden bg-card", showAllHistory && "max-h-56 overflow-y-auto")}>
                                {visibleHistory.map((entry) => {
                                    const label = entry.type === 'goal_deletion_return'
                                        ? 'Goal deletion return'
                                        : entry.is_inflow ? 'Added to goal' : 'Removed from goal';

                                    return (
                                        <div key={entry.id} className="px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className={cn(
                                                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                                                    entry.is_inflow ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                                                )}>
                                                    {entry.is_inflow
                                                        ? <ArrowDownLeft size={13} strokeWidth={2.5} />
                                                        : <ArrowUpRight size={13} strokeWidth={2.5} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-semibold text-foreground truncate leading-tight">{label}</p>
                                                    <p className="text-[9px] text-muted-foreground leading-tight">{entry.created_at_human}</p>
                                                </div>
                                            </div>
                                            <p className={cn(
                                                'text-[11px] font-bold shrink-0 ml-2 tabular-nums',
                                                entry.is_inflow ? 'text-success' : 'text-foreground'
                                            )}>
                                                {entry.is_inflow ? '+' : '−'}₱{entry.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </ModalShell>
    );
}

function Stat({ icon: Icon, label, value, theme }) {
    return (
        <div className="rounded-xl border border-border bg-card px-3 py-2.5">
            <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center mb-1.5', theme.bgSoft)}>
                <Icon size={12} className={theme.text} strokeWidth={2.5} />
            </div>
            <p className="text-sm font-bold text-foreground tabular-nums leading-tight">{value}</p>
            <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{label}</p>
        </div>
    );
}