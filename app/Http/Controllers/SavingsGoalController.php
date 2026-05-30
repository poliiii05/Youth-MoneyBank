<?php

namespace App\Http\Controllers;

use App\Models\SavingsGoal;
use App\Support\Money;
use Illuminate\Http\Request;
use Inertia\Inertia;


class SavingsGoalController extends Controller
{
   public function index()
{
    $user = auth()->user();
    $wallet = $user->wallet;

    // Lahat ng computation sa CENTS, then convert to pesos for display
    $mainBalanceCents = $wallet ? $wallet->balance_cents : 0;
    $unallocatedSavingsCents = $wallet ? $wallet->savings_balance_cents : 0;
    $allocatedGoalsCents = $user->savingsGoals()
    ->where('status', '!=', 'deleted')
    ->sum('current_amount_cents');    $totalSavingsCents = $unallocatedSavingsCents + $allocatedGoalsCents;

    $goals = $user->savingsGoals()
    ->where('status', '!=', 'deleted')
    ->orderBy('created_at', 'desc')
    ->get()
    ->map(function ($goal) {
            return [
                'id' => $goal->id,
                'title' => $goal->title,
                'subtitle' => $goal->subtitle,
                'current_amount' => (float) $goal->current_amount_pesos,
                'target_amount' => (float) $goal->target_amount_pesos,
                'icon_name' => $goal->icon_name,
                'color_theme' => $goal->color_theme,
                'status' => $goal->status,
            ];
        });

    return Inertia::render('User/Goals', [
                'auth' => ['user' => $user],
                'goals' => $goals,
                'finances' => [
                    'total_savings' => (float) ($totalSavingsCents / 100),
                    'allocated' => (float) ($allocatedGoalsCents / 100),
                    'unallocated' => (float) ($unallocatedSavingsCents / 100),
                    'main_balance' => (float) ($mainBalanceCents / 100),
                    'savings_pool_balance' => (float) ($unallocatedSavingsCents / 100),  // ← BAGO ITO (alias for clarity)
                ]
            ]);
}
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'target_amount' => 'required|numeric|min:50',
            'icon_name' => 'required|string',
            'color_theme' => 'required|string',
        ]);

        // Convert peso input to cents for storage
        auth()->user()->savingsGoals()->create([
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'target_amount_cents' => Money::pesosToCents($validated['target_amount']),
            'current_amount_cents' => 0,
            'icon_name' => $validated['icon_name'],
            'color_theme' => $validated['color_theme'],
        ]);

        return back()->with('success', 'Goal created successfully!');
    }

    /**
     * Update an existing savings goal.
     * Only metadata changes — does not affect allocated amount or ledger.
     */
    public function update(Request $request, SavingsGoal $goal)
    {
        // Ownership check
        if ($goal->user_id !== $request->user()->id) {
            abort(403, 'You do not have permission to edit this goal.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:50',
            'subtitle' => 'nullable|string|max:100',
            'target_amount' => 'required|numeric|min:1',
            'icon_name' => 'required|string|max:50',
            'color_theme' => 'required|string|max:50',
        ], [
            'title.required' => 'Goal title is required.',
            'target_amount.min' => 'Target amount must be at least ₱1.',
        ]);

        $newTargetCents = Money::pesosToCents($validated['target_amount']);

        // Validate: target cannot be less than current allocated amount
        if ($newTargetCents < $goal->current_amount_cents) {
            return back()->withErrors([
                'target_amount' => 'Target cannot be less than what\'s already allocated (₱' . 
                    number_format($goal->current_amount_cents / 100, 2) . '). ' .
                    'Unallocate funds first if you want to reduce the target.',
            ]);
        }

        $goal->update([
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'target_amount_cents' => $newTargetCents,
            'icon_name' => $validated['icon_name'],
            'color_theme' => $validated['color_theme'],
        ]);

        return back()->with('success', 'Goal updated successfully!');
    }
    /**
     * Delete a savings goal (soft delete).
     * If the goal has allocated funds, they are automatically returned to the Savings Pool
     * with a balanced ledger entry before the goal is marked as deleted.
     */
    public function destroy(Request $request, SavingsGoal $goal)
    {
        // Ownership check
        if ($goal->user_id !== $request->user()->id) {
            abort(403, 'You do not have permission to delete this goal.');
        }

        // Don't allow deleting an already-deleted goal
        if ($goal->status === 'deleted') {
            return back()->withErrors([
                'goal' => 'This goal has already been deleted.',
            ]);
        }

        $user = $request->user();

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($user, $goal) {
                
                $wallet = $user->wallet()->lockForUpdate()->first();
                
                if (!$wallet) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'goal' => 'Wallet not found. Please contact support.',
                    ]);
                }

                $lockedGoal = SavingsGoal::where('id', $goal->id)->lockForUpdate()->first();

                // ====================================================
                // If goal has allocated funds, return them to Savings Pool
                // ====================================================
                if ($lockedGoal->current_amount_cents > 0) {
                    $returnAmount = $lockedGoal->current_amount_cents;

                    // Move funds: Goal → Savings Pool
                    $lockedGoal->current_amount_cents = 0;
                    $lockedGoal->save();

                    $wallet->savings_balance_cents = Money::add($wallet->savings_balance_cents, $returnAmount);
                    $wallet->save();

                    // Create transaction record for the auto-return
                    $transaction = $user->transactions()->create([
                        'title' => "Returned from deleted goal: {$lockedGoal->title}",
                        'type' => 'goal_deletion_return',
                        'amount_cents' => $returnAmount,
                        'reference_id' => 'GOAL_DEL_' . $lockedGoal->id . '_' . time() . '_' . uniqid(),
                        'status' => 'completed',
                        'description' => "Auto-returned from deleted '{$lockedGoal->title}' goal to Savings Pool",
                        'is_positive' => true,
                    ]);

                    // Post to ledger
                    $goalAccount = \App\Services\LedgerService::getOrCreateGoalAccount($lockedGoal);
                    $poolAccount = \App\Services\LedgerService::getOrCreateSavingsPoolAccount($user);

                    \App\Services\LedgerService::post($transaction, [
                        [
                            'ledger_account_id' => $goalAccount->id,
                            'direction' => 'credit',  // Money leaving goal
                            'amount_cents' => $returnAmount,
                        ],
                        [
                            'ledger_account_id' => $poolAccount->id,
                            'direction' => 'debit',   // Money entering savings pool
                            'amount_cents' => $returnAmount,
                        ],
                    ]);
                }

                // ====================================================
                // Soft delete: set status to 'deleted'
                // ====================================================
                $lockedGoal->update(['status' => 'deleted']);
            });

            return back()->with('success', 'Goal deleted successfully!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
            
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Goal deletion error', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'goal_id' => $goal->id,
            ]);
            return back()->withErrors([
                'goal' => 'An error occurred. Please try again.',
            ]);
        }
        
    }
    /**
     * Get detailed info for a specific goal, including transaction history.
     * Returns JSON for the View Details modal.
     */
    public function showDetails(Request $request, SavingsGoal $goal)
    {
        // Ownership check
        if ($goal->user_id !== $request->user()->id) {
            abort(403, 'You do not have permission to view this goal.');
        }

        // Get the goal's ledger account
        $goalAccount = \App\Services\LedgerService::getOrCreateGoalAccount($goal);

        // Fetch all transactions involving this goal via ledger entries
        $entries = \App\Models\LedgerEntry::where('ledger_account_id', $goalAccount->id)
            ->with('transaction')
            ->orderBy('created_at', 'desc')
            ->get();

        // Format the transaction history
        $history = $entries->map(function ($entry) {
            $txn = $entry->transaction;
            
            // For goal accounts: debit = money IN (allocation), credit = money OUT (deallocation/deletion)
            $isInflow = $entry->direction === 'debit';
            
            return [
                'id' => $txn->id,
                'title' => $txn->title,
                'type' => $txn->type,
                'amount' => (float) ($entry->amount_cents / 100),
                'direction' => $entry->direction,
                'is_inflow' => $isInflow,
                'status' => $txn->status,
                'created_at' => $txn->created_at->toIso8601String(),
                'created_at_human' => $txn->created_at->diffForHumans(),
            ];
        });

        // Compute stats
        $totalAllocations = $entries->where('direction', 'debit')->count();
        $totalDeallocations = $entries->where('direction', 'credit')->count();
        $sumAllocated = $entries->where('direction', 'debit')->sum('amount_cents') / 100;
        $avgAllocation = $totalAllocations > 0 
            ? ($sumAllocated / $totalAllocations) 
            : 0;

        return response()->json([
            'goal' => [
                'id' => $goal->id,
                'title' => $goal->title,
                'subtitle' => $goal->subtitle,
                'current_amount' => (float) $goal->current_amount_pesos,
                'target_amount' => (float) $goal->target_amount_pesos,
                'icon_name' => $goal->icon_name,
                'color_theme' => $goal->color_theme,
                'status' => $goal->status,
                'created_at' => $goal->created_at->toIso8601String(),
                'created_at_human' => $goal->created_at->diffForHumans(),
            ],
            'history' => $history,
            'stats' => [
                'total_allocations' => $totalAllocations,
                'total_deallocations' => $totalDeallocations,
                'sum_allocated_lifetime' => $sumAllocated,
                'avg_allocation' => round($avgAllocation, 2),
            ],
        ]);
    }
}