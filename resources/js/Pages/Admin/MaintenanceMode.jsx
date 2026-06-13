// resources/js/Pages/Admin/MaintenanceMode.jsx
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import Avatar from '../../Components/Admin/Avatar';
import { 
    Power, AlertTriangle, ShieldCheck, Users, 
    History, FileCheck, UserPlus,
} from 'lucide-react';

export default function MaintenanceMode({ 
    auth, 
    isMaintenanceActive = false,
    toggles = [],
    impactStats = {},
    recentToggles = [],
    pendingCounts = {} 
}) {
    const user = auth?.user;

    return (
        <AdminLayout user={user} header="Maintenance" pendingCounts={pendingCounts}>
            <Head title="Maintenance | Super Admin" />

            <div className="max-w-5xl space-y-4">
                {/* Status hero card */}
                <div className={`rounded-xl border p-5 ${
                    isMaintenanceActive 
                        ? 'bg-amber-50 border-amber-200' 
                        : 'bg-emerald-50 border-emerald-200'
                }`}>
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            isMaintenanceActive ? 'bg-amber-100' : 'bg-emerald-100'
                        }`}>
                            {isMaintenanceActive 
                                ? <AlertTriangle size={24} className="text-amber-700" strokeWidth={2.5} />
                                : <ShieldCheck size={24} className="text-emerald-700" strokeWidth={2.5} />
                            }
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className={`text-base font-black ${
                                    isMaintenanceActive ? 'text-amber-900' : 'text-emerald-900'
                                }`}>
                                    {isMaintenanceActive ? 'Maintenance Mode Active' : 'System Operational'}
                                </h2>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                    isMaintenanceActive 
                                        ? 'bg-amber-200 text-amber-800' 
                                        : 'bg-emerald-200 text-emerald-800'
                                }`}>
                                    {isMaintenanceActive ? 'BLOCKED' : 'NORMAL'}
                                </span>
                            </div>
                            <p className={`text-xs font-medium ${
                                isMaintenanceActive ? 'text-amber-800' : 'text-emerald-800'
                            }`}>
                                {isMaintenanceActive 
                                    ? 'Regular users cannot access the system. Admins maintain full operational access.' 
                                    : 'All users have normal access to the system.'
                                }
                            </p>
                        </div>
                    </div>
                </div>

               {/* Impact stats — only show when maintenance ON */}
                    {isMaintenanceActive && (
                        <div className="grid grid-cols-2 gap-3">
                            <ImpactCard 
                                icon={Users} 
                                label="Regular Users" 
                                value={impactStats.regular_users || 0}
                                subtitle="Currently blocked"
                                color="amber"
                            />
                            <ImpactCard 
                                icon={ShieldCheck} 
                                label="Active Admins" 
                                value={impactStats.active_admins || 0}
                                subtitle="Maintain access"
                                color="emerald"
                            />
                        </div>
                    )}

                {/* Operational Controls */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-black text-slate-900">Operational Controls</h3>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Toggle system-wide operational behaviors. All changes are logged.
                        </p>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {toggles.map(toggle => (
                            <ToggleCard key={toggle.id} toggle={toggle} />
                        ))}
                    </div>
                </div>

                {/* Recent toggle history */}
                {recentToggles.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <History size={14} className="text-slate-600" strokeWidth={2.5} />
                                <h3 className="text-sm font-black text-slate-900">Recent Changes</h3>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Last 15 operational toggles across all settings</p>
                        </div>
                        
                        {/* Table header */}
                        <div className="grid grid-cols-12 items-center gap-3 px-5 py-2.5 bg-slate-50 border-b border-slate-200">
                            <div className="col-span-2">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Action</p>
                            </div>
                            <div className="col-span-3">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Actor / Setting</p>
                            </div>
                            <div className="col-span-5">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Reason</p>
                            </div>
                            <div className="col-span-2 text-right">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Date</p>
                            </div>
                        </div>
                        
                        <div>
                            {recentToggles.map((toggle) => (
                                <ToggleHistoryRow key={toggle.id} toggle={toggle} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function ImpactCard({ icon: Icon, label, value, subtitle, color }) {
    const colorStyles = {
        slate: 'bg-slate-50 border-slate-200',
        amber: 'bg-amber-50 border-amber-200',
        emerald: 'bg-emerald-50 border-emerald-200',
    };
    const iconBg = {
        slate: 'bg-slate-100 text-slate-700',
        amber: 'bg-amber-100 text-amber-700',
        emerald: 'bg-emerald-100 text-emerald-700',
    };
    return (
        <div className={`rounded-xl border p-4 ${colorStyles[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{label}</p>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg[color]}`}>
                    <Icon size={14} strokeWidth={2.5} />
                </div>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{value.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">{subtitle}</p>
        </div>
    );
}

function ToggleCard({ toggle }) {
    const [pendingState, setPendingState] = useState(null); // null = no change, true/false = pending toggle
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const isPendingChange = pendingState !== null;

    const handleToggleClick = () => {
        if (isPendingChange) {
            // Cancel pending change
            setPendingState(null);
            setReason('');
            setError('');
        } else {
            // Initiate change
            setPendingState(!toggle.value);
            setError('');
        }
    };

    const handleConfirm = () => {
        setError('');
        if (reason.trim().length < 10) {
            setError('Please provide a detailed reason (min 10 characters).');
            return;
        }

        setIsProcessing(true);
        router.post('/admin/maintenance/toggle', {
            key: toggle.key,
            enabled: pendingState,
            reason: reason.trim(),
        }, {
            preserveScroll: true,
            onFinish: () => setIsProcessing(false),
            onSuccess: () => {
                setPendingState(null);
                setReason('');
            },
            onError: (errors) => setError(Object.values(errors)[0] || 'Failed to toggle setting.'),
        });
    };

    const handleCancel = () => {
        setPendingState(null);
        setReason('');
        setError('');
    };

    const effectiveState = isPendingChange ? pendingState : toggle.value;

    return (
        <div className={`px-5 py-4 transition-colors ${
            isPendingChange ? 'bg-blue-50/40' : 'hover:bg-slate-50/50'
        }`}>
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-black text-slate-900">{toggle.label}</p>
                        {toggle.is_critical && (
                            <span className="inline-flex items-center px-1.5 py-0.5 bg-red-50 text-red-700 text-[9px] font-bold uppercase tracking-widest rounded border border-red-200">
                                Critical
                            </span>
                        )}
                        {toggle.value && !isPendingChange && (
                            <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        )}
                    </div>
                    {toggle.description && (
                        <p className="text-[11px] text-slate-600 font-medium">{toggle.description}</p>
                    )}
                    {toggle.updated_at && (
                        <p className="text-[9px] text-slate-400 font-medium mt-1">Last changed: {toggle.updated_at}</p>
                    )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        effectiveState ? 'text-emerald-700' : 'text-slate-500'
                    }`}>
                        {effectiveState ? 'ON' : 'OFF'}
                    </span>
                    <button
                        onClick={handleToggleClick}
                        disabled={isProcessing}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                            effectiveState ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            effectiveState ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                </div>
            </div>

            {/* Pending change confirmation */}
            {isPendingChange && (
                <div className={`mt-3 p-3 rounded-lg border ${
                    toggle.is_critical && pendingState
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-blue-50 border-blue-200'
                }`}>
                    <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle size={14} className={`shrink-0 mt-0.5 ${
                            toggle.is_critical && pendingState ? 'text-amber-600' : 'text-blue-600'
                        }`} strokeWidth={2.5} />
                        <p className={`text-[11px] font-bold ${
                            toggle.is_critical && pendingState ? 'text-amber-900' : 'text-blue-900'
                        }`}>
                            About to {pendingState ? 'ENABLE' : 'DISABLE'} {toggle.label}
                        </p>
                    </div>
                    
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={`Reason for ${pendingState ? 'enabling' : 'disabling'}...`}
                        rows={2}
                        disabled={isProcessing}
                        maxLength={500}
                        className={`w-full px-3 py-2 text-xs font-medium border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                            error ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-50'
                        }`}
                    />
                    
                    <div className="flex items-center justify-between mt-1.5">
                        {error ? (
                            <p className="text-[10px] font-bold text-red-600">{error}</p>
                        ) : (
                            <p className={`text-[10px] font-bold ${
                                reason.trim().length >= 10 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                                {reason.trim().length >= 10 
                                    ? '✓ Minimum reached' 
                                    : `${10 - reason.trim().length} more characters needed`
                                }
                            </p>
                        )}
                        <p className="text-[10px] font-medium text-slate-400">{reason.length}/500</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3 justify-end">
                        <button
                            onClick={handleCancel}
                            disabled={isProcessing}
                            className="px-3 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-white rounded-lg cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isProcessing || reason.trim().length < 10}
                            className={`px-3 py-1.5 text-[10px] font-black text-white rounded-lg shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                                toggle.is_critical && pendingState
                                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                            }`}
                        >
                            {isProcessing ? 'Saving...' : `Confirm ${pendingState ? 'ON' : 'OFF'}`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function ToggleHistoryRow({ toggle }) {
    const isEnable = toggle.action === 'Enabled';
    return (
        <div className="grid grid-cols-12 items-center gap-3 px-5 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
            {/* Action badge — col-span-2 */}
            <div className="col-span-2">
                <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded border ${
                    isEnable 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                    {toggle.action}
                </span>
            </div>

            {/* Actor → Setting — col-span-3 */}
            <div className="col-span-3 min-w-0">
                <div className="flex items-center gap-1.5">
                    <Avatar src={toggle.actor?.profile_picture} name={toggle.actor?.name} size="xs" />
                    <span className="text-xs font-bold text-slate-900 truncate">{toggle.actor?.name}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{toggle.setting_label}</p>
            </div>

            {/* Reason — col-span-5 */}
            <div className="col-span-5 min-w-0">
                <p className="text-[11px] text-slate-600 font-medium italic line-clamp-2">
                    "{toggle.reason}"
                </p>
            </div>

            {/* Date — col-span-2 */}
            <div className="col-span-2 text-right">
                <p className="text-[10px] font-bold text-slate-700">{toggle.created_relative}</p>
                <p className="text-[9px] text-slate-400 font-medium">{toggle.created_at}</p>
            </div>
        </div>
    );
}