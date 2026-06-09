// resources/js/Pages/Admin/UserList.jsx
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import Avatar from '../../Components/Admin/Avatar';
import { 
    Search, ChevronLeft, ChevronRight, Check, Users,
} from 'lucide-react';

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
    // Check kung may unverified users sa current view
    const hasUnverified = users.some(u => !u.email_verified);
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
                    <StatCard label="Total Users" value={counts.all || 0} color="slate" />
                    <StatCard label="Tier 1 — Starter" value={counts.tier1 || 0} color="teal" />
                    <StatCard label="Tier 2 — Builder" value={counts.tier2 || 0} color="blue" />
                    <StatCard label="Tier 3 — Achiever" value={counts.tier3 || 0} color="amber" />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {/* Filters bar */}
                    <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-slate-100">
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Tier filter */}
                        <TierFilterTabs current={filters.tier || 'all'} onChange={setTierFilter} />
                        
                        {/* Verified filter — only show kung may unverified users */}
                        {hasUnverified && (
                            <VerifiedFilterTabs current={filters.verified || 'all'} onChange={setVerifiedFilter} />
                        )}
                    </div>
                        
                        {/* Search */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search name, email, or account..."
                                    className="pl-8 pr-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all w-64"
                                />
                            </div>
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={() => setSearchInput('')}
                                    className="px-2 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {users.length > 0 ? (
                        <>
                            {/* Table header */}
                            <div className="hidden sm:grid grid-cols-12 items-center gap-3 px-5 py-2.5 bg-slate-50 border-b border-slate-200">
                                <div className="col-span-6">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">User</p>
                                </div>
                                <div className="col-span-2 text-center">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tier</p>
                                </div>
                                <div className="hidden md:block col-span-2 text-center">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Joined</p>
                                </div>
                                <div className="col-span-2 text-center">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status</p>
                                </div>
                            </div>
                            
                            {/* Rows */}
                            <div>
                                {users.map((u) => (
                                    <UserListItem key={u.id} user={u} />
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
                                <p className="text-[11px] text-slate-500 font-medium">
                                    Showing <span className="font-bold text-slate-900">{pagination.from}-{pagination.to}</span> of <span className="font-bold text-slate-900">{pagination.total_count}</span>
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => goToPage(pagination.current_page - 1)}
                                        disabled={pagination.current_page <= 1}
                                        className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                    >
                                        <ChevronLeft size={12} />
                                    </button>
                                    <span className="text-[11px] font-bold text-slate-700 px-2">
                                        Page {pagination.current_page} of {pagination.total_pages}
                                    </span>
                                    <button
                                        onClick={() => goToPage(pagination.current_page + 1)}
                                        disabled={pagination.current_page >= pagination.total_pages}
                                        className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                    >
                                        <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={28} className="text-slate-400" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-bold text-slate-700 mb-1">No users found</p>
                        <p className="text-[11px] text-slate-500 font-medium max-w-xs mx-auto">
                            {filters.search 
                                ? `No matches for "${filters.search}". Try a different keyword.` 
                                : filters.tier !== 'all'
                                    ? `No users in this tier yet.`
                                    : 'Users will appear here as they sign up.'
                            }
                        </p>
                    </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
function TierFilterTabs({ current, onChange }) {
    const tabs = [
        { id: 'all', label: 'All Users' },
        { id: '1', label: 'Tier 1', color: 'teal' },
        { id: '2', label: 'Tier 2', color: 'blue' },
        { id: '3', label: 'Tier 3', color: 'amber' },
    ];

    const activeColors = {
        teal: 'bg-teal-600 text-white shadow-sm shadow-teal-200',
        blue: 'bg-blue-600 text-white shadow-sm shadow-blue-200',
        amber: 'bg-amber-500 text-white shadow-sm shadow-amber-200',
    };

    return (
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {tabs.map((tab) => {
                const isActive = current === tab.id;
                const activeStyle = tab.color ? activeColors[tab.color] : 'bg-white text-slate-900 shadow-sm';
                
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                            isActive
                                ? activeStyle
                                : 'text-slate-500 hover:text-slate-700'
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
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                        current === tab.id
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
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
            className="grid grid-cols-12 items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 last:border-b-0"
        >
            {/* Column 1: User — 6 cols */}
            <div className="col-span-12 sm:col-span-6 flex items-center gap-3 min-w-0">
                <Avatar src={user.profile_picture} name={user.name} size="md" />
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{user.email}</p>
                </div>
            </div>

            {/* Column 2: Tier — 2 cols, centered */}
            <div className="hidden sm:flex justify-center col-span-2">
                <TierBadge tier={user.kyc_tier} />
            </div>

            {/* Column 3: Joined — 2 cols, centered */}
            <div className="hidden md:flex flex-col items-center col-span-2">
                <p className="text-[11px] font-bold text-slate-700">{user.member_since}</p>
                <p className="text-[9px] text-slate-500 font-medium">{user.created_relative}</p>
            </div>

           {/* Column 4: Status — 2 cols, centered */}
                <div className="col-span-12 sm:col-span-2 flex justify-center items-center gap-1.5">
                    {user.email_verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase tracking-widest rounded">
                            <Check size={10} strokeWidth={3} />
                            Verified
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-500 border border-slate-200 text-[9px] font-bold uppercase tracking-widest rounded">
                            Pending
                        </span>
                    )}
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                </div>
        </Link>
    );
}

function TierBadge({ tier }) {
    const styles = {
        1: { color: 'bg-teal-50 text-teal-700 border-teal-200', label: 'Starter' },
        2: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Builder' },
        3: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Achiever' },
    };
    const style = styles[tier] || styles[1];
    return (
        <div className="flex flex-col items-center gap-0.5">
            <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${style.color}`}>
                Tier {tier}
            </span>
            <p className="text-[9px] text-slate-500 font-medium">{style.label}</p>
        </div>
    );
}

function StatCard({ label, value, color = 'slate' }) {
    const colorStyles = {
        slate: 'bg-slate-50 border-slate-200 text-slate-900',
        teal: 'bg-teal-50 border-teal-200 text-teal-900',
        blue: 'bg-blue-50 border-blue-200 text-blue-900',
        amber: 'bg-amber-50 border-amber-200 text-amber-900',
    };

    const accentColors = {
        slate: 'text-slate-500',
        teal: 'text-teal-600',
        blue: 'text-blue-600',
        amber: 'text-amber-600',
    };

    return (
        <div className={`rounded-xl border p-4 ${colorStyles[color]}`}>
            <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${accentColors[color]}`}>
                {label}
            </p>
            <p className="text-2xl font-black tracking-tight">{value}</p>
        </div>
    );
}