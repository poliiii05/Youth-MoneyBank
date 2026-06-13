<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Transaction;
use App\Models\KycApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AdminAuditLog;

class UserManagementController extends Controller
{
    /**
     * Display list of users with filters and pagination.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $perPage = 15;
        $page = (int) $request->query('page', 1);
        $tier = $request->query('tier', 'all');         // all|1|2|3
        $verified = $request->query('verified', 'all'); // all|verified|unverified
        $search = $request->query('search', '');

        // Build query — exclude admin accounts from user list
        $query = User::whereNull('admin_role');

        if ($tier !== 'all') {
            $query->where('kyc_tier', (int) $tier);
        }

        if ($verified === 'verified') {
            $query->whereNotNull('email_verified_at');
        } elseif ($verified === 'unverified') {
            $query->whereNull('email_verified_at');
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('account_number', 'like', "%{$search}%");
            });
        }

        $totalCount = $query->count();
        $totalPages = max(1, ceil($totalCount / $perPage));

        $users = $query
            ->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'account_number' => $u->account_number,
                    'kyc_tier' => $u->kyc_tier,
                    'profile_picture' => $u->profile_picture,
                    'email_verified' => !is_null($u->email_verified_at),
                    'created_at' => $u->created_at?->toIso8601String(),
                    'member_since' => $u->created_at?->format('M j, Y'),
                    'created_relative' => $u->created_at?->diffForHumans(),
                ];
            });

        // Counts for filter tabs
        $counts = [
            'all' => User::whereNull('admin_role')->count(),
            'tier1' => User::whereNull('admin_role')->where('kyc_tier', 1)->count(),
            'tier2' => User::whereNull('admin_role')->where('kyc_tier', 2)->count(),
            'tier3' => User::whereNull('admin_role')->where('kyc_tier', 3)->count(),
        ];

        return Inertia::render('Admin/UserList', [
            'auth' => ['user' => $user],
            'users' => $users,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'total_count' => $totalCount,
                'per_page' => $perPage,
                'from' => $totalCount > 0 ? ($page - 1) * $perPage + 1 : 0,
                'to' => min($page * $perPage, $totalCount),
            ],
            'filters' => [
                'tier' => $tier,
                'verified' => $verified,
                'search' => $search,
            ],
            'counts' => $counts,
            'pendingCounts' => $this->getAdminPendingCounts(),
        ]);
    }

    /**
     * Display user detail with balances, transactions, and KYC history.
     */
    public function show(Request $request, int $id)
    {
        $admin = $request->user();
        
        $targetUser = User::findOrFail($id);

        // Prevent admin from viewing other admins
        if (!is_null($targetUser->admin_role)) {
            return redirect()->route('admin.users.index')
                ->withErrors(['user' => 'Cannot view admin accounts via user management.']);
        }

        // Recent transactions (last 10)
        $recentTransactions = Transaction::where('user_id', $targetUser->id)
            ->whereIn('status', ['completed', 'success'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'title' => $t->title,
                    'amount' => (float) $t->amount_pesos,
                    'is_positive' => $t->is_positive,
                    'status' => $t->status,
                    'created_at' => $t->created_at?->toIso8601String(),
                    'created_relative' => $t->created_at?->diffForHumans() ?? '—',
                ];
            });

        // KYC history (all applications)
        $kycHistory = KycApplication::where('user_id', $targetUser->id)
            ->orderBy('submitted_at', 'desc')
            ->get()
            ->map(function ($app) {
                return [
                    'id' => $app->id,
                    'original_tier' => $app->original_tier ?? ($app->target_tier - 1),
                    'target_tier' => $app->target_tier,
                    'status' => $app->status,
                    'submitted_at' => $app->submitted_at?->toIso8601String(),
                    'submitted_relative' => $app->submitted_at?->diffForHumans() ?? '—',
                    'reviewed_at' => $app->reviewed_at?->toIso8601String(),
                    'reviewed_relative' => $app->reviewed_at?->diffForHumans(),
                    'rejection_reason' => $app->rejection_reason,
                ];
            });

        // Calculate balances — wallet via relation, savings = sum of all savings goals
        $wallet = $targetUser->wallet;
        $walletBalance = $wallet ? $wallet->balance_cents / 100 : 0;

        // Savings = sum of all savings goals balances
        $savingsGoalsCount = $targetUser->savingsGoals()->count();
        $savingsBalanceCents = $targetUser->savingsGoals()->sum('current_amount_cents');
        $savingsBalance = $savingsBalanceCents / 100;

        // Total transaction volume
        $totalVolumeCents = Transaction::where('user_id', $targetUser->id)
            ->whereIn('status', ['completed', 'success'])
            ->sum('amount_cents');
        $totalVolume = $totalVolumeCents / 100;

        $totalTransactions = Transaction::where('user_id', $targetUser->id)
            ->whereIn('status', ['completed', 'success'])
            ->count();

        return Inertia::render('Admin/UserDetail', [
            'auth' => ['user' => $admin],
            'targetUser' => [
                'id' => $targetUser->id,
                'name' => $targetUser->name,
                'email' => $targetUser->email,
                'phone_number' => $targetUser->phone_number,
                'account_number' => $targetUser->account_number,
                'kyc_tier' => $targetUser->kyc_tier,
                'profile_picture' => $targetUser->profile_picture,
                'email_verified' => !is_null($targetUser->email_verified_at),
                'email_verified_at' => $targetUser->email_verified_at?->format('F j, Y \a\t g:i A'),
                'phone_verified' => !is_null($targetUser->phone_verified_at),
                'member_since' => $targetUser->created_at?->format('F j, Y'),
                'last_active' => $targetUser->updated_at?->diffForHumans(),
                'google_linked' => !is_null($targetUser->google_id),
                'is_suspended' => (bool) $targetUser->is_suspended,
                'suspended_at' => $targetUser->suspended_at?->format('F j, Y \a\t g:i A'),
                'suspension_reason' => $targetUser->suspension_reason,
            ],
            'balances' => [
                'wallet' => $walletBalance,
                'savings' => $savingsBalance,
                'total' => $walletBalance + $savingsBalance,
            ],
            'stats' => [
                'total_volume' => $totalVolume,
                'total_transactions' => $totalTransactions,
                'kyc_applications' => $kycHistory->count(),
                'savings_goals' => $savingsGoalsCount,
            ],
            'recent_transactions' => $recentTransactions,
            'kyc_history' => $kycHistory,
            'pendingCounts' => $this->getAdminPendingCounts(),
        ]);
    }

    /**
     * Override user's KYC tier (super_admin only).
     */
    public function overrideTier(Request $request, int $id)
    {
        $admin = $request->user();
        
        // Permission check — only super_admin can override
        if (!$admin->isSuperAdmin()) {
            return back()->withErrors([
                'permission' => 'Only Super Admin can override user tier.',
            ]);
        }

        $validated = $request->validate([
            'new_tier' => 'required|integer|in:1,2,3',
            'reason' => 'required|string|min:10|max:500',
        ], [
            'new_tier.required' => 'New tier is required.',
            'new_tier.in' => 'Invalid tier. Must be 1, 2, or 3.',
            'reason.required' => 'Override reason is required.',
            'reason.min' => 'Please provide a detailed reason (min 10 characters).',
        ]);

        try {
            $targetUser = User::findOrFail($id);
            
            // Prevent overriding admin accounts
            if (!is_null($targetUser->admin_role)) {
                return back()->withErrors([
                    'user' => 'Cannot override admin account tier.',
                ]);
            }
            
            $oldTier = $targetUser->kyc_tier;
            $targetUser->update(['kyc_tier' => $validated['new_tier']]);

            AdminAuditLog::record([
                'actor_id' => $admin->id,
                'target_user_id' => $targetUser->id,
                'action_type' => 'override_tier',
                'category' => 'user_management',
                'reason' => $validated['reason'],
                'metadata' => [
                    'old_tier' => $oldTier,
                    'new_tier' => $validated['new_tier'],
                    'target_email' => $targetUser->email,
                    'target_name' => $targetUser->name,
                ],
            ]);

            \Log::info('Admin tier override', [
                'admin_id' => $admin->id,
                'admin_name' => $admin->name,
                'target_user_id' => $targetUser->id,
                'target_user_name' => $targetUser->name,
                'old_tier' => $oldTier,
                'new_tier' => $validated['new_tier'],
                'reason' => $validated['reason'],
            ]);

            return redirect()->route('admin.users.show', $id)
                ->with('success', "Tier updated. {$targetUser->name} is now Tier {$validated['new_tier']}.");

        } catch (\Exception $e) {
            \Log::error('Tier override failed', [
                'user_id' => $id,
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors([
                'user' => 'Failed to update tier. Please try again.',
            ]);
        }
    }

    /**
     * Suspend or reactivate user account (super_admin only).
     */
    public function toggleSuspension(Request $request, int $id)
    {
        $admin = $request->user();
        
        if (!$admin->isSuperAdmin()) {
            return back()->withErrors([
                'permission' => 'Only Super Admin can suspend/activate accounts.',
            ]);
        }

        $validated = $request->validate([
            'reason' => 'required|string|min:10|max:500',
        ], [
            'reason.required' => 'A reason is required for this action.',
            'reason.min' => 'Please provide a detailed reason (min 10 characters).',
        ]);

        try {
            $targetUser = User::findOrFail($id);

            if (!is_null($targetUser->admin_role)) {
                return back()->withErrors([
                    'user' => 'Cannot suspend admin accounts.',
                ]);
            }

            $wasSuspended = (bool) $targetUser->is_suspended;
            
            if ($wasSuspended) {
                // Reactivate
                $targetUser->update([
                    'is_suspended' => false,
                    'suspended_at' => null,
                    'suspension_reason' => null,
                    'suspended_by' => null,
                ]);
                $message = "{$targetUser->name}'s account has been reactivated.";
                $action = 'reactivated';
            } else {
                // Suspend
                $targetUser->update([
                    'is_suspended' => true,
                    'suspended_at' => now(),
                    'suspension_reason' => $validated['reason'],
                    'suspended_by' => $admin->id,
                ]);
                $message = "{$targetUser->name}'s account has been suspended.";
                $action = 'suspended';
            }

            AdminAuditLog::record([
                'actor_id' => $admin->id,
                'target_user_id' => $targetUser->id,
                'action_type' => $wasSuspended ? 'unsuspend_user' : 'suspend_user',
                'category' => 'user_management',
                'reason' => $validated['reason'],
                'metadata' => [
                    'target_email' => $targetUser->email,
                    'target_name' => $targetUser->name,
                ],
            ]);

            \Log::info("Admin {$action} user account", [
                'admin_id' => $admin->id,
                'target_user_id' => $targetUser->id,
                'target_user_name' => $targetUser->name,
                'reason' => $validated['reason'],
                'action' => $action,
            ]);

            return redirect()->route('admin.users.show', $id)
                ->with('success', $message);

        } catch (\Exception $e) {
            \Log::error('Suspension toggle failed', [
                'user_id' => $id,
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors([
                'user' => 'Failed to update account status.',
            ]);
        }
    }

    /**
     * Force logout user from all sessions (super_admin only).
     */
    public function forceLogout(Request $request, int $id)
    {
        $admin = $request->user();
        
        if (!$admin->isSuperAdmin()) {
            return back()->withErrors([
                'permission' => 'Only Super Admin can force logout users.',
            ]);
        }

        try {
            $targetUser = User::findOrFail($id);

            if (!is_null($targetUser->admin_role)) {
                return back()->withErrors([
                    'user' => 'Cannot force logout admin accounts.',
                ]);
            }

            // Invalidate all sessions for this user
            // Updating remember_token forces session re-auth
            $targetUser->update([
                'remember_token' => null,
            ]);

            // Delete database sessions for this user (if using database driver)
            \DB::table('sessions')
                ->where('user_id', $targetUser->id)
                ->delete();

            AdminAuditLog::record([
                'actor_id' => $admin->id,
                'target_user_id' => $targetUser->id,
                'action_type' => 'force_logout',
                'category' => 'user_management',
                'reason' => 'Force logout from all sessions',
                'metadata' => [
                    'target_email' => $targetUser->email,
                    'target_name' => $targetUser->name,
                ],
            ]);

            \Log::info('Admin force logged out user', [
                'admin_id' => $admin->id,
                'target_user_id' => $targetUser->id,
                'target_user_name' => $targetUser->name,
            ]);

            return redirect()->route('admin.users.show', $id)
                ->with('success', "{$targetUser->name} has been logged out from all sessions.");

        } catch (\Exception $e) {
            \Log::error('Force logout failed', [
                'user_id' => $id,
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors([
                'user' => 'Failed to logout user.',
            ]);
        }
    }
}