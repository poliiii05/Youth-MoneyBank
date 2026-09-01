<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TurnstileService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class RegisteredUserController extends Controller
{
    /**
     * Youth platform, but still a financial account — under-13s are out of
     * scope. Age does not grant a tier: every account starts at Tier 1 and
     * moves up only through verified documents. Birth date is stored so the
     * Tier 3 application can check the 18+ requirement later.
     */
    private const MINIMUM_AGE = 13;

    /**
     * Handle a registration request.
     *
     * Creates the user, their account number, and their wallet in a single
     * transaction — a user without a wallet would break every balance read,
     * so partial state is not acceptable here.
     */
    public function store(Request $request, TurnstileService $turnstile)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            // 'dns' does a real MX lookup, so typo domains like gmail.cmo are
            // rejected because nothing there can receive mail. This beats an
            // allowlist, which would also reject legitimate company and school
            // addresses we could never enumerate.
            'email' => ['required', 'string', 'lowercase', 'email:rfc,dns', 'max:255', 'unique:users,email'],
            'birth_date' => [
                'required',
                'date',
                'before:' . now()->subYears(self::MINIMUM_AGE)->toDateString(),
                'after:' . now()->subYears(100)->toDateString(),
            ],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->symbols(),
            ],
        ], [
            'email.email' => 'That email address does not appear to exist. Please check it for typos.',
            'email.unique' => 'An account with this email already exists.',
            'password.confirmed' => 'Password did not match.',
            'birth_date.before' => 'You must be at least ' . self::MINIMUM_AGE . ' years old to open an account.',
            'birth_date.after' => 'Please enter a valid date of birth.',
        ]);

        // Bot check runs on the same request as the signup, so there is no
        // separate unauthenticated endpoint to abuse.
        if (! $turnstile->verify($request->input('turnstile_token'), $request->ip())) {
            throw ValidationException::withMessages([
                'turnstile_token' => 'Verification failed. Please complete the check again.',
            ]);
        }

        $user = DB::transaction(function () use ($validated) {
            $user = User::create([
                'account_number' => User::generateAccountNumber(),
                'name' => $validated['name'],
                'email' => $validated['email'],
                'birth_date' => $validated['birth_date'],
                'password' => Hash::make($validated['password']),
            ]);

            $user->wallet()->create([
                'balance_cents' => 0,
                'savings_balance_cents' => 0,
            ]);

            return $user;
        });

        // Fires Laravel's SendEmailVerificationNotification listener, which
        // mails the signed verification link.
        event(new Registered($user));

        // Deliberately not logged in — bounce back to signup carrying the
        // address, so the page can show a confirmation the visitor has to
        // acknowledge. A toast would be easy to miss, and the verification
        // email is the thing they need to act on next.
        return redirect()
            ->route('signup')
            ->with('registered', $user->email);
    }
}