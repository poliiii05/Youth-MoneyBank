// resources/js/Pages/Admin/UserDetail.jsx
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import Avatar from '../../Components/Admin/Avatar';
import OverrideTierModal from '../../Components/Admin/Users/OverrideTierModal';
import SuspendUserModal from '../../Components/Admin/Users/SuspendUserModal';
import ForceLogoutModal from '../../Components/Admin/Users/ForceLogoutModal';
import { 
    ChevronLeft, Mail, CreditCard, Calendar, UserX, 
    Check, Shield, Wallet, PiggyBank, TrendingUp,
    AlertTriangle, LogOut, Settings, ArrowUp, ArrowDown,
    Ban, CheckCircle2,
} from 'lucide-react';

export default function UserDetail({ 
    auth, 
    targetUser, 
    balances, 
    stats, 
    recent_transactions = [], 
    kyc_history = [],
    pendingCounts = {} 
}) {
    const user = auth?.user;
    const [overrideOpen, setOverrideOpen] = useState(false);
    const [suspendOpen, setSuspendOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);

    const isSuperAdmin = user?.admin_role === 'super_admin';

    const formatPeso = (amount) => '₱' + Number(amount).toLocaleString('en-PH', { 
        minimumFractionDigits: 2, maximumFractionDigits: 2 
    });

    const formatPesoShort = (amount) => {
        if (amount >= 1000000) return '₱' + (amount / 1000000).toFixed(1) + 'M';
        if (amount >= 1000) return '₱' + (amount / 1000).toFixed(1) + 'K';
        return '₱' + amount.toFixed(0);
    };

    return (
        <AdminLayout user={user} header={`User #${targetUser.id}`} pendingCounts={pendingCounts}>
            <Head title={`${targetUser.name} | User Management`} />

            <div className="max-w-6xl space-y-4">
                {/* Back link */}
                <Link 
                    href="/admin/users"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    <ChevronLeft size={14} strokeWidth={2.5} />
                    Back to Users
                </Link>

                {/* Suspension banner */}
                {targetUser.deactivated_at && (
                    <div className="rounded-xl border border-border bg-muted p-3 flex items-start gap-2.5">
                        <UserX size={15} className="text-muted-foreground mt-0.5 shrink-0" strokeWidth={2.5} />
                        <div>
                            <p className="text-xs font-bold text-foreground">Account deactivated by the user</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Closed on {targetUser.deactivated_at}. They cannot sign in until it is reopened.
                            </p>
                        </div>
                    </div>
                )}

                {targetUser.is_suspended && (
                    <div className="bg-destructive/10 border border-destructive/25 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Ban size={20} className="text-destructive shrink-0 mt-0.5" strokeWidth={2.5} />
                            <div className="flex-1">
                                <p className="text-sm font-black text-red-900 mb-1">Account Suspended</p>
                                <p className="text-xs text-destructive">
                                    <span className="font-bold">Reason:</span> {targetUser.suspension_reason}
                                </p>
                                <p className="text-[10px] text-destructive font-medium mt-1">
                                    Suspended on {targetUser.suspended_at}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* User header card */}
                <Card className="bg-card p-5">
                    <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <Avatar 
                                src={targetUser.profile_picture}
                                name={targetUser.name}
                                size="lg"
                            />
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-lg font-black text-foreground tracking-tight">{targetUser.name}</h1>
                                    {targetUser.email_verified && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-success/10 text-success border border-success/25 text-[9px] font-bold uppercase tracking-widest rounded">
                                            <Check size={9} strokeWidth={3} />
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground font-medium">{targetUser.email}</p>
                            </div>
                        </div>
                        <TierBadge tier={targetUser.kyc_tier} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
                        <Stat label="User ID" value={`#${targetUser.id}`} />
                        <Stat label="Account #" value={targetUser.account_number} />
                        <Stat label="Member Since" value={targetUser.member_since} />
                        <Stat label="Last Active" value={targetUser.last_active} />
                    </div>
                </Card>

                {/* Balance cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <BalanceCard 
                        label="Wallet Balance" 
                        amount={balances.wallet} 
                        icon={Wallet}
                        color="wallet"
                        formatPeso={formatPeso}
                    />
                    <BalanceCard 
                        label="Savings Balance" 
                        amount={balances.savings} 
                        icon={PiggyBank}
                        color="savings"
                        formatPeso={formatPeso}
                    />
                    <BalanceCard 
                        label="Total Balance" 
                        amount={balances.total} 
                        icon={TrendingUp}
                        color="total"
                        formatPeso={formatPeso}
                    />
                </div>

                {/* Two-column: User Info + Recent Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    
                    {/* User Information */}
                    <Card className="bg-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-border">
                            <h3 className="text-sm font-black text-foreground tracking-tight">User Information</h3>
                        </div>
                        <div className="p-5 space-y-3">
                            <InfoRow icon={Mail} label="Email" value={targetUser.email} />
                            <InfoRow icon={CreditCard} label="Account #" value={targetUser.account_number} />
                            <InfoRow icon={Calendar} label="Joined" value={targetUser.member_since} />
                            <InfoRow icon={Shield} label="Google Linked" value={targetUser.google_linked ? 'Yes' : 'No'} />
                        </div>
                    </Card>

                    {/* Recent Transactions */}
                    <Card className="lg:col-span-2 overflow-hidden">
                        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-foreground tracking-tight">Recent Transactions</h3>
                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                    Total: {stats.total_transactions} · Volume: {formatPesoShort(stats.total_volume)}
                                </p>
                            </div>
                        </div>
                        {recent_transactions.length > 0 ? (
                            <div className="divide-y divide-border max-h-80 overflow-y-auto">
                                {recent_transactions.map((tx) => (
                                    <div key={tx.id} className="px-5 py-3 hover:bg-muted transition-colors">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                    tx.is_positive 
                                                        ? 'bg-success/15 text-success' 
                                                        : 'bg-destructive/15 text-destructive'
                                                }`}>
                                                    {tx.is_positive 
                                                        ? <ArrowDown size={12} strokeWidth={2.5} />
                                                        : <ArrowUp size={12} strokeWidth={2.5} />
                                                    }
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-foreground truncate">{tx.title}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium truncate">{tx.created_relative}</p>
                                                </div>
                                            </div>
                                            <p className={`text-xs font-black shrink-0 ${
                                                tx.is_positive ? 'text-success' : 'text-destructive'
                                            }`}>
                                                {tx.is_positive ? '+' : '-'}{formatPeso(tx.amount)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-xs text-muted-foreground font-medium">No transactions yet</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* KYC History */}
                {kyc_history.length > 0 && (
                    <Card className="bg-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-border">
                            <h3 className="text-sm font-black text-foreground tracking-tight">KYC History</h3>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                {stats.kyc_applications} application{stats.kyc_applications !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="divide-y divide-border">
                            {kyc_history.map((app) => (
                                <Link
                                    key={app.id}
                                    href={`/admin/kyc/${app.id}`}
                                    className="flex items-center justify-between px-5 py-3 hover:bg-muted transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs font-black text-foreground">
                                            T{app.original_tier} → T{app.target_tier}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-foreground">App #{app.id}</p>
                                            <p className="text-[9px] text-muted-foreground font-medium">{app.submitted_relative}</p>
                                        </div>
                                    </div>
                                    <KycStatusBadge status={app.status} />
                                </Link>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Admin Actions */}
                <Card className="bg-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-foreground tracking-tight">Admin Actions</h3>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                {isSuperAdmin 
                                    ? 'Super Admin privileges enabled' 
                                    : 'Only Super Admin can perform these actions'
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 border border-accent/30 rounded">
                            <Settings size={11} className="text-accent-foreground" strokeWidth={2.5} />
                            <span className="text-[9px] font-bold text-accent-foreground uppercase tracking-widest">Restricted</span>
                        </div>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Override Tier */}
                        <button
                            onClick={() => isSuperAdmin && setOverrideOpen(true)}
                            disabled={!isSuperAdmin}
                            className="flex flex-col items-start gap-2 p-4 border border-border hover:border-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-card text-left group"
                            title={!isSuperAdmin ? 'Super Admin only' : ''}
                        >
                            <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                                <TrendingUp size={16} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-foreground mb-0.5">Override Tier</p>
                                <p className="text-[10px] text-muted-foreground font-medium">Manually adjust KYC tier</p>
                            </div>
                        </button>

                        {/* Suspend/Activate */}
                        <button
                            onClick={() => isSuperAdmin && setSuspendOpen(true)}
                            disabled={!isSuperAdmin}
                            className={`flex flex-col items-start gap-2 p-4 border rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-card text-left group ${
                                targetUser.is_suspended
                                    ? 'border-border hover:border-emerald-400 hover:bg-success/10'
                                    : 'border-border hover:border-red-400 hover:bg-destructive/10'
                            }`}
                            title={!isSuperAdmin ? 'Super Admin only' : ''}
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                targetUser.is_suspended
                                    ? 'bg-success/15 text-success'
                                    : 'bg-destructive/15 text-destructive'
                            }`}>
                                {targetUser.is_suspended 
                                    ? <CheckCircle2 size={16} strokeWidth={2.5} />
                                    : <Ban size={16} strokeWidth={2.5} />
                                }
                            </div>
                            <div>
                                <p className="text-xs font-black text-foreground mb-0.5">
                                    {targetUser.is_suspended ? 'Reactivate Account' : 'Suspend Account'}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-medium">
                                    {targetUser.is_suspended ? 'Restore user access' : 'Block user from logging in'}
                                </p>
                            </div>
                        </button>

                        {/* Force Logout */}
                        <button
                            onClick={() => isSuperAdmin && setLogoutOpen(true)}
                            disabled={!isSuperAdmin}
                            className="flex flex-col items-start gap-2 p-4 border border-border hover:border-amber-400 hover:bg-accent/10 rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-card text-left group"
                            title={!isSuperAdmin ? 'Super Admin only' : ''}
                        >
                            <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent-foreground flex items-center justify-center">
                                <LogOut size={16} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-foreground mb-0.5">Force Logout</p>
                                <p className="text-[10px] text-muted-foreground font-medium">End all active sessions</p>
                            </div>
                        </button>
                    </div>
                </Card>
            </div>

            {/* Modals */}
            {isSuperAdmin && (
                <>
                    <OverrideTierModal 
                        isOpen={overrideOpen}
                        onClose={() => setOverrideOpen(false)}
                        targetUser={targetUser}
                    />
                    <SuspendUserModal 
                        isOpen={suspendOpen}
                        onClose={() => setSuspendOpen(false)}
                        targetUser={targetUser}
                    />
                    <ForceLogoutModal 
                        isOpen={logoutOpen}
                        onClose={() => setLogoutOpen(false)}
                        targetUser={targetUser}
                    />
                </>
            )}
        </AdminLayout>
    );
}

function Stat({ label, value }) {
    return (
        <div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
            <p className="text-sm font-bold text-foreground truncate">{value}</p>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-2.5">
            <Icon size={14} className="text-muted-foreground mt-0.5 shrink-0" strokeWidth={2} />
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-xs font-bold text-foreground break-words">{value}</p>
            </div>
        </div>
    );
}

function BalanceCard({ label, amount, icon: Icon, color, formatPeso }) {
    // Total is the sum of the two beside it, so it reads as the emphasis rather
    // than as a third unrelated category — the purple it used to carry made it
    // look like something else entirely.
    const colorStyles = {
        wallet: 'bg-primary/10 border-primary/25',
        savings: 'bg-success/10 border-success/25',
        total: 'bg-foreground/[0.04] border-border',
    };
    const iconStyles = {
        wallet: 'bg-primary/15 text-primary',
        savings: 'bg-success/15 text-success',
        total: 'bg-foreground/10 text-foreground',
    };

    return (
        <Card className={`p-4 ${colorStyles[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-bold text-foreground uppercase tracking-widest">{label}</p>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconStyles[color]}`}>
                    <Icon size={14} strokeWidth={2.5} />
                </div>
            </div>
            <p className="text-xl font-black text-foreground tracking-tight">{formatPeso(amount)}</p>
        </Card>
    );
}

function TierBadge({ tier }) {
    const styles = {
        1: { color: 'bg-secondary text-primary border-primary/25', label: 'Starter', limit: '₱5K' },
        2: { color: 'bg-primary/10 text-primary border-primary/25', label: 'Builder', limit: '₱20K' },
        3: { color: 'bg-accent/10 text-accent-foreground border-accent/30', label: 'Achiever', limit: '₱100K' },
    };
    const style = styles[tier] || styles[1];
    return (
        <div className={`px-3 py-1.5 rounded-lg border ${style.color}`}>
            <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest">Tier {tier}</span>
                <span className="text-[9px] font-bold opacity-70">· {style.label}</span>
            </div>
            <p className="text-[9px] font-bold opacity-70 mt-0.5">Limit: {style.limit}</p>
        </div>
    );
}

function KycStatusBadge({ status }) {
    const styles = {
        pending: 'bg-accent/10 text-accent-foreground border-accent/30',
        approved: 'bg-success/10 text-success border-success/25',
        rejected: 'bg-destructive/10 text-destructive border-destructive/25',
    };
    const label = status?.toUpperCase() || 'UNKNOWN';
    return (
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${styles[status] || styles.pending}`}>
            {label}
        </span>
    );
}