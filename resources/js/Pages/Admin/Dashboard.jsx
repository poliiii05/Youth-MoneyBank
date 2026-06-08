// resources/js/Pages/Admin/Dashboard.jsx
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import StatCard from '../../Components/Admin/StatCard';
import TierDistributionCard from '../../Components/Admin/Dashboard/TierDistributionCard';
import ActivityAnalyticsCard from '../../Components/Admin/Dashboard/ActivityAnalyticsCard';
import RecentTransactionsCard from '../../Components/Admin/Dashboard/RecentTransactionsCard';
import RecentKycCard from '../../Components/Admin/Dashboard/RecentKycCard';
import { Users, Activity, TrendingUp, Clock, RefreshCw } from 'lucide-react';

export default function AdminDashboard({ 
    auth, 
    stats = null, 
    tier_distribution = [],
    analytics = null,
    recent_kyc = [], 
    recent_transactions = [],
    pendingCounts = {} 
}) {
    const user = auth?.user;
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    const defaultStats = {
        total_users: 0, active_today: 0, total_volume: 0, pending_kyc: 0,
    };
    const s = stats || defaultStats;

    const formatPesoShort = (amount) => {
        if (amount >= 1000000) return '₱' + (amount / 1000000).toFixed(1) + 'M';
        if (amount >= 1000) return '₱' + (amount / 1000).toFixed(1) + 'K';
        return '₱' + amount.toFixed(0);
    };

    // Auto-refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
        }, 60000); // 60 seconds

        return () => clearInterval(interval);
    }, []);

    // Refresh data via Inertia partial reload
    const refreshData = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['stats', 'tier_distribution', 'analytics', 'recent_kyc', 'pendingCounts'],
            onFinish: () => {
                setIsRefreshing(false);
                setLastRefresh(new Date());
            },
        });
    };

    // Format time since last refresh
    const getTimeSinceRefresh = () => {
        const seconds = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        return `${Math.floor(seconds / 60)}m ago`;
    };

    return (
        <AdminLayout 
            user={user} 
            header="Dashboard" 
            pendingCounts={pendingCounts}
            actions={
                <RefreshIndicator 
                    isRefreshing={isRefreshing}
                    timeSince={getTimeSinceRefresh()}
                    onRefresh={refreshData}
                />
            }
        >
            <Head title="Admin Dashboard | Youth MoneyBank" />

            <div className="max-w-7xl space-y-4">
                {/* ROW 1: KPI Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Total Users" value={s.total_users.toLocaleString()} icon={Users} color="blue" />
                    <StatCard label="Active Today" value={s.active_today.toLocaleString()} icon={Activity} color="emerald" />
                    <StatCard label="Total Volume" value={formatPesoShort(s.total_volume)} icon={TrendingUp} color="purple" />
                    <StatCard 
                        label="Pending KYC" 
                        value={s.pending_kyc.toLocaleString()} 
                        icon={Clock} 
                        color="amber"
                        onClick={() => window.location.href = '/admin/kyc?status=pending'}
                    />
                </div>

                {/* ROW 2: Tier Distribution + Activity Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-1">
                        <TierDistributionCard data={tier_distribution} />
                    </div>
                    <div className="lg:col-span-2">
                        <ActivityAnalyticsCard analytics={analytics} />
                    </div>
                </div>

                {/* ROW 3: Recent Transactions + Recent KYC */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <RecentTransactionsCard initialTransactions={recent_transactions} />
                    <RecentKycCard applications={recent_kyc} />
                </div>
            </div>
        </AdminLayout>
    );
}

// Refresh indicator badge sa header
function RefreshIndicator({ isRefreshing, timeSince, onRefresh }) {
    return (
        <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
            title="Manual refresh"
        >
            <RefreshCw 
                size={12} 
                className={`text-slate-600 group-hover:text-slate-900 ${isRefreshing ? 'animate-spin' : ''}`} 
                strokeWidth={2.5}
            />
            <div className="hidden sm:flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                    {isRefreshing ? 'Refreshing' : timeSince}
                </span>
            </div>
        </button>
    );
}