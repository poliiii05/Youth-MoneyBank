/**
 * Goal colour themes.
 *
 * `savings_goals.color_theme` stores a raw Tailwind class string (default
 * "bg-blue-500"). That only renders because some unrelated file happens to use
 * the same class — Tailwind generates CSS from classes it finds in source, so a
 * value that exists only in the database is never compiled. Retheme the file
 * that happened to mention it and every goal using that value silently loses
 * its colour.
 *
 * Resolving through this map fixes that: the stored value is a lookup key, and
 * the classes it returns are written here in source where Tailwind can see
 * them. Legacy class strings still resolve, so nothing needs migrating.
 */

export const GOAL_THEMES = {
    emerald: {
        label: 'Emerald',
        bg: 'bg-emerald-500',
        bgSoft: 'bg-emerald-50',
        text: 'text-emerald-600',
        ring: 'ring-emerald-500',
    },
    forest: {
        label: 'Forest',
        bg: 'bg-emerald-700',
        bgSoft: 'bg-emerald-50',
        text: 'text-emerald-700',
        ring: 'ring-emerald-700',
    },
    mint: {
        label: 'Mint',
        bg: 'bg-emerald-400',
        bgSoft: 'bg-emerald-50',
        text: 'text-emerald-500',
        ring: 'ring-emerald-400',
    },
    amber: {
        label: 'Amber',
        bg: 'bg-amber-500',
        bgSoft: 'bg-amber-50',
        text: 'text-amber-600',
        ring: 'ring-amber-500',
    },
    rose: {
        label: 'Rose',
        bg: 'bg-rose-500',
        bgSoft: 'bg-rose-50',
        text: 'text-rose-600',
        ring: 'ring-rose-500',
    },
    sky: {
        label: 'Sky',
        bg: 'bg-sky-500',
        bgSoft: 'bg-sky-50',
        text: 'text-sky-600',
        ring: 'ring-sky-500',
    },
    violet: {
        label: 'Violet',
        bg: 'bg-violet-500',
        bgSoft: 'bg-violet-50',
        text: 'text-violet-600',
        ring: 'ring-violet-500',
    },
    slate: {
        label: 'Slate',
        bg: 'bg-slate-600',
        bgSoft: 'bg-slate-50',
        text: 'text-slate-600',
        ring: 'ring-slate-600',
    },
};

export const DEFAULT_GOAL_THEME = 'emerald';

/**
 * Values written before this map existed were raw class strings. Map them onto
 * a key so old goals keep a sensible colour without a data migration.
 */
const LEGACY_CLASS_MAP = {
    'bg-blue-500': 'sky',
    'bg-blue-600': 'sky',
    'bg-sky-500': 'sky',
    'bg-emerald-300': 'mint',
    'bg-emerald-400': 'mint',
    'bg-emerald-500': 'emerald',
    'bg-emerald-600': 'emerald',
    'bg-emerald-700': 'forest',
    'bg-emerald-800': 'forest',
    'bg-amber-500': 'amber',
    'bg-rose-500': 'rose',
    'bg-red-500': 'rose',
    'bg-purple-500': 'violet',
    'bg-violet-500': 'violet',
    'bg-slate-900': 'slate',
    'bg-slate-600': 'slate',
};

/**
 * Resolve any stored value — a theme key or a legacy class string — into a
 * theme object. Always returns something renderable.
 */
export function resolveGoalTheme(stored) {
    if (!stored) return GOAL_THEMES[DEFAULT_GOAL_THEME];

    if (GOAL_THEMES[stored]) return GOAL_THEMES[stored];

    const legacyKey = LEGACY_CLASS_MAP[stored];
    if (legacyKey) return GOAL_THEMES[legacyKey];

    return GOAL_THEMES[DEFAULT_GOAL_THEME];
}