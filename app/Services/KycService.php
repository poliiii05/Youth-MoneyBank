<?php

namespace App\Services;

use App\Models\KycApplication;
use App\Models\KycDocument;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class KycService
{
    /**
     * Submit a new KYC application for tier upgrade.
     * 
     * @param User $user The user submitting
     * @param int $targetTier The tier they want to reach (2 or 3)
     * @param array $documents Array of documents:
     *   [
     *     'id_front' => ['type' => 'sample'] OR ['type' => 'upload', 'file' => UploadedFile],
     *     'id_back' => [...],
     *     ...
     *   ]
     * @return KycApplication
     * @throws ValidationException
     */
    public static function submitApplication(User $user, int $targetTier, array $documents): KycApplication
    {
        // ====================================================
        // VALIDATION 1: Target tier must be 2 or 3
        // ====================================================
        if (!in_array($targetTier, [2, 3])) {
            throw ValidationException::withMessages([
                'target_tier' => 'Invalid target tier. Must be 2 or 3.',
            ]);
        }

        // ====================================================
        // VALIDATION 2: User must be at lower tier than target
        // ====================================================
        $currentTier = (int) ($user->kyc_tier ?? 1);
        if ($currentTier >= $targetTier) {
            throw ValidationException::withMessages([
                'target_tier' => "You are already at Tier {$currentTier}. Cannot downgrade or re-apply.",
            ]);
        }

        // ====================================================
        // VALIDATION 3: User must upgrade sequentially (no skipping)
        // ====================================================
        if ($targetTier !== $currentTier + 1) {
            throw ValidationException::withMessages([
                'target_tier' => "Sequential upgrade required. Apply for Tier " . ($currentTier + 1) . " first.",
            ]);
        }

        // ====================================================
        // VALIDATION 4: No pending application allowed
        // ====================================================
        $existingPending = $user->kycApplications()
            ->where('status', 'pending')
            ->first();
        
        if ($existingPending) {
            throw ValidationException::withMessages([
                'application' => 'You already have a pending application. Please wait for review.',
            ]);
        }

        // ====================================================
        // VALIDATION 5: Required documents present
        // ====================================================
        $requiredDocs = config('kyc.required_documents.' . $targetTier, []);
        $providedDocs = array_keys($documents);
        $missingDocs = array_diff($requiredDocs, $providedDocs);

        if (!empty($missingDocs)) {
            throw ValidationException::withMessages([
                'documents' => 'Missing required documents: ' . implode(', ', $missingDocs),
            ]);
        }

        // ====================================================
        // TRANSACTIONAL: Create application + store documents
        // ====================================================
        $application = DB::transaction(function () use ($user, $targetTier, $documents, $currentTier) {
            
            // Create the application record
            $application = KycApplication::create([
                'user_id' => $user->id,
                'target_tier' => $targetTier,
                'original_tier' => $currentTier,
                'status' => 'pending',
                'submitted_at' => now(),
                'auto_approved' => false, // Will be flipped if auto-approve runs
            ]);

            // Store each document
            foreach ($documents as $type => $docData) {
                self::storeDocument($application, $type, $docData);
            }

            return $application;
        });

        // ====================================================
        // AUTO-APPROVE LOGIC (Path 3 Hybrid)
        // ====================================================
        if (config('kyc.auto_approve', false)) {
            Log::info('Auto-approving KYC application', [
                'application_id' => $application->id,
                'user_id' => $user->id,
                'target_tier' => $targetTier,
            ]);

            self::approveApplication($application, null, true);
            $application->refresh();
        }

        return $application;
    }

    /**
     * Store a single document (sample or uploaded file).
     */
    protected static function storeDocument(KycApplication $application, string $type, array $docData): KycDocument
    {
        $isSample = ($docData['type'] ?? '') === 'sample';

        if ($isSample) {
            // Sample document — placeholder path, no actual file
            return KycDocument::create([
                'application_id' => $application->id,
                'document_type' => $type,
                'file_path' => null,
                'is_sample' => true,
                'file_name' => "Sample {$type}.pdf",
                'file_size' => null,
                'mime_type' => null,
            ]);
        }

        // Real upload — store file in private storage
        $file = $docData['file'] ?? null;
        
        if (!$file || !($file instanceof UploadedFile)) {
            throw ValidationException::withMessages([
                $type => 'Invalid file upload.',
            ]);
        }

        // Validate file size
        $maxSizeMb = config('kyc.max_file_size_mb', 5);
        $maxSizeBytes = $maxSizeMb * 1024 * 1024;
        
        if ($file->getSize() > $maxSizeBytes) {
            throw ValidationException::withMessages([
                $type => "File too large. Max {$maxSizeMb}MB.",
            ]);
        }

        // Validate MIME type
        $allowedMimes = config('kyc.allowed_mime_types', []);
        if (!empty($allowedMimes) && !in_array($file->getMimeType(), $allowedMimes)) {
            throw ValidationException::withMessages([
                $type => 'Invalid file type. Allowed: JPG, PNG, PDF.',
            ]);
        }

        // Store in private disk: kyc-uploads/{application_id}/{type}_{timestamp}.ext
        $disk = config('kyc.storage_disk', 'local');
        $folder = "kyc-uploads/{$application->id}";
        $filename = "{$type}_" . time() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $filename, $disk);

        return KycDocument::create([
            'application_id' => $application->id,
            'document_type' => $type,
            'file_path' => $path,
            'is_sample' => false,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);
    }

    /**
     * Approve a KYC application — upgrades the user's tier.
     * 
     * @param KycApplication $application
     * @param User|null $reviewer The admin reviewer (null for auto-approval)
     * @param bool $isAutoApproval
     */
    public static function approveApplication(KycApplication $application, ?User $reviewer = null, bool $isAutoApproval = false): KycApplication
    {
        if (!$application->isPending()) {
            throw ValidationException::withMessages([
                'application' => "Cannot approve {$application->status} application.",
            ]);
        }

        return DB::transaction(function () use ($application, $reviewer, $isAutoApproval) {
            // Update application
            $application->update([
                'status' => 'approved',
                'reviewed_at' => now(),
                'reviewed_by' => $reviewer?->id,
                'auto_approved' => $isAutoApproval,
            ]);

            // Upgrade user's tier
            $application->user->update([
                'kyc_tier' => $application->target_tier,
            ]);

            Log::info('KYC application approved', [
                'application_id' => $application->id,
                'user_id' => $application->user_id,
                'new_tier' => $application->target_tier,
                'auto' => $isAutoApproval,
            ]);

            return $application;
        });
    }

    /**
     * Reject a KYC application with a reason.
     */
    public static function rejectApplication(KycApplication $application, User $reviewer, string $reason): KycApplication
    {
        if (!$application->isPending()) {
            throw ValidationException::withMessages([
                'application' => "Cannot reject {$application->status} application.",
            ]);
        }

        $application->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
            'reviewed_by' => $reviewer->id,
            'rejection_reason' => $reason,
        ]);

        Log::info('KYC application rejected', [
            'application_id' => $application->id,
            'reviewer_id' => $reviewer->id,
            'reason' => $reason,
        ]);

        return $application;
    }

    /**
     * Get the user's latest pending or recent KYC application.
     */
    public static function getCurrentApplication(User $user): ?KycApplication
    {
        return $user->kycApplications()
            ->with('documents')
            ->whereIn('status', ['pending', 'approved', 'rejected'])
            ->latest()
            ->first();
    }

    /**
     * Check if the user has a pending application.
     */
    public static function hasPendingApplication(User $user): bool
    {
        return $user->kycApplications()
            ->where('status', 'pending')
            ->exists();
    }
}