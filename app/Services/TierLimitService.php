<?php

namespace App\Services;

use App\Models\User;
use App\Support\Money;

/**
 * TierLimitService
 * 
 * Single source of truth for tier-based balance limits.
 * Used by controllers, middleware, and any code that needs to know
 * the maximum balance a user can hold based on their KYC tier.
 * 
 * Tier framework inspired by BSP Circular No. 992 (Basic Deposit Accounts)
 * and Circular No. 649 (Electronic Money Issuers).
 */
class TierLimitService
{
    /**
     * Tier limits in CENTS (integer).
     * 
     * Tier 1 (Starter):  ₱5,000   = 500,000 cents
     * Tier 2 (Builder):  ₱20,000  = 2,000,000 cents
     * Tier 3 (Achiever): ₱100,000 = 10,000,000 cents
     */
    private const TIER_LIMITS_CENTS = [
        1 => 500_000,
        2 => 2_000_000,
        3 => 10_000_000,
    ];

    private const TIER_NAMES = [
        1 => 'Starter',
        2 => 'Builder',
        3 => 'Achiever',
    ];

    /**
     * Get the maximum balance in CENTS for a given tier.
     */
    /**
     * Get the maximum balance in CENTS for a given tier.
     */
    public static function getMaxBalanceCents(int $tier): int
    {
        return self::TIER_LIMITS_CENTS[$tier] ?? self::TIER_LIMITS_CENTS[1];
    }

    /**
     * Get the maximum balance in PESOS (for display only).
     */
    public static function getMaxBalancePesos(int $tier): float
    {
        return self::getMaxBalanceCents($tier) / 100;
    }

    /**
     * Get the human-readable tier name.
     */
    public static function getTierName(int $tier): string
    {
        return self::TIER_NAMES[$tier] ?? 'Starter';
    }

    /**
     * Calculate user's TOTAL HOLDINGS across all accounts.
     * Total = Main Wallet + Savings Pool + Sum of all active Savings Goals
     * 
     * This is the source of truth for tier limit enforcement —
     * users cannot bypass tier limits by spreading funds across sub-accounts.
     * 
     * Returns the total in CENTS.
     */
    public static function getTotalHoldingsCents(User $user): int
    {
        $wallet = $user->wallet;
        
        if (!$wallet) {
            return 0;
        }

        $mainWallet = (int) $wallet->balance_cents;
        $savingsPool = (int) $wallet->savings_balance_cents;
        
        $goalAllocations = (int) $user->savingsGoals()
            ->where('status', '!=', 'deleted')
            ->sum('current_amount_cents');

        return $mainWallet + $savingsPool + $goalAllocations;
    }

    /**
     * Check if a transaction would exceed the user's tier limit.
     * Checks against TOTAL HOLDINGS, not just main wallet.
     * 
     * @param User $user The user making the transaction
     * @param int $additionalCents The amount being added (in cents)
     * @return bool True if the resulting total holdings would EXCEED the tier limit
     */
    public static function wouldExceedLimit(User $user, int $additionalCents): bool
    {
        $tier = (int) ($user->kyc_tier ?? 1);
        $maxCents = self::getMaxBalanceCents($tier);
        
        $currentTotal = self::getTotalHoldingsCents($user);
        $projectedTotal = $currentTotal + $additionalCents;
        
        return $projectedTotal > $maxCents;
    }

    /**
     * Get the remaining capacity in CENTS for a user.
     * Returns how much more they can cash-in before hitting tier limit.
     */
    public static function getRemainingCapacityCents(User $user): int
    {
        $tier = (int) ($user->kyc_tier ?? 1);
        $maxCents = self::getMaxBalanceCents($tier);
        
        $currentTotal = self::getTotalHoldingsCents($user);
        
        return max(0, $maxCents - $currentTotal);
    }
    
}