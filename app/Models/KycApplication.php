<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KycApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'target_tier',
        'status',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'rejection_reason',
        'auto_approved',
    ];

    protected $casts = [
        'target_tier' => 'integer',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'auto_approved' => 'boolean',
    ];

    /**
     * The user who submitted this application.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The admin who reviewed this application (nullable).
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Documents submitted with this application.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(KycDocument::class, 'application_id');
    }

    /**
     * Check if application is still pending review.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if application was approved.
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if application was rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }
}