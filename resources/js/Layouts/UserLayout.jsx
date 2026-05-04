// resources/js/Layouts/UserLayout.jsx
import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
// Updated Imports: Tinanggal na natin ang ArrowUpCircle, ArrowUpRight na ang nandito
import { Target, CreditCard, PieChart, Settings, LogOut, Menu, Home, Bell, ArrowUpRight } from 'lucide-react';

export default function UserLayout({ user, header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();

    const userData = {
        name: user?.name || 'User',
        profilePicture: user?.profile_picture || null
    };

    // TIER STYLES
    const getTierStyle = (tier) => {
        switch(Number(tier)) {
            case 3: 
                return { 
                    name: 'GOLD', 
                    boxCss: 'bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-300 shadow-sm',
                    textCss: 'text-yellow-900',
                    badgeCss: 'bg-yellow-200/50 text-yellow-800 border-yellow-400'
                };
            case 2: 
                return { 
                    name: 'SILVER', 
                    boxCss: 'bg-gradient-to-br from-slate-50 to-gray-200 border-slate-300 shadow-sm',
                    textCss: 'text-slate-800',
                    badgeCss: 'bg-white/60 text-slate-700 border-slate-400'
                };
            case 1: 
            default: 
                return { 
                    name: 'BRONZE', 
                    boxCss: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-sm',
                    textCss: 'text-orange-900',
                    badgeCss: 'bg-orange-200/50 text-orange-800 border-orange-300'
                };
        }
    };

    const userTier = getTierStyle(user?.kyc_tier);

    // NEXT TIER LOGIC
    const getNextTier = (tier) => {
        const current = Number(tier || 1);
        if (current === 1) return 'SILVER';
        if (current === 2) return 'GOLD';
        return null; 
    };
    
    const nextTierName = getNextTier(user?.kyc_tier);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout', {}, {
            onBefore: () => confirm('Are you sure you want to logout?'),
            onSuccess: () => localStorage.clear()
        });
    };

    const isUrlActive = (path) => url.startsWith(path);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 flex flex-col
            `}>
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                            YM
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-gray-900 leading-tight">Youth Money</h1>
                            <p className="text-xs text-gray-500 font-medium">Bank</p>
                        </div>
                    </div>
                    
                    {/* USER PROFILE BOX - PRO DESIGN */}
                    <div className={`p-3 rounded-2xl border transition-colors duration-300 ${userTier.boxCss}`}>
                        
                        {/* Avatar & Details Row */}
                        <div className="flex items-center gap-3 mb-3">
                            {userData.profilePicture ? (
                                <img src={userData.profilePicture} alt="Profile" className="w-10 h-10 rounded-full shadow-sm border border-white shrink-0" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0 border-2 border-white">
                                    {userData.name.charAt(0)}
                                </div>
                            )}
                            
                            <div className="flex-1 min-w-0 flex flex-col items-start justify-center">
                                {/* CLEAN UID */}
                                <p className={`text-sm font-mono font-bold tracking-tight mb-1 truncate w-full ${userTier.textCss}`}>
                                    UID: {user?.account_number || 'Pending'}
                                </p>
                                
                                {/* HORIZONTAL TIER BADGE SA ILALIM NG UID */}
                                <span className={`px-2 py-0.5 rounded border text-[9px] font-black tracking-widest uppercase ${userTier.badgeCss}`}>
                                    {userTier.name} TIER
                                </span>
                            </div>
                        </div>

                        {/* PRO-STYLE UPGRADE BUTTON */}
                        {nextTierName && (
                            <button 
                                onClick={() => alert('Tier Upgrade modal coming soon!')}
                                className="w-full bg-white/70 hover:bg-white backdrop-blur-sm border border-white/60 rounded-xl px-3 py-2.5 flex items-center justify-between shadow-sm hover:shadow transition-all group cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600 font-medium">Upgrade to</span>
                                    <span className="bg-gray-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-lg tracking-wide shadow-sm">
                                        {nextTierName}
                                    </span>
                                </div>
                                <div className="bg-white p-1 rounded-md shadow-sm border border-gray-100 group-hover:bg-gray-50 transition-colors">
                                    <ArrowUpRight size={14} className="text-gray-900" />
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="p-4 space-y-1 flex-1">
                    <Link href="/dashboard" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isUrlActive('/dashboard') ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}>
                        <Home className="w-5 h-5" />
                        <span className="font-medium text-sm">Dashboard</span>
                    </Link>
                    <Link href="/transactions" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isUrlActive('/transactions') ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}>
                        <CreditCard className="w-5 h-5" />
                        <span className="font-medium text-sm">Transactions</span>
                    </Link>
                    <Link href="/goals" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isUrlActive('/goals') ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}>
                        <Target className="w-5 h-5" />
                        <span className="font-medium text-sm">Savings Goals</span>
                    </Link>
                    <Link href="/summary" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isUrlActive('/summary') ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}>
                        <PieChart className="w-5 h-5" />
                        <span className="font-medium text-sm">Spending Summary</span>
                    </Link>
                    <Link href="/settings" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isUrlActive('/settings') ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}>
                        <Settings className="w-5 h-5" />
                        <span className="font-medium text-sm">Settings</span>
                    </Link>
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-200 bg-white">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all font-semibold text-sm cursor-pointer"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout securely</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:ml-64 flex flex-col min-h-screen">
                <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-100">
                    <div className="flex items-center justify-between px-4 py-4 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-blue-50 text-gray-600 rounded-lg transition-colors cursor-pointer"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h2 className="text-xl font-bold text-gray-800 hidden sm:block uppercase tracking-tight">
                                {header || "Dashboard"}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-gray-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
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