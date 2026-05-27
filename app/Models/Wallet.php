<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    protected $fillable = [
        'user_id',
        'balance_cents',
        'savings_balance_cents',
    ];

    /**
     * Casts — ensure these are always integers, never floats/strings.
     */
    protected $casts = [
        'balance_cents' => 'integer',
        'savings_balance_cents' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Convenience accessor for display purposes only.
     * Returns balance in pesos as float. DO NOT use for arithmetic.
     * 
     * Usage: $wallet->balance_pesos → 100.50
     */
    public function getBalancePesosAttribute(): float
    {
        return $this->balance_cents / 100;
    }

    /**
     * Convenience accessor for savings balance in pesos.
     */
    public function getSavingsBalancePesosAttribute(): float
    {
        return $this->savings_balance_cents / 100;
    }
}