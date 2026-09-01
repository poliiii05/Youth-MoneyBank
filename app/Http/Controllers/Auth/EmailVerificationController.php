<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    /**
     * Show the "please verify" prompt.
     */
    public function notice(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->to(url($request->user()->getDefaultRedirectPath()));
        }

        return inertia('Auth/VerifyEmail', [
            'status' => session('status'),
            'email' => $request->user()->email,
        ]);
    }

    /**
     * Handle the signed verification link from the email.
     *
     * EmailVerificationRequest validates the signature and that the hash
     * matches the logged-in user before this method runs.
     */
    public function verify(EmailVerificationRequest $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->to(url($request->user()->getDefaultRedirectPath() . '?verified=already'));
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return redirect()->to(url($request->user()->getDefaultRedirectPath() . '?verified=1'));
    }

    /**
     * Resend the verification email.
     */
    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->to(url($request->user()->getDefaultRedirectPath()));
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'A fresh verification link has been sent to your email.');
    }
}