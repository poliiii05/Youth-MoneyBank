<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')
        ->stateless()
        ->with([
            'prompt' => 'select_account', 
            'include_granted_scopes' => 'true'
        ])
        ->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        // 1. Hanapin muna kung may existing user na gamit ang email
        $existingUser = User::where('email', $googleUser->getEmail())->first();

        if ($existingUser) {
            // Check suspension status — only block regular users (admins can't be suspended)
            if ($existingUser->is_suspended && $existingUser->isRegularUser()) {
                return redirect()->route('login')->withErrors([
                    'email' => 'Your account has been suspended. Please contact support for assistance.',
                ]);
            }

            // 2. Kung existing na, i-update lang ang profile picture
            $existingUser->update([
                'google_id' => $googleUser->getId(),
                'profile_picture' => $googleUser->getAvatar(),
            ]);
            $user = $existingUser;
        } else {
            // 3. Kung BAGONG user, generate unique 10-digit account number
            do {
                $accountNum = '00' . date('Y') . str_pad(random_int(0, 99999), 5, '0', STR_PAD_LEFT);
            } while (User::where('account_number', $accountNum)->exists());
            
            $user = User::create([
                'account_number' => $accountNum,
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'profile_picture' => $googleUser->getAvatar(),
                'password' => bcrypt(Str::random(16)),
                'email_verified_at' => now(),
            ]);

            // Gawan agad ng Wallet na 0 ang balance (in cents)
            $user->wallet()->create(['balance_cents' => 0, 'savings_balance_cents' => 0]);
            
            // Default goals removed in favor of template-based onboarding.
            // New users now see template suggestions sa empty state (Dashboard at Goals page).
        }

        // I-login ang user
        Auth::login($user, true);

        // Role-based redirect
        $redirectPath = $user->getDefaultRedirectPath();
        $queryString = $user->isAdmin() ? '' : '?login=success';
        
        return redirect()->to(url($redirectPath . $queryString));
    }
}