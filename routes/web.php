<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Api\CaptchaController; // sa ano ito, uhm sa parang im not a robot part
use App\Http\Controllers\Auth\GoogleAuthController;  // integration naman ito sa google sign in hehe
use App\Http\Controllers\SavingsGoalController; // para mahanap nya yung file nato, need pala!
use App\Http\Controllers\User\WalletController;

//---------------------------------------------//
//   sa part ito ng parang verified captcha    // -------importanteng part na mauna kasi nageeror haha--------
//---------------------------------------------//

//Route::post('/verify-turnstile', [CaptchaController::class, 'verify']); 
Route::post('/verify-turnstile', [CaptchaController::class, 'verify'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])
    ->name('verify.turnstile');

//---------------------------------------------//
//   Google OAuth Routes part ito hmp          //
//---------------------------------------------//

// 1. Ito ang tatawagin ng React button mo para pumunta sa Google
Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('google.redirect');

// 2. Dito ibabato ni Google ang user pabalik kasama ang data nila
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');

//---------------------------------------------//
//  ito nga ang Public pages routes,uhmki      //
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
//  Auth Routes(Login & SignUp)wag malito okey //
//---------------------------------------------//

Route::get('/login', function () {
    return Inertia::render('Auth/Login');
})->name('login');

Route::get('/signup', function () {
    return Inertia::render('Auth/SignUp');
})->name('signup');

Route::post('/login', function (Request $request) {
    // Handle phone + OTP login logic here
    // You'll need to implement OTP service
})->name('login.store');

Route::post('/signup', function (Request $request) {
    // Handle signup logic here
})->name('signup.store');

//---------------------------------------------//
//    Middleware, procted and user route       //
//---------------------------------------------//


// Lahat ng nasa loob nito ay kailangan NAKA-LOGIN bago mapasok
Route::middleware(['auth'])->group(function () {
    
    // DASHBOARD ROUTE  
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
            
            // Active goal logic — Option C: Most funds first, fallback chain
            // 1. Goal with most current allocation
            // 2. If all empty, goal with smallest target (most achievable)
            // 3. Null if no goals
            $activeGoal = $user->savingsGoals()
                ->where('status', '!=', 'deleted')
                ->where('current_amount_cents', '>', 0)
                ->orderBy('current_amount_cents', 'desc')
                ->first();

            if (!$activeGoal) {
                // Fallback: no goals have funds yet, pick the smallest target (most achievable)
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
                // Bagong breakdown fields
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
                    ->take(3)
                    ->get()
                    ->map(function ($t) {
                        return [
                            'id' => $t->id,
                            'title' => $t->title,
                            'type' => $t->type,
                            'amount' => (float) $t->amount_pesos,
                            'is_positive' => $t->is_positive,
                            'status' => $t->status,
                            'created_at' => $t->created_at,
                        ];
                    }),
            ]);
        })->name('dashboard');

        
    // SAVINGS GOALS ROUTE
    Route::get('/goals', [SavingsGoalController::class, 'index'])->name('goals.index');
    Route::post('/goals', [SavingsGoalController::class, 'store'])->name('goals.store');

    // TRANSACTIONS 
        Route::get('/transactions', function () {
            $user = auth()->user();

            return inertia('User/Transactions', [
                'auth' => ['user' => $user],
                'transactions' => $user->transactions()
                    ->latest()
                    ->get()
                    ->map(function ($t) {
                        return [
                            'id' => $t->id,
                            'title' => $t->title,
                            'type' => $t->type,
                            'amount' => (float) $t->amount_pesos,
                            'is_positive' => $t->is_positive,
                            'status' => $t->status,
                            'created_at' => $t->created_at,
                        ];
                    }),
            ]);
        })->name('transactions');

    //Settings
    Route::get('/Settings', function () {
        return Inertia::render('User/Settings', [
            'auth' => ['user' => auth()->user()]
        ]);
    })->name('Settings');
    
    // logout session
    Route::post('/logout', function (Request $request) {
        Auth::logout();
        $request->session()->invalidate(); // Destroy the session data
        $request->session()->regenerateToken(); // Create a new CSRF token for safety
 
        return redirect('/login');
    })->name('logout');
    
    // Add money transactions
    Route::post('/wallet/add-money', [WalletController::class, 'addMoney'])->name('wallet.add-money');

    // Goal allocation, deallocate (wallet → goal)
    Route::post('/goals/{goal}/allocate', [\App\Http\Controllers\User\GoalAllocationController::class, 'allocate'])
        ->name('goals.allocate');

    Route::post('/goals/{goal}/deallocate', [\App\Http\Controllers\User\GoalAllocationController::class, 'deallocate'])
    ->name('goals.deallocate');   

    Route::post('/goals/{goal}/update', [\App\Http\Controllers\SavingsGoalController::class, 'update'])
    ->name('goals.update');

    // Savings transfers (Main Wallet ↔ Savings Pool)
    Route::post('/savings/add', [\App\Http\Controllers\User\SavingsTransferController::class, 'addToSavings'])
        ->name('savings.add');

    Route::post('/savings/withdraw', [\App\Http\Controllers\User\SavingsTransferController::class, 'withdrawFromSavings'])
        ->name('savings.withdraw');
    
    Route::post('/goals/{goal}/delete', [\App\Http\Controllers\SavingsGoalController::class, 'destroy'])
    ->name('goals.destroy');

    Route::get('/goals/{goal}/details', [\App\Http\Controllers\SavingsGoalController::class, 'showDetails'])
    ->name('goals.details');
    });