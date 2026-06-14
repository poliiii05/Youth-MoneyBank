<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SupportTicket extends Model
{
    protected $fillable = [
        'user_id',
        'transaction_id',
        'public_reference_id',
        'subject',
        'category',
        'priority',
        'status',
        'assigned_to',
        'assigned_at',
        'resolved_at',
        'resolved_by',
        'resolution_notes',
        'closed_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    /**
     * Auto-generate public_reference_id on creation.
     */
    protected static function booted()
    {
        static::creating(function ($ticket) {
            if (empty($ticket->public_reference_id)) {
                $ticket->public_reference_id = 'TKT-' . strtoupper(Str::random(8));
            }
        });
    }

    // ============================================================
    // RELATIONSHIPS
    // ============================================================

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

    // ============================================================
    // STATUS HELPERS
    // ============================================================

    /**
     * Check if ticket is in an actionable state (can receive replies).
     */
    public function isActionable(): bool
    {
        return in_array($this->status, ['open', 'in_progress', 'awaiting_user']);
    }

    /**
     * Check if ticket is closed/resolved.
     */
    public function isClosed(): bool
    {
        return in_array($this->status, ['resolved', 'closed']);
    }

    /**
     * Check if ticket needs admin attention.
     */
    public function needsAdminAttention(): bool
    {
        return in_array($this->status, ['open', 'in_progress']);
    }

    // ============================================================
    // UNREAD COUNT HELPERS
    // ============================================================

    /**
     * Count unread messages for a given role.
     * 
     * @param string $forRole 'user' or 'admin'
     */
    public function unreadCountFor(string $forRole): int
    {
        if ($forRole === 'user') {
            // Messages NOT from user that user hasn't read
            return $this->messages()
                ->where('read_by_user', false)
                ->where('sender_role', '!=', 'user')
                ->count();
        }
        
        // Admin: messages from user that admin hasn't read
        return $this->messages()
            ->where('read_by_admin', false)
            ->where('sender_role', 'user')
            ->count();
    }

    /**
     * Mark all messages as read for a given role.
     */
    public function markAsReadFor(string $forRole): int
    {
        if ($forRole === 'user') {
            return $this->messages()
                ->where('sender_role', '!=', 'user')
                ->where('read_by_user', false)
                ->update(['read_by_user' => true]);
        }
        
        return $this->messages()
            ->where('sender_role', 'user')
            ->where('read_by_admin', false)
            ->update(['read_by_admin' => true]);
    }

    // ============================================================
    // SCOPES
    // ============================================================

    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['open', 'in_progress', 'awaiting_user']);
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }
}