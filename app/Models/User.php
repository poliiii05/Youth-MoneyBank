<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone_number',
        'password',
        'google_id',
        'profile_picture',
        'account_number', 
        'email_verified_at',
        'phone_verified_at',
        'kyc_tier', // Dinagdag natin: Para ma-update natin if Tier 1, 2, or 3 siya
        'is_parent', // Dinagdag natin: Para ma-identify kung Bata ba siya o Magulang
        
       
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
    ];

    public function wallet() {
        return $this->hasOne(Wallet::class);
    }
    public function savingsGoals() {
        return $this->hasMany(SavingsGoal::class);
    }
    public function transactions() {
        return $this->hasMany(Transaction::class)->orderBy('created_at', 'desc');
    }
}