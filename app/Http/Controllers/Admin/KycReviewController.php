<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KycApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AdminAuditLog;

class KycReviewController extends Controller
{
    /**
     * Display list of KYC applications with filters and pagination.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $perPage = 15;
        $page = (int) $request->query('page', 1);
        $status = $request->query('status', 'all'); // all|pending|approved|rejected
        $search = $request->query('search', '');

        // Build query
        $query = KycApplication::with('user:id,name,email,kyc_tier,profile_picture');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if (!empty($search)) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $totalCount = $query->count();
        $totalPages = max(1, ceil($totalCount / $perPage));

        $applications = $query
            ->orderBy('submitted_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(function ($app) {
                return [
                    'id' => $app->id,
                    'user' => [
                    'id' => $app->user->id,
                    'name' => $app->user->name,
                    'email' => $app->user->email,
                    'current_tier' => $app->user->kyc_tier,
                    'profile_picture' => $app->user->profile_picture,
                ],
                    'original_tier' => $app->original_tier ?? ($app->target_tier - 1), 
                    'target_tier' => $app->target_tier,
                    'status' => $app->status,
                    'submitted_at' => $app->submitted_at?->toIso8601String(),
                    'submitted_relative' => $app->submitted_at?->diffForHumans() ?? '—',
                    'reviewed_at' => $app->reviewed_at?->toIso8601String(),
                    'reviewed_relative' => $app->reviewed_at?->diffForHumans(),
                    'auto_approved' => (bool) $app->auto_approved,
                ];
            });

        // Counts for filter tabs
        $counts = [
            'all' => KycApplication::count(),
            'pending' => KycApplication::where('status', 'pending')->count(),
            'approved' => KycApplication::where('status', 'approved')->count(),
            'rejected' => KycApplication::where('status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/KycList', [
            'auth' => ['user' => $user],
            'applications' => $applications,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'total_count' => $totalCount,
                'per_page' => $perPage,
                'from' => $totalCount > 0 ? ($page - 1) * $perPage + 1 : 0,
                'to' => min($page * $perPage, $totalCount),
            ],
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
            'counts' => $counts,
            'pendingCounts' => $this->getAdminPendingCounts(),
        ]);
    }

    /**
     * Display detail of a single KYC application.
     */
    public function show(Request $request, int $id)
    {
        $user = $request->user();

        $application = KycApplication::with([
            'user:id,name,email,kyc_tier,profile_picture,phone_number,account_number,created_at,email_verified_at',
            'documents',
            'reviewer:id,name,email',
        ])->findOrFail($id);

        // Map documents
        $documents = $application->documents->map(function ($doc) {
            return [
                'id' => $doc->id,
                'document_type' => $doc->document_type,
                'file_path' => $doc->file_path,
                'is_sample' => (bool) $doc->is_sample,
                'file_name' => $doc->file_name,
                'file_size' => $doc->file_size,
                'mime_type' => $doc->mime_type,
                'preview_url' => $doc->is_sample 
                    ? null 
                    : ($doc->file_path ? '/storage/' . $doc->file_path : null),
            ];
        });

        return Inertia::render('Admin/KycDetail', [
            'auth' => ['user' => $user],
            'application' => [
                'id' => $application->id,
                'user' => [
                    'id' => $application->user->id,
                    'name' => $application->user->name,
                    'email' => $application->user->email,
                    'phone_number' => $application->user->phone_number,
                    'account_number' => $application->user->account_number,
                    'current_tier' => $application->user->kyc_tier,
                    'profile_picture' => $application->user->profile_picture,
                    'member_since' => $application->user->created_at?->format('F j, Y'),
                    'email_verified' => !is_null($application->user->email_verified_at),
                ],
                'original_tier' => $application->original_tier ?? ($application->target_tier - 1),
                'target_tier' => $application->target_tier,
                'status' => $application->status,
                'submitted_at' => $application->submitted_at?->toIso8601String(),
                'submitted_formatted' => $application->submitted_at?->format('F j, Y \a\t g:i A'),
                'reviewed_at' => $application->reviewed_at?->toIso8601String(),
                'reviewed_formatted' => $application->reviewed_at?->format('F j, Y \a\t g:i A'),
                'auto_approved' => (bool) $application->auto_approved,
                'rejection_reason' => $application->rejection_reason,
                'reviewer' => $application->reviewer ? [
                    'name' => $application->reviewer->name,
                    'email' => $application->reviewer->email,
                ] : null,
                'documents' => $documents,
            ],
            'pendingCounts' => $this->getAdminPendingCounts(),
        ]);
    }

    /**
     * Approve a KYC application.
     */
    public function approve(Request $request, int $id)
{
    $admin = $request->user();
    if (!$admin->canApproveKyc()) {
        return back()->withErrors([
            'permission' => 'You do not have permission to approve KYC applications.',
        ]);
    }

    try {
        $application = KycApplication::findOrFail($id);

        if ($application->user_id === $admin->id) {
            return back()->withErrors([
                'application' => 'You cannot approve your own KYC application.',
            ]);
        }

         // Use existing service method (manual approval, not auto)
        $approvedApp = \App\Services\KycService::approveApplication($application, $admin, false);

         AdminAuditLog::record([
            'actor_id' => $admin->id,
            'target_user_id' => $approvedApp->user_id,
            'action_type' => 'kyc_approve',
            'category' => 'kyc',
            'reason' => 'Approved via admin review',
            'metadata' => [
                'application_id' => $approvedApp->id,
                'original_tier' => $approvedApp->original_tier,
                'target_tier' => $approvedApp->target_tier,
                'target_email' => $approvedApp->user->email,
                'target_name' => $approvedApp->user->name,
            ],
        ]);

        return redirect()->route('admin.kyc.index', ['status' => 'pending'])
        ->with('success', "Application approved. {$approvedApp->user->name} is now Tier {$approvedApp->target_tier}.");

    } catch (\Exception $e) {
        \Log::error('KYC approval failed', [
            'application_id' => $id,
            'admin_id' => $admin->id,
            'error' => $e->getMessage(),
        ]);
        return back()->withErrors([
            'application' => 'Failed to approve application. Please try again.',
        ]);
    }
}

    /**
     * Reject a KYC application with reason.
     */
    public function reject(Request $request, int $id)
    {
        $admin = $request->user();
        if (!$admin->canApproveKyc()) {
            return back()->withErrors([
                'permission' => 'You do not have permission to reject KYC applications.',
            ]);
        }

        $validated = $request->validate([
            'reason' => 'required|string|min:10|max:500',
        ], [
            'reason.required' => 'A rejection reason is required.',
            'reason.min' => 'Please provide a more detailed reason (at least 10 characters).',
            'reason.max' => 'Rejection reason cannot exceed 500 characters.',
        ]);

        try {
            $application = KycApplication::findOrFail($id);

            if ($application->user_id === $admin->id) {
                return back()->withErrors([
                    'application' => 'You cannot reject your own KYC application.',
                ]);
            }

            // Use existing service method
            \App\Services\KycService::rejectApplication(
                $application, 
                $admin, 
                $validated['reason']
            );

             AdminAuditLog::record([
                'actor_id' => $admin->id,
                'target_user_id' => $application->user_id,
                'action_type' => 'kyc_reject',
                'category' => 'kyc',
                'reason' => $validated['reason'],
                'metadata' => [
                    'application_id' => $application->id,
                    'original_tier' => $application->original_tier ?? null,
                    'target_tier' => $application->target_tier,
                    'target_email' => $application->user->email,
                    'target_name' => $application->user->name,
                ],
            ]);
            
            return redirect()->route('admin.kyc.index', ['status' => 'pending'])
            ->with('success', 'Application rejected with reason recorded.');

        } catch (\Exception $e) {
            \Log::error('KYC rejection failed', [
                'application_id' => $id,
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors([
                'application' => 'Failed to reject application. Please try again.',
            ]);
        }
    }
}