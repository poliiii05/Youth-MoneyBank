    // resources/js/Components/Layouts/UserLayout.jsx
    import { useState } from 'react';
    import { Link, usePage } from '@inertiajs/react';
    import ProfileDropdown from './ProfileDropdown';
    import { Target, CreditCard, Settings, Menu, Home, Sparkles, Star, X, TrendingUp } from 'lucide-react';
    import FloatingButton from '../Support/FloatingButton';

    export default function UserLayout({ user, header, children }) {
        const [sidebarOpen, setSidebarOpen] = useState(false);
        const { url } = usePage();

        const isUrlActive = (path) => url.startsWith(path);

        return (
            <div className="min-h-screen bg-teal-50/30">
                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-teal-900/20 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* SIDEBAR — teal-themed */}
                <aside className={`
                    fixed top-0 left-0 h-full w-64 bg-white border-r border-teal-100 z-50 transform transition-transform duration-300
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 flex flex-col
                `}>
                    {/* Brand */}
                    <div className="p-6 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img 
                                    src="/images/logo.png" 
                                    alt="Logo" 
                                    className="w-9 h-9 object-contain rounded-xl shadow-sm border border-teal-100" 
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.src = "https://ui-avatars.com/api/?name=YM&background=0F766E&color=fff&rounded=true&bold=true";
                                    }}
                                />
                                <div>
                                    <h1 className="font-black text-lg text-teal-900 leading-none tracking-tight">Youth Money</h1>
                                    <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest mt-0.5">Bank</p>
                                </div>
                            </div>
                            {/* Close button (mobile only) */}
                            <button 
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-1.5 hover:bg-teal-50 text-teal-600 rounded-lg transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="px-4 py-2 space-y-1 flex-1 overflow-y-auto">
                        <p className="text-[9px] font-bold text-teal-500 uppercase tracking-widest px-4 mb-2">
                            Menu
                        </p>
                        
                        {/* Dashboard */}
                        <Link 
                            href="/dashboard" 
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                                isUrlActive('/dashboard') 
                                    ? 'bg-teal-50 text-teal-700 font-bold border border-teal-100' 
                                    : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-700 font-medium'
                            }`}
                        >
                            <Home className="w-4 h-4" strokeWidth={isUrlActive('/dashboard') ? 2.5 : 2} />
                            <span className="text-sm">Dashboard</span>
                        </Link>
                        
                        {/* Transactions */}
                        <Link 
                            href="/transactions" 
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                                isUrlActive('/transactions') 
                                    ? 'bg-teal-50 text-teal-700 font-bold border border-teal-100' 
                                    : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-700 font-medium'
                            }`}
                        >
                            <CreditCard className="w-4 h-4" strokeWidth={isUrlActive('/transactions') ? 2.5 : 2} />
                            <span className="text-sm">Transactions</span>
                        </Link>
                        
                        {/* Savings (Goals) */}
                        <Link 
                            href="/goals" 
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                                isUrlActive('/goals') 
                                    ? 'bg-teal-50 text-teal-700 font-bold border border-teal-100' 
                                    : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-700 font-medium'
                            }`}
                        >
                            <Target className="w-4 h-4" strokeWidth={isUrlActive('/goals') ? 2.5 : 2} />
                            <span className="text-sm">Savings</span>
                        </Link>
                        
                        {/* Insights */}
                        <Link 
                            href="/insights" 
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                                isUrlActive('/insights') 
                                    ? 'bg-teal-50 text-teal-700 font-bold border border-teal-100' 
                                    : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-700 font-medium'
                            }`}
                        >
                            <TrendingUp className="w-4 h-4" strokeWidth={isUrlActive('/insights') ? 2.5 : 2} />
                            <span className="text-sm">Insights</span>
                        </Link>
                        
                        {/* Settings */}
                        <Link 
                            href="/settings" 
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                                isUrlActive('/settings') 
                                    ? 'bg-teal-50 text-teal-700 font-bold border border-teal-100' 
                                    : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-700 font-medium'
                            }`}
                        >
                            <Settings className="w-4 h-4" strokeWidth={isUrlActive('/settings') ? 2.5 : 2} />
                            <span className="text-sm">Settings</span>
                        </Link>
                    </nav>

                    {/* Footer */}
                    <div className="px-6 pb-6 pt-4 border-t border-teal-100">
                        <p className="text-[9px] font-medium text-teal-500 text-center">
                            Banking for Filipino teens
                        </p>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <div className="lg:ml-64 flex flex-col min-h-screen">
                    
                    {/* HEADER */}
                    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-30 border-b border-teal-100 shadow-sm">
                        <div className="flex items-center justify-between px-4 py-3 lg:px-8">
                            
                            {/* LEFT: Mobile menu + page title */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-2 hover:bg-teal-50 text-teal-700 rounded-lg transition-colors cursor-pointer"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                                <h2 className="text-base font-bold text-teal-900 hidden sm:block tracking-tight">
                                    {header || "Dashboard"}
                                </h2>
                            </div>

                            {/* RIGHT: Tier badge + Profile */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                
                                {/* Tier-aware button — Upgrade for Tier 1/2, Achiever badge for Tier 3 */}
                                {Number(user?.kyc_tier || 1) < 3 ? (
                                    <Link 
                                        href="/settings?tab=upgrade"
                                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 text-amber-950 text-[11px] font-black rounded-full transition-all shadow-md shadow-amber-300/50 hover:shadow-lg hover:shadow-amber-400/60 hover:scale-105 cursor-pointer group ring-1 ring-amber-400/30"
                                    >
                                        <Sparkles size={13} className="text-amber-700 group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
                                        <span className="tracking-tight">Upgrade to Tier {Number(user?.kyc_tier || 1) + 1}</span>
                                    </Link>
                                ) : (
                                    <Link 
                                        href="/settings?tab=upgrade"
                                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-600 hover:to-amber-700 text-amber-950 text-[11px] font-black rounded-full shadow-md shadow-amber-400/40 hover:shadow-lg hover:shadow-amber-500/50 ring-1 ring-amber-500/40 transition-all hover:scale-105 cursor-pointer group"
                                    >
                                        <Star size={13} className="text-amber-800 fill-amber-700 group-hover:animate-pulse" strokeWidth={2.5} />
                                        <span className="tracking-tight">Achiever Member</span>
                                    </Link>
                                )}

                                {/* Profile dropdown */}
                                <ProfileDropdown user={user} />
                            </div>
                        </div>
                    </header>

                    {/* MAIN */}
                    <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
                        {children}
                    </main>
                    
                    <FloatingButton isAuthenticated={true} currentUser={user} />
                </div>
            </div>
        );
    }