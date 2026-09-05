// resources/js/Pages/Admin/UserList.jsx
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import Avatar from '../../Components/Admin/Avatar';
import { 
    Search, ChevronLeft, ChevronRight, Check, Users, Sprout, TrendingUp, Trophy,
} from 'lucide-react';
// Third copy of this component in the admin panel — UserList, AdminsList and
// AuditLog each had their own, so a fix to one never reached the others.
import StatCard from '../../Components/Admin/StatCard';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { cn } from '@/lib/utils';

export default function UserList({ 
    auth, 
    users = [], 
    pagination = {}, 
    filters = {}, 
    counts = {},
    pendingCounts = {} 
}) {
    const user = auth?.user;
    const [searchInput, setSearchInput] = useState(filters.search || '');
    // The verified tabs used to render only when the visible page contained an
    // unverified user. Selecting "Verified" then emptied that condition, so the
    // control removed itself the moment it was used and there was no way back
    // to All. A filter's presence cannot depend on what it filtered.
    // Debounced auto-search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== (filters.search || '')) {
                router.get('/admin/users', { ...filters, search: searchInput, page: 1 }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const setTierFilter = (tier) => {
        router.get('/admin/users', { ...filters, tier, page: 1 }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const setVerifiedFilter = (verified) => {
        router.get('/admin/users', { ...filters, verified, page: 1 }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const goToPage = (page) => {
        router.get('/admin/users', { ...filters, page }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout user={user} header="User Management" pendingCounts={pendingCounts}>
            <Head title="Users | Admin" />

            <div className="max-w-7xl space-y-4">
                {/* Quick stats cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Total Users" value={counts.all || 0} icon={Users} color="neutral" />
                    <StatCard label="Tier 1 — Starter" value={counts.tier1 || 0} icon={Sprout} color="tier1" />
                    <StatCard label="Tier 2 — Builder" value={counts.tier2 || 0} icon={TrendingUp} color="tier2" />
                    <StatCard label="Tier 3 — Achiever" value={counts.tier3 || 0} icon={Trophy} color="tier3" />
                </div>

                <Card className="bg-card overflow-hidden">
                    {/* Filters bar */}
                    <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-border">
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Tier filter */}
                        <TierFilterTabs current={filters.tier || 'all'} onChange={setTierFilter} />
                        
                        <VerifiedFilterTabs current={filters.verified || 'all'} onChange={setVerifiedFilter} />
                    </div>
                        
                        {/* Search */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search name, email, or account..."
                                    className="pl-8 h-8 text-xs w-64 bg-muted/50"
                                />
                            </div>
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={() => setSearchInput('')}
                                    className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {users.length > 0 ? (
                        <>
                            {/* Table header */}
                            <div className="hidden sm:grid grid-cols-12 items-center gap-3 px-5 py-2.5 bg-muted border-b border-border">
                                <div className="col-span-6">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">User</p>
                                </div>
                                <div className="col-span-2 text-center">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Tier</p>
                                </div>
                                <div className="hidden md:block col-span-2 text-center">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Joined</p>
                                </div>
                                <div className="col-span-2 text-center">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                                </div>
                            </div>
                            
                            {/* Rows */}
                            <div>
                                {users.map((u) => (
                                    <UserListItem key={u.id} user={u} />
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-3">
                                <p className="text-[11px] text-muted-foreground font-medium">
                                    Showing <span className="font-bold text-foreground">{pagination.from}-{pagination.to}</span> of <span className="font-bold text-foreground">{pagination.total_count}</span>
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => goToPage(pagination.current_page - 1)}
                                        disabled={pagination.current_page <= 1}
                                        className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                    >
                                        <ChevronLeft size={12} />
                                    </button>
                                    <span className="text-[11px] font-bold text-foreground px-2">
                                        Page {pagination.current_page} of {pagination.total_pages}
                                    </span>
                                    <button
                                        onClick={() => goToPage(pagination.current_page + 1)}
                                        disabled={pagination.current_page >= pagination.total_pages}
                                        className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                    >
                                        <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={28} className="text-muted-foreground" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-bold text-foreground mb-1">No users found</p>
                        <p className="text-[11px] text-muted-foreground font-medium max-w-xs mx-auto">
                            {filters.search 
                                ? `No matches for "${filters.search}". Try a different keyword.` 
                                : filters.tier !== 'all'
                                    ? `No users in this tier yet.`
                                    : 'Users will appear here as they sign up.'
                            }
                        </p>
                    </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}
function TierFilterTabs({ current, onChange }) {
    const tabs = [
        { id: 'all', label: 'All Users' },
        { id: '1', label: 'Tier 1', tier: 1 },
        { id: '2', label: 'Tier 2', tier: 2 },
        { id: '3', label: 'Tier 3', tier: 3 },
    ];

    return (
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            {tabs.map((tab) => {
                const isActive = current === tab.id;
                // Tier tabs take their fill from the --tier-N tokens, the same
                // source the sidebar indicator and goal themes read, so a tier
                // means one colour everywhere.
                const activeStyle = tab.tier ? 'text-white shadow-sm' : 'bg-card text-foreground shadow-sm';
                const activeVar = tab.tier ? { backgroundColor: `var(--tier-${tab.tier})` } : undefined;
                
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        style={isActive ? activeVar : undefined}
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                            isActive
                                ? activeStyle
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

function VerifiedFilterTabs({ current, onChange }) {
    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'verified', label: 'Verified' },
        { id: 'unverified', label: 'Unverified' },
    ];
    return (
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                        current === tab.id
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

function UserListItem({ user }) {
    return (
        <Link
            href={`/admin/users/${user.id}`}
            className="grid grid-cols-12 items-center gap-3 px-5 py-3 hover:bg-muted transition-colors cursor-pointer border-b border-border last:border-b-0"
        >
            {/* Column 1: User — 6 cols */}
            <div className="col-span-12 sm:col-span-6 flex items-center gap-3 min-w-0">
                <Avatar src={user.profile_picture} name={user.name} size="md" />
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium truncate">{user.email}</p>
                </div>
            </div>

            {/* Column 2: Tier — 2 cols, centered */}
            <div className="hidden sm:flex justify-center col-span-2">
                <TierBadge tier={user.kyc_tier} />
            </div>

            {/* Column 3: Joined — 2 cols, centered */}
            <div className="hidden md:flex flex-col items-center col-span-2">
                <p className="text-[11px] font-bold text-foreground">{user.member_since}</p>
                <p className="text-[9px] text-muted-foreground font-medium">{user.created_relative}</p>
            </div>

           {/* Column 4: Status — 2 cols, centered */}
                <div className="col-span-12 sm:col-span-2 flex justify-center items-center gap-1.5">
                    {user.email_verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success border border-success/25 text-[9px] font-bold uppercase tracking-widest rounded">
                            <Check size={10} strokeWidth={3} />
                            Verified
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground border border-border text-[9px] font-bold uppercase tracking-widest rounded">
                            Pending
                        </span>
                    )}
                    <ChevronRight size={14} className="text-muted-foreground/50 shrink-0" />
                </div>
        </Link>
    );
}

function TierBadge({ tier }) {
    const styles = {
        1: { color: 'bg-secondary text-primary border-primary/25', label: 'Starter' },
        2: { color: 'bg-primary/10 text-primary border-primary/25', label: 'Builder' },
        3: { color: 'bg-accent/10 text-accent-foreground border-accent/30', label: 'Achiever' },
    };
    const style = styles[tier] || styles[1];
    return (
        <div className="flex flex-col items-center gap-0.5">
            <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${style.color}`}>
                Tier {tier}
            </span>
            <p className="text-[9px] text-muted-foreground font-medium">{style.label}</p>
        </div>
    );
}