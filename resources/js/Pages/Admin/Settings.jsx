// resources/js/Pages/Admin/Settings.jsx
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import Avatar from '../../Components/Admin/Avatar';
import { 
    Settings as SettingsIcon, Sliders, Server, User, Crown, ShieldCheck,
    Database, Info, Shield, Users, Lock, CheckCircle2, Edit, Mail,
    Calendar, Clock,
} from 'lucide-react';

export default function Settings({ 
    auth, 
    settings = { config: [] },
    systemInfo = {},
    adminInfo = {},
    pendingCounts = {} 
}) {
    const user = auth?.user;
    const [activeTab, setActiveTab] = useState('account');

    return (
        <AdminLayout user={user} header="Settings" pendingCounts={pendingCounts}>
            <Head title="Settings | Super Admin" />

           <div className="mx-auto space-y-4">
             {/* Tab nav — floating pill, centered */}
                <div className="flex justify-center">
                    <div className="bg-white rounded-xl border border-slate-200 p-1.5 inline-flex gap-1 shadow-sm">
                        <TabButton 
                            label="My Account" 
                            icon={User} 
                            active={activeTab === 'account'} 
                            onClick={() => setActiveTab('account')} 
                        />
                        <TabButton 
                            label="Configuration" 
                            icon={Sliders} 
                            active={activeTab === 'config'} 
                            onClick={() => setActiveTab('config')} 
                        />
                        <TabButton 
                            label="System Info" 
                            icon={Server} 
                            active={activeTab === 'info'} 
                            onClick={() => setActiveTab('info')} 
                        />
                    </div>
                </div>

                {/* Account Tab */}
                    {activeTab === 'account' && (
                        <AccountTab adminInfo={adminInfo} />
                    )}

                {/* Configuration Tab */}
                {activeTab === 'config' && (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-black text-slate-900">System Configuration</h2>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                Tier limits, transaction caps, and other operational parameters
                            </p>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {settings.config?.map(setting => (
                                <SettingRow key={setting.id} setting={setting} />
                            ))}
                        </div>
                    </div>
                )}

                {/* System Info Tab */}
                {activeTab === 'info' && (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-black text-slate-900">System Information</h2>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                Application environment and statistics
                            </p>
                        </div>
                        <div className="p-5 grid grid-cols-2 gap-4">
                            <InfoRow icon={Server} label="Laravel Version" value={systemInfo.laravel_version} />
                            <InfoRow icon={Server} label="PHP Version" value={systemInfo.php_version} />
                            <InfoRow icon={Database} label="Database" value={systemInfo.database} />
                            <InfoRow icon={Info} label="Timezone" value={systemInfo.timezone} />
                            <InfoRow icon={Shield} label="Environment" value={systemInfo.environment} />
                            <InfoRow icon={Users} label="Total Users" value={systemInfo.total_users?.toLocaleString()} />
                            <InfoRow icon={Shield} label="Total Admins" value={systemInfo.total_admins?.toLocaleString()} />
                            <InfoRow icon={Database} label="Total Transactions" value={systemInfo.total_transactions?.toLocaleString()} />
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function TabButton({ label, icon: Icon, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                active 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
            <Icon size={14} strokeWidth={2.5} />
            {label}
        </button>
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

function SettingRow({ setting }) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(setting.value);

    const handleSaveInteger = () => {
        router.post('/admin/settings/update', {
            key: setting.key,
            value: tempValue,
        }, {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false),
        });
    };

    const handleCancelEdit = () => {
        setTempValue(setting.value);
        setIsEditing(false);
    };

    return (
        <div className="px-5 py-4 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-black text-slate-900">{setting.label}</p>
                        {setting.is_locked && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-widest rounded border border-slate-200">
                                <Lock size={9} strokeWidth={2.5} />
                                Locked
                            </span>
                        )}
                    </div>
                    {setting.description && (
                        <p className="text-[11px] text-slate-500 font-medium">{setting.description}</p>
                    )}
                    {setting.updated_at && (
                        <p className="text-[9px] text-slate-400 font-medium mt-1">Last updated: {setting.updated_at}</p>
                    )}
                </div>

                <div className="shrink-0">
                    {isEditing ? (
                        <div className="flex items-center gap-1.5">
                            <input
                                type="number"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-32 px-2 py-1 text-xs font-bold text-right border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-100"
                                autoFocus
                            />
                            <button
                                onClick={handleSaveInteger}
                                className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer"
                            >
                                <CheckCircle2 size={14} strokeWidth={2.5} />
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded cursor-pointer text-xs font-bold w-6 h-6"
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => !setting.is_locked && setIsEditing(true)}
                            disabled={setting.is_locked}
                            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-black rounded transition-all ${
                                setting.is_locked 
                                    ? 'text-slate-500 bg-slate-50 cursor-not-allowed' 
                                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer'
                            }`}
                        >
                            <span>{setting.key.includes('limit') || setting.key.includes('max') ? '₱' : ''}{Number(setting.value).toLocaleString('en-PH')}</span>
                            {!setting.is_locked && <Edit size={11} strokeWidth={2.5} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value, subtitle, statusGood }) {
    return (
        <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded transition-colors">
            <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <Icon size={13} className="text-slate-600" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 truncate">{value || '—'}</p>
                    {statusGood !== undefined && (
                        <span className={`inline-flex w-1.5 h-1.5 rounded-full ${
                            statusGood ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}></span>
                    )}
                </div>
                {subtitle && (
                    <p className="text-[9px] text-slate-400 font-medium">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

function AccountTab({ adminInfo }) {
    const [name, setName] = useState(adminInfo.name || '');
    const [phoneNumber, setPhoneNumber] = useState(adminInfo.phone_number || '');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const hasChanges = (
        name !== (adminInfo.name || '') ||
        phoneNumber !== (adminInfo.phone_number || '')
    );

    const handleSave = () => {
        setErrors({});
        setIsProcessing(true);
        router.post('/admin/settings/profile', {
            name: name.trim(),
            phone_number: phoneNumber.trim() || null,
        }, {
            preserveScroll: true,
            onFinish: () => setIsProcessing(false),
            onError: (errs) => setErrors(errs),
        });
    };

    const handleReset = () => {
        setName(adminInfo.name || '');
        setPhoneNumber(adminInfo.phone_number || '');
        setErrors({});
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-black text-slate-900">My Account</h2>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Manage your admin profile information
                </p>
            </div>
            
            {/* Profile banner */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-4">
                    <Avatar src={adminInfo.profile_picture} name={adminInfo.name} size="lg" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-base font-black text-slate-900 truncate">{adminInfo.name}</p>
                            <RoleBadge role={adminInfo.admin_role} />
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate">{adminInfo.email}</p>
                        {adminInfo.google_linked && (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                ✓ Linked with Google
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 items-stretch">
                {/* LEFT: Editable fields */}
                <div className="p-5 flex flex-col">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Editable</p>
                    
                    <div className="space-y-3 flex-1">
                    {/* Name */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 block">
                            Display Name <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isProcessing}
                            maxLength={100}
                            className={`w-full px-3 py-2 text-xs font-medium border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                errors.name ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-50'
                            }`}
                        />
                        {errors.name && (
                            <p className="text-[10px] font-bold text-red-600 mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Email — read only */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 block flex items-center gap-1.5">
                            Email Address
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-widest rounded border border-slate-200">
                                <Lock size={9} strokeWidth={2.5} />
                                Locked
                            </span>
                        </label>
                        <input
                            type="email"
                            value={adminInfo.email || ''}
                            disabled
                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                        />
                        <p className="text-[10px] text-slate-500 font-medium mt-1">
                            Email is managed via Google OAuth
                        </p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 block">
                            Phone Number
                            <span className="text-[10px] font-medium text-slate-400 ml-1.5 normal-case tracking-normal">(optional)</span>
                        </label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            disabled={isProcessing}
                            maxLength={20}
                            placeholder="e.g., +63 917 123 4567"
                            className={`w-full px-3 py-2 text-xs font-medium border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                errors.phone_number ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-50'
                            }`}
                        />
                        {errors.phone_number && (
                            <p className="text-[10px] font-bold text-red-600 mt-1">{errors.phone_number}</p>
                        )}
                    </div>
                </div>
        </div>  

                {/* RIGHT: Account info (read-only) */}
                    <div className="p-5 flex flex-col">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Account Info</p>
                        
                        <div className="flex-1 flex flex-col justify-between py-1">
                        <CompactInfoRow 
                            icon={Mail} 
                            label="Email Verification" 
                            value={adminInfo.email_verified ? 'Verified' : 'Not Verified'} 
                            statusGood={adminInfo.email_verified}
                        />
                        <CompactInfoRow 
                            icon={Crown} 
                            label="Role Granted" 
                            value={adminInfo.granted_at || '—'} 
                            subtitle={adminInfo.granted_relative}
                        />
                        <CompactInfoRow 
                            icon={Calendar} 
                            label="Member Since" 
                            value={adminInfo.created_at || '—'} 
                            subtitle={adminInfo.created_relative}
                        />
                        <CompactInfoRow 
                            icon={Clock} 
                            label="Last Active" 
                            value={adminInfo.last_login_relative || 'Just now'} 
                        />
                    </div>
                </div>
            </div>

            {/* Save bar — only when changes detected */}
            {hasChanges && (
                <div className="px-5 py-3 bg-blue-50 border-t border-blue-200 flex items-center justify-between gap-3">
                    <p className="text-[11px] font-bold text-blue-900">
                        You have unsaved changes
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReset}
                            disabled={isProcessing}
                            className="px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-white rounded-lg cursor-pointer disabled:opacity-50"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isProcessing || name.trim().length < 2}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-lg shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function CompactInfoRow({ icon: Icon, label, value, subtitle, statusGood }) {
    return (
        <div className="flex items-start gap-3 py-1.5">
            <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={13} className="text-slate-600" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 truncate">{value || '—'}</p>
                    {statusGood !== undefined && (
                        <span className={`inline-flex w-1.5 h-1.5 rounded-full ${
                            statusGood ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}></span>
                    )}
                </div>
                {subtitle && (
                    <p className="text-[9px] text-slate-400 font-medium">{subtitle}</p>
                )}
            </div>
        </div>
    );
}