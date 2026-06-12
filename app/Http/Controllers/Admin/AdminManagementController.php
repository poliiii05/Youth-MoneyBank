<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AdminAuditLog;

class AdminManagementController extends Controller
{
    /**
     * Display list of all admin accounts.
     */
    public function index(Request $request)
    {
        $admin = $request->user();
        
        if (!$admin->isSuperAdmin()) {
            abort(403, 'Only Super Admin can manage admin accounts.');
        }

        $search = $request->query('search', '');

        $query = User::whereNotNull('admin_role')
            ->with('adminRoleGrantor:id,name,email');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $admins = $query
            ->orderByRaw("CASE WHEN admin_role = 'super_admin' THEN 0 ELSE 1 END")
            ->orderBy('admin_role_granted_at', 'desc')
            ->get()
            ->map(function ($u) use ($admin) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'profile_picture' => $u->profile_picture,
                    'admin_role' => $u->admin_role,
                    'role_label' => $u->admin_role === 'super_admin' ? 'Super Admin' : 'Admin',
                    'granted_at' => $u->admin_role_granted_at?->format('M j, Y'),
                    'granted_relative' => $u->admin_role_granted_at?->diffForHumans(),
                    'granted_by' => $u->adminRoleGrantor ? [
                        'id' => $u->adminRoleGrantor->id,
                        'name' => $u->adminRoleGrantor->name,
                    ] : null,
                    'is_self' => $u->id === $admin->id,
                    'created_at' => $u->created_at?->format('M j, Y'),
                ];
            });

        // Counts
        $counts = [
            'total' => User::whereNotNull('admin_role')->count(),
            'super_admin' => User::where('admin_role', 'super_admin')->count(),
            'admin' => User::where('admin_role', 'admin')->count(),
        ];
        // Recent audit logs for admin management actions
        $auditLogs = AdminAuditLog::with('actor:id,name,profile_picture', 'targetUser:id,name,profile_picture')
            ->where('category', 'admin_management')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($log) {
                $actionLabels = [
                    'promote_admin' => 'Promoted',
                    'change_role' => 'Changed Role',
                    'revoke_admin' => 'Revoked Access',
                ];
                
                return [
                    'id' => $log->id,
                    'action_type' => $log->action_type,
                    'action_label' => $actionLabels[$log->action_type] ?? $log->action_type,
                    'actor' => $log->actor ? [
                        'id' => $log->actor->id,
                        'name' => $log->actor->name,
                        'profile_picture' => $log->actor->profile_picture,
                    ] : null,
                    'target_user' => $log->targetUser ? [
                        'id' => $log->targetUser->id,
                        'name' => $log->targetUser->name,
                        'profile_picture' => $log->targetUser->profile_picture,
                    ] : ($log->metadata['target_name'] ?? null ? ['name' => $log->metadata['target_name']] : null),
                    'reason' => $log->reason,
                    'metadata' => $log->metadata,
                    'created_at' => $log->created_at?->format('M j, Y g:i A'),
                    'created_relative' => $log->created_at?->diffForHumans(),
                ];
            });

        return Inertia::render('Admin/AdminsList', [
            'auth' => ['user' => $admin],
            'admins' => $admins,
            'counts' => $counts,
            'filters' => ['search' => $search],
            'auditLogs' => $auditLogs,
            'pendingCounts' => $this->getAdminPendingCounts(),
        ]);
    }

    /**
     * Promote a regular user to admin role.
     */
    public function promote(Request $request)
    {
        $admin = $request->user();
        
        if (!$admin->isSuperAdmin()) {
            return back()->withErrors(['permission' => 'Only Super Admin can promote users.']);
        }

        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'required|string|in:admin,super_admin',
            'reason' => 'required|string|min:10|max:500',
        ], [
            'email.exists' => 'No user found with this email.',
            'role.in' => 'Invalid role.',
            'reason.min' => 'Please provide a detailed reason (min 10 chars).',
        ]);

        try {
            $targetUser = User::where('email', $validated['email'])->firstOrFail();

            if (!is_null($targetUser->admin_role)) {
                return back()->withErrors([
                    'email' => 'User is already an admin. Use "Change Role" instead.',
                ]);
            }

            if ($targetUser->is_suspended) {
                return back()->withErrors([
                    'email' => 'Cannot promote a suspended user.',
                ]);
            }

            $targetUser->update([
                'admin_role' => $validated['role'],
                'admin_role_granted_at' => now(),
                'admin_role_granted_by' => $admin->id,
                'admin_role_change_reason' => $validated['reason'],
            ]);

            AdminAuditLog::record([
                'actor_id' => $admin->id,
                'target_user_id' => $targetUser->id,
                'action_type' => 'promote_admin',
                'category' => 'admin_management',
                'reason' => $validated['reason'],
                'metadata' => [
                    'role_granted' => $validated['role'],
                    'target_email' => $targetUser->email,
                    'target_name' => $targetUser->name,
                ],
            ]);

            \Log::info('Super admin promoted user', [
                'admin_id' => $admin->id,
                'admin_name' => $admin->name,
                'target_user_id' => $targetUser->id,
                'target_user_name' => $targetUser->name,
                'new_role' => $validated['role'],
                'reason' => $validated['reason'],
            ]);

            $roleLabel = $validated['role'] === 'super_admin' ? 'Super Admin' : 'Admin';

            return redirect()->route('admin.admins.index')
                ->with('success', "{$targetUser->name} has been promoted to {$roleLabel}.");

        } catch (\Exception $e) {
            \Log::error('Admin promotion failed', [
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors([
                'email' => 'Failed to promote user.',
            ]);
        }
    }

    /**
     * Change an admin's role (admin ↔ super_admin).
     */
    public function changeRole(Request $request, int $id)
    {
        $admin = $request->user();
        
        if (!$admin->isSuperAdmin()) {
            return back()->withErrors(['permission' => 'Only Super Admin can change roles.']);
        }

        $validated = $request->validate([
            'new_role' => 'required|string|in:admin,super_admin',
            'reason' => 'required|string|min:10|max:500',
        ]);

        try {
            $targetUser = User::findOrFail($id);

            if ($targetUser->id === $admin->id) {
                return back()->withErrors([
                    'role' => 'You cannot change your own role.',
                ]);
            }

            if (is_null($targetUser->admin_role)) {
                return back()->withErrors([
                    'role' => 'User is not an admin.',
                ]);
            }

            if ($targetUser->admin_role === $validated['new_role']) {
                return back()->withErrors([
                    'role' => 'User already has this role.',
                ]);
            }

            // Check: Cannot demote last super_admin
            if ($targetUser->admin_role === 'super_admin' && $validated['new_role'] === 'admin') {
                $superAdminCount = User::where('admin_role', 'super_admin')->count();
                if ($superAdminCount <= 1) {
                    return back()->withErrors([
                        'role' => 'Cannot demote the last Super Admin. System needs at least one.',
                    ]);
                }
            }

            $oldRole = $targetUser->admin_role;

            $targetUser->update([
                'admin_role' => $validated['new_role'],
                'admin_role_change_reason' => $validated['reason'],
            ]);

            AdminAuditLog::record([
                'actor_id' => $admin->id,
                'target_user_id' => $targetUser->id,
                'action_type' => 'revoke_admin',
                'category' => 'admin_management',
                'reason' => $validated['reason'],
                'metadata' => [
                    'revoked_role' => $oldRole,
                    'target_email' => $targetUser->email,
                    'target_name' => $targetUser->name,
                ],
            ]);

            \Log::info('Super admin changed admin role', [
                'admin_id' => $admin->id,
                'admin_name' => $admin->name,
                'target_user_id' => $targetUser->id,
                'target_user_name' => $targetUser->name,
                'old_role' => $oldRole,
                'new_role' => $validated['new_role'],
                'reason' => $validated['reason'],
            ]);

            $roleLabel = $validated['new_role'] === 'super_admin' ? 'Super Admin' : 'Admin';

            return redirect()->route('admin.admins.index')
                ->with('success', "{$targetUser->name}'s role changed to {$roleLabel}.");

        } catch (\Exception $e) {
            \Log::error('Role change failed', [
                'target_user_id' => $id,
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors([
                'role' => 'Failed to change role.',
            ]);
        }
    }

    /**
     * Revoke admin role (back to regular user).
     */
    public function revoke(Request $request, int $id)
    {
        $admin = $request->user();
        
        if (!$admin->isSuperAdmin()) {
            return back()->withErrors(['permission' => 'Only Super Admin can revoke admin access.']);
        }

        $validated = $request->validate([
            'reason' => 'required|string|min:10|max:500',
        ]);

        try {
            $targetUser = User::findOrFail($id);

            if ($targetUser->id === $admin->id) {
                return back()->withErrors([
                    'user' => 'You cannot revoke your own admin role.',
                ]);
            }

            if (is_null($targetUser->admin_role)) {
                return back()->withErrors([
                    'user' => 'User is not an admin.',
                ]);
            }

            // Check: Cannot revoke last super_admin
            if ($targetUser->admin_role === 'super_admin') {
                $superAdminCount = User::where('admin_role', 'super_admin')->count();
                if ($superAdminCount <= 1) {
                    return back()->withErrors([
                        'user' => 'Cannot revoke the last Super Admin. System needs at least one.',
                    ]);
                }
            }

            $oldRole = $targetUser->admin_role;

            $targetUser->update([
                'admin_role' => null,
                'admin_role_revoked_at' => now(),
                'admin_role_revoked_by' => $admin->id,
                'admin_role_change_reason' => $validated['reason'],
            ]);

            \Log::info('Super admin revoked admin role', [
                'admin_id' => $admin->id,
                'admin_name' => $admin->name,
                'target_user_id' => $targetUser->id,
                'target_user_name' => $targetUser->name,
                'old_role' => $oldRole,
                'reason' => $validated['reason'],
            ]);

            return redirect()->route('admin.admins.index')
                ->with('success', "{$targetUser->name}'s admin access has been revoked.");

        } catch (\Exception $e) {
            \Log::error('Admin revocation failed', [
                'target_user_id' => $id,
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors([
                'user' => 'Failed to revoke admin role.',
            ]);
        }
    }
    /**
     * Search for promotable users (non-admins, not suspended).
     * Used by the Promote Admin modal for typeahead autocomplete.
     */
    public function searchPromotableUsers(Request $request)
    {
        $admin = $request->user();
        
        if (!$admin->isSuperAdmin()) {
            return response()->json([], 403);
        }

        $query = trim($request->query('q', ''));
        
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $users = User::whereNull('admin_role')
            ->where('is_suspended', false)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%");
            })
            ->limit(8)
            ->get(['id', 'name', 'email', 'profile_picture', 'kyc_tier'])
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'profile_picture' => $u->profile_picture,
                    'kyc_tier' => $u->kyc_tier,
                ];
            });

        return response()->json($users);
    }
}