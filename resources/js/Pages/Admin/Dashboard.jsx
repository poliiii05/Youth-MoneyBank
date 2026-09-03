// resources/js/Pages/Admin/Dashboard.jsx
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import StatCard from '../../Components/Admin/StatCard';
import TierDistributionCard from '../../Components/Admin/Dashboard/TierDistributionCard';
import ActivityAnalyticsCard from '../../Components/Admin/Dashboard/ActivityAnalyticsCard';
import RecentTransactionsCard from '../../Components/Admin/Dashboard/RecentTransactionsCard';
import RecentKycCard from '../../Components/Admin/Dashboard/RecentKycCard';
import { Users, Wallet, FileCheck, Target } from 'lucide-react';

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
    const [isRefreshing, setIsRefreshing] = useState(false);

    const defaultStats = {
    total_users: 0,
    users_this_week: 0,
    total_volume: 0,
    volume_this_month: 0,
    pending_kyc: 0,
    active_goals: 0,
    goals_this_week: 0,
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
            },
        });
    };

    return (
        <AdminLayout 
            user={user} 
            header="Dashboard" 
            pendingCounts={pendingCounts}
        >
            <Head title="Admin Dashboard | Youth MoneyBank" />

            <div className="max-w-7xl space-y-4">
                {/* ROW 1: KPI Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard 
                        label="Total Users" 
                        value={s.total_users.toLocaleString()} 
                        icon={Users} 
                        color="neutral"
                        subText={`+${s.users_this_week} this week`}
                    />
                    <StatCard 
                        label="Total Volume" 
                        value={formatPesoShort(s.total_volume)} 
                        icon={Wallet} 
                        color="emerald"
                        subText={`+${formatPesoShort(s.volume_this_month)} this month`}
                    />
                    <StatCard 
                        label="Pending KYC" 
                        value={s.pending_kyc.toLocaleString()} 
                        icon={FileCheck} 
                        color="amber"
                        subText="Awaiting review"
                        onClick={() => window.location.href = '/admin/kyc?status=pending'}
                    />
                    <StatCard 
                        label="Active Goals" 
                        value={s.active_goals.toLocaleString()} 
                        icon={Target} 
                        color="neutral"
                        subText={`+${s.goals_this_week} this week`}
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