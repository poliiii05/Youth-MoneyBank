// resources/js/Pages/Admin/KycList.jsx
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import { 
    Search, Clock, CheckCircle2, XCircle, FileCheck,
    ChevronLeft, ChevronRight, ChevronDown,
} from 'lucide-react';

export default function KycList({ 
    auth, 
    applications = [], 
    pagination = {}, 
    filters = {}, 
    counts = {},
    pendingCounts = {} 
}) {
    const user = auth?.user;
    const [searchInput, setSearchInput] = useState(filters.search || '');

    // Change filter
    const setFilter = (status) => {
        router.get('/admin/kyc', { ...filters, status, page: 1 }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Search
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/kyc', { ...filters, search: searchInput, page: 1 }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Pagination
    const goToPage = (page) => {
        router.get('/admin/kyc', { ...filters, page }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout user={user} header="KYC Reviews" pendingCounts={pendingCounts}>
            <Head title="KYC Reviews | Admin" />

            <div className="max-w-7xl space-y-4">
                {/* FILTER TABS */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-slate-100">
                        <FilterTabs current={filters.status || 'all'} counts={counts} onChange={setFilter} />
                        
                        {/* Search box */}
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="pl-8 pr-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all w-60"
                                />
                            </div>
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchInput('');
                                        router.get('/admin/kyc', { ...filters, search: '', page: 1 }, {
                                            preserveState: true, preserveScroll: true,
                                        });
                                    }}
                                    className="px-2 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                                >
                                    Clear
                                </button>
                            )}
                        </form>
                    </div>

                    {/* APPLICATIONS LIST */}
                    {applications.length > 0 ? (
                        <>
                            <div className="divide-y divide-slate-100">
                                {applications.map((app) => (
                                    <KycListItem key={app.id} application={app} />
                                ))}
                            </div>

                            {/* PAGINATION */}
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
                        <div className="p-12 text-center">
                            <FileCheck size={40} className="text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
                            <p className="text-sm font-bold text-slate-700">
                                {filters.status === 'pending' && 'No pending applications'}
                                {filters.status === 'approved' && 'No approved applications'}
                                {filters.status === 'rejected' && 'No rejected applications'}
                                {(!filters.status || filters.status === 'all') && 'No applications yet'}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">
                                {filters.search ? 'Try adjusting your search' : 'Applications will appear here'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

// Filter tabs component
function FilterTabs({ current, counts, onChange }) {
    const tabs = [
        { id: 'all', label: 'All', icon: null, color: 'slate' },
        { id: 'pending', label: 'Pending', icon: Clock, color: 'amber' },
        { id: 'approved', label: 'Approved', icon: CheckCircle2, color: 'emerald' },
        { id: 'rejected', label: 'Rejected', icon: XCircle, color: 'red' },
    ];

    return (
        <div className="flex items-center gap-1 flex-wrap">
            {tabs.map((tab) => {
                const isActive = current === tab.id;
                const count = counts[tab.id] || 0;
                const Icon = tab.icon;

                const activeStyles = {
                    slate: 'bg-slate-900 text-white',
                    amber: 'bg-amber-500 text-white',
                    emerald: 'bg-emerald-600 text-white',
                    red: 'bg-red-600 text-white',
                };

                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            isActive
                                ? `${activeStyles[tab.color]} shadow-sm font-bold`
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold'
                        }`}
                    >
                        {Icon && <Icon size={11} strokeWidth={2.5} />}
                        <span className="text-[11px]">{tab.label}</span>
                        <span className={`text-[9px] font-black px-1.5 rounded-full ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

// Single list item component
function KycListItem({ application }) {
    return (
        <Link
            href={`/admin/kyc/${application.id}`}
            className="block px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
        >
            <div className="flex items-center gap-3">
                {/* Avatar */}
                {application.user.profile_picture ? (
                    <img 
                        src={application.user.profile_picture} 
                        alt={application.user.name}
                        className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {(application.user.name || '?').charAt(0).toUpperCase()}
                    </div>
                )}

                {/* User info */}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{application.user.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium truncate">{application.user.email}</p>
                </div>

                {/* Tier */}
                <div className="hidden sm:flex flex-col items-center gap-0.5 shrink-0 min-w-[80px]">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tier</p>
                    <p className="text-xs font-black text-slate-900">
                        T{application.user.current_tier} → T{application.target_tier}
                    </p>
                </div>

                {/* Submitted */}
                <div className="hidden md:flex flex-col items-center gap-0.5 shrink-0 min-w-[100px]">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Submitted</p>
                    <p className="text-[11px] font-bold text-slate-700">{application.submitted_relative}</p>
                </div>

                {/* Status badge */}
                <StatusBadge status={application.status} autoApproved={application.auto_approved} />

                {/* Arrow */}
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
            </div>
        </Link>
    );
}

// Status badge
function StatusBadge({ status, autoApproved }) {
    const styles = {
        pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'PENDING' },
        approved: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: autoApproved ? 'AUTO-APPROVED' : 'APPROVED' },
        rejected: { color: 'bg-red-50 text-red-700 border-red-200', label: 'REJECTED' },
    };
    const style = styles[status] || { color: 'bg-slate-50 text-slate-700 border-slate-200', label: 'UNKNOWN' };
    return (
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${style.color} shrink-0`}>
            {style.label}
        </span>
    );
}