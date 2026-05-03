// resources/js/Layouts/UserLayout.jsx
import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Wallet, Target, CreditCard, PieChart, Settings, LogOut, Menu, Home, Bell } from 'lucide-react';

export default function UserLayout({ user, header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Safety fallback kung sakaling walang user prop
    const userData = {
        name: user?.name || 'User',
        accountNumber: `YMB-2024-${String(user?.id || '1').padStart(5, '0')}`,
        profilePicture: user?.profile_picture || null
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout', {}, {
            onBefore: () => confirm('Are you sure you want to logout?'),
            onSuccess: () => localStorage.clear()
        });
    };

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
                lg:translate-x-0
            `}>
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                            YM
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-gray-900 leading-tight">Youth Money</h1>
                            <p className="text-xs text-gray-500 font-medium">Bank</p>
                        </div>
                    </div>
                    
                    {/* User Profile */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50">
                        {userData.profilePicture ? (
                            <img src={userData.profilePicture} alt="Profile" className="w-10 h-10 rounded-full shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                                {userData.name.charAt(0)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">{userData.name}</p>
                            <p className="text-xs text-gray-600 truncate">{userData.accountNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation - Gamit na ang Inertia Link imbes na state */}
                <nav className="p-4 space-y-1">
                    <Link href="/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        <Home className="w-5 h-5" />
                        <span className="font-medium text-sm">Dashboard</span>
                    </Link>
                    <Link href="/transactions" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        <CreditCard className="w-5 h-5" />
                        <span className="font-medium text-sm">Transactions</span>
                    </Link>
                    <Link href="/goals" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        <Target className="w-5 h-5" />
                        <span className="font-medium text-sm">Savings Goals</span>
                    </Link>
                    <Link href="/summary" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        <PieChart className="w-5 h-5" />
                        <span className="font-medium text-sm">Spending Summary</span>
                    </Link>
                    <Link href="/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium text-sm">Settings</span>
                    </Link>
                </nav>

                {/* Logout Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
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

                {/* Dito papasok yung content ng Dashboard, Transactions, etc. */}
                <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}