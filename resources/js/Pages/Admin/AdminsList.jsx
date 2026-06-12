// resources/js/Pages/Admin/AdminsList.jsx
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import Avatar from '../../Components/Admin/Avatar';
import PromoteAdminModal from '../../Components/Admin/Admins/PromoteAdminModal';
import ChangeRoleModal from '../../Components/Admin/Admins/ChangeRoleModal';
import RevokeAdminModal from '../../Components/Admin/Admins/RevokeAdminModal';
import { 
    Search, Shield, ShieldCheck, UserPlus, 
    Edit, Ban, Crown, History, ArrowRight,
} from 'lucide-react';

export default function AdminsList({ 
    auth, 
    admins = [], 
    counts = {},
    filters = {},
    auditLogs = [],
    pendingCounts = {} 
}) {
    const user = auth?.user;
    const [searchInput, setSearchInput] = useState(filters.search || '');
    const [promoteModalOpen, setPromoteModalOpen] = useState(false);
    const [changeRoleAdmin, setChangeRoleAdmin] = useState(null);
    const [revokeAdmin, setRevokeAdmin] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== (filters.search || '')) {
                router.get('/admin/admins', { search: searchInput }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    return (
        <AdminLayout user={user} header="Admin Management" pendingCounts={pendingCounts}>
            <Head title="Admin Management | Super Admin" />

            <div className="max-w-6xl space-y-4">
                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Total Admins" value={counts.total || 0} icon={Shield} color="slate" />
                    <StatCard label="Super Admins" value={counts.super_admin || 0} icon={Crown} color="amber" />
                    <StatCard label="Admins" value={counts.admin || 0} icon={ShieldCheck} color="blue" />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-slate-50 border-b border-slate-200">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                                <Crown size={16} className="text-amber-700" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-slate-900">Admin Accounts</h2>
                                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                                    Manage admin roles and permissions. Super Admin actions are logged.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Audit Log section */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                <History size={16} className="text-slate-700" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-slate-900">Audit Log</h2>
                                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                                    Recent admin role changes (last 20 actions)
                                </p>
                            </div>
                        </div>
                    </div>

                    {auditLogs.length > 0 ? (
                        <div>
                            {auditLogs.map((log) => (
                                <AuditLogRow key={log.id} log={log} />
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-center">
                            <p className="text-xs text-slate-500 font-medium">No audit log entries yet.</p>
                        </div>
                    )}
                </div>

                    {/* Toolbar */}
                    <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-slate-100">
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search admin name or email..."
                                className="pl-8 pr-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all w-72"
                            />
                        </div>
                        <button
                            onClick={() => setPromoteModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-lg shadow-md shadow-blue-200 transition-all cursor-pointer"
                        >
                            <UserPlus size={14} strokeWidth={2.5} />
                            Promote User to Admin
                        </button>
                    </div>

                    {admins.length > 0 ? (
                        <>
                            {/* Table header */}
                            <div className="hidden sm:grid grid-cols-12 items-center gap-3 px-5 py-2.5 bg-slate-50 border-b border-slate-200">
                                <div className="col-span-5">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Admin</p>
                                </div>
                                <div className="col-span-2 text-center">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Role</p>
                                </div>
                                <div className="hidden md:block col-span-2 text-center">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Granted</p>
                                </div>
                                <div className="hidden md:block col-span-2 text-center">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Granted By</p>
                                </div>
                                <div className="col-span-1 text-center">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Actions</p>
                                </div>
                            </div>

                            {/* Rows */}
                            <div>
                               {admins.map((adm) => (
                                    <AdminRow 
                                        key={adm.id} 
                                        admin={adm}
                                        onChangeRole={() => setChangeRoleAdmin(adm)}
                                        onRevoke={() => setRevokeAdmin(adm)}
                                    />
                                ))}
                                                            </div>
                        </>
                    ) : (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield size={28} className="text-slate-400" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-bold text-slate-700 mb-1">No admins found</p>
                            <p className="text-[11px] text-slate-500 font-medium">
                                {filters.search ? `No matches for "${filters.search}"` : 'Promote users to add admins'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <PromoteAdminModal 
                isOpen={promoteModalOpen}
                onClose={() => setPromoteModalOpen(false)}
            />
            
            {changeRoleAdmin && (
                <ChangeRoleModal 
                    isOpen={!!changeRoleAdmin}
                    onClose={() => setChangeRoleAdmin(null)}
                    admin={changeRoleAdmin}
                />
            )}
            
            {revokeAdmin && (
                <RevokeAdminModal 
                    isOpen={!!revokeAdmin}
                    onClose={() => setRevokeAdmin(null)}
                    admin={revokeAdmin}
                />
            )}
        </AdminLayout>
    );
}

function StatCard({ label, value, icon: Icon, color }) {
    const colorStyles = {
        slate: 'bg-slate-50 border-slate-200',
        amber: 'bg-amber-50 border-amber-200',
        blue: 'bg-blue-50 border-blue-200',
    };
    const iconStyles = {
        slate: 'bg-slate-100 text-slate-700',
        amber: 'bg-amber-100 text-amber-700',
        blue: 'bg-blue-100 text-blue-700',
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
        </div>
    );
}

function AdminRow({ admin, onChangeRole, onRevoke }) {
    
    return (
        <div className="grid grid-cols-12 items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0">
            {/* Admin info */}
            <div className="col-span-12 sm:col-span-5 flex items-center gap-3 min-w-0">
                <Avatar src={admin.profile_picture} name={admin.name} size="md" />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 truncate">{admin.name}</p>
                        {admin.is_self && (
                            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1 rounded">YOU</span>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{admin.email}</p>
                </div>
            </div>

            {/* Role */}
            <div className="hidden sm:flex justify-center col-span-2">
                <RoleBadge role={admin.admin_role} />
            </div>

            {/* Granted */}
            <div className="hidden md:flex flex-col items-center col-span-2">
                <p className="text-[11px] font-bold text-slate-700">{admin.granted_at || '—'}</p>
                <p className="text-[9px] text-slate-500 font-medium">{admin.granted_relative || ''}</p>
            </div>

            {/* Granted by */}
            <div className="hidden md:flex justify-center col-span-2">
                <p className="text-[11px] font-bold text-slate-700 truncate">
                    {admin.granted_by?.name || '—'}
                </p>
            </div>

           {/* Actions — inline buttons */}
                    <div className="col-span-12 sm:col-span-1 flex justify-end items-center gap-1">
                        {!admin.is_self ? (
                            <>
                                <button
                                    onClick={onChangeRole}
                                    title="Change Role"
                                    className="p-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded text-amber-700 transition-colors cursor-pointer"
                                >
                                    <Edit size={12} strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={onRevoke}
                                    title="Revoke Access"
                                    className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-700 transition-colors cursor-pointer"
                                >
                                    <Ban size={12} strokeWidth={2.5} />
                                </button>
                            </>
                        ) : (
                            <span className="text-[10px] font-bold text-slate-400">—</span>
                        )}
                    </div>
        </div>
    );
}

function RoleBadge({ role }) {
    if (role === 'super_admin') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold uppercase tracking-widest rounded">
                <Crown size={9} strokeWidth={2.5} />
                Super Admin
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold uppercase tracking-widest rounded">
            <ShieldCheck size={9} strokeWidth={2.5} />
            Admin
        </span>
    );
}

function AuditLogRow({ log }) {
    const actionStyles = {
        promote_admin: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
        change_role: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
        revoke_admin: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    };
    const style = actionStyles[log.action_type] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
    
    return (
        <div className="px-5 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-3">
                {/* Action badge */}
                <div className="shrink-0">
                    <span className={`inline-flex items-center text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${style.bg} ${style.text} ${style.border}`}>
                        {log.action_label}
                    </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                        <span className="font-bold text-slate-900">{log.actor?.name || 'System'}</span>
                        <ArrowRight size={11} className="text-slate-400" />
                        <span className="font-bold text-slate-700">{log.target_user?.name || 'Unknown User'}</span>
                        {log.metadata?.old_role && log.metadata?.new_role && (
                            <>
                                <span className="text-slate-400">·</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">
                                    {log.metadata.old_role.replace('_', ' ')} → {log.metadata.new_role.replace('_', ' ')}
                                </span>
                            </>
                        )}
                        {log.metadata?.role_granted && (
                            <>
                                <span className="text-slate-400">·</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">
                                    {log.metadata.role_granted.replace('_', ' ')}
                                </span>
                            </>
                        )}
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium mt-1 italic">
                        "{log.reason}"
                    </p>
                </div>

                {/* Timestamp */}
                <div className="shrink-0 text-right">
                    <p className="text-[10px] font-bold text-slate-700">{log.created_relative}</p>
                    <p className="text-[9px] text-slate-500 font-medium">{log.created_at}</p>
                </div>
            </div>
        </div>
    );
}