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
            // Tinanggal natin ang 'consent'. 
            // 'select_account' na lang para papiliin lang ng email, tapos auto-login na kung existing!
            'prompt' => 'select_account', 
            'include_granted_scopes' => 'true'
        ])
        ->redirect();
    }

    public function callback()
    {
        // 2. Idinagdag din ang ->stateless() dito bago tawagin ang user()
        $googleUser = Socialite::driver('google')->stateless()->user();

        // Hanapin kung may existing user na, kung wala, gawa ng bago
        $user = User::updateOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
                'profile_picture' => $googleUser->getAvatar(),
                'password' => bcrypt(Str::random(16)),
                'email_verified_at' => now(),
            ]
        );

        // I-login ang user
        Auth::login($user, true);

        // I-redirect diretso sa dashboard
        return redirect()->to(url('/dashboard?login=success'));
    }
}