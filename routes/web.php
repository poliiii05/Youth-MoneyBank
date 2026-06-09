<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Api\CaptchaController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\SavingsGoalController;
use App\Http\Controllers\User\WalletController;

//---------------------------------------------//
//   Turnstile verification                    //
//---------------------------------------------//

Route::post('/verify-turnstile', [CaptchaController::class, 'verify'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])
    ->name('verify.turnstile');

//---------------------------------------------//
//   Google OAuth Routes                       //
//---------------------------------------------//

Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');

//---------------------------------------------//
//   Public Pages                              //
//---------------------------------------------//

Route::get('/', function () {
    return Inertia::render('Public/Landing');
});

Route::get('/home', function () {
    return Inertia::render('Public/Home');
});

Route::get('/about', function () {
    return Inertia::render('Public/About');
});

Route::get('/faq', function () {
    return Inertia::render('Public/FAQs');
});

//---------------------------------------------//
//   Auth Routes (Login & SignUp)              //
//---------------------------------------------//

Route::get('/login', function () {
    return Inertia::render('Auth/Login');
})->name('login');

Route::get('/signup', function () {
    return Inertia::render('Auth/SignUp');
})->name('signup');

Route::post('/login', function (Request $request) {
    // Handle phone + OTP login logic here
})->name('login.store');

Route::post('/signup', function (Request $request) {
    // Handle signup logic here
})->name('signup.store');

//---------------------------------------------//
//   Protected Routes (Authenticated)          //
//---------------------------------------------//

Route::middleware(['auth', 'not.suspended'])->group(function (){

    // ====================================================
    // DASHBOARD
    // ====================================================
    Route::get('/dashboard', function () {
        $user = auth()->user();
        $wallet = $user->wallet;

        $mainBalanceCents = $wallet ? $wallet->balance_cents : 0;
        $unallocatedSavingsCents = $wallet ? $wallet->savings_balance_cents : 0;
        $allocatedGoalsCents = $user->savingsGoals()
            ->where('status', '!=', 'deleted')
            ->sum('current_amount_cents');
        $totalSavingsCents = $unallocatedSavingsCents + $allocatedGoalsCents;

        $tier = (int) ($user->kyc_tier ?? 1);
        $maxLimitCents = \App\Services\TierLimitService::getMaxBalanceCents($tier);
        $totalHoldingsCents = \App\Services\TierLimitService::getTotalHoldingsCents($user);
        $remainingCapacityCents = \App\Services\TierLimitService::getRemainingCapacityCents($user);

        // Active goal logic: most funds first, fallback to smallest target
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

        return Inertia::render('User/Dashboard', [
            'auth' => ['user' => $user],
            'finances' => [
                'main_balance' => (float) ($mainBalanceCents / 100),
                'total_savings' => (float) ($totalSavingsCents / 100),
                'max_limit' => (float) ($maxLimitCents / 100),
                'main_balance_cents' => $mainBalanceCents,
                'max_limit_cents' => $maxLimitCents,
                'unallocated_savings' => (float) ($unallocatedSavingsCents / 100),
                'allocated_to_goals' => (float) ($allocatedGoalsCents / 100),
                'total_holdings' => (float) ($totalHoldingsCents / 100),
                'remaining_capacity' => (float) ($remainingCapacityCents / 100),
            ],
            'active_goal' => $activeGoal ? [
                'id' => $activeGoal->id,
                'title' => $activeGoal->title,
                'icon_name' => $activeGoal->icon_name,
                'current_amount' => (float) $activeGoal->current_amount_pesos,
                'target_amount' => (float) $activeGoal->target_amount_pesos,
            ] : null,
            'kyc_tier' => $tier,
            'recent_transactions' => $user->transactions()
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($t) {
                    return [
                        'id' => $t->id,
                        'title' => $t->title,
                        'type' => $t->type,
                        'amount' => (float) $t->amount_pesos,
                        'is_positive' => $t->is_positive,
                        'status' => $t->status,
                        'public_reference_id' => $t->public_reference_id,
                        'created_at' => $t->created_at,
                    ];
                }),
        ]);
    })->name('dashboard');

    // ====================================================
    // SAVINGS GOALS
    // ====================================================
    Route::get('/goals', [SavingsGoalController::class, 'index'])->name('goals.index');
    Route::post('/goals', [SavingsGoalController::class, 'store'])->name('goals.store');

    // ====================================================
    // TRANSACTIONS — list with 30-day filter + pagination
    // ====================================================
    Route::get('/transactions', function () {
        $user = auth()->user();

        $perPage = 10;
        $page = (int) request('page', 1);
        $showAll = request('show_all') === '1';

        $query = $user->transactions()
            ->with(['ledgerEntries.ledgerAccount'])
            ->latest();

        if (!$showAll) {
            $query->where('created_at', '>=', now()->subDays(30));
        }

        $totalCount = $query->count();
        $totalPages = max(1, ceil($totalCount / $perPage));

        $transactions = $query
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'title' => $t->title,
                    'type' => $t->type,
                    'amount' => (float) $t->amount_pesos,
                    'is_positive' => $t->is_positive,
                    'status' => $t->status,
                    'reference_id' => $t->reference_id,
                    'public_reference_id' => $t->public_reference_id,
                    'created_at' => $t->created_at,
                    'ledger_entries_count' => $t->ledgerEntries->count(),
                ];
            });

        $hasOlderTransactions = $user->transactions()
            ->where('created_at', '<', now()->subDays(30))
            ->exists();

        return inertia('User/Transactions', [
            'auth' => ['user' => $user],
            'transactions' => $transactions,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'total_count' => $totalCount,
                'per_page' => $perPage,
                'from' => $totalCount > 0 ? ($page - 1) * $perPage + 1 : 0,
                'to' => min($page * $perPage, $totalCount),
            ],
            'filters' => [
                'show_all' => $showAll,
                'has_older' => $hasOlderTransactions,
            ],
        ]);
    })->name('transactions');

    // ====================================================
    // TRANSACTION DETAIL
    // ====================================================
    Route::get('/transactions/{transaction}', function (\App\Models\Transaction $transaction) {
        $user = auth()->user();

        if ($transaction->user_id !== $user->id) {
            abort(403, 'You do not have permission to view this transaction.');
        }

        $transaction->load(['ledgerEntries.ledgerAccount']);

        return inertia('User/TransactionDetail', [
            'auth' => ['user' => $user],
            'transaction' => [
                'id' => $transaction->id,
                'title' => $transaction->title,
                'type' => $transaction->type,
                'amount' => (float) $transaction->amount_pesos,
                'is_positive' => $transaction->is_positive,
                'status' => $transaction->status,
                'description' => $transaction->description,
                'reference_id' => $transaction->reference_id,
                'public_reference_id' => $transaction->public_reference_id,
                'created_at' => $transaction->created_at,
                'ledger_entries' => $transaction->ledgerEntries
                    ->sortBy(function ($entry) {
                        return $entry->direction === 'debit' ? 0 : 1;
                    })
                    ->values()
                    ->map(function ($entry) {
                        return [
                            'id' => $entry->id,
                            'direction' => $entry->direction,
                            'amount' => (float) ($entry->amount_cents / 100),
                            'account_name' => $entry->ledgerAccount?->name ?? 'Unknown',
                            'account_type' => $entry->ledgerAccount?->type ?? 'unknown',
                            'account_code' => $entry->ledgerAccount?->code ?? null,
                        ];
                    }),
            ],
        ]);
    })->name('transactions.show');

    // ====================================================
    // SETTINGS
    // ====================================================
    Route::get('/settings', [\App\Http\Controllers\User\SettingsController::class, 'index'])
        ->name('settings');

    Route::patch('/settings/profile', [\App\Http\Controllers\User\SettingsController::class, 'updateProfile'])
        ->name('settings.profile.update');

    // ====================================================
    // WALLET
    // ====================================================
    Route::post('/wallet/add-money', [WalletController::class, 'addMoney'])->name('wallet.add-money');

    // ====================================================
    // GOAL ALLOCATIONS
    // ====================================================
    Route::post('/goals/{goal}/allocate', [\App\Http\Controllers\User\GoalAllocationController::class, 'allocate'])
        ->name('goals.allocate');

    Route::post('/goals/{goal}/deallocate', [\App\Http\Controllers\User\GoalAllocationController::class, 'deallocate'])
        ->name('goals.deallocate');

    Route::post('/goals/{goal}/update', [\App\Http\Controllers\SavingsGoalController::class, 'update'])
        ->name('goals.update');

    Route::post('/goals/{goal}/delete', [\App\Http\Controllers\SavingsGoalController::class, 'destroy'])
        ->name('goals.destroy');

    Route::get('/goals/{goal}/details', [\App\Http\Controllers\SavingsGoalController::class, 'showDetails'])
        ->name('goals.details');

    // ====================================================
    // SAVINGS TRANSFERS (Main Wallet ↔ Savings Pool)
    // ====================================================
    Route::post('/savings/add', [\App\Http\Controllers\User\SavingsTransferController::class, 'addToSavings'])
        ->name('savings.add');

    Route::post('/savings/withdraw', [\App\Http\Controllers\User\SavingsTransferController::class, 'withdrawFromSavings'])
        ->name('savings.withdraw');

    // ====================================================
    // KYC
    // ====================================================
    Route::post('/kyc/submit', [\App\Http\Controllers\User\KycController::class, 'submit'])
        ->name('kyc.submit');

    Route::get('/kyc/status', [\App\Http\Controllers\User\KycController::class, 'status'])
        ->name('kyc.status');

    // ====================================================
    // ADMIN ROUTES 
    // ====================================================
    Route::prefix('admin')->name('admin.')->middleware(['role:any'])->group(function () {

        Route::get('/', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])
            ->name('dashboard');
        
        // API: Real-time recent transactions (for polling)
        Route::get('/api/recent-transactions', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'recentTransactions'])
            ->name('api.recent-transactions');
        
        // KYC Reviews — requires kyc_reviewer or super_admin
        Route::middleware(['role:super_admin,kyc_reviewer'])->group(function () {
            Route::get('/kyc', [\App\Http\Controllers\Admin\KycReviewController::class, 'index'])
                ->name('kyc.index');
            
            Route::get('/kyc/{id}', [\App\Http\Controllers\Admin\KycReviewController::class, 'show'])
                ->whereNumber('id')
                ->name('kyc.show');
            
            Route::post('/kyc/{id}/approve', [\App\Http\Controllers\Admin\KycReviewController::class, 'approve'])
                ->whereNumber('id')
                ->name('kyc.approve');
            
            Route::post('/kyc/{id}/reject', [\App\Http\Controllers\Admin\KycReviewController::class, 'reject'])
                ->whereNumber('id')
                ->name('kyc.reject');
        });

        // User Management — read access for any admin, write only for super_admin
        Route::get('/users', [\App\Http\Controllers\Admin\UserManagementController::class, 'index'])
            ->name('users.index');

        Route::get('/users/{id}', [\App\Http\Controllers\Admin\UserManagementController::class, 'show'])
            ->whereNumber('id')
            ->name('users.show');

       // Write actions — super_admin only
        Route::middleware(['role:super_admin'])->group(function () {
            Route::post('/users/{id}/override-tier', [\App\Http\Controllers\Admin\UserManagementController::class, 'overrideTier'])
                ->whereNumber('id')
                ->name('users.override-tier');
            
            Route::post('/users/{id}/toggle-suspension', [\App\Http\Controllers\Admin\UserManagementController::class, 'toggleSuspension'])
                ->whereNumber('id')
                ->name('users.toggle-suspension');
            
            Route::post('/users/{id}/force-logout', [\App\Http\Controllers\Admin\UserManagementController::class, 'forceLogout'])
                ->whereNumber('id')
                ->name('users.force-logout');
        });
    });

    // ====================================================
    // LOGOUT
    // ====================================================
    Route::post('/logout', function (Request $request) {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Inertia::location('/');
    })->name('logout');

});