<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    // Idinagdag natin dito lahat ng kailangan nating i-save!
    protected $fillable = [
        'user_id',
        'title',
        'type',
        'amount',
        'reference_id',
        'status',
        'description',
        'is_positive', // kumbaga nakikita parin yung transactions na na add or something
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}