<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    /**
     * Display global audit log with filters and pagination.
     */
    public function index(Request $request)
    {
        $admin = $request->user();
        
        if (!$admin->isSuperAdmin()) {
            abort(403, 'Only Super Admin can access audit logs.');
        }

        $perPage = 25;
        $page = (int) $request->query('page', 1);
        $category = $request->query('category', 'all'); // all|admin_management|kyc|user_management|transaction
        $actionType = $request->query('action_type', 'all');
        $actorId = $request->query('actor_id', 'all');
        $dateRange = $request->query('date_range', '7days'); // today|7days|30days|all
        $search = $request->query('search', '');

        $query = AdminAuditLog::with('actor:id,name,profile_picture', 'targetUser:id,name,profile_picture');

        // Category filter
        if ($category !== 'all') {
            $query->where('category', $category);
        }

        // Action type filter
        if ($actionType !== 'all') {
            $query->where('action_type', $actionType);
        }

        // Actor filter
        if ($actorId !== 'all') {
            $query->where('actor_id', (int) $actorId);
        }

        // Date range filter
        if ($dateRange === 'today') {
            $query->whereDate('created_at', today());
        } elseif ($dateRange === '7days') {
            $query->where('created_at', '>=', now()->subDays(7));
        } elseif ($dateRange === '30days') {
            $query->where('created_at', '>=', now()->subDays(30));
        }
        // 'all' = no date filter

        // Search by reason or metadata
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%")
                  ->orWhereHas('actor', function ($aq) use ($search) {
                      $aq->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('targetUser', function ($tq) use ($search) {
                      $tq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $totalCount = $query->count();
        $totalPages = max(1, ceil($totalCount / $perPage));

        $logs = $query
            ->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action_type' => $log->action_type,
                    'action_label' => $this->getActionLabel($log->action_type),
                    'category' => $log->category,
                    'category_label' => $this->getCategoryLabel($log->category),
                    'actor' => $log->actor ? [
                        'id' => $log->actor->id,
                        'name' => $log->actor->name,
                        'profile_picture' => $log->actor->profile_picture,
                    ] : ['name' => 'System'],
                    'target_user' => $log->targetUser ? [
                        'id' => $log->targetUser->id,
                        'name' => $log->targetUser->name,
                        'profile_picture' => $log->targetUser->profile_picture,
                    ] : ($log->metadata['target_name'] ?? null ? ['name' => $log->metadata['target_name']] : null),
                    'reason' => $log->reason,
                    'metadata' => $log->metadata,
                    'created_at' => $log->created_at?->format('M j, Y g:i A'),
                    'created_relative' => $log->created_at?->diffForHumans(),
                    'created_iso' => $log->created_at?->toIso8601String(),
                ];
            });

        // Stats
        $stats = [
            'total_today' => AdminAuditLog::whereDate('created_at', today())->count(),
            'total_7days' => AdminAuditLog::where('created_at', '>=', now()->subDays(7))->count(),
            'total_all_time' => AdminAuditLog::count(),
            'unique_actors_7days' => AdminAuditLog::where('created_at', '>=', now()->subDays(7))
                ->distinct('actor_id')
                ->count('actor_id'),
        ];

        // Available actors for filter dropdown
        $actors = \App\Models\User::whereNotNull('admin_role')
            ->select('id', 'name', 'profile_picture')
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'profile_picture' => $u->profile_picture,
                ];
            });

        // Category counts for filter
        $categoryCounts = [
            'all' => AdminAuditLog::count(),
            'admin_management' => AdminAuditLog::where('category', 'admin_management')->count(),
            'kyc' => AdminAuditLog::where('category', 'kyc')->count(),
            'user_management' => AdminAuditLog::where('category', 'user_management')->count(),
            'transaction' => AdminAuditLog::where('category', 'transaction')->count(),
        ];

        return Inertia::render('Admin/AuditLog', [
            'auth' => ['user' => $admin],
            'logs' => $logs,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'total_count' => $totalCount,
                'per_page' => $perPage,
                'from' => $totalCount > 0 ? ($page - 1) * $perPage + 1 : 0,
                'to' => min($page * $perPage, $totalCount),
            ],
            'filters' => [
                'category' => $category,
                'action_type' => $actionType,
                'actor_id' => $actorId,
                'date_range' => $dateRange,
                'search' => $search,
            ],
            'stats' => $stats,
            'actors' => $actors,
            'categoryCounts' => $categoryCounts,
            'pendingCounts' => $this->getAdminPendingCounts(),
        ]);
    }

    /**
     * Get human-readable label for action type.
     */
    private function getActionLabel(string $actionType): string
    {
        $labels = [
            // Admin management
            'promote_admin' => 'Promoted Admin',
            'change_role' => 'Changed Role',
            'revoke_admin' => 'Revoked Admin',
            'update_profile' => 'Updated Profile',
            'update_setting' => 'Updated Setting',
            'toggle_maintenance' => 'Toggled Maintenance',
            // KYC
            'kyc_approve' => 'Approved KYC',
            'kyc_reject' => 'Rejected KYC',
            // User management
            'override_tier' => 'Override Tier',
            'suspend_user' => 'Suspended User',
            'unsuspend_user' => 'Reactivated User',
            'force_logout' => 'Force Logout',
            // Transaction
            'flag_transaction' => 'Flagged Transaction',
            'unflag_transaction' => 'Unflagged Transaction',
            'resolve_transaction' => 'Resolved Transaction',
            'reopen_transaction' => 'Reopened Transaction',
            'manual_credit' => 'Manual Credit',
        ];
        return $labels[$actionType] ?? ucwords(str_replace('_', ' ', $actionType));
    }

    /**
     * Get human-readable label for category.
     */
    private function getCategoryLabel(string $category): string
    {
        $labels = [
            'admin_management' => 'Admin Management',
            'kyc' => 'KYC',
            'user_management' => 'User Management',
            'transaction' => 'Transaction',
        ];
        return $labels[$category] ?? ucwords(str_replace('_', ' ', $category));
    }

    /**
     * Export audit logs to CSV with current filter state.
     */
    public function export(Request $request)
    {
        $admin = $request->user();
        
        if (!$admin->isSuperAdmin()) {
            abort(403, 'Only Super Admin can export audit logs.');
        }

        $category = $request->query('category', 'all');
        $actionType = $request->query('action_type', 'all');
        $actorId = $request->query('actor_id', 'all');
        $dateRange = $request->query('date_range', '7days');
        $search = $request->query('search', '');

        $query = AdminAuditLog::with('actor:id,name,email', 'targetUser:id,name,email');

        // Apply same filters as index()
        if ($category !== 'all') {
            $query->where('category', $category);
        }
        if ($actionType !== 'all') {
            $query->where('action_type', $actionType);
        }
        if ($actorId !== 'all') {
            $query->where('actor_id', (int) $actorId);
        }
        if ($dateRange === 'today') {
            $query->whereDate('created_at', today());
        } elseif ($dateRange === '7days') {
            $query->where('created_at', '>=', now()->subDays(7));
        } elseif ($dateRange === '30days') {
            $query->where('created_at', '>=', now()->subDays(30));
        }
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%")
                  ->orWhereHas('actor', function ($aq) use ($search) {
                      $aq->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('targetUser', function ($tq) use ($search) {
                      $tq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $logs = $query->orderBy('created_at', 'desc')->get();
        
        $filename = 'audit_log_' . now()->format('Y-m-d_His') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($logs) {
            $output = fopen('php://output', 'w');
            
            // UTF-8 BOM for Excel compatibility
            fputs($output, "\xEF\xBB\xBF");
            
            // CSV headers
            fputcsv($output, [
                'Date/Time',
                'Category',
                'Action',
                'Actor',
                'Actor Email',
                'Target User',
                'Target Email',
                'Reason',
                'Metadata',
            ]);
            
            foreach ($logs as $log) {
                fputcsv($output, [
                    $log->created_at?->format('Y-m-d H:i:s') ?? '',
                    $this->getCategoryLabel($log->category),
                    $this->getActionLabel($log->action_type),
                    $log->actor->name ?? 'System',
                    $log->actor->email ?? '',
                    $log->targetUser->name ?? ($log->metadata['target_name'] ?? ''),
                    $log->targetUser->email ?? ($log->metadata['target_email'] ?? ''),
                    $log->reason,
                    json_encode($log->metadata ?? []),
                ]);
            }
            
            fclose($output);
        };

        // Log the export action itself for audit trail
        \Log::info('Super admin exported audit log', [
            'admin_id' => $admin->id,
            'admin_name' => $admin->name,
            'filters' => compact('category', 'actionType', 'actorId', 'dateRange', 'search'),
            'export_count' => $logs->count(),
        ]);

        return response()->stream($callback, 200, $headers);
    }
    
}