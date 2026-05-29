<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LedgerAccount extends Model
{
    protected $fillable = [
        'type',
        'user_id',
        'savings_goal_id',
        'name',
        'code',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function savingsGoal()
    {
        return $this->belongsTo(SavingsGoal::class);
    }

    public function entries()
    {
        return $this->hasMany(LedgerEntry::class);
    }

    /**
     * Compute the balance of this account from its ledger entries.
     * Debits increase, credits decrease (for asset accounts like wallets).
     * 
     * Returns balance in CENTS.
     */
    public function computedBalanceCents(): int
    {
        $debits = $this->entries()->where('direction', 'debit')->sum('amount_cents');
        $credits = $this->entries()->where('direction', 'credit')->sum('amount_cents');
        
        return (int) ($debits - $credits);
    }
}