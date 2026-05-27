<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\TierLimitService;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class WalletController extends Controller
{
    /**
     * Add money to user's wallet.
     * 
     * Features:
     * - Atomic balance update with row-level locking (lockForUpdate)
     * - Backend tier limit enforcement via TierLimitService
     * - Idempotency via unique reference_id (transaction_id)
     * - Append-only transaction log
     * - Comprehensive error handling
     */
    public function addMoney(Request $request)
    {
        // ============================================================
        // 1. VALIDATE INPUT
        // ============================================================
        // Note: amount is in PESOS from frontend (e.g., 100.50)
        // Will be converted to cents for storage
        $validated = $request->validate([
            'amount' => 'required|numeric|min:50|max:100000',
            'transaction_id' => 'required|string|max:255',
            'status' => 'required|string',
            'remarks' => 'nullable|string|max:255',
        ], [
            'amount.min' => 'Minimum cash-in amount is ₱50.',
            'amount.max' => 'Amount exceeds maximum allowed per transaction.',
            'transaction_id.required' => 'Transaction reference is missing.',
        ]);

        $user = $request->user();
        $amountCents = Money::pesosToCents($validated['amount']);

        // ============================================================
        // 2. IDEMPOTENCY CHECK (outside transaction for fast-fail)
        // ============================================================
        // If this transaction_id was already processed, return success
        // (don't double-charge). The unique constraint on reference_id
        // is the ultimate safeguard, but we check here to give a
        // friendly response.
        $existingTransaction = Transaction::where('reference_id', $validated['transaction_id'])
            ->where('user_id', $user->id)
            ->first();
        
        if ($existingTransaction) {
            Log::info('Idempotent request — transaction already processed', [
                'transaction_id' => $validated['transaction_id'],
                'user_id' => $user->id,
            ]);
            return back()->with('success', 'Money was already added (duplicate request).');
        }

        // ============================================================
        // 3. ATOMIC TRANSACTION WITH ROW-LEVEL LOCKING
        // ============================================================
        try {
            DB::transaction(function () use ($user, $amountCents, $validated) {
                
                // CRITICAL: lockForUpdate() acquires a row-level lock.
                // Other concurrent requests trying to update this wallet
                // will WAIT until this transaction commits.
                $wallet = $user->wallet()
                    ->lockForUpdate()
                    ->firstOrCreate(
                        ['user_id' => $user->id],
                        ['balance_cents' => 0, 'savings_balance_cents' => 0]
                    );

                // ====================================================
                // 4. ENFORCE TIER LIMIT (BACKEND - cannot be bypassed)
                // ====================================================
                if (TierLimitService::wouldExceedLimit($user, $wallet->balance_cents, $amountCents)) {
                    $tier = (int) ($user->kyc_tier ?? 1);
                    $maxPesos = TierLimitService::getMaxBalancePesos($tier);
                    $tierName = TierLimitService::getTierName($tier);
                    
                    throw ValidationException::withMessages([
                        'amount' => "This amount would exceed your {$tierName} tier limit of ₱" . number_format($maxPesos, 2) . ".",
                    ]);
                }

                // ====================================================
                // 5. UPDATE BALANCE (safe — lock is held)
                // ====================================================
                $wallet->balance_cents = Money::add($wallet->balance_cents, $amountCents);
                $wallet->save();

                // ====================================================
                // 6. APPEND-ONLY TRANSACTION LOG
                // ====================================================
                // Insert (never update or delete) for full audit trail
                $user->transactions()->create([
                    'title' => 'Cash In via PayPal',
                    'type' => 'cash_in',
                    'amount_cents' => $amountCents,
                    'reference_id' => $validated['transaction_id'],
                    'status' => 'completed',
                    'description' => $validated['remarks'] ?? 'PayPal cash-in transaction',
                    'is_positive' => true,
                ]);
            });

            return back()->with('success', 'Money added successfully!');

        } catch (ValidationException $e) {
            // Tier limit exception — propagate to frontend with field errors
            throw $e;
            
        } catch (\Illuminate\Database\QueryException $e) {
            // Could be the unique constraint violation on reference_id
            // (race condition where two requests slipped through #2 check)
            if ($e->errorInfo[1] == 1062) { // MySQL duplicate entry code
                Log::warning('Idempotency race — caught by DB unique constraint', [
                    'transaction_id' => $validated['transaction_id'],
                    'user_id' => $user->id,
                ]);
                return back()->with('success', 'Money was already added (duplicate request).');
            }
            
            Log::error('Database error in addMoney', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);
            return back()->withErrors(['amount' => 'A database error occurred. Please try again.']);
            
        } catch (\Exception $e) {
            Log::error('Unexpected error in addMoney', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);
            return back()->withErrors(['amount' => 'An error occurred. Please try again.']);
        }
    }
}