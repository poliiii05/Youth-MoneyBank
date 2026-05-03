<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Api\CaptchaController; // sa ano ito, uhm sa parang im not a robot part
use App\Http\Controllers\Auth\GoogleAuthController;  // integration naman ito sa google sign in hehe

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
    
    // DASHBOARD
    Route::get('/dashboard', function () {
        return Inertia::render('User/Dashboard', [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    })->name('dashboard');

    // SAVINGS GOALS
    Route::get('/goals', function () {
        return Inertia::render('User/SavingsGoals', [
            'auth' => ['user' => auth()->user()]
        ]);
    })->name('goals');

    // TRANSACTIONS (Placeholder muna para di mag-error pag kinlick)
    Route::get('/transactions', function () {
        return Inertia::render('User/Transactions', [
            'auth' => ['user' => auth()->user()]
        ]);
    })->name('transactions');

    //Settings
    Route::get('/Settings', function () {
        return Inertia::render('User/Settings', [
            'auth' => ['user' => auth()->user()]
        ]);
    })->name('transactions');
    
    // logout session
    Route::post('/logout', function (Request $request) {
        Auth::logout();
        $request->session()->invalidate(); // Destroy the session data
        $request->session()->regenerateToken(); // Create a new CSRF token for safety
 
        return redirect('/login');
    })->name('logout');

});