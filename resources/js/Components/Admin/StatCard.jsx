// resources/js/Components/Admin/StatCard.jsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/Components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Stat card for the admin dashboard.
 *
 * Colour marks the icon, not the whole card. The previous version tinted each
 * card's entire background — four differently coloured panels in a row read as
 * four alerts, when they are just four numbers. The surface is now uniform and
 * the accent is a single swatch, so the figures compete with each other rather
 * than with the decoration.
 */

const VARIANTS = {
    primary: {
        surface: 'bg-primary/[0.07] border-primary/20 hover:border-primary/40',
        icon: 'bg-primary/15 text-primary',
        glow: 'bg-primary/20',
    },
    emerald: {
        surface: 'bg-primary/[0.07] border-primary/20 hover:border-primary/40',
        icon: 'bg-primary/15 text-primary',
        glow: 'bg-primary/20',
    },
    accent: {
        surface: 'bg-accent/[0.07] border-accent/25 hover:border-accent/45',
        icon: 'bg-accent/15 text-accent',
        glow: 'bg-accent/20',
    },
    amber: {
        surface: 'bg-accent/[0.07] border-accent/25 hover:border-accent/45',
        icon: 'bg-accent/15 text-accent',
        glow: 'bg-accent/20',
    },
    destructive: {
        surface: 'bg-destructive/[0.07] border-destructive/25 hover:border-destructive/45',
        icon: 'bg-destructive/15 text-destructive',
        glow: 'bg-destructive/20',
    },
    red: {
        surface: 'bg-destructive/[0.07] border-destructive/25 hover:border-destructive/45',
        icon: 'bg-destructive/15 text-destructive',
        glow: 'bg-destructive/20',
    },
    // Tier variants read the --tier-N tokens, so a tier card here carries the
    // same colour as the sidebar indicator, the filter tabs below it and the
    // goal themes on the user side. Written as inline style rather than
    // classes because the value comes from a variable, not a fixed palette.
    // Fill strength climbs with the tier, so the three cards read as a ladder
    // rather than three unrelated colours — the same progression the sidebar
    // indicator and the goal themes use.
    tier1: { tier: 1, fill: 14, glow: 30 },
    tier2: { tier: 2, fill: 18, glow: 38 },
    tier3: { tier: 3, fill: 22, glow: 46 },
    neutral: {
        // Darker than the page so a plain count still reads as its own panel
        // rather than as empty space with a number on it.
        surface: 'bg-foreground/[0.06] border-foreground/10 hover:border-foreground/20',
        icon: 'bg-foreground/10 text-foreground',
        glow: 'bg-foreground/15',
    },
    slate: {
        surface: 'bg-foreground/[0.06] border-foreground/10 hover:border-foreground/20',
        icon: 'bg-foreground/10 text-foreground',
        glow: 'bg-foreground/15',
    },
};

export default function StatCard({
    label,
    value,
    icon: Icon,
    color = 'neutral',
    trend = null,
    onClick = null,
    subText = null,
}) {
    const v = VARIANTS[color] || VARIANTS.neutral;

    // A tier variant builds its surface from the token instead of class names.
    const tierVar = v.tier ? `var(--tier-${v.tier})` : null;

    const renderTrend = () => {
        if (!trend) return null;

        const TrendIcon = trend.direction === 'up' ? TrendingUp
            : trend.direction === 'down' ? TrendingDown
            : Minus;

        const trendClass = trend.direction === 'up' ? 'text-success bg-success/10'
            : trend.direction === 'down' ? 'text-destructive bg-destructive/10'
            : 'text-muted-foreground bg-muted';

        return (
            <div className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold', trendClass)}>
                <TrendIcon size={10} strokeWidth={2.5} />
                {trend.value}
            </div>
        );
    };

    // Card renders a div, so a clickable stat gets a real button wrapped
    // around it rather than a div pretending to be one — keyboard focus and
    // Enter/Space come free that way.
    const body = (
        <Card
            className={cn(
                'relative overflow-hidden p-4 text-left h-full transition-all',
                v.surface,
                tierVar && 'border-transparent',
                onClick && 'hover:shadow-md'
            )}
            style={tierVar ? { backgroundColor: `color-mix(in srgb, ${tierVar} ${v.fill}%, transparent)` } : undefined}
        >
            {/* Soft corner wash — enough to tell the cards apart at a glance
                without turning each one into its own alert. */}
            <div
                className={cn('absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-60', v.glow)}
                style={tierVar ? { backgroundColor: `color-mix(in srgb, ${tierVar} ${v.glow}%, transparent)` } : undefined}
            />

            <div className="relative">
                <div className="flex items-start justify-between mb-3">
                    <div
                        className={cn('w-9 h-9 rounded-lg flex items-center justify-center', v.icon)}
                        style={tierVar ? {
                            // Solid swatch: the icon is the one place the tier
                            // colour appears at full strength.
                            backgroundColor: tierVar,
                            color: 'white',
                        } : undefined}
                    >
                        <Icon size={16} strokeWidth={2.5} />
                    </div>
                    {renderTrend()}
                </div>

                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {label}
                </p>
                <p className="text-2xl font-black text-foreground mt-1 tracking-tight tabular-nums">
                    {value}
                </p>
                {subText && (
                    <p className={cn(
                        'text-[10px] font-bold mt-1',
                        subText.startsWith('+') ? 'text-success' : 'text-muted-foreground'
                    )}>
                        {subText}
                    </p>
                )}
            </div>
        </Card>
    );

    if (!onClick) return body;

    return (
        <button type="button" onClick={onClick} className="text-left cursor-pointer w-full">
            {body}
        </button>
    );
}