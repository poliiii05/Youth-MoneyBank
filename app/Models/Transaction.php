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
}