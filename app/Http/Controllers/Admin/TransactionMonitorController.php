<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\KycApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\AdminAuditLog;

class TransactionMonitorController extends Controller
{
    /**
     * Display list of transactions with filters and pagination.
     */
    public function index(Request $request)
    {
        $admin = $request->user();
        $perPage = 20;
        $page = (int) $request->query('page', 1);
        $status = $request->query('status', 'all');       // all|completed|failed|pending
        $flagged = $request->query('flagged', 'all');     // all|flagged|clean
        $search = $request->query('search', '');

        // Build query — exclude admin transactions (focus sa regular user activity)
        $query = Transaction::with('user:id,name,email,profile_picture');

        // Status filter
        if ($status === 'completed') {
            $query->whereIn('status', ['completed', 'success']);
        } elseif ($status === 'failed') {
            $query->where('status', 'failed');
        } elseif ($status === 'pending') {
            $query->where('status', 'pending');
        }

        // Flag filter
        if ($flagged === 'flagged') {
            $query->where('is_flagged', true);
        } elseif ($flagged === 'clean') {
            $query->where('is_flagged', false);
        }

        // Search by user name, email, or reference
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%")
                       ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('public_reference_id', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }

        $totalCount = $query->count();
        $totalPages = max(1, ceil($totalCount / $perPage));

        $transactions = $query
            ->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'public_reference_id' => $t->public_reference_id,
                    'user' => [
                        'id' => $t->user->id ?? null,
                        'name' => $t->user->name ?? 'Unknown',
                        'email' => $t->user->email ?? '',
                        'profile_picture' => $t->user->profile_picture ?? null,
                    ],
                    'title' => $t->title,
                    'type' => $t->type,
                    'amount' => (float) $t->amount_pesos,
                    'is_positive' => $t->is_positive,
                    'status' => $t->status,
                    'is_flagged' => (bool) $t->is_flagged,
                    'created_at' => $t->created_at?->toIso8601String(),
                    'created_relative' => $t->created_at?->diffForHumans() ?? '—',
                ];
            });

        // Counts for filter tabs
        $counts = [
            'all' => Transaction::count(),
            'completed' => Transaction::whereIn('status', ['completed', 'success'])->count(),
            'failed' => Transaction::where('status', 'failed')->count(),
            'pending' => Transaction::where('status', 'pending')->count(),
            'flagged' => Transaction::where('is_flagged', true)->count(),
        ];

        // Quick stats
        $stats = [
            'total_volume' => Transaction::whereIn('status', ['completed', 'success'])->sum('amount_cents') / 100,
            'total_count' => $counts['all'],
            'flagged_count' => $counts['flagged'],
            'failed_count' => $counts['failed'],
        ];

        return Inertia::render('Admin/TransactionsList', [
            'auth' => ['user' => $admin],
            'transactions' => $transactions,
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
                'flagged' => $flagged,
                'search' => $search,
            ],
            'counts' => $counts,
            'stats' => $stats,
            'pendingCounts' => $this->getAdminPendingCounts(),
        ]);
    }

    /**
     * Display transaction detail with full audit info.
     */
  /**
     * Display transaction detail with full audit info.
     */
    public function show(Request $request, int $id)
    {
        $admin = $request->user();

        $transaction = Transaction::with([
            'user:id,name,email,profile_picture,kyc_tier,account_number',
            'flagger:id,name,email',
            'resolver:id,name,email',
            'parentTransaction:id,public_reference_id,title',
            'correctionTransactions',
        ])->findOrFail($id);

        return Inertia::render('Admin/TransactionDetail', [
            'auth' => ['user' => $admin],
            'transaction' => [
                'id' => $transaction->id,
                'public_reference_id' => $transaction->public_reference_id,
                'title' => $transaction->title,
                'type' => $transaction->type,
                'amount' => (float) $transaction->amount_pesos,
                'amount_cents' => $transaction->amount_cents,
                'is_positive' => $transaction->is_positive,
                'status' => $transaction->status,
                'is_flagged' => (bool) $transaction->is_flagged,
                'flag_reason' => $transaction->flag_reason,
                'flagged_at' => $transaction->flagged_at?->format('F j, Y \a\t g:i A'),
                'flagger' => $transaction->flagger ? [
                    'id' => $transaction->flagger->id,
                    'name' => $transaction->flagger->name,
                    'email' => $transaction->flagger->email,
                ] : null,
                'created_at' => $transaction->created_at?->toIso8601String(),
                'is_resolved' => (bool) $transaction->is_resolved,
                'resolved_at' => $transaction->resolved_at?->format('F j, Y \a\t g:i A'),
                'resolution_type' => $transaction->resolution_type,
                'resolution_notes' => $transaction->resolution_notes,
                'resolver' => $transaction->resolver ? [
                    'id' => $transaction->resolver->id,
                    'name' => $transaction->resolver->name,
                    'email' => $transaction->resolver->email,
                ] : null,
                'created_formatted' => $transaction->created_at?->format('F j, Y \a\t g:i A'),
                'created_relative' => $transaction->created_at?->diffForHumans(),
                'updated_at' => $transaction->updated_at?->toIso8601String(),
                'updated_formatted' => $transaction->updated_at?->format('F j, Y \a\t g:i A'),
                'user' => [
                    'id' => $transaction->user->id ?? null,
                    'name' => $transaction->user->name ?? 'Unknown',
                    'email' => $transaction->user->email ?? '',
                    'profile_picture' => $transaction->user->profile_picture ?? null,
                    'kyc_tier' => $transaction->user->kyc_tier ?? 1,
                    'account_number' => $transaction->user->account_number ?? '',
                ],
                'parent_transaction' => $transaction->parentTransaction ? [
                    'id' => $transaction->parentTransaction->id,
                    'public_reference_id' => $transaction->parentTransaction->public_reference_id,
                    'title' => $transaction->parentTransaction->title,
                ] : null,
                'correction_transactions' => $transaction->correctionTransactions->map(function ($corr) {
                    return [
                        'id' => $corr->id,
                        'public_reference_id' => $corr->public_reference_id,
                        'amount' => (float) $corr->amount_pesos,
                        'correction_proof' => $corr->correction_proof,
                        'created_at' => $corr->created_at?->format('F j, Y \a\t g:i A'),
                        'created_relative' => $corr->created_at?->diffForHumans(),
                    ];
                })->toArray(),
                'correction_proof' => $transaction->correction_proof,
            ],
            'pendingCounts' => $this->getAdminPendingCounts(),
        ]);
    }
    
    /**
     * Flag a transaction as suspicious (super_admin only).
     */
    public function flagTransaction(Request $request, int $id)
    {
        $admin = $request->user();
        
        if (!$admin->isSuperAdmin()) {
            return back()->withErrors([
                'permission' => 'Only Super Admin can flag transactions.',
            ]);
        }

        $validated = $request->validate([
            'reason' => 'required|string|min:10|max:500',
        ], [
            'reason.required' => 'A flag reason is required.',
            'reason.min' => 'Please provide a detailed reason (min 10 characters).',
            'reason.max' => 'Reason cannot exceed 500 characters.',
        ]);

        try {
            $transaction = Transaction::findOrFail($id);

            if ($transaction->is_flagged) {
                // Unflag (toggle)
                $transaction->update([
                    'is_flagged' => false,
                    'flagged_at' => null,
                    'flag_reason' => null,
                    'flagged_by' => null,
                ]);
                $message = "Transaction #{$transaction->public_reference_id} unflagged.";
                $action = 'unflagged';
            } else {
                // Flag
                $transaction->update([
                    'is_flagged' => true,
                    'flagged_at' => now(),
                    'flag_reason' => $validated['reason'],
                    'flagged_by' => $admin->id,
                ]);
                $message = "Transaction #{$transaction->public_reference_id} flagged for review.";
                $action = 'flagged';
            }

           AdminAuditLog::record([
                'actor_id' => $admin->id,
                'target_user_id' => $transaction->user_id,
                'action_type' => $action === 'flagged' ? 'flag_transaction' : 'unflag_transaction',
                'category' => 'transaction',
                'reason' => $validated['reason'],
                'metadata' => [
                    'transaction_id' => $transaction->id,
                    'reference_id' => $transaction->public_reference_id,
                    'amount_cents' => $transaction->amount_cents,
                ],
            ]);

            \Log::info("Admin {$action} transaction", [
                'admin_id' => $admin->id,
                'admin_name' => $admin->name,
                'transaction_id' => $transaction->id,
                'reference_id' => $transaction->public_reference_id,
                'reason' => $validated['reason'],
                'action' => $action,
            ]);

            return redirect()->route('admin.transactions.show', $id)
                ->with('success', $message);

        } catch (\Exception $e) {
            \Log::error('Transaction flag failed', [
                'transaction_id' => $id,
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors([
                'transaction' => 'Failed to update flag status.',
            ]);
        }
    }
    /**
     * Resolve a transaction (mark as resolved with notes).
     * Any admin can resolve (customer support workflow).
     */
    public function resolveTransaction(Request $request, int $id)
    {
        $admin = $request->user();
        
        if (!$admin->isAdmin()) {
            return back()->withErrors([
                'permission' => 'Admin access required.',
            ]);
        }

        $validated = $request->validate([
            'resolution_type' => 'required|string|in:refunded,reprocessed,cancelled,verified,no_action',
            'notes' => 'required|string|min:10|max:1000',
        ], [
            'resolution_type.required' => 'Please select a resolution type.',
            'resolution_type.in' => 'Invalid resolution type.',
            'notes.required' => 'Resolution notes are required.',
            'notes.min' => 'Please provide detailed notes (min 10 characters).',
            'notes.max' => 'Notes cannot exceed 1000 characters.',
        ]);

        try {
            $transaction = Transaction::findOrFail($id);

            $transaction->update([
                'is_resolved' => true,
                'resolved_at' => now(),
                'resolution_type' => $validated['resolution_type'],
                'resolution_notes' => $validated['notes'],
                'resolved_by' => $admin->id,
            ]);

            AdminAuditLog::record([
                'actor_id' => $admin->id,
                'target_user_id' => $transaction->user_id,
                'action_type' => 'resolve_transaction',
                'category' => 'transaction',
                'reason' => $validated['notes'],
                'metadata' => [
                    'transaction_id' => $transaction->id,
                    'reference_id' => $transaction->public_reference_id,
                    'resolution_type' => $validated['resolution_type'],
                    'amount_cents' => $transaction->amount_cents,
                ],
            ]);

            \Log::info('Admin resolved transaction', [                'admin_id' => $admin->id,
                'admin_name' => $admin->name,
                'transaction_id' => $transaction->id,
                'reference_id' => $transaction->public_reference_id,
                'resolution_type' => $validated['resolution_type'],
                'notes' => $validated['notes'],
            ]);

            $fromCs = $request->input('from') === 'cs';
            $redirectRoute = $fromCs ? 'admin.customer-support.index' : 'admin.transactions.show';
            $redirectParams = $fromCs ? [] : ['id' => $id];

            return redirect()->route($redirectRoute, $redirectParams)
                ->with('success', "Transaction marked as {$validated['resolution_type']}.");

        } catch (\Exception $e) {
            \Log::error('Transaction resolution failed', [
                'transaction_id' => $id,
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors([
                'transaction' => 'Failed to resolve transaction.',
            ]);
        }
    }

    /**
     * Reopen a resolved transaction (super_admin only — corrective action).
     */
    public function reopenTransaction(Request $request, int $id)
    {
        $admin = $request->user();
        
        if (!$admin->isSuperAdmin()) {
            return back()->withErrors([
                'permission' => 'Only Super Admin can reopen resolved transactions.',
            ]);
        }

        try {
            $transaction = Transaction::findOrFail($id);

            $transaction->update([
                'is_resolved' => false,
                'resolved_at' => null,
                'resolution_type' => null,
                'resolution_notes' => null,
                'resolved_by' => null,
            ]);

            AdminAuditLog::record([
                'actor_id' => $admin->id,
                'target_user_id' => $transaction->user_id,
                'action_type' => 'reopen_transaction',
                'category' => 'transaction',
                'reason' => 'Reopened by super admin for further review',
                'metadata' => [
                    'transaction_id' => $transaction->id,
                    'reference_id' => $transaction->public_reference_id,
                ],
            ]);

            \Log::info('Super admin reopened transaction', [
                'admin_id' => $admin->id,
                'transaction_id' => $transaction->id,
                'reference_id' => $transaction->public_reference_id,
            ]);

            $fromCs = $request->input('from') === 'cs';
            $redirectUrl = $fromCs 
                ? route('admin.customer-support.index')
                : route('admin.transactions.show', $id);

            return redirect($redirectUrl)
                ->with('success', 'Transaction reopened for further review.');

        } catch (\Exception $e) {
            return back()->withErrors([
                'transaction' => 'Failed to reopen transaction.',
            ]);
        }
    }

    /**
     * Manually credit user's wallet (corrective action).
     * Used when external payment was successful but webhook/system failed
     * to credit the user. Both admin and super_admin can perform this action.
     */
    public function manualCredit(Request $request, int $id)
    {
        $admin = $request->user();
        
        if (!$admin->isAdmin()) {
            return back()->withErrors([
                'permission' => 'Admin access required.',
            ]);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01|max:1000000',
            'correction_proof' => 'required|string|min:5|max:255',
            'notes' => 'required|string|min:20|max:1000',
        ], [
            'amount.required' => 'Credit amount is required.',
            'amount.min' => 'Amount must be greater than 0.',
            'amount.max' => 'Amount cannot exceed ₱1,000,000 per correction.',
            'correction_proof.required' => 'External payment proof is required.',
            'correction_proof.min' => 'Proof reference must be at least 5 characters.',
            'notes.required' => 'Detailed notes are required.',
            'notes.min' => 'Please provide detailed notes (min 20 characters).',
        ]);

        try {
            $originalTransaction = Transaction::findOrFail($id);

            // Validation: must be failed or pending (can't correct completed ones)
            if (!in_array($originalTransaction->status, ['failed', 'pending'])) {
                return back()->withErrors([
                    'transaction' => 'Manual credit can only be applied to failed or pending transactions.',
                ]);
            }

            // Validation: must be incoming transaction (positive)
            if (!$originalTransaction->is_positive) {
                return back()->withErrors([
                    'transaction' => 'Manual credit only applies to incoming (positive) transactions.',
                ]);
            }

            // Validation: cannot double-correct
            if ($originalTransaction->is_resolved) {
                return back()->withErrors([
                    'transaction' => 'This transaction has already been resolved.',
                ]);
            }

            $existingCorrection = Transaction::where('parent_transaction_id', $originalTransaction->id)->exists();
            if ($existingCorrection) {
                return back()->withErrors([
                    'transaction' => 'A correction transaction already exists for this case.',
                ]);
            }

            $user = $originalTransaction->user;
            if (!$user || !$user->wallet) {
                return back()->withErrors([
                    'transaction' => 'User wallet not found.',
                ]);
            }

            $amountCents = (int) round($validated['amount'] * 100);

            // ATOMIC TRANSACTION — critical for money movement
            DB::transaction(function () use (
                $originalTransaction, 
                $user, 
                $amountCents, 
                $validated, 
                $admin
            ) {
                // 1. Create correction transaction (credit to user)
                $correction = Transaction::create([
                    'user_id' => $user->id,
                    'parent_transaction_id' => $originalTransaction->id,
                    'title' => 'Manual Credit — Correction for #' . $originalTransaction->public_reference_id,
                    'type' => $originalTransaction->type,
                    'amount_cents' => $amountCents,
                    'is_positive' => true,
                    'status' => 'completed',
                    'public_reference_id' => 'CORR-' . strtoupper(Str::random(8)),
                    'correction_proof' => $validated['correction_proof'],
                    'description' => "Manual credit by admin. Proof: {$validated['correction_proof']}. Notes: {$validated['notes']}",
                ]);

                // 2. Update wallet balance
                $user->wallet->increment('balance_cents', $amountCents);

                // 3. Mark original as resolved
                $originalTransaction->update([
                    'is_resolved' => true,
                    'resolved_at' => now(),
                    'resolution_type' => 'reprocessed',
                    'resolution_notes' => "Manual credit applied (₱{$validated['amount']}). Correction TX: {$correction->public_reference_id}. Notes: {$validated['notes']}",
                    'resolved_by' => $admin->id,
                ]);

                // 4. Write to audit log
                AdminAuditLog::record([
                    'actor_id' => $admin->id,
                    'target_user_id' => $user->id,
                    'action_type' => 'manual_credit',
                    'category' => 'transaction',
                    'reason' => $validated['notes'],
                    'metadata' => [
                        'original_transaction_id' => $originalTransaction->id,
                        'correction_transaction_id' => $correction->id,
                        'amount_cents' => $amountCents,
                        'correction_proof' => $validated['correction_proof'],
                        'target_email' => $user->email,
                        'target_name' => $user->name,
                    ],
                ]);
            });

            \Log::info('Admin performed manual credit', [
                'admin_id' => $admin->id,
                'admin_name' => $admin->name,
                'original_transaction_id' => $originalTransaction->id,
                'original_reference' => $originalTransaction->public_reference_id,
                'user_id' => $user->id,
                'user_name' => $user->name,
                'amount_cents' => $amountCents,
                'correction_proof' => $validated['correction_proof'],
                'notes' => $validated['notes'],
            ]);

            $fromCs = $request->input('from') === 'cs';
            $redirectRoute = $fromCs ? 'admin.customer-support.index' : 'admin.transactions.show';
            $redirectParams = $fromCs ? [] : ['id' => $id];

          $fromCs = $request->input('from') === 'cs';
          $redirectUrl = $fromCs 
            ? route('admin.customer-support.index')
            : route('admin.transactions.show', $id);    

        return redirect($redirectUrl)
            ->with('success', "Manual credit of ₱{$validated['amount']} applied to {$user->name}'s wallet.");

        } catch (\Exception $e) {
            \Log::error('Manual credit failed', [
                'transaction_id' => $id,
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return back()->withErrors([
                'transaction' => 'Failed to apply manual credit. ' . $e->getMessage(),
            ]);
        }
    }
}