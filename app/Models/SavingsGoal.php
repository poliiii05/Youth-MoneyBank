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
        'target_amount',
        'current_amount',
        'icon_name',
        'color_theme',
        'target_date',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}   