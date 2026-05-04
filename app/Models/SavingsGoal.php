<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavingsGoal extends Model
{
   protected $fillable = [
        'user_id', 'title', 'subtitle', 'target_amount', 
        'current_amount', 'icon_name', 'color_theme', 'status'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
