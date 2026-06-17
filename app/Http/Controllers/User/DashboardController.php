<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use App\Services\TierLimitService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Main dashboard page.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return redirect('/admin');
        }

        return Inertia::render('User/Dashboard', [
            'auth' => ['user' => $user],
            'finances' => $this->getFinances($user),
            'active_goal' => $this->getActiveGoal($user),
            'kyc_tier' => (int) ($user->kyc_tier ?? 1),
            'recent_transactions' => $this->getRecentTransactions($user),
            'streak_preview' => $this->getStreakPreview($user),
            'spending_preview' => $this->getSpendingPreview($user),
            'is_new_user' => is_null($user->onboarded_at),

        ]);
    }

    /**
     * Full insights page — Strava-style heatmap, achievement badges, spending breakdown.
     */
    public function insights(Request $request)
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return redirect('/admin');
        }

        $smartInsights = $this->getSmartInsights($user);

        return Inertia::render('User/Insights', [
            'auth' => ['user' => $user],
            'streak' => $this->getFullStreak($user),
            'smart_insights' => $smartInsights,
            'personality' => $this->getSavingsPersonality($user),
            'achievements' => $this->getAchievements($user),
            'dynamic_tip' => $this->getDynamicTip($user, $smartInsights),
        ]);
    }

    /**
     * Financial summary.
     */
    private function getFinances(User $user): array
    {
        $wallet = $user->wallet;
        $mainBalanceCents = $wallet ? $wallet->balance_cents : 0;
        $unallocatedSavingsCents = $wallet ? $wallet->savings_balance_cents : 0;
        $allocatedGoalsCents = $user->savingsGoals()
            ->where('status', '!=', 'deleted')
            ->sum('current_amount_cents');
        $totalSavingsCents = $unallocatedSavingsCents + $allocatedGoalsCents;

        $tier = (int) ($user->kyc_tier ?? 1);
        $maxLimitCents = TierLimitService::getMaxBalanceCents($tier);
        $totalHoldingsCents = TierLimitService::getTotalHoldingsCents($user);
        $remainingCapacityCents = TierLimitService::getRemainingCapacityCents($user);

        return [
            'main_balance' => (float) ($mainBalanceCents / 100),
            'total_savings' => (float) ($totalSavingsCents / 100),
            'max_limit' => (float) ($maxLimitCents / 100),
            'main_balance_cents' => $mainBalanceCents,
            'max_limit_cents' => $maxLimitCents,
            'unallocated_savings' => (float) ($unallocatedSavingsCents / 100),
            'allocated_to_goals' => (float) ($allocatedGoalsCents / 100),
            'total_holdings' => (float) ($totalHoldingsCents / 100),
            'remaining_capacity' => (float) ($remainingCapacityCents / 100),
        ];
    }

    /**
     * Most-funded active goal, or smallest target if none funded.
     */
    private function getActiveGoal(User $user): ?array
    {
        $activeGoal = $user->savingsGoals()
            ->where('status', '!=', 'deleted')
            ->where('current_amount_cents', '>', 0)
            ->orderBy('current_amount_cents', 'desc')
            ->first();

        if (!$activeGoal) {
            $activeGoal = $user->savingsGoals()
                ->where('status', '!=', 'deleted')
                ->orderBy('target_amount_cents', 'asc')
                ->first();
        }

        if (!$activeGoal) {
            return null;
        }

        return [
            'id' => $activeGoal->id,
            'title' => $activeGoal->title,
            'icon_name' => $activeGoal->icon_name,
            'current_amount' => (float) $activeGoal->current_amount_pesos,
            'target_amount' => (float) $activeGoal->target_amount_pesos,
        ];
    }

    /**
     * Latest 5 transactions.
     */
    private function getRecentTransactions(User $user): array
    {
        return $user->transactions()
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'type' => $t->type,
                'amount' => (float) $t->amount_pesos,
                'is_positive' => $t->is_positive,
                'status' => $t->status,
                'public_reference_id' => $t->public_reference_id,
                'created_at' => $t->created_at,
            ])
            ->toArray();
    }

    /**
     * Compact streak preview for Dashboard (last 7 days + current streak).
     */
    private function getStreakPreview(User $user): array
    {
        $streak = $this->computeStreak($user, 7);

        return [
            'current_streak' => $streak['current_streak'],
            'best_streak' => $streak['best_streak'],
            'next_milestone' => $streak['next_milestone'],
            'progress_to_next' => $streak['progress_to_next'],
            'last_7_days' => $streak['heatmap'], // array of 0/1 for last 7 days
        ];
    }

    /**
     * Compact spending preview for Dashboard (this month total + top 3 categories).
     */
    private function getSpendingPreview(User $user): array
    {
        $insights = $this->computeSpendingInsights($user);

        return [
            'this_month_total' => $insights['this_month_total'],
            'percent_change' => $insights['percent_change'],
            'top_categories' => array_slice($insights['top_categories'], 0, 3),
        ];
    }

    /**
     * Full streak data for Insights page (30 days + achievements).
     */
    private function getFullStreak(User $user): array
    {
        $streak = $this->computeStreak($user, 30);

        // Achievement milestones
        $milestones = [7, 14, 30, 60, 100, 365];
        $achievements = [];
        foreach ($milestones as $m) {
            $achievements[] = [
                'days' => $m,
                'unlocked' => $streak['best_streak'] >= $m,
                'label' => $this->milestoneLabel($m),
            ];
        }

        return [
            'current_streak' => $streak['current_streak'],
            'best_streak' => $streak['best_streak'],
            'next_milestone' => $streak['next_milestone'],
            'progress_to_next' => $streak['progress_to_next'],
            'heatmap_30_days' => $streak['heatmap'],
            'total_active_days' => array_sum($streak['heatmap']),
            'achievements' => $achievements,
            'saved_today' => $streak['saved_today'],
        ];
    }

    /**
     * Full spending insights for Insights page.
     */
    private function getFullSpendingInsights(User $user): array
    {
        return $this->computeSpendingInsights($user);
    }

    /**
 * Core streak calculation.
 * Returns: current_streak, best_streak, next_milestone, heatmap (0/1 array for last N days), saved_today
 */
private function computeStreak(User $user, int $days = 30): array
{
    // Get ALL distinct savings dates (entire history, for all-time best)
    $allSavingsDates = Transaction::where('user_id', $user->id)
        ->whereIn('type', ['savings_deposit', 'savings_transfer', 'goal_allocation'])
        ->where('status', 'completed')
        ->selectRaw('DATE(created_at) as date')
        ->distinct()
        ->orderBy('date', 'asc')
        ->pluck('date')
        ->map(fn($d) => \Carbon\Carbon::parse($d)->toDateString())
        ->values();

    // Build heatmap (last N days, 0 = no savings, 1 = saved)
    $heatmap = [];
    $today = now()->startOfDay();
    $savingsSet = array_flip($allSavingsDates->toArray());

    for ($i = $days - 1; $i >= 0; $i--) {
        $date = $today->copy()->subDays($i)->toDateString();
        $heatmap[] = isset($savingsSet[$date]) ? 1 : 0;
    }

    // Calculate current streak (count back from today)
    $currentStreak = 0;
    for ($i = $days - 1; $i >= 0; $i--) {
        if ($heatmap[$i] === 1) {
            $currentStreak++;
        } else {
            break;
        }
    }

    // Calculate ALL-TIME best streak from full history
    $bestStreak = 0;
    $runningStreak = 0;
    $previousDate = null;

    foreach ($allSavingsDates as $dateStr) {
        $date = \Carbon\Carbon::parse($dateStr);
        
        if ($previousDate === null) {
            $runningStreak = 1;
        } elseif ($previousDate->copy()->addDay()->toDateString() === $dateStr) {
            // Consecutive day
            $runningStreak++;
        } else {
            // Broke streak
            $bestStreak = max($bestStreak, $runningStreak);
            $runningStreak = 1;
        }
        
        $previousDate = $date;
    }

    // Final check for last run
    $bestStreak = max($bestStreak, $runningStreak);
    
    // Best can also be current
    $bestStreak = max($bestStreak, $currentStreak);

    // Continuous milestones — never-ending challenge
    $milestones = [7, 14, 30, 60, 100, 180, 365, 500, 730, 1000, 1500, 2000];
    $nextMilestone = 7;
    foreach ($milestones as $m) {
        if ($currentStreak < $m) {
            $nextMilestone = $m;
            break;
        }
    }

    // If past all defined milestones, add 1000 to current
    if ($currentStreak >= end($milestones)) {
        $nextMilestone = $currentStreak + 1000;
    }

    $progressToNext = $nextMilestone > 0
        ? min(100, round(($currentStreak / $nextMilestone) * 100))
        : 100;

    return [
        'current_streak' => $currentStreak,
        'best_streak' => $bestStreak,
        'next_milestone' => $nextMilestone,
        'progress_to_next' => $progressToNext,
        'heatmap' => $heatmap,
        'saved_today' => end($heatmap) === 1,
    ];
}
    /**
     * Core spending insights calculation.
     */
    private function computeSpendingInsights(User $user): array
    {
        // This month outflows
        $thisMonthTotal = Transaction::where('user_id', $user->id)
            ->where('is_positive', false)
            ->where('status', 'completed')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount_cents') / 100;

        // Last month outflows
        $lastMonthTotal = Transaction::where('user_id', $user->id)
            ->where('is_positive', false)
            ->where('status', 'completed')
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->sum('amount_cents') / 100;

        // Percent change
        $percentChange = 0;
        if ($lastMonthTotal > 0) {
            $percentChange = round((($thisMonthTotal - $lastMonthTotal) / $lastMonthTotal) * 100, 1);
        } elseif ($thisMonthTotal > 0) {
            $percentChange = 100;
        }

        // Top categories (by transaction type, since no 'category' field)
        $categoryRaw = Transaction::where('user_id', $user->id)
            ->where('is_positive', false)
            ->where('status', 'completed')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->selectRaw('type, SUM(amount_cents) as total')
            ->groupBy('type')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        $topCategories = $categoryRaw->map(fn($c) => [
            'category' => $this->humanizeCategory($c->type),
            'raw_type' => $c->type,
            'amount' => (float) ($c->total / 100),
            'percentage' => $thisMonthTotal > 0 ? round(($c->total / 100 / $thisMonthTotal) * 100) : 0,
        ])->toArray();

        return [
            'this_month_total' => $thisMonthTotal,
            'last_month_total' => $lastMonthTotal,
            'percent_change' => $percentChange,
            'top_categories' => $topCategories,
            'has_data' => $thisMonthTotal > 0,
        ];
    }

    /**
 * Get savings data for a specific month.
 * 
 * @param User $user
 * @param int $year
 * @param int $month
 * @return array Includes month metadata + daily savings map
 */
public function monthlyStreak(Request $request)
{
    $user = $request->user();
    
    if ($user->isAdmin()) {
        return response()->json(['error' => 'Admin not supported'], 403);
    }

    $year = (int) $request->query('year', now()->year);
    $month = (int) $request->query('month', now()->month);
    
    // Validate
    $year = max(2020, min(2100, $year));
    $month = max(1, min(12, $month));

    $start = \Carbon\Carbon::create($year, $month, 1)->startOfMonth();
    $end = $start->copy()->endOfMonth();
    
    // Get all savings dates within this month
    $savingsDates = Transaction::where('user_id', $user->id)
        ->whereIn('type', ['savings_deposit', 'savings_transfer', 'goal_allocation'])
        ->where('status', 'completed')
        ->whereBetween('created_at', [$start, $end])
        ->selectRaw('DATE(created_at) as date')
        ->distinct()
        ->pluck('date')
        ->map(fn($d) => \Carbon\Carbon::parse($d)->toDateString())
        ->toArray();
    
    $savingsSet = array_flip($savingsDates);
    
    // Build calendar grid (with padding for full weeks)
    $firstDay = $start->copy(); // 1st of month
    $startOfCalendar = $firstDay->copy()->startOfWeek(\Carbon\Carbon::SUNDAY);
    $endOfCalendar = $end->copy()->endOfWeek(\Carbon\Carbon::SATURDAY);
    
    $cells = [];
    $cursor = $startOfCalendar->copy();
    $today = now()->startOfDay();
    
    while ($cursor->lte($endOfCalendar)) {
        $cells[] = [
            'date' => $cursor->toDateString(),
            'day' => $cursor->day,
            'month_label' => $cursor->format('M'),
            'is_current_month' => $cursor->month === $month && $cursor->year === $year,
            'is_today' => $cursor->isSameDay($today),
            'is_future' => $cursor->isAfter($today),
            'is_active' => isset($savingsSet[$cursor->toDateString()]),
            'day_of_week' => $cursor->dayOfWeek, // 0=Sunday
        ];
        $cursor->addDay();
    }

    // Compute global current streak (across all months)
    $streakData = $this->computeStreak($user, 90);

    return response()->json([
        'year' => $year,
        'month' => $month,
        'month_label' => $start->format('F Y'),
        'cells' => $cells,
        'active_days_in_month' => count($savingsDates),
        'current_streak' => $streakData['current_streak'],
        'best_streak' => $streakData['best_streak'],
        'next_milestone' => $streakData['next_milestone'],
        'progress_to_next' => $streakData['progress_to_next'],
        'saved_today' => $streakData['saved_today'],
        'achievements' => collect([7, 14, 30, 60, 100, 365])->map(fn($m) => [
            'days' => $m,
            'unlocked' => $streakData['best_streak'] >= $m,
        ])->toArray(),
    ]);
}

    /**
     * Convert transaction type to human-readable category.
     */
    private function humanizeCategory(?string $type): string
    {
        if (!$type) return 'Other';

        $map = [
            'deposit' => 'Deposit',
            'withdrawal' => 'Withdrawal',
            'savings_deposit' => 'Savings',
            'savings_transfer' => 'Savings Transfer',
            'goal_allocation' => 'Goal Allocation',
            'transfer' => 'Transfer',
            'payment' => 'Payment',
            'fee' => 'Fees',
        ];

        return $map[$type] ?? ucwords(str_replace('_', ' ', $type));
    }

    /**
     * Get human-friendly milestone label.
     */
    private function milestoneLabel(int $days): string
    {
        return match($days) {
            7 => 'One week streak',
            14 => 'Two weeks strong',
            30 => 'One month milestone',
            60 => 'Two months champion',
            100 => '100 days hero',
            365 => 'Year-long legend',
            default => "{$days} day streak",
        };
    }
    /**
 * Get smart insights for the page.
 */
private function getSmartInsights(User $user): array
{
    // Total saved this month
    $thisMonthTotal = Transaction::where('user_id', $user->id)
        ->whereIn('type', ['savings_deposit', 'savings_transfer', 'goal_allocation'])
        ->where('status', 'completed')
        ->whereMonth('created_at', now()->month)
        ->whereYear('created_at', now()->year)
        ->sum('amount_cents') / 100;

    // Deposit count this month
    $thisMonthCount = Transaction::where('user_id', $user->id)
        ->whereIn('type', ['savings_deposit', 'savings_transfer', 'goal_allocation'])
        ->where('status', 'completed')
        ->whereMonth('created_at', now()->month)
        ->whereYear('created_at', now()->year)
        ->count();

    // Weekly average (last 4 weeks)
    $weeklyTotal = Transaction::where('user_id', $user->id)
        ->whereIn('type', ['savings_deposit', 'savings_transfer', 'goal_allocation'])
        ->where('status', 'completed')
        ->where('created_at', '>=', now()->subWeeks(4))
        ->sum('amount_cents') / 100;
    $weeklyAvg = round($weeklyTotal / 4, 2);

    // Goals completed (current_amount >= target_amount)
    $goalsCompleted = $user->savingsGoals()
        ->where('status', '!=', 'deleted')
        ->whereColumn('current_amount_cents', '>=', 'target_amount_cents')
        ->count();

    // Total goals
    $totalGoals = $user->savingsGoals()
        ->where('status', '!=', 'deleted')
        ->count();

    // Best month ever (highest monthly savings)
    $monthlyTotals = Transaction::where('user_id', $user->id)
        ->whereIn('type', ['savings_deposit', 'savings_transfer', 'goal_allocation'])
        ->where('status', 'completed')
        ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(amount_cents) as total')
        ->groupBy('year', 'month')
        ->orderByDesc('total')
        ->first();

    $bestMonth = $monthlyTotals ? [
        'label' => \Carbon\Carbon::create($monthlyTotals->year, $monthlyTotals->month, 1)->format('F Y'),
        'amount' => (float) ($monthlyTotals->total / 100),
    ] : null;

    return [
        'this_month_total' => $thisMonthTotal,
        'this_month_count' => $thisMonthCount,
        'weekly_avg' => $weeklyAvg,
        'goals_completed' => $goalsCompleted,
        'total_goals' => $totalGoals,
        'best_month' => $bestMonth,
    ];
}

/**
 * Determine user's savings personality based on behavior.
 */
private function getSavingsPersonality(User $user): array
{
    $totalSavings = Transaction::where('user_id', $user->id)
        ->whereIn('type', ['savings_deposit', 'savings_transfer', 'goal_allocation'])
        ->where('status', 'completed')
        ->sum('amount_cents');

    if ($totalSavings === 0) {
        return [
            'type' => 'new',
            'emoji' => '🌱',
            'label' => 'New Saver',
            'description' => 'Start your savings journey today!',
            'color' => 'slate',
        ];
    }

    $streak = $this->computeStreak($user, 30);
    $bestStreak = $streak['best_streak'];

    // Count goal-related transactions
    $goalDeposits = Transaction::where('user_id', $user->id)
        ->where('type', 'goal_allocation')
        ->where('status', 'completed')
        ->count();

    $totalDeposits = Transaction::where('user_id', $user->id)
        ->whereIn('type', ['savings_deposit', 'savings_transfer', 'goal_allocation'])
        ->where('status', 'completed')
        ->count();

    $goalRatio = $totalDeposits > 0 ? ($goalDeposits / $totalDeposits) : 0;

    // Classify
    if ($bestStreak >= 14) {
        return [
            'type' => 'streak_master',
            'emoji' => '🔥',
            'label' => 'Streak Master',
            'description' => 'You rarely miss saving days. Consistency is your superpower!',
            'color' => 'amber',
        ];
    } elseif ($goalRatio >= 0.6) {
        return [
            'type' => 'goal_chaser',
            'emoji' => '🚀',
            'label' => 'Goal Chaser',
            'description' => 'Most of your deposits go straight to goals. Focused saver!',
            'color' => 'blue',
        ];
    } else {
        return [
            'type' => 'slow_steady',
            'emoji' => '🐢',
            'label' => 'Slow & Steady',
            'description' => 'You save consistently. Slow progress beats no progress!',
            'color' => 'emerald',
        ];
    }
}

/**
 * Compute multi-category achievements.
 */
private function getAchievements(User $user): array
{
    $totalSavings = Transaction::where('user_id', $user->id)
        ->whereIn('type', ['savings_deposit', 'savings_transfer', 'goal_allocation'])
        ->where('status', 'completed')
        ->sum('amount_cents') / 100;

    $streak = $this->computeStreak($user, 30);
    
    $hasFirstDeposit = Transaction::where('user_id', $user->id)
        ->whereIn('type', ['savings_deposit', 'savings_transfer', 'goal_allocation'])
        ->where('status', 'completed')
        ->exists();

    $hasFirstGoal = $user->savingsGoals()->where('status', '!=', 'deleted')->exists();
    
    $hasCompletedGoal = $user->savingsGoals()
        ->where('status', '!=', 'deleted')
        ->whereColumn('current_amount_cents', '>=', 'target_amount_cents')
        ->exists();

    $tier = (int) ($user->kyc_tier ?? 1);

    return [
        // Savings amount achievements
        ['key' => 'first_deposit', 'label' => 'First Deposit', 'icon' => 'piggy', 'unlocked' => $hasFirstDeposit],
        ['key' => 'saved_100', 'label' => '₱100 Saved', 'icon' => 'coins', 'unlocked' => $totalSavings >= 100],
        ['key' => 'saved_1k', 'label' => '₱1K Saved', 'icon' => 'cash', 'unlocked' => $totalSavings >= 1000],
        ['key' => 'saved_10k', 'label' => '₱10K Saved', 'icon' => 'trophy', 'unlocked' => $totalSavings >= 10000],
        
        // Streak achievements
        ['key' => 'streak_7', 'label' => '7-Day Streak', 'icon' => 'flame', 'unlocked' => $streak['best_streak'] >= 7],
        ['key' => 'streak_30', 'label' => '30-Day Streak', 'icon' => 'flame', 'unlocked' => $streak['best_streak'] >= 30],
        ['key' => 'streak_100', 'label' => '100-Day Streak', 'icon' => 'flame', 'unlocked' => $streak['best_streak'] >= 100],
        ['key' => 'streak_365', 'label' => 'Year Streak', 'icon' => 'trophy', 'unlocked' => $streak['best_streak'] >= 365],
        
        // Goal achievements
        ['key' => 'first_goal', 'label' => 'First Goal', 'icon' => 'target', 'unlocked' => $hasFirstGoal],
        ['key' => 'goal_done', 'label' => 'Goal Achieved', 'icon' => 'check', 'unlocked' => $hasCompletedGoal],
        
        // Tier achievements
        ['key' => 'tier_2', 'label' => 'Tier 2', 'icon' => 'shield', 'unlocked' => $tier >= 2],
        ['key' => 'tier_3', 'label' => 'Tier 3', 'icon' => 'crown', 'unlocked' => $tier >= 3],
    ];
}

/**
 * Generate personalized money tip based on user behavior.
 */
private function getDynamicTip(User $user, array $insights): array
{
    $weeklyAvg = $insights['weekly_avg'] ?? 0;
    $thisMonthTotal = $insights['this_month_total'] ?? 0;

    if ($weeklyAvg > 0) {
        $yearlyProjection = $weeklyAvg * 52;
        return [
            'tip' => "You're saving ₱" . number_format($weeklyAvg, 0) . "/week!",
            'message' => "If you keep this pace, you'll save ₱" . number_format($yearlyProjection, 0) . " by next year. Keep going!",
            'icon' => 'trending_up',
        ];
    } elseif ($thisMonthTotal > 0) {
        return [
            'tip' => "Great start! You saved ₱" . number_format($thisMonthTotal, 0) . " this month.",
            'message' => "Try to save ₱50 daily — that's ₱18,250 a year!",
            'icon' => 'sparkles',
        ];
    } else {
        return [
            'tip' => "Ready to start saving?",
            'message' => "Even ₱50/week adds up to ₱2,600 in a year. Small steps, big results!",
            'icon' => 'rocket',
        ];
    }
}

}