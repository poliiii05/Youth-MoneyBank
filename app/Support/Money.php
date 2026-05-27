<?php

namespace App\Support;

use InvalidArgumentException;

/**
 * Money Helper Class
 * 
 * Central utility for handling money operations.
 * All money in this application is stored as INTEGER CENTS (centavos)
 * to avoid floating-point arithmetic errors.
 * 
 * ₱100.50 is stored as 10050 cents.
 * 
 * RULES:
 * - Never do math directly on peso amounts (floats)
 * - Always convert to cents for storage and arithmetic
 * - Convert to pesos only when displaying to users
 */
class Money
{
    /**
     * Convert pesos (float/string) to cents (integer).
     * 
     * Examples:
     *   pesosToCents(100.50) → 10050
     *   pesosToCents("100.50") → 10050
     *   pesosToCents(100) → 10000
     * 
     * @param float|string|int $pesos
     * @return int
     */
    public static function pesosToCents($pesos): int
    {
        if (!is_numeric($pesos)) {
            throw new InvalidArgumentException("Amount must be numeric, got: " . gettype($pesos));
        }

        if ($pesos < 0) {
            throw new InvalidArgumentException("Amount cannot be negative.");
        }

        // bcmul ginagamit para sa exact arithmetic (avoids float precision issues)
        // intval rounds toward zero, pero gumagamit tayo ng round() muna
        return (int) round(((float) $pesos) * 100);
    }

    /**
     * Convert cents (integer) to pesos (float).
     * Use only for display purposes — never for arithmetic.
     * 
     * Examples:
     *   centsToPesos(10050) → 100.50
     *   centsToPesos(10000) → 100.00
     * 
     * @param int $cents
     * @return float
     */
    public static function centsToPesos(int $cents): float
    {
        return $cents / 100;
    }

    /**
     * Format cents as a peso string with currency symbol.
     * 
     * Examples:
     *   format(10050) → "₱100.50"
     *   format(10000) → "₱100.00"
     *   format(0) → "₱0.00"
     * 
     * @param int $cents
     * @return string
     */
    public static function format(int $cents): string
    {
        return '₱' . number_format($cents / 100, 2, '.', ',');
    }

    /**
     * Add two amounts (in cents). Returns cents.
     * Safe arithmetic since both inputs are integers.
     * 
     * @param int $aCents
     * @param int $bCents
     * @return int
     */
    public static function add(int $aCents, int $bCents): int
    {
        return $aCents + $bCents;
    }

    /**
     * Subtract two amounts (in cents). Returns cents.
     * Throws exception if result would be negative.
     * 
     * @param int $aCents
     * @param int $bCents
     * @return int
     */
    public static function subtract(int $aCents, int $bCents): int
    {
        $result = $aCents - $bCents;
        if ($result < 0) {
            throw new InvalidArgumentException("Subtraction would result in negative amount.");
        }
        return $result;
    }

    /**
     * Check if amount in cents meets a minimum (in cents).
     * 
     * Example: hasMinimum(5000, 5000) → true (₱50 minimum met)
     * 
     * @param int $amountCents
     * @param int $minimumCents
     * @return bool
     */
    public static function hasMinimum(int $amountCents, int $minimumCents): bool
    {
        return $amountCents >= $minimumCents;
    }

    /**
     * Check if amount in cents exceeds a maximum (in cents).
     * 
     * Example: exceedsMaximum(600000, 500000) → true (₱6000 exceeds ₱5000 max)
     * 
     * @param int $amountCents
     * @param int $maximumCents
     * @return bool
     */
    public static function exceedsMaximum(int $amountCents, int $maximumCents): bool
    {
        return $amountCents > $maximumCents;
    }
}