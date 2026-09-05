// resources/js/Pages/Admin/AdminsList.jsx
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
// Shared with the dashboard, user list and transactions — this was the second
// of three private copies, each with its own colour map.
import StatCard from '../../Components/Admin/StatCard';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
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
                    <StatCard label="Total Admins" value={counts.total || 0} icon={Shield} color="neutral" />
                    <StatCard label="Super Admins" value={counts.super_admin || 0} icon={Crown} color="accent" />
                    <StatCard label="Admins" value={counts.admin || 0} icon={ShieldCheck} color="primary" />
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-muted border-b border-border">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-accent/15 rounded-lg flex items-center justify-center shrink-0">
                                <Crown size={16} className="text-accent-foreground" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-foreground">Admin Accounts</h2>
                                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                                    Manage admin roles and permissions. Super Admin actions are logged.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* The audit log lived here as well, showing the same rows the
                        dedicated Audit Log page already lists — two places to read
                        the same history, one of which could silently fall behind.
                        A link points at the single source instead. */}
                    {/* Toolbar */}
                    <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-border">
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search admin name or email..."
                                className="pl-8 pr-3 py-1.5 text-xs font-medium border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all w-72"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                        <Link
                            href="/admin/audit?category=admin_management"
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            <History size={14} /> View audit log
                        </Link>

                        <button
                            onClick={() => setPromoteModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-black rounded-lg shadow-md shadow-primary/25 transition-all cursor-pointer"
                        >
                            <UserPlus size={14} strokeWidth={2.5} />
                            Promote User to Admin
                        </button>
                        </div>
                    </div>

                    {admins.length > 0 ? (
                        <>
                            {/* Table header */}
                            <div className="hidden sm:grid grid-cols-12 items-center gap-3 px-5 py-2.5 bg-muted border-b border-border">
                                <div className="col-span-5">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Admin</p>
                                </div>
                                <div className="col-span-2 text-center">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Role</p>
                                </div>
                                <div className="hidden md:block col-span-2 text-center">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Granted</p>
                                </div>
                                <div className="hidden md:block col-span-2 text-center">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Granted By</p>
                                </div>
                                <div className="col-span-1 text-center">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Actions</p>
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
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield size={28} className="text-muted-foreground" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-bold text-foreground mb-1">No admins found</p>
                            <p className="text-[11px] text-muted-foreground font-medium">
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



function AdminRow({ admin, onChangeRole, onRevoke }) {
    
    return (
        <div className="grid grid-cols-12 items-center gap-3 px-5 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0">
            {/* Admin info */}
            <div className="col-span-12 sm:col-span-5 flex items-center gap-3 min-w-0">
                <Avatar src={admin.profile_picture} name={admin.name} size="md" />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-foreground truncate">{admin.name}</p>
                        {admin.is_self && (
                            <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/25 px-1 rounded">YOU</span>
                        )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium truncate">{admin.email}</p>
                </div>
            </div>

            {/* Role */}
            <div className="hidden sm:flex justify-center col-span-2">
                <RoleBadge role={admin.admin_role} />
            </div>

            {/* Granted */}
            <div className="hidden md:flex flex-col items-center col-span-2">
                <p className="text-[11px] font-bold text-foreground">{admin.granted_at || '—'}</p>
                <p className="text-[9px] text-muted-foreground font-medium">{admin.granted_relative || ''}</p>
            </div>

            {/* Granted by */}
            <div className="hidden md:flex justify-center col-span-2">
                <p className="text-[11px] font-bold text-foreground truncate">
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
                                    className="p-1.5 bg-accent/10 hover:bg-accent/15 border border-accent/30 rounded text-accent-foreground transition-colors cursor-pointer"
                                >
                                    <Edit size={12} strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={onRevoke}
                                    title="Revoke Access"
                                    className="p-1.5 bg-destructive/10 hover:bg-destructive/15 border border-destructive/25 rounded text-destructive transition-colors cursor-pointer"
                                >
                                    <Ban size={12} strokeWidth={2.5} />
                                </button>
                            </>
                        ) : (
                            <span className="text-[10px] font-bold text-muted-foreground">—</span>
                        )}
                    </div>
        </div>
    );
}

function RoleBadge({ role }) {
    if (role === 'super_admin') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent-foreground border border-accent/30 text-[9px] font-bold uppercase tracking-widest rounded">
                <Crown size={9} strokeWidth={2.5} />
                Super Admin
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary border border-primary/25 text-[9px] font-bold uppercase tracking-widest rounded">
            <ShieldCheck size={9} strokeWidth={2.5} />
            Admin
        </span>
    );
}