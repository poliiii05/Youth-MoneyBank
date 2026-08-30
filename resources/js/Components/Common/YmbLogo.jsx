import { cn } from '@/lib/utils';

/**
 * YmbLogo — the YMB mark as inline SVG.
 *
 * Three ascending bars for the three KYC tiers (Starter → Builder →
 * Achiever), with a sprout growing off the tallest one: the savings habit
 * compounding as the user verifies further. Reads down to 16px, which the
 * old PNG mark did not.
 *
 * Replaces /images/YMB_HeaderLogo.png — a flat PNG with a baked-in white
 * background and hardcoded navy/blue fills. Inline SVG means no white box,
 * per-theme recolouring without new asset files, and no blur at any size.
 *
 * variant:
 *   'brand' — for light backgrounds (public site, user dashboard)
 *   'dark'  — brighter, for dark backgrounds (admin sidebar)
 *   'mono'  — single colour, inherits the parent's text colour
 */
export default function YmbLogo({ variant = 'brand', className, ...props }) {
    const fills = {
        brand: {
            leaf: 'fill-emerald-500',
            starter: 'fill-emerald-200',
            builder: 'fill-emerald-500',
            achiever: 'fill-primary',
        },
        dark: {
            leaf: 'fill-emerald-300',
            starter: 'fill-emerald-200',
            builder: 'fill-emerald-400',
            achiever: 'fill-emerald-500',
        },
        mono: {
            leaf: 'fill-current',
            starter: 'fill-current opacity-40',
            builder: 'fill-current opacity-70',
            achiever: 'fill-current',
        },
    }[variant];

    return (
        <svg
            viewBox="0 0 88 110"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('h-10 w-auto', className)}
            role="img"
            aria-label="Youth MoneyBank"
            {...props}
        >
            {/* Sprout — growth off the Achiever tier */}
            <path
                className={fills.leaf}
                d="M72 2 C64 6, 54 14, 50 26 C48 32, 49 38, 52 42 C60 38, 68 28, 71 16 C72 11, 72 6, 72 2 Z"
            />

            {/* Tier 1 — Starter */}
            <rect className={fills.starter} x="0" y="60" width="16" height="46" rx="5" />

            {/* Tier 2 — Builder */}
            <rect className={fills.builder} x="23" y="42" width="16" height="64" rx="5" />

            {/* Tier 3 — Achiever */}
            <rect className={fills.achiever} x="46" y="24" width="16" height="82" rx="5" />
        </svg>
    );
}