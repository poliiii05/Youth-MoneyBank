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
            // 2. Kung existing na, i-update lang ang profile picture
            $existingUser->update([
                'google_id' => $googleUser->getId(),
                'profile_picture' => $googleUser->getAvatar(),
            ]);
            $user = $existingUser;
     } else {
            // 3. Kung BAGONG user, pure 10-digit number generator
           // $accountNum = '00' . date('Y') . str_pad(random_int(0, 99999), 5, '0', STR_PAD_LEFT);

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

            // NEW: I-insert ang 3 Default Savings Goals
          // I-insert ang 3 Default Savings Goals (amounts in cents)
            $user->savingsGoals()->createMany([
                [
                    'title' => 'Emergency Fund',
                    'subtitle' => 'For unexpected expenses',
                    'target_amount_cents' => 500000,  // ₱5,000
                    'current_amount_cents' => 0,
                    'icon_name' => 'ShieldAlert',
                    'color_theme' => 'bg-red-500',
                ],
                [
                    'title' => 'New Sneakers',
                    'subtitle' => 'Reward for myself',
                    'target_amount_cents' => 450000,  // ₱4,500
                    'current_amount_cents' => 0,
                    'icon_name' => 'ShoppingBag',
                    'color_theme' => 'bg-emerald-500',
                ],
                [
                    'title' => 'Dream Phone',
                    'subtitle' => 'Saving up for an upgrade',
                    'target_amount_cents' => 1500000,  // ₱15,000
                    'current_amount_cents' => 0,
                    'icon_name' => 'Smartphone',
                    'color_theme' => 'bg-blue-500',
                ]
            ]);
        }

        // I-login ang user
        Auth::login($user, true);

        // I-redirect diretso sa dashboard
        return redirect()->to(url('/dashboard?login=success'));
    }
}