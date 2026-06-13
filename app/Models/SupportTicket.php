<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SupportTicket extends Model
{
    protected $fillable = [
        'user_id', 'transaction_id', 'public_reference_id',
        'subject', 'category', 'priority', 'status',
        'assigned_to', 'assigned_at', 
        'resolved_at', 'resolved_by',
        'closed_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    /**
     * Generate public reference ID on creation.
     */
    protected static function booted()
    {
        static::creating(function ($ticket) {
            if (empty($ticket->public_reference_id)) {
                $ticket->public_reference_id = 'TKT-' . strtoupper(Str::random(8));
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function messages()
    {
        return $this->hasMany(SupportMessage::class, 'ticket_id')->orderBy('created_at', 'asc');
    }

    public function latestMessage()
    {
        return $this->hasOne(SupportMessage::class, 'ticket_id')->latestOfMany();
    }

    /**
     * Check if ticket is actionable (still open for replies).
     */
    public function isActionable(): bool
    {
        return in_array($this->status, ['open', 'in_progress', 'awaiting_user']);
    }

    /**
     * Get unread message count for a given user role.
     */
    public function unreadCountFor(string $forRole): int
    {
        if ($forRole === 'user') {
            return $this->messages()->where('read_by_user', false)
                ->where('sender_role', '!=', 'user')->count();
        }
        return $this->messages()->where('read_by_admin', false)
            ->where('sender_role', 'user')->count();
    }
}