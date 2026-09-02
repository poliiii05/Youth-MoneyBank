// resources/js/Components/Layouts/UserLayout.jsx
import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ProfileDropdown from './ProfileDropdown';
import YmbLockup from '../Common/YmbLockup';
import { Target, CreditCard, Settings, Menu, Home, Sparkles, Star, X, TrendingUp, AlertCircle } from 'lucide-react';
import FloatingButton from '../Support/FloatingButton';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, tour: 'nav-dashboard' },
    { href: '/transactions', label: 'Transactions', icon: CreditCard, tour: 'nav-transactions' },
    { href: '/goals', label: 'Savings', icon: Target, tour: 'nav-savings' },
    { href: '/insights', label: 'Insights', icon: TrendingUp, tour: 'nav-insights' },
    { href: '/settings', label: 'Settings', icon: Settings, tour: 'nav-settings' },
];

const TIER_NAMES = { 1: 'Starter', 2: 'Builder', 3: 'Achiever' };

export default function UserLayout({ user, header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url, props } = usePage();
    const tierStatus = props?.tier_status;

    const isUrlActive = (path) => url.startsWith(path);
    const tier = Number(tierStatus?.tier ?? user?.kyc_tier ?? 1);
    const usagePercent = Number(tierStatus?.usage_percent ?? 0);

    return (
        <div className="min-h-screen bg-secondary/40">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={cn(
                    'fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50',
                    'transform transition-transform duration-300 lg:translate-x-0 flex flex-col',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Brand */}
                <div className="p-5 pb-4 flex items-center justify-between">
                    <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
                        <YmbLockup size="sm" showTagline={false} />
                    </Link>

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1.5 hover:bg-muted text-muted-foreground rounded-lg transition-colors cursor-pointer"
                        aria-label="Close menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="px-3 py-2 space-y-1 flex-1 overflow-y-auto">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-2">
                        Menu
                    </p>

                    {NAV_ITEMS.map(({ href, label, icon: Icon, tour }) => {
                        const active = isUrlActive(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                data-tour={tour}
                                className={cn(
                                    'relative w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all',
                                    active
                                        ? 'bg-secondary text-primary font-bold'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
                                )}
                            >
                                {/* Active marker — reads at a glance without relying on colour alone */}
                                {active && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary" />
                                )}
                                <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
                                <span className="text-sm">{label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer — where the user stands, and how far the ladder goes */}
                <div className="px-3 pb-5 pt-4 border-t border-border">
                    <div className="rounded-xl bg-secondary p-3" data-tour="tier-progress">
                        <div className="flex items-baseline justify-between mb-2">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Your Tier
                            </p>
                            <p className="text-[9px] font-bold text-muted-foreground tabular-nums">
                                {tier}/3
                            </p>
                        </div>

                        <p className="text-sm font-bold text-foreground leading-none mb-2.5">
                            {TIER_NAMES[tier] || 'Starter'}
                        </p>

                        {/* Three segments — filled up to the tier reached. Shows
                            progress and headroom in the same glance. */}
                        <div className="flex gap-1">
                            {[1, 2, 3].map((step) => (
                                <span
                                    key={step}
                                    className={cn(
                                        'h-1.5 flex-1 rounded-full transition-colors',
                                        step > tier && 'bg-border'
                                    )}
                                    style={
                                        step <= tier
                                            ? { backgroundColor: `var(--tier-${step})` }
                                            : undefined
                                    }
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="lg:ml-64 flex flex-col min-h-screen">

                {/* HEADER */}
                <header className="bg-card/95 backdrop-blur-md sticky top-0 z-30 border-b border-border shadow-sm">
                    <div className="flex items-center justify-between px-4 py-3 lg:px-8">

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-muted text-foreground rounded-lg transition-colors cursor-pointer"
                                aria-label="Open menu"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <h2 className="text-base font-bold text-foreground hidden sm:block tracking-tight">
                                {header || 'Dashboard'}
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* The upgrade prompt appears only once the tier ceiling
                                is actually in the way. Showing it to someone with an
                                empty wallet asks them to raise a limit they haven't
                                met — the sidebar already tells them their tier, so
                                this slot is for "act now", not "here's your status".
                                Amber stays the progression colour, distinct from the
                                emerald UI. */}
                            {tier >= 3 ? (
                                <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent-foreground text-[11px] font-bold rounded-full ring-1 ring-accent/30">
                                    <Star size={12} className="fill-accent text-accent" strokeWidth={2.5} />
                                    <span className="tracking-tight">Achiever</span>
                                </span>
                            ) : usagePercent >= 80 ? (
                                <Link
                                    href="/settings?tab=upgrade"
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground text-[11px] font-black rounded-full transition-all shadow-md hover:shadow-lg hover:scale-105 cursor-pointer group"
                                >
                                    <AlertCircle size={13} strokeWidth={2.5} />
                                    <span className="tracking-tight">
                                        Wallet {usagePercent}% full — upgrade
                                    </span>
                                </Link>
                            ) : usagePercent >= 50 ? (
                                <Link
                                    href="/settings?tab=upgrade"
                                    className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-[11px] font-bold rounded-full transition-colors cursor-pointer text-accent-foreground/80 hover:text-accent-foreground hover:bg-accent/10 ring-1 ring-accent/30 group"
                                >
                                    <Sparkles size={12} className="text-accent group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
                                    <span className="tracking-tight">Upgrade to Tier {tier + 1}</span>
                                </Link>
                            ) : null}

                            <ProfileDropdown user={user} />
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>

                <FloatingButton isAuthenticated={true} currentUser={user} />
            </div>
        </div>
    );
}