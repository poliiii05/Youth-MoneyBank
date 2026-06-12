// resources/js/Components/Admin/Sidebar.jsx
import { Link } from '@inertiajs/react';
import { 
    LayoutDashboard, FileCheck, Users, Receipt, Headphones,
    Activity, Settings as SettingsIcon, Lock, Shield, X,
} from 'lucide-react';

/**
 * Admin sidebar with grouped sections, role-based visibility, and pending badges.
 * 
 * Role-based access:
 * - admin: Can view dashboard, KYC, transactions, users (read-only)
 * - super_admin: Same as admin + destructive actions + admin management
 */
export default function AdminSidebar({ user, pendingCounts = {}, sidebarOpen, onClose }) {
    const isUrlActive = (path) => {
        if (typeof window === 'undefined') return false;
        const currentPath = window.location.pathname;
        if (path === '/admin') return currentPath === '/admin';
        return currentPath.startsWith(path);
    };

    const role = user?.admin_role;
    
    // Permission helpers (mirror sa User.php helpers)
    const isAdminLevel = role === 'admin' || role === 'super_admin';  // both
    const isSuperAdmin = role === 'super_admin';                       // super only
    
    // Specific permissions
    const canAccessKyc = isAdminLevel;        // both can review KYC
    const canViewTransactions = isAdminLevel; // both can view
    const canManageUsers = isAdminLevel;      // both can view users
    const canManageAdmins = isSuperAdmin;     // super only
    const canAccessAudit = isSuperAdmin;      // super only
    const canAccessSettings = isSuperAdmin;   // super only

    // Get inline role label (short, all caps)
    const getRoleLabel = (role) => {
        const labels = {
            super_admin: 'SUPER ADMIN',
            admin: 'ADMIN',
        };
        return labels[role] || 'STAFF';
    };

    // Get nickname (first name only)
    const getNickname = (name) => {
        if (!name) return 'Admin';
        return name.split(' ')[0];
    };

    const roleLabel = getRoleLabel(role);
    const nickname = getNickname(user?.name);

    // Grouped nav structure with permission-based locking
    const sections = [
        {
            title: 'Overview',
            items: [
                { 
                    label: 'Dashboard', 
                    href: '/admin', 
                    icon: LayoutDashboard, 
                    visible: true, 
                    locked: false 
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
                    locked: !canAccessKyc,
                },
                { 
                    label: 'Transactions', 
                    href: '/admin/transactions', 
                    icon: Receipt, 
                    visible: true, 
                    locked: !canViewTransactions 
                },
                { 
                    label: 'Customer Support', 
                    href: '/admin/customer-support', 
                    icon: Headphones,
                    badge: pendingCounts.cs || null, 
                    visible: true, 
                    locked: !canViewTransactions,
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
                    visible: true, 
                    locked: !canManageUsers,
                },
                { 
                    label: 'Admins', 
                    href: '/admin/admins', 
                    icon: Shield,
                    visible: true, 
                    locked: !canManageAdmins, 
                    requiresSuper: true,
                    comingSoon: true,
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
                    locked: !canAccessAudit, 
                    requiresSuper: true,
                    comingSoon: true,
                },
                { 
                    label: 'Settings', 
                    href: '/admin/settings', 
                    icon: SettingsIcon, 
                    visible: true, 
                    locked: !canAccessSettings, 
                    requiresSuper: true,
                    comingSoon: true,
                },
            ],
        },
    ];

    return (
        <aside className={`fixed lg:sticky top-0 left-0 z-30 h-screen w-60 bg-slate-900 text-slate-200 border-r border-slate-800 transform transition-transform lg:transform-none flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
            {/* TOP: Brand */}
            <div className="p-4 pb-3 border-b border-slate-800/80">
                <div className="flex items-center justify-between">
                    <Link 
                        href="/admin" 
                        className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                            <Shield size={17} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-white tracking-tight leading-none">Youth Money</p>
                            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">Bank</p>
                        </div>
                    </Link>
                    
                    {/* Mobile close button */}
                    <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1 cursor-pointer">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Role + Nickname */}
            <div className="px-4 py-3 border-b border-slate-800/80">
                <div className="flex items-baseline gap-1.5">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                        isSuperAdmin ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                        {roleLabel}
                    </span>
                    <span className="text-slate-600 text-[9px]">:</span>
                    <span className="text-xs font-bold text-white truncate">{nickname}</span>
                </div>
            </div>

            {/* Nav sections */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-4">
                {sections.map((section) => (
                    <div key={section.title}>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-2">
                            {section.title}
                        </p>
                        <div className="space-y-0.5">
                            {section.items.filter(item => item.visible).map((item) => {
                                const Icon = item.icon;
                                const active = isUrlActive(item.href);
                                const locked = item.locked;
                                const comingSoon = item.comingSoon;
                                
                                if (locked || comingSoon) {
                                    const tooltipText = comingSoon 
                                        ? 'Coming soon' 
                                        : `Requires ${item.requiresSuper ? 'Super Admin' : 'higher'} role`;
                                    
                                    return (
                                        <div
                                            key={item.href}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 text-xs font-semibold cursor-not-allowed opacity-60"
                                            title={tooltipText}
                                        >
                                            <Icon size={14} strokeWidth={2} className="opacity-50" />
                                            <span className="flex-1">{item.label}</span>
                                            {comingSoon ? (
                                                <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest">Soon</span>
                                            ) : (
                                                <Lock size={10} strokeWidth={2.5} className="text-slate-600" />
                                            )}
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

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-800/80">
                <p className="text-[9px] font-medium text-slate-500 text-center leading-relaxed">
                    Banking Admin Console<br/>
                    <span className="text-slate-600">v1.0 · {new Date().getFullYear()}</span>
                </p>
            </div>
        </aside>
    );

    
}