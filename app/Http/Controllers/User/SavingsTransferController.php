<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\LedgerService;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class SavingsTransferController extends Controller
{
    /**
     * Add money from Main Wallet to Savings Pool.
     * 
     * POST /savings/add
     * 
     * Flow:
     *   Main Wallet (balance_cents)  →  credit
     *   Savings Pool (savings_balance_cents)  →  debit
     */
    public function addToSavings(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
        ], [
            'amount.min' => 'Minimum transfer amount is ₱1.',
        ]);

        $user = $request->user();
        $amountCents = Money::pesosToCents($validated['amount']);

        try {
            DB::transaction(function () use ($user, $amountCents) {
                
                $wallet = $user->wallet()->lockForUpdate()->first();
                
                if (!$wallet) {
                    throw ValidationException::withMessages([
                        'amount' => 'Wallet not found. Please contact support.',
                    ]);
                }

                if ($wallet->balance_cents < $amountCents) {
                    throw ValidationException::withMessages([
                        'amount' => 'Insufficient main wallet balance. You have ₱' . 
                            number_format($wallet->balance_cents / 100, 2) . ' available.',
                    ]);
                }

                $wallet->balance_cents = Money::subtract($wallet->balance_cents, $amountCents);
                $wallet->savings_balance_cents = Money::add($wallet->savings_balance_cents, $amountCents);
                $wallet->save();

                $transaction = $user->transactions()->create([
                    'title' => 'Added to Savings',
                    'type' => 'savings_deposit',
                    'amount_cents' => $amountCents,
                    'reference_id' => 'SAV_ADD_' . $user->id . '_' . time() . '_' . uniqid(),
                    'status' => 'completed',
                    'description' => 'Transferred from Main Wallet to Savings Pool',
                    'is_positive' => false,
                ]);

                $walletAccount = LedgerService::getOrCreateWalletAccount($user);
                $poolAccount = LedgerService::getOrCreateSavingsPoolAccount($user);

                LedgerService::post($transaction, [
                    [
                        'ledger_account_id' => $walletAccount->id,
                        'direction' => 'credit',
                        'amount_cents' => $amountCents,
                    ],
                    [
                        'ledger_account_id' => $poolAccount->id,
                        'direction' => 'debit',
                        'amount_cents' => $amountCents,
                    ],
                ]);
            });

            return back()->with('success', 'Money added to savings successfully!');

        } catch (ValidationException $e) {
            throw $e;
            
        } catch (\Exception $e) {
            Log::error('Add to savings error', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);
            return back()->withErrors([
                'amount' => 'An error occurred. Please try again.',
            ]);
        }
    }

    /**
     * Withdraw money from Savings Pool back to Main Wallet.
     * 
     * POST /savings/withdraw
     * 
     * Flow:
     *   Savings Pool (savings_balance_cents)  →  credit
     *   Main Wallet (balance_cents)  →  debit
     */
    public function withdrawFromSavings(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
        ], [
            'amount.min' => 'Minimum withdrawal amount is ₱1.',
        ]);

        $user = $request->user();
        $amountCents = Money::pesosToCents($validated['amount']);

        try {
            DB::transaction(function () use ($user, $amountCents) {
                
                $wallet = $user->wallet()->lockForUpdate()->first();
                
                if (!$wallet) {
                    throw ValidationException::withMessages([
                        'amount' => 'Wallet not found. Please contact support.',
                    ]);
                }

                if ($wallet->savings_balance_cents < $amountCents) {
                    throw ValidationException::withMessages([
                        'amount' => 'Insufficient savings pool balance. You have ₱' . 
                            number_format($wallet->savings_balance_cents / 100, 2) . ' available.',
                    ]);
                }

                $wallet->savings_balance_cents = Money::subtract($wallet->savings_balance_cents, $amountCents);
                $wallet->balance_cents = Money::add($wallet->balance_cents, $amountCents);
                $wallet->save();

                $transaction = $user->transactions()->create([
                    'title' => 'Withdrew from Savings',
                    'type' => 'savings_withdraw',
                    'amount_cents' => $amountCents,
                    'reference_id' => 'SAV_WD_' . $user->id . '_' . time() . '_' . uniqid(),
                    'status' => 'completed',
                    'description' => 'Transferred from Savings Pool to Main Wallet',
                    'is_positive' => true,
                ]);

                $walletAccount = LedgerService::getOrCreateWalletAccount($user);
                $poolAccount = LedgerService::getOrCreateSavingsPoolAccount($user);

                LedgerService::post($transaction, [
                    [
                        'ledger_account_id' => $poolAccount->id,
                        'direction' => 'credit',
                        'amount_cents' => $amountCents,
                    ],
                    [
                        'ledger_account_id' => $walletAccount->id,
                        'direction' => 'debit',
                        'amount_cents' => $amountCents,
                    ],
                ]);
            });

            return back()->with('success', 'Withdrew from savings successfully!');

        } catch (ValidationException $e) {
            throw $e;
            
        } catch (\Exception $e) {
            Log::error('Withdraw from savings error', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);
            return back()->withErrors([
                'amount' => 'An error occurred. Please try again.',
            ]);
        }
    }
}