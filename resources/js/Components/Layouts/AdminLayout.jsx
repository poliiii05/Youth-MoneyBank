// resources/js/Components/Layouts/AdminLayout.jsx
import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Shield, LogOut, ChevronDown, Menu, X, ExternalLink } from 'lucide-react';
import AdminSidebar from '../Admin/Sidebar';

export default function AdminLayout({ user, breadcrumbs = [], actions = null, pendingCounts = {}, children }) {
    const [profileOpen, setProfileOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const userName = user?.name || 'Admin';
    const userInitial = userName.charAt(0).toUpperCase();

    const handleLogout = () => {
        if (confirm('Logout from admin panel?')) {
            window.location.href = '/';
            router.post('/logout');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            
            {/* SIDEBAR */}
            <AdminSidebar 
                user={user} 
                pendingCounts={pendingCounts}
                sidebarOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* MAIN AREA */}
            <div className="flex-1 flex flex-col min-w-0">
                
                {/* TOP HEADER */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
                    <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                        
                        {/* LEFT: Mobile menu + Breadcrumbs */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                            >
                                <Menu size={18} />
                            </button>

                            {/* Breadcrumbs */}
                            {breadcrumbs.length > 0 ? (
                                <nav className="flex items-center gap-1.5 min-w-0 overflow-x-auto">
                                    {breadcrumbs.map((item, idx) => {
                                        const isLast = idx === breadcrumbs.length - 1;
                                        return (
                                            <span key={idx} className="flex items-center gap-1.5 shrink-0">
                                                {item.href && !isLast ? (
                                                    <Link 
                                                        href={item.href}
                                                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                                                    >
                                                        {item.label}
                                                    </Link>
                                                ) : (
                                                    <span className={`text-xs font-bold ${isLast ? 'text-slate-900' : 'text-slate-500'}`}>
                                                        {item.label}
                                                    </span>
                                                )}
                                                {!isLast && <span className="text-slate-300 text-xs">/</span>}
                                            </span>
                                        );
                                    })}
                                </nav>
                            ) : (
                                <div className="flex items-center gap-2 min-w-0">
                                    <Shield size={16} className="text-slate-700 shrink-0" strokeWidth={2.5} />
                                    <p className="text-sm font-black text-slate-900 truncate">Admin</p>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Custom actions + Profile dropdown */}
                        <div className="flex items-center gap-2 shrink-0">
                            {actions}

                            {/* Profile dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className={`flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer ${profileOpen ? 'bg-slate-100' : ''}`}
                                >
                                    {user?.profile_picture ? (
                                        <img 
                                            src={user.profile_picture}
                                            alt={userName}
                                            className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                                        />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white font-bold text-xs">
                                            {userInitial}
                                        </div>
                                    )}
                                    <ChevronDown size={12} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {profileOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-30" 
                                            onClick={() => setProfileOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-40">
                                            <div className="p-3 border-b border-slate-100">
                                                <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                                                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                                            </div>
                                            <div className="py-1">
                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                                >
                                                    <ExternalLink size={11} />
                                                    Back to User App
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2"
                                                >
                                                    <LogOut size={12} />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}