<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Services\KycService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class KycController extends Controller
{
    /**
     * Submit a new KYC application for tier upgrade.
     * 
     * POST /kyc/submit
     * 
     * Expected form data:
     *   - target_tier: int (2 or 3)
     *   - documents[id_front][type]: 'sample' or 'upload'
     *   - documents[id_front][file]: file (if type=upload)
     *   - documents[id_back][...]: same pattern
     *   - documents[selfie][...]: same pattern
     *   - (For Tier 3: also proof_of_address, income_statement)
     */
    public function submit(Request $request)
    {
        $user = $request->user();

        // ====================================================
        // VALIDATION
        // ====================================================
        $validated = $request->validate([
            'target_tier' => 'required|integer|in:2,3',
            'documents' => 'required|array|min:1',
            'documents.*.type' => 'required|in:sample,upload',
            'documents.*.file' => 'nullable|file|max:5120', // 5MB max
        ], [
            'target_tier.required' => 'Target tier is required.',
            'target_tier.in' => 'Target tier must be 2 or 3.',
            'documents.required' => 'At least one document is required.',
            'documents.*.file.max' => 'File size cannot exceed 5MB.',
        ]);

        // ====================================================
        // VALIDATE: Required documents per tier
        // ====================================================
        $targetTier = (int) $validated['target_tier'];
        $requiredDocs = config('kyc.required_documents.' . $targetTier, []);
        $providedDocs = array_keys($validated['documents']);
        $missingDocs = array_diff($requiredDocs, $providedDocs);

        if (!empty($missingDocs)) {
            return back()->withErrors([
                'documents' => 'Missing required documents: ' . implode(', ', $missingDocs),
            ]);
        }

        // ====================================================
        // PROCESS: Submit via service
        // ====================================================
        try {
            $application = KycService::submitApplication(
                $user,
                $targetTier,
                $validated['documents']
            );

            // ====================================================
            // SUCCESS MESSAGE based on outcome
            // ====================================================
            if ($application->isApproved()) {
                // Auto-approved (production mode)
                return redirect()->route('settings', ['tab' => 'upgrade'])
                    ->with('success', "Congratulations! You've been upgraded to Tier {$targetTier}.");
            }

            // Pending (manual review needed)
            return redirect()->route('settings', ['tab' => 'upgrade'])
                ->with('success', "Your application for Tier {$targetTier} has been submitted. You'll be notified after review.");

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
        Log::error('KYC submission error', [
            'user_id' => $user->id,
            'target_tier' => $validated['target_tier'] ?? null,
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
        ]);

        // In dev/local environment, show actual error
        $errorMsg = config('app.debug') 
            ? 'Error: ' . $e->getMessage() 
            : 'An error occurred. Please try again.';

        return back()->withErrors([
            'submission' => $errorMsg,
        ]);
}
    }

    /**
     * Get the current KYC application status.
     * 
     * GET /kyc/status (JSON endpoint)
     * 
     * Used by frontend for polling/refresh.
     */
    public function status(Request $request)
    {
        $user = $request->user();
        $application = KycService::getCurrentApplication($user);

        if (!$application) {
            return response()->json([
                'has_application' => false,
                'status' => null,
                'target_tier' => null,
            ]);
        }

        return response()->json([
            'has_application' => true,
            'status' => $application->status,
            'target_tier' => $application->target_tier,
            'submitted_at' => $application->submitted_at?->toIso8601String(),
            'reviewed_at' => $application->reviewed_at?->toIso8601String(),
            'auto_approved' => $application->auto_approved,
            'rejection_reason' => $application->rejection_reason,
            'is_demo_mode' => config('kyc.auto_approve', false),
        ]);
    }
}