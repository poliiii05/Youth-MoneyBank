// resources/js/Layouts/UserLayout.jsx
import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Target, CreditCard, PieChart, Settings, LogOut, Menu, Home, Bell, ArrowRight } from 'lucide-react';

export default function UserLayout({ user, header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();

    const userData = {
        name: user?.name || 'User',
        profilePicture: user?.profile_picture || null
    };

    const getTierDetails = (tier) => {
        const current = Number(tier || 1);
        if (current === 3) return { name: 'Achiever Account', level: 'Tier 3', color: 'text-indigo-600', dot: 'bg-indigo-500' };
        if (current === 2) return { name: 'Builder Account', level: 'Tier 2', color: 'text-emerald-600', dot: 'bg-emerald-500' };
        return { name: 'Starter Account', level: 'Tier 1', color: 'text-blue-600', dot: 'bg-blue-500' };
    };

    const tierDetails = getTierDetails(user?.kyc_tier);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout', {}, {
            onBefore: () => confirm('Are you sure you want to logout?'),
            onSuccess: () => localStorage.clear()
        });
    };

    const isUrlActive = (path) => url.startsWith(path);

    return (
        <div className="min-h-screen bg-slate-50/50">
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 z-50 transform transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 flex flex-col
            `}>
                <div className="p-6 pb-2">
                    {/* Brand Logo with Image Logo & "Youth Money Bank" text */}
                    <div className="flex items-center gap-3 mb-8">
                        <img 
                            src="/images/logo.png" 
                            alt="Logo" 
                            className="w-9 h-9 object-contain rounded-xl shadow-sm border border-slate-100" 
                            onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = "https://ui-avatars.com/api/?name=YM&background=2563eb&color=fff&rounded=true&bold=true";
                            }}
                        />
                        <div>
                            <h1 className="font-black text-lg text-slate-900 leading-none tracking-tight">Youth Money</h1>
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">Bank</p>
                        </div>
                    </div>
                    
                    {/* MINIMALIST PROFILE BOX */}
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 mb-4">
                        <div className="flex items-center gap-3 mb-4">
                            {userData.profilePicture ? (
                                <img src={userData.profilePicture} alt="Profile" className="w-9 h-9 rounded-full shadow-sm border border-slate-200 shrink-0 object-cover" />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shadow-sm shrink-0 border border-slate-200">
                                    {userData.name.charAt(0)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-900 truncate">{userData.name}</p>
                                <p className="text-[10px] font-mono text-slate-500 mt-0.5 tracking-tight">UID: {user?.account_number || 'PENDING'}</p>
                            </div>
                        </div>

                        {/* TIER INFO & UPGRADE */}
                        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${tierDetails.dot}`}></div>
                                        <p className={`text-[11px] font-bold ${tierDetails.color}`}>{tierDetails.name}</p>
                                    </div>
                                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest ml-3">{tierDetails.level}</p>
                                </div>
                            </div>
                            
                            {Number(user?.kyc_tier || 1) < 3 && (
                                <button onClick={() => alert('Upgrade modal coming soon!')} className="w-full flex justify-between items-center text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-100 py-2 px-2.5 rounded-lg transition-all mt-2.5 group cursor-pointer">
                                    Upgrade Account <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="px-4 pb-4 space-y-0.5 flex-1 overflow-y-auto">
                    <Link href="/dashboard" className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${isUrlActive('/dashboard') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}>
                        <Home className="w-4 h-4" strokeWidth={isUrlActive('/dashboard') ? 2.5 : 2} />
                        <span className="text-sm">Dashboard</span>
                    </Link>
                    <Link href="/transactions" className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${isUrlActive('/transactions') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}>
                        <CreditCard className="w-4 h-4" strokeWidth={isUrlActive('/transactions') ? 2.5 : 2} />
                        <span className="text-sm">Transactions</span>
                    </Link>
                    <Link href="/goals" className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${isUrlActive('/goals') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}>
                        <Target className="w-4 h-4" strokeWidth={isUrlActive('/goals') ? 2.5 : 2} />
                        <span className="text-sm">Savings Goals</span>
                    </Link>
                    <Link href="/summary" className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${isUrlActive('/summary') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}>
                        <PieChart className="w-4 h-4" strokeWidth={isUrlActive('/summary') ? 2.5 : 2} />
                        <span className="text-sm">Spending Summary</span>
                    </Link>
                    <Link href="/settings" className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${isUrlActive('/settings') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}>
                        <Settings className="w-4 h-4" strokeWidth={isUrlActive('/settings') ? 2.5 : 2} />
                        <span className="text-sm">Settings</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold text-xs cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout securely</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:ml-64 flex flex-col min-h-screen">
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
                    <div className="flex items-center justify-between px-4 py-3 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <h2 className="text-sm font-bold text-slate-800 hidden sm:block uppercase tracking-widest">
                                {header || "Dashboard"}
                            </h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}