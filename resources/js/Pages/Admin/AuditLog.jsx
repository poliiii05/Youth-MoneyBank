// resources/js/Pages/Admin/AuditLog.jsx
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import Avatar from '../../Components/Admin/Avatar';
import { 
    Search, ChevronLeft, ChevronRight, History,
    Activity, Users, FileCheck, Receipt, Shield,
    Filter, ArrowRight, Calendar, X, Download,
} from 'lucide-react';
export default function AuditLog({ 
    auth, 
    logs = [], 
    pagination = {}, 
    filters = {},
    stats = {},
    actors = [],
    categoryCounts = {},
    pendingCounts = {} 

    
}) {

    const handleExport = () => {
        const params = new URLSearchParams({
            category: filters.category || 'all',
            action_type: filters.action_type || 'all',
            actor_id: filters.actor_id || 'all',
            date_range: filters.date_range || '7days',
            search: filters.search || '',
        });
        window.location.href = `/admin/audit/export?${params.toString()}`;
    };
    
    const user = auth?.user;
    const [searchInput, setSearchInput] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== (filters.search || '')) {
                updateFilter('search', searchInput);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const updateFilter = (key, value) => {
        router.get('/admin/audit', { ...filters, [key]: value, page: 1 }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const goToPage = (page) => {
        router.get('/admin/audit', { ...filters, page }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        router.get('/admin/audit', { category: 'all', action_type: 'all', actor_id: 'all', date_range: '7days', search: '', page: 1 }, {
            preserveState: false,
        });
    };

    const hasActiveFilters = filters.category !== 'all' || filters.action_type !== 'all' || filters.actor_id !== 'all' || filters.search;

    return (
        <AdminLayout user={user} header="Audit Log" pendingCounts={pendingCounts}>
            <Head title="Audit Log | Super Admin" />

            <div className="max-w-7xl space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard label="Today" value={stats.total_today || 0} subtitle="actions today" icon={Activity} color="blue" />
                    <StatCard label="Last 7 Days" value={stats.total_7days || 0} subtitle="recent activity" icon={Calendar} color="emerald" />
                    <StatCard label="Active Admins" value={stats.unique_actors_7days || 0} subtitle="in last 7 days" icon={Users} color="amber" />
                    <StatCard label="All Time" value={stats.total_all_time || 0} subtitle="audit entries" icon={History} color="slate" />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                

                    {/* Filter bar */}
                    <div className="px-5 py-4 border-b border-slate-100 space-y-3">
                        {/* Category tabs */}
                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 flex-wrap">
                            <CategoryTab label="All" value="all" current={filters.category} onClick={updateFilter} count={categoryCounts.all} icon={Filter} />
                            <CategoryTab label="Admins" value="admin_management" current={filters.category} onClick={updateFilter} count={categoryCounts.admin_management} icon={Shield} />
                            <CategoryTab label="KYC" value="kyc" current={filters.category} onClick={updateFilter} count={categoryCounts.kyc} icon={FileCheck} />
                            <CategoryTab label="Users" value="user_management" current={filters.category} onClick={updateFilter} count={categoryCounts.user_management} icon={Users} />
                            <CategoryTab label="Transactions" value="transaction" current={filters.category} onClick={updateFilter} count={categoryCounts.transaction} icon={Receipt} />
                        </div>

                        {/* Secondary filters */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Date range */}
                                <select
                                    value={filters.date_range || '7days'}
                                    onChange={(e) => updateFilter('date_range', e.target.value)}
                                    className="text-[11px] font-bold border border-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-blue-400"
                                >
                                    <option value="today">Today</option>
                                    <option value="7days">Last 7 days</option>
                                    <option value="30days">Last 30 days</option>
                                    <option value="all">All time</option>
                                </select>

                                {/* Actor filter */}
                                <select
                                    value={filters.actor_id || 'all'}
                                    onChange={(e) => updateFilter('actor_id', e.target.value)}
                                    className="text-[11px] font-bold border border-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-blue-400"
                                >
                                    <option value="all">All admins</option>
                                    {actors.map(actor => (
                                        <option key={actor.id} value={actor.id}>{actor.name}</option>
                                    ))}
                                </select>

                                {/* Search */}
                                <div className="relative flex-1 max-w-md">
                                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                       <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="Search by reason or user name..."
                                        className="w-full pl-8 pr-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                                    />
                                </div>

                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                                    >
                                        <X size={11} />
                                        Clear filters
                                    </button>
                                )}

                                {/* Export CSV button */}
                                <button
                                    onClick={handleExport}
                                    disabled={logs.length === 0}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                                >
                                    <Download size={11} strokeWidth={2.5} />
                                    Export CSV
                                </button>
                            </div>
                        
                    </div>

                    {/* Audit log entries */}
                    {logs.length > 0 ? (
                            <>
                                {/* Table header */}
                                <div className="hidden md:grid grid-cols-12 items-center gap-3 px-5 py-2.5 bg-slate-50 border-b border-slate-200">
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Action</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Actor → Target</p>
                                    </div>
                                    <div className="col-span-3">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Reason</p>
                                    </div>
                                    <div className="col-span-3">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Metadata</p>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Date</p>
                                    </div>
                                </div>
                                
                                <div>
                                    {logs.map((log) => (
                                        <AuditLogEntry key={log.id} log={log} />
                                    ))}
                                </div>

                            {/* Pagination */}
                            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
                                <p className="text-[11px] text-slate-500 font-medium">
                                    Showing <span className="font-bold text-slate-900">{pagination.from}-{pagination.to}</span> of <span className="font-bold text-slate-900">{pagination.total_count}</span> entries
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
                                <History size={28} className="text-slate-400" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-bold text-slate-700 mb-1">No audit entries</p>
                            <p className="text-[11px] text-slate-500 font-medium">
                                {hasActiveFilters ? 'No entries match the filters' : 'No actions logged yet'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ label, value, subtitle, icon: Icon, color }) {
    const colorStyles = {
        blue: 'bg-blue-50 border-blue-200',
        emerald: 'bg-emerald-50 border-emerald-200',
        amber: 'bg-amber-50 border-amber-200',
        slate: 'bg-slate-50 border-slate-200',
    };
    const iconStyles = {
        blue: 'bg-blue-100 text-blue-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        amber: 'bg-amber-100 text-amber-700',
        slate: 'bg-slate-100 text-slate-700',
    };
    return (
        <div className={`rounded-xl border p-4 ${colorStyles[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{label}</p>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconStyles[color]}`}>
                    <Icon size={14} strokeWidth={2.5} />
                </div>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
            {subtitle && <p className="text-[10px] text-slate-500 font-medium mt-1">{subtitle}</p>}
        </div>
    );
}

function CategoryTab({ label, value, current, onClick, count, icon: Icon }) {
    const active = current === value;
    return (
        <button
            onClick={() => onClick('category', value)}
            className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
            }`}
        >
            <Icon size={11} strokeWidth={2.5} />
            {label}
            {count > 0 && (
                <span className={`text-[9px] font-black px-1 rounded-full ${
                    active ? 'bg-slate-200 text-slate-700' : 'bg-slate-200 text-slate-500'
                }`}>
                    {count}
                </span>
            )}
        </button>
    );
}

function AuditLogEntry({ log }) {
    const actionStyles = {
    // Admin management
    promote_admin: 'blue',
    change_role: 'amber',
    revoke_admin: 'red',
    update_profile: 'slate',
    update_setting: 'slate',
    toggle_maintenance: 'amber',
    // KYC
    kyc_approve: 'emerald',
    kyc_reject: 'red',
    // User management
    override_tier: 'amber',
    suspend_user: 'red',
    unsuspend_user: 'emerald',
    force_logout: 'amber',
    // Transaction
    flag_transaction: 'red',
    unflag_transaction: 'emerald',
    resolve_transaction: 'blue',
    reopen_transaction: 'amber',
    manual_credit: 'emerald',
};
    
    const color = actionStyles[log.action_type] || 'slate';
    
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        red: 'bg-red-50 text-red-700 border-red-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        slate: 'bg-slate-50 text-slate-700 border-slate-200',
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 px-5 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
            {/* Action badge — col-span-2 */}
            <div className="md:col-span-2">
                <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded border ${colorClasses[color]}`}>
                    {log.action_label}
                </span>
            </div>

            {/* Actor → Target — col-span-2 */}
            <div className="md:col-span-2 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-900 truncate">
                        {log.actor?.name || 'System'}
                    </span>
                    {log.target_user && (
                        <>
                            <ArrowRight size={10} className="text-slate-400 shrink-0" />
                            <span className="text-[11px] font-bold text-slate-700 truncate">
                                {log.target_user.name}
                            </span>
                        </>
                    )}
                </div>
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                    {log.category_label}
                </p>
            </div>

            {/* Reason — col-span-3 */}
            <div className="md:col-span-3 min-w-0">
                <p className="text-[11px] text-slate-600 font-medium italic line-clamp-2">
                    "{log.reason}"
                </p>
            </div>

            {/* Metadata — col-span-3 */}
            <div className="md:col-span-3 min-w-0">
                {log.metadata && Object.keys(log.metadata).length > 0 ? (
                    <div className="flex items-center gap-1 flex-wrap">
                        {log.metadata.old_role && log.metadata.new_role && (
                            <MetadataChip label={`${log.metadata.old_role.replace('_', ' ')} → ${log.metadata.new_role.replace('_', ' ')}`} variant="role" />
                        )}
                        {log.metadata.old_tier && log.metadata.new_tier && (
                            <MetadataChip label={`T${log.metadata.old_tier} → T${log.metadata.new_tier}`} variant="tier" />
                        )}
                        {log.metadata.original_tier && log.metadata.target_tier && (
                            <MetadataChip label={`T${log.metadata.original_tier} → T${log.metadata.target_tier}`} variant="tier" />
                        )}
                        {log.metadata.amount_cents && (
                            <MetadataChip label={`₱${(log.metadata.amount_cents / 100).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} variant="amount" />
                        )}
                        {log.metadata.reference_id && (
                            <MetadataChip label={`#${log.metadata.reference_id}`} variant="ref" />
                        )}
                        {log.metadata.resolution_type && (
                            <MetadataChip label={log.metadata.resolution_type.toUpperCase()} variant="status" />
                        )}
                        {log.metadata.role_granted && (
                            <MetadataChip label={log.metadata.role_granted.replace('_', ' ').toUpperCase()} variant="role" />
                        )}
                        {log.metadata.setting_label && (
                            <MetadataChip label={log.metadata.setting_label} variant="ref" />
                        )}
                        {log.metadata.setting_key === 'maintenance_mode' && log.metadata.new_value !== undefined && (
                            <MetadataChip 
                                label={log.metadata.new_value === '1' ? 'ENABLED' : 'DISABLED'} 
                                variant={log.metadata.new_value === '1' ? 'status' : 'status'} 
                            />
                        )}
                        {log.metadata.changes && (
                            <MetadataChip label="PROFILE EDIT" variant="ref" />
                        )}
                    </div>
                ) : (
                    <span className="text-[10px] text-slate-400 font-medium">—</span>
                )}
            </div>

            {/* Date — col-span-2 */}
            <div className="md:col-span-2 text-right">
                <p className="text-[10px] font-bold text-slate-700">{log.created_relative}</p>
                <p className="text-[9px] text-slate-400 font-medium">{log.created_at}</p>
            </div>
        </div>
    );
}
function MetadataChip({ label, variant = 'default' }) {
    const variantStyles = {
        default: 'bg-slate-100 text-slate-600 border-slate-200',
        role: 'bg-amber-50 text-amber-700 border-amber-200',
        tier: 'bg-blue-50 text-blue-700 border-blue-200',
        amount: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        ref: 'bg-purple-50 text-purple-700 border-purple-200',
        status: 'bg-slate-100 text-slate-700 border-slate-300',
    };
    return (
        <span className={`inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${variantStyles[variant]}`}>
            {label}
        </span>
    );
}