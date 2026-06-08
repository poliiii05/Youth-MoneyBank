<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KycApplication;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $today = now()->startOfDay();

        // ====================================================
        // KPI STATS
        // ====================================================
        $totalUsers = User::whereNull('admin_role')->count();
        
        $activeToday = User::whereNull('admin_role')
            ->whereDate('updated_at', $today)
            ->count();

        $totalVolumeCents = Transaction::whereIn('status', ['completed', 'success'])
            ->sum('amount_cents');

        $pendingKyc = KycApplication::where('status', 'pending')->count();

        $stats = [
            'total_users' => $totalUsers,
            'active_today' => $activeToday,
            'total_volume' => $totalVolumeCents / 100,
            'pending_kyc' => $pendingKyc,
        ];

        // ====================================================
        // TIER DISTRIBUTION (with tier titles)
        // ====================================================
        $tier1 = User::whereNull('admin_role')->where('kyc_tier', 1)->count();
        $tier2 = User::whereNull('admin_role')->where('kyc_tier', 2)->count();
        $tier3 = User::whereNull('admin_role')->where('kyc_tier', 3)->count();
        $totalTierUsers = $tier1 + $tier2 + $tier3;

        $tierDistribution = [
            [
                'name' => 'Tier 1',
                'title' => 'Starter',
                'value' => $tier1,
                'percent' => $totalTierUsers > 0 ? round(($tier1 / $totalTierUsers) * 100) : 0,
                'color' => '#14b8a6', // teal-500
            ],
            [
                'name' => 'Tier 2',
                'title' => 'Builder',
                'value' => $tier2,
                'percent' => $totalTierUsers > 0 ? round(($tier2 / $totalTierUsers) * 100) : 0,
                'color' => '#3b82f6', // blue-500
            ],
            [
                'name' => 'Tier 3',
                'title' => 'Achiever',
                'value' => $tier3,
                'percent' => $totalTierUsers > 0 ? round(($tier3 / $totalTierUsers) * 100) : 0,
                'color' => '#f59e0b', // amber-500
            ],
        ];

        // ====================================================
        // ANALYTICS (calendar-based periods)
        // ====================================================
        $analytics = [
            'weekly' => $this->getWeeklyAnalytics(),
            'monthly' => $this->getMonthlyAnalytics(),
            'yearly' => $this->getYearlyAnalytics(),
        ];

        // ====================================================
        // RECENT KYC
        // ====================================================
        $recentKyc = KycApplication::with('user:id,name,email')
            ->orderBy('submitted_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($app) {
                return [
                    'id' => $app->id,
                    'user_name' => $app->user->name ?? 'Unknown',
                    'target_tier' => $app->target_tier,
                    'status' => $app->status,
                    'submitted_at' => $app->submitted_at?->toIso8601String(),
                    'submitted_relative' => $app->submitted_at?->diffForHumans() ?? '—',
                ];
            });

        // ====================================================
        // RECENT TRANSACTIONS
        // ====================================================
        $recentTransactions = Transaction::with('user:id,name')
            ->whereIn('status', ['completed', 'success'])
            ->latest()
            ->limit(8)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'user_name' => $t->user->name ?? 'Unknown',
                    'title' => $t->title,
                    'amount' => (float) $t->amount_pesos,
                    'is_positive' => $t->is_positive,
                    'created_at' => $t->created_at?->toIso8601String(),
                    'created_relative' => $t->created_at?->diffForHumans() ?? '—',
                ];
            });

        $pendingCounts = ['kyc' => $pendingKyc];

        return Inertia::render('Admin/Dashboard', [
            'auth' => ['user' => $user],
            'stats' => $stats,
            'tier_distribution' => $tierDistribution,
            'analytics' => $analytics,
            'recent_kyc' => $recentKyc,
            'recent_transactions' => $recentTransactions,
            'pendingCounts' => $pendingCounts,
        ]);
    }

    /**
     * Real-time recent transactions endpoint (for polling).
     */
    public function recentTransactions(Request $request)
    {
        $transactions = Transaction::with('user:id,name')
            ->whereIn('status', ['completed', 'success'])
            ->latest()
            ->limit(8)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'user_name' => $t->user->name ?? 'Unknown',
                    'title' => $t->title,
                    'amount' => (float) $t->amount_pesos,
                    'is_positive' => $t->is_positive,
                    'created_at' => $t->created_at?->toIso8601String(),
                    'created_relative' => $t->created_at?->diffForHumans() ?? '—',
                ];
            });

        return response()->json([
            'transactions' => $transactions,
            'fetched_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Weekly analytics: CURRENT week (Mon to Sun).
     * Future days show ₱0 until they happen.
     */
    protected function getWeeklyAnalytics(): array
    {
        $now = now();
        $startOfWeek = $now->copy()->startOfWeek(Carbon::MONDAY);
        $endOfWeek = $now->copy()->endOfWeek(Carbon::SUNDAY);
        
        $previousWeekStart = $startOfWeek->copy()->subWeek();
        $previousWeekEnd = $endOfWeek->copy()->subWeek();

        // Build daily chart for current week (Mon to Sun)
        $chartData = [];
        $totalVolumeCents = 0;
        $totalCount = 0;

        for ($i = 0; $i < 7; $i++) {
            $day = $startOfWeek->copy()->addDays($i);
            
            // Future days (after today) = 0
            $isFuture = $day->isAfter($now->copy()->endOfDay());
            
            $dailyVolumeCents = $isFuture ? 0 : Transaction::whereIn('status', ['completed', 'success'])
                ->whereDate('created_at', $day)
                ->sum('amount_cents');

            $dailyCount = $isFuture ? 0 : Transaction::whereIn('status', ['completed', 'success'])
                ->whereDate('created_at', $day)
                ->count();

            $chartData[] = [
                'label' => $day->format('D'),
                'fullDate' => $day->format('M j'),
                'volume' => $dailyVolumeCents / 100,
                'count' => $dailyCount,
                'isFuture' => $isFuture,
            ];

            $totalVolumeCents += $dailyVolumeCents;
            $totalCount += $dailyCount;
        }

        $previousVolumeCents = Transaction::whereIn('status', ['completed', 'success'])
            ->whereBetween('created_at', [$previousWeekStart, $previousWeekEnd])
            ->sum('amount_cents');

        $activeUsers = User::whereNull('admin_role')
            ->where('updated_at', '>=', $startOfWeek)
            ->count();

        return [
            'total_volume' => $totalVolumeCents / 100,
            'transaction_count' => $totalCount,
            'active_users' => $activeUsers,
            'trend' => $this->calculateTrend($totalVolumeCents / 100, $previousVolumeCents / 100),
            'trend_label' => 'vs last week',
            'period_label' => $startOfWeek->format('M j') . ' - ' . $endOfWeek->format('M j'),
            'chart_data' => $chartData,
        ];
    }

    /**
     * Monthly analytics: current month (Day 1 to last day).
     * Chart shows daily volume for the current month.
     */
    protected function getMonthlyAnalytics(): array
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $previousMonthStart = $startOfMonth->copy()->subMonth();
        $previousMonthEnd = $previousMonthStart->copy()->endOfMonth();

        // Build daily chart for the entire month
        $chartData = [];
        $totalVolumeCents = 0;
        $totalCount = 0;
        $daysInMonth = $endOfMonth->day;

        for ($i = 0; $i < $daysInMonth; $i++) {
            $day = $startOfMonth->copy()->addDays($i);
            
            $dailyVolumeCents = Transaction::whereIn('status', ['completed', 'success'])
                ->whereDate('created_at', $day)
                ->sum('amount_cents');

            $dailyCount = Transaction::whereIn('status', ['completed', 'success'])
                ->whereDate('created_at', $day)
                ->count();

            $chartData[] = [
                'label' => $day->format('j'), // 1, 2, 3, ... 30
                'fullDate' => $day->format('M j'),
                'volume' => $dailyVolumeCents / 100,
                'count' => $dailyCount,
            ];

            $totalVolumeCents += $dailyVolumeCents;
            $totalCount += $dailyCount;
        }

        // Previous month for trend comparison
        $previousVolumeCents = Transaction::whereIn('status', ['completed', 'success'])
            ->whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])
            ->sum('amount_cents');

        $activeUsers = User::whereNull('admin_role')
            ->where('updated_at', '>=', $startOfMonth)
            ->count();

        return [
            'total_volume' => $totalVolumeCents / 100,
            'transaction_count' => $totalCount,
            'active_users' => $activeUsers,
            'trend' => $this->calculateTrend($totalVolumeCents / 100, $previousVolumeCents / 100),
            'trend_label' => 'vs last month',
            'period_label' => $startOfMonth->format('F Y'),
            'chart_data' => $chartData,
        ];
    }

    /**
     * Yearly analytics: current year (Jan to Dec).
     * Chart shows monthly volume for the current year.
     */
    protected function getYearlyAnalytics(): array
    {
        $now = now();
        $startOfYear = $now->copy()->startOfYear();
        $endOfYear = $now->copy()->endOfYear();

        $previousYearStart = $startOfYear->copy()->subYear();
        $previousYearEnd = $previousYearStart->copy()->endOfYear();

        // Build monthly chart for the entire year (12 months)
        $chartData = [];
        $totalVolumeCents = 0;
        $totalCount = 0;

        for ($i = 0; $i < 12; $i++) {
            $monthStart = $startOfYear->copy()->addMonths($i);
            $monthEnd = $monthStart->copy()->endOfMonth();
            
            $monthlyVolumeCents = Transaction::whereIn('status', ['completed', 'success'])
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('amount_cents');

            $monthlyCount = Transaction::whereIn('status', ['completed', 'success'])
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->count();

            $chartData[] = [
                'label' => $monthStart->format('M'), // Jan, Feb, Mar...
                'fullDate' => $monthStart->format('M Y'),
                'volume' => $monthlyVolumeCents / 100,
                'count' => $monthlyCount,
            ];

            $totalVolumeCents += $monthlyVolumeCents;
            $totalCount += $monthlyCount;
        }

        // Previous year for trend comparison
        $previousVolumeCents = Transaction::whereIn('status', ['completed', 'success'])
            ->whereBetween('created_at', [$previousYearStart, $previousYearEnd])
            ->sum('amount_cents');

        $activeUsers = User::whereNull('admin_role')
            ->where('updated_at', '>=', $startOfYear)
            ->count();

        return [
            'total_volume' => $totalVolumeCents / 100,
            'transaction_count' => $totalCount,
            'active_users' => $activeUsers,
            'trend' => $this->calculateTrend($totalVolumeCents / 100, $previousVolumeCents / 100),
            'trend_label' => 'vs last year',
            'period_label' => $now->format('Y'),
            'chart_data' => $chartData,
        ];
    }

    /**
     * Calculate percentage trend.
     */
    protected function calculateTrend(float $current, float $previous): ?array
    {
        if ($previous == 0) {
            return $current > 0 ? ['value' => 100, 'direction' => 'up'] : null;
        }
        
        $change = (($current - $previous) / $previous) * 100;
        $direction = $change >= 0 ? 'up' : 'down';
        return [
            'value' => abs(round($change)),
            'direction' => $direction,
        ];
    }
}