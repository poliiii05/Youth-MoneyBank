<?php

namespace App\Services;

use App\Models\LedgerAccount;
use App\Models\LedgerEntry;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

/**
 * LedgerService
 * 
 * Single source of truth for double-entry ledger operations.
 * Implements double-entry bookkeeping: every money movement creates
 * balanced ledger entries (sum of debits = sum of credits).
 * 
 * Account types:
 * - user_wallet: A user's main wallet (spending account)
 * - savings_pool: A user's unallocated savings (middle layer)
 * - savings_goal: A user's specific savings goal
 * - external: External money sources (PayPal, GCash, etc.)
 * - system: System-level accounts (fees, etc.) — for future use
 */
class LedgerService
{
    // ====================================================
    // ACCOUNT SETUP — gumagawa ng ledger accounts on-demand
    // ====================================================

    /**
     * Get or create the ledger account for a user's main wallet.
     */
    public static function getOrCreateWalletAccount(User $user): LedgerAccount
    {
        return LedgerAccount::firstOrCreate(
            ['code' => "WALLET_{$user->id}"],
            [
                'type' => 'user_wallet',
                'user_id' => $user->id,
                'name' => "Wallet of {$user->name}",
            ]
        );
    }

    /**
     * Get or create the ledger account for a user's Savings Pool.
     * This is the "middle layer" between Main Wallet and Savings Goals.
     */
    public static function getOrCreateSavingsPoolAccount(User $user): LedgerAccount
    {
        return LedgerAccount::firstOrCreate(
            ['code' => "SAVINGS_POOL_{$user->id}"],
            [
                'type' => 'savings_pool',
                'user_id' => $user->id,
               'name' => "Savings of {$user->name}",
            ]
        );
    }

    /**
     * Get or create the ledger account for a specific savings goal.
     */
    public static function getOrCreateGoalAccount(SavingsGoal $goal): LedgerAccount
    {
        return LedgerAccount::firstOrCreate(
            ['code' => "GOAL_{$goal->id}"],
            [
                'type' => 'savings_goal',
                'user_id' => $goal->user_id,
                'savings_goal_id' => $goal->id,
                'name' => "Goal: {$goal->title}",
            ]
        );
    }

    /**
     * Get or create a named external source account (PayPal, GCash, etc.).
     */
    public static function getOrCreateExternalAccount(string $code, string $name): LedgerAccount
    {
        return LedgerAccount::firstOrCreate(
            ['code' => $code],
            [
                'type' => 'external',
                'name' => $name,
            ]
        );
    }

    // ====================================================
    // RECORDING — gumagawa ng balanced ledger entries
    // ====================================================

    /**
     * Post balanced ledger entries for a transaction.
     * 
     * @throws InvalidArgumentException If entries don't balance
     * @throws RuntimeException If transaction is already posted
     */
    public static function post(Transaction $transaction, array $entries): void
    {
        // Re-fetch from DB to avoid stale in-memory state
        $freshTransaction = Transaction::find($transaction->id);
        
        if (!$freshTransaction) {
            throw new RuntimeException(
                "Transaction #{$transaction->id} not found in database."
            );
        }
        
        if ($freshTransaction->ledger_posted) {
            throw new RuntimeException(
                "Transaction #{$transaction->id} is already posted to the ledger."
            );
        }
        
        $transaction = $freshTransaction;

        if (count($entries) < 2) {
            throw new InvalidArgumentException(
                "Ledger requires at least 2 entries (one debit, one credit)."
            );
        }

        $totalDebits = 0;
        $totalCredits = 0;

        foreach ($entries as $i => $entry) {
            if (!isset($entry['ledger_account_id'], $entry['direction'], $entry['amount_cents'])) {
                throw new InvalidArgumentException(
                    "Entry #{$i} missing required fields (ledger_account_id, direction, amount_cents)."
                );
            }

            if (!in_array($entry['direction'], ['debit', 'credit'])) {
                throw new InvalidArgumentException(
                    "Entry #{$i} has invalid direction. Must be 'debit' or 'credit'."
                );
            }

            if ((int) $entry['amount_cents'] <= 0) {
                throw new InvalidArgumentException(
                    "Entry #{$i} has invalid amount. Must be positive."
                );
            }

            if ($entry['direction'] === 'debit') {
                $totalDebits += (int) $entry['amount_cents'];
            } else {
                $totalCredits += (int) $entry['amount_cents'];
            }
        }

        if ($totalDebits !== $totalCredits) {
            throw new InvalidArgumentException(
                "Ledger entries do not balance. Debits: {$totalDebits}, Credits: {$totalCredits}. " .
                "Difference: " . abs($totalDebits - $totalCredits) . " cents."
            );
        }

        DB::transaction(function () use ($transaction, $entries) {
            foreach ($entries as $entry) {
                LedgerEntry::create([
                    'transaction_id' => $transaction->id,
                    'ledger_account_id' => $entry['ledger_account_id'],
                    'direction' => $entry['direction'],
                    'amount_cents' => $entry['amount_cents'],
                ]);
            }

            $transaction->update(['ledger_posted' => true]);
        });
    }

    // ====================================================
    // VERIFICATION — reconciliation checks
    // ====================================================

    /**
     * Verify that a specific transaction's ledger entries balance.
     */
    public static function verifyTransactionBalanced(Transaction $transaction): bool
    {
        $entries = LedgerEntry::where('transaction_id', $transaction->id)->get();

        $debits = $entries->where('direction', 'debit')->sum('amount_cents');
        $credits = $entries->where('direction', 'credit')->sum('amount_cents');

        return $debits === $credits;
    }

    /**
     * Reconcile the cached balance against the ledger sum.
     */
    public static function reconcileWallet(User $user): array
    {
        $cachedBalance = (int) ($user->wallet->balance_cents ?? 0);
        
        $walletAccount = self::getOrCreateWalletAccount($user);
        $ledgerBalance = $walletAccount->computedBalanceCents();

        return [
            'cached_balance_cents' => $cachedBalance,
            'ledger_balance_cents' => $ledgerBalance,
            'is_balanced' => $cachedBalance === $ledgerBalance,
            'discrepancy_cents' => abs($cachedBalance - $ledgerBalance),
        ];
    }
}