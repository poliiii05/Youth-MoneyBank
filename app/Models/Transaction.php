<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'type',
        'amount_cents',
        'reference_id',
        'public_reference_id',
        'status',
        'description',
        'is_positive',
        'ledger_posted', 
    ];

    protected $casts = [
        'amount_cents' => 'integer',
        'is_positive' => 'boolean',
         'ledger_posted' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Convenience accessor — amount in pesos for display.
     * Usage: $transaction->amount_pesos → 100.50
     */
    public function getAmountPesosAttribute(): float
    {
        return $this->amount_cents / 100;
    }

    public function ledgerEntries()
    {
        return $this->hasMany(LedgerEntry::class);
    }
    
    /**
     * Generate user-friendly reference ID upon creation.
     * Format: TXN-{YEAR}-{SEQUENCE}, e.g., "TXN-2026-0001"
     * Sequence is per-user.
     */
    protected static function booted()
    {
        static::creating(function ($transaction) {
            if (!$transaction->public_reference_id) {
                $transaction->public_reference_id = self::generatePublicReferenceId($transaction->user_id);
            }
        });
    }

    /**
     * Generate the next public reference ID for a user.
     * Format: TXN-2026-0001 (zero-padded sequential per user, per year)
     */
    public static function generatePublicReferenceId(int $userId): string
    {
        $year = now()->year;
        
        // Count user's transactions in this year + 1
        $count = self::where('user_id', $userId)
            ->whereYear('created_at', $year)
            ->count() + 1;
        
        return sprintf('TXN-%d-%04d', $year, $count);
    }
}