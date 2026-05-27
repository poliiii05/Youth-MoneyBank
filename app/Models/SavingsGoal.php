<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavingsGoal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'subtitle',
        'target_amount_cents',
        'current_amount_cents',
        'icon_name',
        'color_theme',
        'target_date',
        'status',
    ];

    protected $casts = [
        'target_amount_cents' => 'integer',
        'current_amount_cents' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Convenience accessors for display.
     */
    public function getTargetAmountPesosAttribute(): float
    {
        return $this->target_amount_cents / 100;
    }

    public function getCurrentAmountPesosAttribute(): float
    {
        return $this->current_amount_cents / 100;
    }

    /**
     * Computed accessor for progress percentage.
     * Returns 0-100.
     */
    public function getProgressPercentageAttribute(): float
    {
        if ($this->target_amount_cents <= 0) return 0;
        return min(100, ($this->current_amount_cents / $this->target_amount_cents) * 100);
    }
}