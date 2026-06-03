<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /**
     * Display the Settings page.
     * Shows tabs: Profile, Security, Tier Upgrade, Preferences.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        return Inertia::render('User/Settings', [
            'auth' => ['user' => $user],
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'account_number' => $user->account_number,
                'profile_picture' => $user->profile_picture,
                'kyc_tier' => (int) ($user->kyc_tier ?? 1),
                'member_since' => $user->created_at->format('F j, Y'),
                'email_verified' => !is_null($user->email_verified_at),
                'phone_verified' => !is_null($user->phone_verified_at),
            ],
            'active_tab' => $request->query('tab', 'profile'),
        ]);
    }

    /**
     * Update profile information.
     * Editable: name + phone_number
     * Locked: email + account_number (security)
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:100|min:2',
            'phone_number' => 'nullable|string|regex:/^(\+63|0)9\d{9}$/',
        ], [
            'name.required' => 'Full name is required.',
            'name.min' => 'Name must be at least 2 characters.',
            'name.max' => 'Name cannot exceed 100 characters.',
            'phone_number.regex' => 'Phone number must be in PH format (e.g., +639171234567 or 09171234567).',
        ]);

        try {
            // Normalize phone number: 09XX → +63 9XX
            $phone = $validated['phone_number'] ?? null;
            if ($phone && str_starts_with($phone, '0')) {
                $phone = '+63' . substr($phone, 1);
            }

            $user->update([
                'name' => $validated['name'],
                'phone_number' => $phone,
            ]);

            return back()->with('success', 'Profile updated successfully!');

        } catch (\Exception $e) {
            Log::error('Profile update error', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);
            return back()->withErrors([
                'general' => 'An error occurred. Please try again.',
            ]);
        }
    }
}