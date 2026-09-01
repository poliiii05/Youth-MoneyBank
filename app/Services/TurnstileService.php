<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TurnstileService
{
    private const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    /**
     * Verify a Turnstile token with Cloudflare.
     *
     * Returns true when the token is valid, or when Turnstile isn't
     * configured at all — a missing secret means the developer hasn't set it
     * up locally, and blocking every signup for that would make the app
     * unusable on a fresh clone.
     */
    public function verify(?string $token, ?string $ip = null): bool
    {
        $secret = config('services.turnstile.secret');

        if (blank($secret)) {
            Log::warning('Turnstile secret not configured — skipping bot check.');
            return true;
        }

        if (blank($token)) {
            return false;
        }

        try {
            $response = Http::asForm()
                ->timeout(10)
                ->post(self::VERIFY_URL, array_filter([
                    'secret' => $secret,
                    'response' => $token,
                    'remoteip' => $ip,
                ]));

            $result = $response->json();

            if (($result['success'] ?? false) === true) {
                return true;
            }

            Log::warning('Turnstile verification failed', [
                'errors' => $result['error-codes'] ?? [],
            ]);

            return false;
        } catch (\Throwable $e) {
            // A Cloudflare outage shouldn't take registration down with it.
            Log::error('Turnstile verification error: ' . $e->getMessage());
            return true;
        }
    }
}