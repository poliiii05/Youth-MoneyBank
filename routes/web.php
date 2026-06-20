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
//   USER PROTECTED ROUTES                     //
//   (auth + not suspended + user only + maintenance check)
//---------------------------------------------//

Route::middleware(['auth', 'not.suspended', 'user.only', 'check.maintenance'])->group(function () {
    
    // ====================================================
    // NEW USERS ENTER THE SYSTEM
    // ====================================================
    Route::post('/api/onboarding/complete', [\App\Http\Controllers\User\SettingsController::class, 'completeOnboarding'])
        ->name('api.onboarding.complete');
    // ====================================================
    // DASHBOARD
    // ====================================================
    Route::get('/dashboard', [\App\Http\Controllers\User\DashboardController::class, 'index'])
    ->name('dashboard');

    Route::get('/insights', [\App\Http\Controllers\User\DashboardController::class, 'insights'])
        ->name('insights');

    Route::get('/api/insights/monthly', [\App\Http\Controllers\User\DashboardController::class, 'monthlyStreak'])
    ->name('api.insights.monthly');
    // ==================================================   ==
    // Customer Support — API endpoints for ChatModal
    // ====================================================
   
Route::prefix('api/support')->name('api.support.')->group(function () {
    Route::get('/conversation', [\App\Http\Controllers\SupportController::class, 'getOrCreateConversation'])
        ->name('conversation');
    
    Route::get('/conversation/{id}/messages', [\App\Http\Controllers\SupportController::class, 'getMessages'])
        ->whereNumber('id')
        ->name('messages');
    
    Route::post('/conversation/{id}/send', [\App\Http\Controllers\SupportController::class, 'sendMessage'])
        ->whereNumber('id')
        ->name('send');
    
    Route::post('/conversation/{id}/request-agent', [\App\Http\Controllers\SupportController::class, 'requestAgent'])
        ->whereNumber('id')
        ->name('request-agent');
    
    Route::post('/conversation/{id}/close', [\App\Http\Controllers\SupportController::class, 'close'])
        ->whereNumber('id')
        ->name('close');
});

    // ====================================================
    // SAVINGS GOALS
    // ====================================================
    Route::get('/goals', [SavingsGoalController::class, 'index'])->name('goals.index');
    Route::post('/goals', [SavingsGoalController::class, 'store'])->name('goals.store');

    // ====================================================
    // TRANSACTIONS
    // ====================================================
    Route::get('/transactions', [\App\Http\Controllers\User\TransactionsController::class, 'index'])
        ->name('transactions');

    Route::get('/transactions/{transaction}', [\App\Http\Controllers\User\TransactionsController::class, 'show'])
        ->name('transactions.show');
    // ====================================================
    // USER SETTINGS
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
    // SAVINGS TRANSFERS
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

});

//---------------------------------------------//
//   ADMIN PROTECTED ROUTES                    //
//   (auth + not suspended + role:any — NO user.only, NO maintenance)
//---------------------------------------------//

Route::prefix('admin')->name('admin.')->middleware(['auth', 'not.suspended', 'role:any'])->group(function () {

    Route::get('/', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])
        ->name('dashboard');
    
    Route::get('/api/recent-transactions', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'recentTransactions'])
        ->name('api.recent-transactions');
    
    Route::get('/api/pending-counts', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'pendingCounts'])
        ->name('api.pending-counts');

    // KYC Reviews — any admin (admin or super_admin)
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

    // Customer Support — chat-based support with AI integration
    Route::prefix('customer-support')->name('customer-support.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\CustomerSupportTicketsController::class, 'index'])
            ->name('index');
        
        Route::get('/{id}', [\App\Http\Controllers\Admin\CustomerSupportTicketsController::class, 'show'])
            ->whereNumber('id')
            ->name('show');
        
        Route::post('/{id}/reply', [\App\Http\Controllers\Admin\CustomerSupportTicketsController::class, 'reply'])
            ->whereNumber('id')
            ->name('reply');
        
        Route::post('/{id}/resolve', [\App\Http\Controllers\Admin\CustomerSupportTicketsController::class, 'resolve'])
            ->whereNumber('id')
            ->name('resolve');
        
        Route::post('/{id}/close', [\App\Http\Controllers\Admin\CustomerSupportTicketsController::class, 'close'])
            ->whereNumber('id')
            ->name('close');
        
        Route::post('/{id}/reopen', [\App\Http\Controllers\Admin\CustomerSupportTicketsController::class, 'reopen'])
            ->whereNumber('id')
            ->name('reopen');
        
        Route::post('/{id}/assign', [\App\Http\Controllers\Admin\CustomerSupportTicketsController::class, 'assign'])
            ->whereNumber('id')
            ->name('assign');
    });

    // User Management
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

    // Transaction Monitoring
    Route::get('/transactions', [\App\Http\Controllers\Admin\TransactionMonitorController::class, 'index'])
        ->name('transactions.index');
    
    Route::get('/transactions/{id}', [\App\Http\Controllers\Admin\TransactionMonitorController::class, 'show'])
        ->whereNumber('id')
        ->name('transactions.show');
    
    // Flag action — super_admin only
    Route::middleware(['role:super_admin'])->group(function () {
        Route::post('/transactions/{id}/flag', [\App\Http\Controllers\Admin\TransactionMonitorController::class, 'flagTransaction'])
            ->whereNumber('id')
            ->name('transactions.flag');
    });

    // Resolution actions — both admins can do
    Route::post('/transactions/{id}/resolve', [\App\Http\Controllers\Admin\TransactionMonitorController::class, 'resolveTransaction'])
        ->whereNumber('id')
        ->name('transactions.resolve');
        
    Route::post('/transactions/{id}/manual-credit', [\App\Http\Controllers\Admin\TransactionMonitorController::class, 'manualCredit'])
        ->whereNumber('id')
        ->name('transactions.manual-credit');

    // SUPER ADMIN ONLY actions
    Route::middleware(['role:super_admin'])->group(function () {
        Route::post('/transactions/{id}/reopen', [\App\Http\Controllers\Admin\TransactionMonitorController::class, 'reopenTransaction'])
            ->whereNumber('id')
            ->name('transactions.reopen');
        
        // Admin Management
        Route::get('/admins', [\App\Http\Controllers\Admin\AdminManagementController::class, 'index'])
            ->name('admins.index');
        
        Route::post('/admins/promote', [\App\Http\Controllers\Admin\AdminManagementController::class, 'promote'])
            ->name('admins.promote');
        
        Route::post('/admins/{id}/change-role', [\App\Http\Controllers\Admin\AdminManagementController::class, 'changeRole'])
            ->whereNumber('id')
            ->name('admins.change-role');
        
        Route::post('/admins/{id}/revoke', [\App\Http\Controllers\Admin\AdminManagementController::class, 'revoke'])
            ->whereNumber('id')
            ->name('admins.revoke');

        Route::get('/admins/search-users', [\App\Http\Controllers\Admin\AdminManagementController::class, 'searchPromotableUsers'])
            ->name('admins.search-users');

        // Audit
        Route::get('/audit', [\App\Http\Controllers\Admin\AuditLogController::class, 'index'])
            ->name('audit.index');

        Route::get('/audit/export', [\App\Http\Controllers\Admin\AuditLogController::class, 'export'])
            ->name('audit.export');

        // Settings
        Route::get('/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'index'])
            ->name('settings.index');
        
        Route::post('/settings/update', [\App\Http\Controllers\Admin\SettingsController::class, 'update'])
            ->name('settings.update');

        Route::post('/settings/profile', [\App\Http\Controllers\Admin\SettingsController::class, 'updateProfile'])
            ->name('settings.profile');

        // Maintenance Mode
        Route::get('/maintenance', [\App\Http\Controllers\Admin\MaintenanceModeController::class, 'index'])
            ->name('maintenance.index');
        
        Route::post('/maintenance/toggle', [\App\Http\Controllers\Admin\MaintenanceModeController::class, 'toggle'])
            ->name('maintenance.toggle');
    });

});

//---------------------------------------------//
//   Help Center (PUBLIC)                      //
//---------------------------------------------//

Route::prefix('help')->name('help.')->group(function () {
    Route::get('/', [\App\Http\Controllers\HelpController::class, 'index'])
        ->name('index');
    
    Route::get('/{category}', [\App\Http\Controllers\HelpController::class, 'category'])
        ->name('category');
    
    Route::get('/{category}/{article}', [\App\Http\Controllers\HelpController::class, 'article'])
        ->name('article');
});

//---------------------------------------------//
//   LOGOUT (any authenticated user)           //
//---------------------------------------------//

Route::middleware(['auth'])->group(function () {
    Route::post('/logout', function (Request $request) {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Inertia::location('/');
    })->name('logout');
});