// resources/js/Components/Admin/Sidebar.jsx
import { Link } from '@inertiajs/react';
import { 
    LayoutDashboard, FileCheck, Users, Receipt, 
    Activity, Settings as SettingsIcon, Lock, Shield, X,
} from 'lucide-react';

/**
 * Admin sidebar with grouped sections, role-based visibility, and pending badges.
 */
export default function AdminSidebar({ user, pendingCounts = {}, sidebarOpen, onClose }) {
    const isUrlActive = (path) => {
        if (typeof window === 'undefined') return false;
        const currentPath = window.location.pathname;
        if (path === '/admin') return currentPath === '/admin';
        return currentPath.startsWith(path);
    };

    const role = user?.admin_role;
    const isSuperAdmin = role === 'super_admin';
    const canApproveKyc = role === 'super_admin' || role === 'kyc_reviewer';

    // Grouped nav structure
    const sections = [
        {
            title: 'Overview',
            items: [
                { 
                    label: 'Dashboard', 
                    href: '/admin', 
                    icon: LayoutDashboard,
                    visible: true,
                    locked: false,
                },
            ],
        },
        {
            title: 'Review',
            items: [
                { 
                    label: 'KYC Reviews', 
                    href: '/admin/kyc', 
                    icon: FileCheck,
                    badge: pendingCounts.kyc || null,
                    visible: true,
                    locked: !canApproveKyc, // Read-only for support_staff
                },
                { 
                    label: 'Transactions', 
                    href: '/admin/transactions', 
                    icon: Receipt,
                    visible: true,
                    locked: false,
                },
            ],
        },
        {
            title: 'Manage',
            items: [
                { 
                    label: 'Users', 
                    href: '/admin/users', 
                    icon: Users,
                    badge: pendingCounts.users_new || null,
                    visible: true, // Show to all, but locked for non-super
                    locked: !isSuperAdmin,
                    requiresSuper: true,
                },
            ],
        },
        {
            title: 'System',
            items: [
                { 
                    label: 'Audit Log', 
                    href: '/admin/audit', 
                    icon: Activity,
                    visible: true,
                    locked: !isSuperAdmin,
                    requiresSuper: true,
                },
                { 
                    label: 'Settings', 
                    href: '/admin/settings', 
                    icon: SettingsIcon,
                    visible: true,
                    locked: !isSuperAdmin,
                    requiresSuper: true,
                },
            ],
        },
    ];

    const roleBadge = role === 'super_admin' 
        ? { label: 'Super Admin', color: 'bg-purple-100 text-purple-700 border-purple-200' }
        : role === 'kyc_reviewer'
        ? { label: 'KYC Reviewer', color: 'bg-blue-100 text-blue-700 border-blue-200' }
        : role === 'support_staff'
        ? { label: 'Support', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
        : { label: 'Admin', color: 'bg-slate-100 text-slate-700 border-slate-200' };

    const userName = user?.name || 'Admin';
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <aside className={`fixed lg:sticky top-0 lg:top-[57px] left-0 z-30 h-screen lg:h-[calc(100vh-57px)] w-64 bg-slate-900 text-slate-200 border-r border-slate-800 transform transition-transform lg:transform-none flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
            {/* Mobile header (only visible sa mobile) */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg flex items-center justify-center">
                        <Shield size={16} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white tracking-tight leading-tight">
                            Admin Panel
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                    <X size={18} />
                </button>
            </div>

            {/* Nav sections */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-5">
                {sections.map((section) => (
                    <div key={section.title}>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 px-2">
                            {section.title}
                        </p>
                        <div className="space-y-1">
                            {section.items.filter(item => item.visible).map((item) => {
                                const Icon = item.icon;
                                const active = isUrlActive(item.href);
                                const locked = item.locked;
                                
                                if (locked) {
                                    // Locked item (visible but not clickable)
                                    return (
                                        <div
                                            key={item.href}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 text-xs font-semibold cursor-not-allowed opacity-60"
                                            title={`Requires ${item.requiresSuper ? 'Super Admin' : 'higher'} role`}
                                        >
                                            <Icon size={14} strokeWidth={2} className="opacity-50" />
                                            <span className="flex-1">{item.label}</span>
                                            <Lock size={10} strokeWidth={2.5} className="text-slate-600" />
                                        </div>
                                    );
                                }
                                
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs ${
                                            active
                                                ? 'bg-white text-slate-900 font-bold shadow-md'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white font-semibold'
                                        }`}
                                    >
                                        <Icon size={14} strokeWidth={active ? 2.5 : 2} />
                                        <span className="flex-1">{item.label}</span>
                                        {item.badge && (
                                            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-500 text-white text-[9px] font-bold">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User card sa bottom */}
            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-800/50 rounded-xl p-3">
                    <div className="flex items-center gap-2.5 mb-2">
                        {user?.profile_picture ? (
                            <img 
                                src={user.profile_picture}
                                alt={userName}
                                className="w-9 h-9 rounded-full border border-slate-700 object-cover shrink-0"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                {userInitial}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-white truncate">{userName}</p>
                            <p className="text-[9px] text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <span className={`inline-block text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${roleBadge.color}`}>
                        {roleBadge.label}
                    </span>
                </div>
            </div>
        </aside>
    );
}