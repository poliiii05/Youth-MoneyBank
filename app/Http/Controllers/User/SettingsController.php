<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\KycService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /**
     * Display the Settings page.
     * Shows tabs: Profile, Tier Upgrade.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        return Inertia::render('User/Settings', [
            'auth' => ['user' => $user],
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'account_number' => $user->account_number,
                'profile_picture' => $user->profile_picture,
                'kyc_tier' => (int) ($user->kyc_tier ?? 1),
                'member_since' => $user->created_at->format('F j, Y'),
                'birth_date' => $user->birth_date?->format('Y-m-d'),
                'email_verified' => !is_null($user->email_verified_at),
            ],
            'kyc_status' => $this->getKycStatus($user),
            'active_tab' => $request->query('tab', 'profile'),
        ]);
    }

    /**
     * Update profile information.
     *
     * Only the display name is editable. Email and account number are
     * identity, not preferences. Phone was dropped along with SMS
     * verification — collecting a number the platform never verifies or
     * uses would be asking for data with no purpose.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $rules = [
            'name' => 'required|string|max:100|min:2',
        ];

        // Only accepted while it is still empty. Google sign-in never collects
        // a birth date, and accounts created before it was stored have none —
        // without this, the Tier 3 age check tells people to add something the
        // app gives them no way to add. Once set it stays put: it gates a tier,
        // so it is identity rather than a preference.
        $canSetBirthDate = is_null($user->birth_date);

        if ($canSetBirthDate) {
            $rules['birth_date'] = [
                'nullable',
                'date',
                'before:' . now()->subYears(13)->toDateString(),
                'after:' . now()->subYears(100)->toDateString(),
            ];
        }

        $validated = $request->validate($rules, [
            'name.required' => 'Full name is required.',
            'name.min' => 'Name must be at least 2 characters.',
            'name.max' => 'Name cannot exceed 100 characters.',
            'birth_date.before' => 'You must be at least 13 years old.',
            'birth_date.after' => 'Please enter a valid date of birth.',
        ]);

        try {
            $payload = ['name' => $validated['name']];

            if ($canSetBirthDate && ! empty($validated['birth_date'])) {
                $payload['birth_date'] = $validated['birth_date'];
            }

            $user->update($payload);

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

    /**
     * Build KYC status payload for the frontend.
     * Used sa Tier Upgrade tab to show current state.
     */
    /**
     * Deactivate the account.
     *
     * Refuses while the wallet still holds money. Closing an account with a
     * balance would leave funds stranded behind a login nobody can use — a
     * real institution settles first, and the same order applies here.
     *
     * The record is marked closed rather than deleted so the ledger stays
     * whole and the decision remains reversible.
     */
    public function deactivate(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'confirmation' => 'required|string|in:DEACTIVATE',
        ], [
            'confirmation.in' => 'Type DEACTIVATE exactly to confirm.',
        ]);

        $holdings = \App\Services\TierLimitService::getTotalHoldingsCents($user);

        if ($holdings > 0) {
            return back()->withErrors([
                'confirmation' => 'Withdraw your remaining balance of PHP '
                    . number_format($holdings / 100, 2)
                    . ' before deactivating.',
            ]);
        }

        $user->update(['deactivated_at' => now()]);

        Log::info('Account deactivated', ['user_id' => $user->id]);

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Your account has been deactivated.');
    }

    protected function getKycStatus(User $user): array
    {
        $application = KycService::getCurrentApplication($user);

        return [
            'current_tier' => (int) ($user->kyc_tier ?? 1),
            'has_application' => $application !== null,
            'application' => $application ? [
                'id' => $application->id,
                'target_tier' => $application->target_tier,
                'status' => $application->status,
                'submitted_at' => $application->submitted_at?->toIso8601String(),
                'reviewed_at' => $application->reviewed_at?->toIso8601String(),
                'auto_approved' => (bool) $application->auto_approved,
                'rejection_reason' => $application->rejection_reason,
                'documents' => $application->documents->map(fn ($doc) => [
                    'document_type' => $doc->document_type,
                    'is_sample' => (bool) $doc->is_sample,
                    'file_name' => $doc->file_name,
                ])->toArray(),
            ] : null,
            'is_demo_mode' => config('kyc.auto_approve', false),
            'required_documents' => [
                2 => config('kyc.required_documents.2', []),
                3 => config('kyc.required_documents.3', []),
            ],
        ];
    }

    public function completeOnboarding(Request $request)
{
    $user = $request->user();
    
    if (!$user->onboarded_at) {
        $user->onboarded_at = now();
        $user->save();
    }
    
    return response()->json(['success' => true]);
}
}