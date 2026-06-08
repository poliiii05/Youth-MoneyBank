// resources/js/Components/Admin/Dashboard/RecentKycCard.jsx
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, FileCheck } from 'lucide-react';

export default function RecentKycCard({ applications = [] }) {
    const [filter, setFilter] = useState('all');

    const filteredKyc = applications.filter(app => {
        if (filter === 'pending') return app.status === 'pending';
        if (filter === 'today') {
            const today = new Date().toDateString();
            const appDate = new Date(app.submitted_at).toDateString();
            return today === appDate;
        }
        return true;
    });

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">Recent KYC</h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Latest applications</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <FilterTabs filter={filter} onChange={setFilter} />
                    <Link 
                        href="/admin/kyc"
                        className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] uppercase tracking-wider rounded-md transition-all cursor-pointer"
                    >
                        View All
                        <ArrowRight size={10} strokeWidth={2.5} />
                    </Link>
                </div>
            </div>

            {filteredKyc.length > 0 ? (
                <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-72">
                    {filteredKyc.map((app) => (
                        <Link
                            key={app.id}
                            href={`/admin/kyc/${app.id}`}
                            className="block px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                                        {(app.user_name || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-slate-900 truncate">{app.user_name}</p>
                                        <p className="text-[10px] text-slate-500 font-medium truncate">
                                            Tier {app.target_tier} · {app.submitted_relative}
                                        </p>
                                    </div>
                                </div>
                                <StatusBadge status={app.status} />
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                        <FileCheck size={28} className="text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
                        <p className="text-xs font-bold text-slate-700">
                            {filter === 'pending' && 'No pending applications'}
                            {filter === 'today' && 'No submissions today'}
                            {filter === 'all' && 'No applications yet'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function FilterTabs({ filter, onChange }) {
    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'pending', label: 'Pending' },
        { id: 'today', label: 'Today' },
    ];
    return (
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                        filter === tab.id
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

function StatusBadge({ status }) {
    const styles = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
    };
    const label = status?.toUpperCase() || 'UNKNOWN';
    const style = styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
    return (
        <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${style} shrink-0`}>
            {label}
        </span>
    );
}