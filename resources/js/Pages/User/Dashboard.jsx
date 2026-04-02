import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Wallet, TrendingUp, Target, Send, Download, 
    Settings, LogOut, Menu, Home, CreditCard, 
    PieChart, Bell, CheckCircle2 
} from 'lucide-react';

export default function Dashboard({ auth, user }) {
    const { props } = usePage();
    
    // Safety net para sa user data
    const currentUser = auth?.user || user || props.auth?.user;

    const [currentPage, setCurrentPage] = useState('home');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('login') === 'success') {
            setShowWelcomeMessage(true);
            window.history.replaceState(null, '', window.location.pathname);
            setTimeout(() => {
                setShowWelcomeMessage(false);
            }, 5000);
        }
    }, []);

    // Kung naglo-load pa lang ang data
    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    // LOGOUT FUNCTION - Ito ang tatawag sa route sa web.php
    const handleLogout = (e) => {
        e.preventDefault();
        
        // Gagamit tayo ng Inertia router para malinis ang transition
        router.post('/logout', {}, {
            onBefore: () => confirm('Are you sure you want to logout?'),
            onSuccess: () => {
                // Pagka-success, lilinisin ang local storage para fresh start next time
                localStorage.clear(); 
            }
        });
    };

    const userData = {
        name: currentUser.name || 'User',
        email: currentUser.email || '',
        accountNumber: `YMB-2024-${String(currentUser.id || '1').padStart(5, '0')}`,
        balance: 0.00,
        savings: 0.00,
        profilePicture: currentUser.profile_picture || currentUser.avatar || null
    };

    const menuItems = [
        { id: 'home', name: 'Dashboard', icon: Home },
        { id: 'transactions', name: 'Transactions', icon: CreditCard },
        { id: 'savings', name: 'Savings Goals', icon: Target },
        { id: 'analytics', name: 'Analytics', icon: PieChart },
        { id: 'settings', name: 'Settings', icon: Settings },
    ];

    const recentTransactions = [
        { id: 1, type: 'receive', name: 'Welcome Bonus', amount: 500, date: new Date().toLocaleDateString(), time: 'Now' },
    ];

    return (
        <>
            <Head title="Dashboard | Youth Money Bank" />
            
            {/* WELCOME POP-UP */}
            {showWelcomeMessage && (
                <div className="fixed top-5 right-5 z-[100] animate-bounce-in">
                    <div className="bg-white rounded-xl shadow-2xl border-l-4 border-green-500 p-4 max-w-sm flex items-start gap-4">
                        <div className="bg-green-100 rounded-full p-2">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">Login Successful!</h3>
                            <p className="text-gray-600 text-xs mt-1">Welcome back, {userData.name.split(' ')[0]}.</p>
                        </div>
                        <button 
                            onClick={() => setShowWelcomeMessage(false)}
                            className="text-gray-400 hover:text-gray-600 ml-auto"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

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

                    {/* Navigation */}
                    <nav className="p-4 space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setCurrentPage(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                        ${isActive 
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium text-sm">{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* LOGOUT BUTTON - FIXED FOR INERTIA */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all font-semibold text-sm"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout securely</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="lg:ml-64">
                    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-100">
                        <div className="flex items-center justify-between px-4 py-4 lg:px-8">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-2 hover:bg-blue-50 text-gray-600 rounded-lg transition-colors"
                                >
                                    <Menu className="w-6 h-6" />
                                </button>
                                <h2 className="text-xl font-bold text-gray-800 hidden sm:block uppercase tracking-tight">Dashboard Overview</h2>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden md:block relative">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-64 px-4 py-2 pl-10 bg-gray-100/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                    />
                                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                                </div>

                                <button className="relative p-2 text-gray-600 hover:bg-blue-50 rounded-xl transition-colors">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                </button>
                            </div>
                        </div>
                    </header>

                    <main className="p-4 lg:p-8 max-w-7xl mx-auto">
                        {/* Welcome Banner */}
                        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Hello, {userData.name.split(' ')[0]}! 👋</h2>
                                <p className="text-gray-500 text-sm mt-1">Ready to manage your wealth today?</p>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">
                                Connect Bank Account
                            </button>
                        </div>

                        {/* Balance Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                                <p className="text-blue-100 text-sm font-medium mb-1">Total Balance</p>
                                <p className="text-3xl font-bold tracking-tight">₱{userData.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                                <div className="mt-8 flex justify-between items-center opacity-50">
                                    <p className="text-xs font-mono tracking-widest">{userData.accountNumber}</p>
                                    <Wallet size={32} />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                                <p className="text-emerald-100 text-sm font-medium mb-1">Total Savings</p>
                                <p className="text-3xl font-bold tracking-tight">₱{userData.savings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                                <div className="mt-8 flex justify-between items-center opacity-50">
                                    <p className="text-xs font-bold uppercase tracking-widest italic">Savings Account</p>
                                    <Target size={32} />
                                </div>
                            </div>

                            <div className="bg-white border-2 border-dashed border-gray-200 p-6 rounded-2xl flex flex-col justify-center items-center text-center hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <span className="text-2xl font-bold">+</span>
                                </div>
                                <p className="font-bold text-gray-800 uppercase tracking-tighter">Create New Goal</p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-tight">Quick Actions</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                                <button className="flex flex-col items-center gap-3 group">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"><Send size={24} /></div>
                                    <span className="font-bold text-xs text-gray-700">Send Money</span>
                                </button>
                                <button className="flex flex-col items-center gap-3 group">
                                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm"><Download size={24} /></div>
                                    <span className="font-bold text-xs text-gray-700">Request</span>
                                </button>
                                <button className="flex flex-col items-center gap-3 group">
                                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm"><TrendingUp size={24} /></div>
                                    <span className="font-bold text-xs text-gray-700">Invest</span>
                                </button>
                                <button className="flex flex-col items-center gap-3 group">
                                    <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm"><CreditCard size={24} /></div>
                                    <span className="font-bold text-xs text-gray-700">Pay Bills</span>
                                </button>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50/50">
                                <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
                                <button className="text-blue-600 font-bold text-sm">View All</button>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {recentTransactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                                                <Download className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{tx.name}</p>
                                                <p className="text-xs text-gray-500 font-medium">{tx.date} • {tx.time}</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-green-600">+₱{tx.amount.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <style>{`
                @keyframes bounce-in {
                    0% { transform: translateY(-100%); opacity: 0; }
                    50% { transform: translateY(10%); opacity: 1; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
        </>
    );
}