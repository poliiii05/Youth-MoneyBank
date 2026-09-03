// resources/js/Components/Layouts/AdminLayout.jsx
import { Link } from '@inertiajs/react';
import { LogOut, ChevronDown, Menu, Power } from 'lucide-react';
import AdminSidebar from '../Admin/Sidebar';
import SignOutModal from '../Modals/SignOutModal';
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function AdminLayout({ user, header = 'Dashboard', actions = null, pendingCounts = {}, children }) {
    const [profileOpen, setProfileOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [signOutOpen, setSignOutOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const [avatarFailed, setAvatarFailed] = useState(false);

    const userName = user?.name || 'Admin';
    const userInitial = userName.charAt(0).toUpperCase();
    const avatar = !avatarFailed ? user?.profile_picture : null;

    const [livePendingCounts, setLivePendingCounts] = useState(pendingCounts);
    const { maintenanceMode } = usePage().props;

    useEffect(() => {
        const controller = new AbortController();

        const fetchCounts = async () => {
            try {
                const response = await fetch('/admin/api/pending-counts', {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    signal: controller.signal,
                });
                if (response.ok) setLivePendingCounts(await response.json());
            } catch (e) {
                if (e.name !== 'AbortError') console.error('Polling failed:', e);
            }
        };

        fetchCounts();
        const interval = setInterval(fetchCounts, 30000);

        return () => {
            clearInterval(interval);
            // Without this, a poll in flight when the page changes resolves
            // against a component that is no longer mounted.
            controller.abort();
        };
    }, []);

    const confirmSignOut = async () => {
        setSigningOut(true);
        try {
            // Awaited. The previous version navigated away first and fired the
            // request after, so the admin session could survive a logout that
            // looked successful — worse here than on the user side.
            await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
        } catch (err) {
            console.error('Logout request failed:', err);
        } finally {
            window.location.href = '/';
        }
    };

    return (
        // Light workspace with a dark sidebar. A dark page behind white panels
        // is the highest contrast the palette can produce, which is tiring on a
        // screen someone keeps open all day — the sidebar alone carries the
        // "this is tooling" signal.
        <div className="min-h-screen bg-muted/40 text-foreground flex">

            <AdminSidebar 
                user={user} 
                pendingCounts={livePendingCounts}
                maintenanceMode={maintenanceMode}
                sidebarOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />

            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0">

                <header className="bg-card border-b border-border sticky top-0 z-20">
                    <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer shrink-0"
                                aria-label="Open menu"
                            >
                                <Menu size={18} />
                            </button>

                            <h1 className="text-base font-bold text-foreground tracking-tight truncate">
                                {header}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            {actions}

                            {/* Lives here rather than being passed per page, so
                                every admin screen says who is signed in. */}
                            <span className="hidden sm:flex items-baseline gap-1.5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                                    {user?.admin_role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                </span>
                                <span className="text-muted-foreground/60 text-[9px]">:</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-foreground truncate max-w-[160px]">
                                    {userName}
                                </span>
                            </span>

                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className={cn(
                                        'flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-muted transition-colors cursor-pointer',
                                        profileOpen && 'bg-muted'
                                    )}
                                >
                                    {avatar ? (
                                        <img 
                                            src={avatar}
                                            alt={userName}
                                            referrerPolicy="no-referrer"
                                            onError={() => setAvatarFailed(true)}
                                            className="w-8 h-8 rounded-full border border-border object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center text-white font-bold text-xs">
                                            {userInitial}
                                        </div>
                                    )}
                                    <ChevronDown size={12} className={cn('text-muted-foreground transition-transform', profileOpen && 'rotate-180')} />
                                </button>

                                {profileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-56 bg-popover rounded-xl shadow-xl border border-border overflow-hidden z-40">
                                            <div className="p-3 border-b border-border">
                                                <p className="text-xs font-bold text-foreground truncate">{userName}</p>
                                                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                                            </div>
                                            <div className="py-1">
                                                <button
                                                    onClick={() => { setProfileOpen(false); setSignOutOpen(true); }}
                                                    className="w-full text-left px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2"
                                                >
                                                    <LogOut size={12} />
                                                    Sign out
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
                    <div className="bg-accent border-b border-accent px-4 py-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <Power size={14} className="text-accent-foreground animate-pulse shrink-0" strokeWidth={2.5} />
                            <p className="text-[11px] font-black text-accent-foreground uppercase tracking-widest shrink-0">
                                Maintenance Mode Active
                            </p>
                            <p className="text-[11px] text-accent-foreground/80 font-medium hidden sm:block truncate">
                                Regular users are blocked. Admins maintain access.
                            </p>
                        </div>
                        <Link
                            href="/admin/maintenance"
                            className="text-[10px] font-black text-accent-foreground hover:underline cursor-pointer shrink-0"
                        >
                            Manage →
                        </Link>
                    </div>
                )}

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>

                <Toaster position="top-right" />
            </div>

            <SignOutModal
                isOpen={signOutOpen}
                onClose={() => setSignOutOpen(false)}
                onConfirm={confirmSignOut}
                isProcessing={signingOut}
                userName={userName}
            />
        </div>
    );
}