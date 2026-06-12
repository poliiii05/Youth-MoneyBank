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
        'is_flagged',
        'flagged_at',
        'flag_reason',
        'flagged_by',
        'is_resolved',
        'resolved_at',
        'resolution_type',
        'resolution_notes',
        'resolved_by',
    ];

    protected $casts = [
        'amount_cents' => 'integer',
        'is_positive' => 'boolean',
        'ledger_posted' => 'boolean',
        'is_flagged' => 'boolean',
        'flagged_at' => 'datetime',
        'is_resolved' => 'boolean',
        'resolved_at' => 'datetime',
        'parent_transaction_id',
        'correction_proof',
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
        /**
     * Admin who flagged this transaction.
     */
    public function flagger()
    {
        return $this->belongsTo(User::class, 'flagged_by');
    }

        /**
     * Admin who resolved this transaction.
     */
    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
    /**
     * Original transaction that this correction transaction was created for.
     */
    public function parentTransaction()
    {
        return $this->belongsTo(Transaction::class, 'parent_transaction_id');
    }

    /**
     * Correction transactions that fixed this transaction.
     */
    public function correctionTransactions()
    {
        return $this->hasMany(Transaction::class, 'parent_transaction_id');
    }
}