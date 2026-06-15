// resources/js/Components/Layouts/AdminLayout.jsx
import { Link, router } from '@inertiajs/react';
import { LogOut, ChevronDown, Menu } from 'lucide-react';
import AdminSidebar from '../Admin/Sidebar';
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { Power } from 'lucide-react';

export default function AdminLayout({ user, header = 'Dashboard', actions = null, pendingCounts = {}, children }) {
    const [profileOpen, setProfileOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const userName = user?.name || 'Admin';
    const userInitial = userName.charAt(0).toUpperCase();
    // Real-time pending counts polling
    const [livePendingCounts, setLivePendingCounts] = useState(pendingCounts);
    const [previousCsCount, setPreviousCsCount] = useState(pendingCounts?.cs || 0);

    // Flash message handling
    const { flash, maintenanceMode } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                duration: 4000,
                position: 'top-right',
                style: {
                    background: '#059669',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                },
            });
        }
        if (flash?.error) {
            toast.error(flash.error, {
                duration: 5000,
                position: 'top-right',
                style: {
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '12px 16px',
                    borderRadius: '8px',
                },
            });
        }
    }, [flash?.success, flash?.error]);

        useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch('/admin/api/pending-counts', {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setLivePendingCounts(data);
                }
            } catch (e) {
                console.error('Polling failed:', e);
            }
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);
    
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
                pendingCounts={livePendingCounts}
                maintenanceMode={maintenanceMode}
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
                
                {/* TOP HEADER — simplified */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                    <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                        
                        {/* LEFT: Mobile menu + Page title */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                            >
                                <Menu size={18} />
                            </button>

                            {/* Just the page title — clean and direct */}
                            <h1 className="text-base font-bold text-slate-900 tracking-tight truncate">
                                {header}
                            </h1>
                        </div>

                        {/* RIGHT: Custom actions + Profile dropdown */}
                        <div className="flex items-center gap-2 shrink-0">
                            {actions}

                            {/* Profile dropdown — minimal */}
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className={`flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer ${profileOpen ? 'bg-slate-100' : ''}`}
                                >
                                    {user?.profile_picture ? (
                                        <img 
                                            src={user.profile_picture}
                                            alt={userName}
                                            className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white font-bold text-xs">
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
                                            {/* User info */}
                                            <div className="p-3 border-b border-slate-100">
                                                <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                                                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                                            </div>
                                            {/* Just logout */}
                                            <div className="py-1">
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

                {maintenanceMode && (
                    <div className="bg-amber-500 border-b border-amber-600 px-4 py-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Power size={14} className="text-amber-900 animate-pulse" strokeWidth={2.5} />
                            <p className="text-[11px] font-black text-amber-900 uppercase tracking-widest">
                                Maintenance Mode Active
                            </p>
                            <p className="text-[11px] text-amber-900 font-medium hidden sm:block">
                                Regular users are blocked. Admins maintain access.
                            </p>
                        </div>
                        <Link
                            href="/admin/maintenance"
                            className="text-[10px] font-black text-amber-900 hover:text-amber-950 underline cursor-pointer"
                        >
                            Manage →
                        </Link>
                    </div>
                )}

                {/* MAIN CONTENT */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>

                <Toaster position="top-right" />
                
            </div>
        </div>
    );
}