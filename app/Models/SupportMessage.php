<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportMessage extends Model
{
    protected $fillable = [
        'ticket_id', 'sender_id', 'sender_role', 'message',
        'is_system', 'is_ai_generated',
        'read_by_user', 'read_by_admin',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_ai_generated' => 'boolean',
        'read_by_user' => 'boolean',
        'read_by_admin' => 'boolean',
    ];

    public function ticket()
    {
        return $this->belongsTo(SupportTicket::class, 'ticket_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}