<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Services\LedgerService;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class GoalAllocationController extends Controller
{
    /**
     * Allocate money from Savings Pool to a specific Savings Goal.
     * 
     * POST /goals/{goal}/allocate
     * 
     * Flow:
     *   Savings Pool (savings_balance_cents)  →  credit
     *   Goal (current_amount_cents)  →  debit
     */
    public function allocate(Request $request, SavingsGoal $goal)
    {
        if ($goal->user_id !== $request->user()->id) {
            abort(403, 'You do not have permission to allocate to this goal.');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
        ], [
            'amount.min' => 'Minimum allocation is ₱1.',
        ]);

        $user = $request->user();
        $amountCents = Money::pesosToCents($validated['amount']);

        try {
            DB::transaction(function () use ($user, $goal, $amountCents) {
                
                $wallet = $user->wallet()->lockForUpdate()->first();
                
                if (!$wallet) {
                    throw ValidationException::withMessages([
                        'amount' => 'Wallet not found. Please contact support.',
                    ]);
                }

                $lockedGoal = SavingsGoal::where('id', $goal->id)->lockForUpdate()->first();

                if ($wallet->savings_balance_cents < $amountCents) {
                    throw ValidationException::withMessages([
                        'amount' => 'Insufficient savings pool balance. You have ₱' . 
                            number_format($wallet->savings_balance_cents / 100, 2) . ' available in your savings.',
                    ]);
                }

                $remainingToTarget = $lockedGoal->target_amount_cents - $lockedGoal->current_amount_cents;
                
                if ($remainingToTarget <= 0) {
                    throw ValidationException::withMessages([
                        'amount' => 'This goal has already reached its target.',
                    ]);
                }

                if ($amountCents > $remainingToTarget) {
                    throw ValidationException::withMessages([
                        'amount' => 'Amount exceeds remaining target. You can add up to ₱' . 
                            number_format($remainingToTarget / 100, 2) . '.',
                    ]);
                }

                $wallet->savings_balance_cents = Money::subtract($wallet->savings_balance_cents, $amountCents);
                $wallet->save();

                $lockedGoal->current_amount_cents = Money::add($lockedGoal->current_amount_cents, $amountCents);
                $lockedGoal->save();

                $transaction = $user->transactions()->create([
                    'title' => "Allocated to {$lockedGoal->title}",
                    'type' => 'goal_allocation',
                    'amount_cents' => $amountCents,
                    'reference_id' => 'GOAL_ALLOC_' . $lockedGoal->id . '_' . time() . '_' . uniqid(),
                    'status' => 'completed',
                    'description' => "Allocated from Savings Pool to '{$lockedGoal->title}' goal",
                    'is_positive' => false,
                ]);

                $poolAccount = LedgerService::getOrCreateSavingsPoolAccount($user);
                $goalAccount = LedgerService::getOrCreateGoalAccount($lockedGoal);

                LedgerService::post($transaction, [
                    [
                        'ledger_account_id' => $poolAccount->id,
                        'direction' => 'credit',
                        'amount_cents' => $amountCents,
                    ],
                    [
                        'ledger_account_id' => $goalAccount->id,
                        'direction' => 'debit',
                        'amount_cents' => $amountCents,
                    ],
                ]);
            });

            return back()->with('success', 'Money allocated to goal successfully!');

        } catch (ValidationException $e) {
            throw $e;
            
        } catch (\Exception $e) {
            Log::error('Goal allocation error', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'goal_id' => $goal->id,
            ]);
            return back()->withErrors([
                'amount' => 'An error occurred. Please try again.',
            ]);
        }
    }

    /**
     * De-allocate money from a Savings Goal back to the Savings Pool.
     * 
     * POST /goals/{goal}/deallocate
     * 
     * Flow:
     *   Goal (current_amount_cents)  →  credit
     *   Savings Pool (savings_balance_cents)  →  debit
     */
    public function deallocate(Request $request, SavingsGoal $goal)
    {
        if ($goal->user_id !== $request->user()->id) {
            abort(403, 'You do not have permission to modify this goal.');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
        ], [
            'amount.min' => 'Minimum de-allocation is ₱1.',
        ]);

        $user = $request->user();
        $amountCents = Money::pesosToCents($validated['amount']);

        try {
            DB::transaction(function () use ($user, $goal, $amountCents) {
                
                $wallet = $user->wallet()->lockForUpdate()->first();
                
                if (!$wallet) {
                    throw ValidationException::withMessages([
                        'amount' => 'Wallet not found. Please contact support.',
                    ]);
                }

                $lockedGoal = SavingsGoal::where('id', $goal->id)->lockForUpdate()->first();

                // ====================================================
                // VALIDATE: Cannot de-allocate more than what's in the goal
                // ====================================================
                if ($lockedGoal->current_amount_cents < $amountCents) {
                    throw ValidationException::withMessages([
                        'amount' => 'You can only de-allocate up to ₱' . 
                            number_format($lockedGoal->current_amount_cents / 100, 2) . 
                            ' from this goal.',
                    ]);
                }

                // ====================================================
                // UPDATE BALANCES (Goal → Savings Pool)
                // ====================================================
                $lockedGoal->current_amount_cents = Money::subtract($lockedGoal->current_amount_cents, $amountCents);
                $lockedGoal->save();

                $wallet->savings_balance_cents = Money::add($wallet->savings_balance_cents, $amountCents);
                $wallet->save();

                // ====================================================
                // CREATE TRANSACTION RECORD
                // ====================================================
                $transaction = $user->transactions()->create([
                    'title' => "Unallocated from {$lockedGoal->title}",
                    'type' => 'goal_deallocation',
                    'amount_cents' => $amountCents,
                    'reference_id' => 'GOAL_DEALLOC_' . $lockedGoal->id . '_' . time() . '_' . uniqid(),
                    'status' => 'completed',
                    'description' => "Moved from '{$lockedGoal->title}' back to Savings Pool",
                    'is_positive' => true,
                ]);

                // ====================================================
                // POST TO LEDGER (reversed direction vs allocate)
                // ====================================================
                $goalAccount = LedgerService::getOrCreateGoalAccount($lockedGoal);
                $poolAccount = LedgerService::getOrCreateSavingsPoolAccount($user);

                LedgerService::post($transaction, [
                    [
                        'ledger_account_id' => $goalAccount->id,
                        'direction' => 'credit',  // Money leaving goal
                        'amount_cents' => $amountCents,
                    ],
                    [
                        'ledger_account_id' => $poolAccount->id,
                        'direction' => 'debit',   // Money entering savings pool
                        'amount_cents' => $amountCents,
                    ],
                ]);
            });

            return back()->with('success', 'Funds moved back to savings!');

        } catch (ValidationException $e) {
            throw $e;
            
        } catch (\Exception $e) {
            Log::error('Goal de-allocation error', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'goal_id' => $goal->id,
            ]);
            return back()->withErrors([
                'amount' => 'An error occurred. Please try again.',
            ]);
        }
    }
}