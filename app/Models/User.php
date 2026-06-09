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
        'admin_role',
        'admin_role_granted_at',
        'admin_role_granted_by',
        'is_suspended',
        'suspended_at',
        'suspension_reason',
        'suspended_by',
        
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'admin_role_granted_at' => 'datetime',
        'is_suspended' => 'boolean',
        'suspended_at' => 'datetime',
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

    /**
     * All KYC applications by this user.
     */
    public function kycApplications()
    {
        return $this->hasMany(KycApplication::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get the latest pending KYC application (if any).
     */
    public function pendingKycApplication()
    {
        return $this->hasOne(KycApplication::class)
            ->where('status', 'pending')
            ->latest();
    }

    /**
     * Get the latest KYC application (any status).
     */
    public function latestKycApplication()
    {
        return $this->hasOne(KycApplication::class)->latestOfMany();
    }

    // ============================================================
    // ADMIN ROLES
    // ============================================================
    
    /**
     * Available admin roles.
     */
    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_KYC_REVIEWER = 'kyc_reviewer';
    public const ROLE_SUPPORT_STAFF = 'support_staff';

    /**
     * All available admin roles (for validation/dropdowns).
     */
    public const ADMIN_ROLES = [
        self::ROLE_SUPER_ADMIN,
        self::ROLE_KYC_REVIEWER,
        self::ROLE_SUPPORT_STAFF,
    ];

    /**
     * Role display names.
     */
    public const ROLE_NAMES = [
        self::ROLE_SUPER_ADMIN => 'Super Admin',
        self::ROLE_KYC_REVIEWER => 'KYC Reviewer',
        self::ROLE_SUPPORT_STAFF => 'Support Staff',
    ];

    /**
     * Check if user is any admin.
     */
    public function isAdmin(): bool
    {
        return !is_null($this->admin_role);
    }

    /**
     * Check if user is super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->admin_role === self::ROLE_SUPER_ADMIN;
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->admin_role === $role;
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->admin_role, $roles);
    }

    /**
     * Check if user can approve KYC.
     */
    public function canApproveKyc(): bool
    {
        return $this->hasAnyRole([
            self::ROLE_SUPER_ADMIN,
            self::ROLE_KYC_REVIEWER,
        ]);
    }

    /**
     * Check if user can view KYC applications (read-only).
     */
    public function canViewKyc(): bool
    {
        return $this->isAdmin(); // All admins can view
    }

    /**
     * Check if user can manage users.
     */
    public function canManageUsers(): bool
    {
        return $this->isSuperAdmin();
    }

    /**
     * Check if user can view transactions.
     */
    public function canViewTransactions(): bool
    {
        return $this->isAdmin(); // All admins
    }

    /**
     * Get the user who granted this admin role.
     */
    public function adminRoleGrantor()
    {
        return $this->belongsTo(User::class, 'admin_role_granted_by');
    }

    /**
     * Get the display name of the user's role.
     */
    public function getRoleDisplayName(): ?string
    {
        if (!$this->admin_role) return null;
        return self::ROLE_NAMES[$this->admin_role] ?? $this->admin_role;
    }
}