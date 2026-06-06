// resources/js/Pages/Admin/Dashboard.jsx
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import StatCard from '../../Components/Admin/StatCard';
import { 
    FileCheck, Users, TrendingUp, Activity, 
    Clock, CheckCircle2, AlertCircle, ArrowRight 
} from 'lucide-react';

export default function AdminDashboard({ auth, stats = null, recent_kyc = [], pendingCounts = {} }) {
    const user = auth?.user;

    // Default stats if not yet wired up
    const defaultStats = {
        pending_kyc: 0,
        approved_today: 0,
        total_users: 0,
        active_today: 0,
        trends: {},
    };
    const s = stats || defaultStats;

    const breadcrumbs = [
        { label: 'Admin', href: '/admin' },
        { label: 'Dashboard' },
    ];

    return (
        <AdminLayout 
            user={user} 
            breadcrumbs={breadcrumbs}
            pendingCounts={pendingCounts}
        >
            <Head title="Admin Dashboard | Youth MoneyBank" />

            <div className="max-w-7xl">
                {/* PAGE HEADING */}
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                        Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        Welcome back, <span className="font-bold text-slate-700">{user?.name}</span>. Here's what's happening today.
                    </p>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <StatCard 
                        label="Pending KYC"
                        value={s.pending_kyc}
                        icon={Clock}
                        color="amber"
                        onClick={() => window.location.href = '/admin/kyc?status=pending'}
                    />
                    <StatCard 
                        label="Approved Today"
                        value={s.approved_today}
                        icon={CheckCircle2}
                        color="emerald"
                        trend={s.trends?.approved ? { value: s.trends.approved, direction: 'up' } : null}
                    />
                    <StatCard 
                        label="Total Users"
                        value={s.total_users.toLocaleString()}
                        icon={Users}
                        color="blue"
                    />
                    <StatCard 
                        label="Active Today"
                        value={s.active_today}
                        icon={Activity}
                        color="purple"
                    />
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    
                    {/* RECENT KYC SUBMISSIONS — 2 cols */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 tracking-tight">Recent KYC Submissions</h3>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Latest applications awaiting review</p>
                            </div>
                            <Link 
                                href="/admin/kyc"
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                            >
                                View All
                                <ArrowRight size={11} strokeWidth={2.5} />
                            </Link>
                        </div>
                        
                        {recent_kyc.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {recent_kyc.map((app) => (
                                    <Link
                                        key={app.id}
                                        href={`/admin/kyc/${app.id}`}
                                        className="block px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                    {(app.user_name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{app.user_name}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium truncate">
                                                        Target Tier {app.target_tier} · {app.submitted_relative}
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusBadge status={app.status} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <FileCheck size={32} className="text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
                                <p className="text-sm font-bold text-slate-700">No pending applications</p>
                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">All caught up!</p>
                            </div>
                        )}
                    </div>

                    {/* PENDING ACTIONS — 1 col */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">Pending Actions</h3>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Items needing your attention</p>
                        </div>
                        <div className="p-3 space-y-2">
                            {s.pending_kyc > 0 && (
                                <Link 
                                    href="/admin/kyc?status=pending"
                                    className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                                >
                                    <Clock size={16} className="text-amber-600 shrink-0" strokeWidth={2.5} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-amber-900">{s.pending_kyc} KYC review{s.pending_kyc > 1 ? 's' : ''}</p>
                                        <p className="text-[9px] text-amber-700">Awaiting your decision</p>
                                    </div>
                                    <ArrowRight size={12} className="text-amber-600 shrink-0" />
                                </Link>
                            )}

                            {s.pending_kyc === 0 && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-emerald-900">All clear!</p>
                                        <p className="text-[9px] text-emerald-700">No pending tasks</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SYSTEM HEALTH (Super Admin only) */}
                {user?.admin_role === 'super_admin' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <h3 className="text-sm font-black text-slate-900 tracking-tight mb-3">System Health</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <HealthIndicator label="Database" status="operational" />
                            <HealthIndicator label="API Endpoints" status="operational" />
                            <HealthIndicator label="File Storage" status="operational" />
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

// Status badge sa list
function StatusBadge({ status }) {
    const styles = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
    };
    const label = status?.toUpperCase() || 'UNKNOWN';
    const style = styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
    return (
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${style} shrink-0`}>
            {label}
        </span>
    );
}

// System health indicator
function HealthIndicator({ label, status }) {
    const isOk = status === 'operational';
    return (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className={`w-2 h-2 rounded-full ${isOk ? 'bg-emerald-500' : 'bg-red-500'} ${isOk ? 'animate-pulse' : ''}`}></div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                <p className={`text-xs font-bold ${isOk ? 'text-emerald-700' : 'text-red-700'}`}>
                    {isOk ? 'Operational' : 'Degraded'}
                </p>
            </div>
        </div>
    );
}