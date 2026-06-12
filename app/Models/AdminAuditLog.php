<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminAuditLog extends Model
{
    protected $fillable = [
        'actor_id',
        'target_user_id',
        'action_type',
        'category',
        'reason',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function targetUser()
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    /**
     * Helper to log an admin action.
     */
    public static function record(array $data): self
    {
        return self::create([
            'actor_id' => $data['actor_id'],
            'target_user_id' => $data['target_user_id'] ?? null,
            'action_type' => $data['action_type'],
            'category' => $data['category'],
            'reason' => $data['reason'],
            'metadata' => $data['metadata'] ?? null,
        ]);
    }
}