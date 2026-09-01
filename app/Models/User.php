<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'birth_date',
        'phone_number',
        'password',
        'google_id',
        'profile_picture',
        'account_number', 
        'email_verified_at',
        'phone_verified_at',
        'kyc_tier', 
        'is_parent', 
        'admin_role',
        'admin_role_granted_at',
        'admin_role_granted_by',
        'is_suspended',
        'suspended_at',
        'suspension_reason',
        'suspended_by',
        'admin_role_revoked_at',
        'admin_role_revoked_by',
        'admin_role_change_reason',
        
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
         'birth_date' => 'date',
        'password' => 'hashed',
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'admin_role_granted_at' => 'datetime',
        'is_suspended' => 'boolean',
        'suspended_at' => 'datetime',
        'admin_role_revoked_at' => 'datetime',
    ];

        /**
     * Generate a unique 10-digit account number.
     *
     * Shared by email registration and Google sign-in so both paths produce
     * the same format and both check for collisions.
     */
    public static function generateAccountNumber(): string
    {
        do {
            $accountNum = '00' . date('Y') . str_pad(random_int(0, 99999), 5, '0', STR_PAD_LEFT);
        } while (static::where('account_number', $accountNum)->exists());

        return $accountNum;
    }

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
     * - 'admin': Handles KYC reviews, user lookups, transaction investigations
     * - 'super_admin': Full access + destructive actions (override tier, suspend, manage admins)
     */
    public const ROLE_ADMIN = 'admin';
    public const ROLE_SUPER_ADMIN = 'super_admin';

    /**
     * All available admin roles (for validation/dropdowns).
     */
    public const ADMIN_ROLES = [
        self::ROLE_ADMIN,
        self::ROLE_SUPER_ADMIN,
    ];

    /**
     * Role display names.
     */
    public const ROLE_NAMES = [
        self::ROLE_ADMIN => 'Admin',
        self::ROLE_SUPER_ADMIN => 'Super Admin',
    ];

    /**
     * Check if user is any admin (admin or super_admin).
     */
    public function isAdmin(): bool
    {
        return in_array($this->admin_role, self::ADMIN_ROLES);
    }

    /**
     * Check if user is super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->admin_role === self::ROLE_SUPER_ADMIN;
    }

    /**
     * Check if user is a regular user (no admin role).
     */
    public function isRegularUser(): bool
    {
        return is_null($this->admin_role);
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

    // ============================================================
    // PERMISSION HELPERS
    // ============================================================
    // Logic:
    //   - Admin level (both admin + super_admin): day-to-day operations
    //   - Super Admin only: destructive/critical actions

    /**
     * Can approve/reject KYC applications.
     * Both admin and super_admin can do this.
     */
    public function canApproveKyc(): bool
    {
        return $this->isAdmin();
    }

    /**
     * Can view KYC applications (read-only access).
     */
    public function canViewKyc(): bool
    {
        return $this->isAdmin();
    }

    /**
     * Can view users (search, browse, view details).
     */
    public function canManageUsers(): bool
    {
        return $this->isAdmin();
    }

    /**
     * Can view transactions and investigate.
     */
    public function canViewTransactions(): bool
    {
        return $this->isAdmin();
    }

    /**
     * Can override user's KYC tier manually.
     * SUPER_ADMIN ONLY — destructive action.
     */
    public function canOverrideTier(): bool
    {
        return $this->isSuperAdmin();
    }

    /**
     * Can suspend/reactivate user accounts.
     * SUPER_ADMIN ONLY — destructive action.
     */
    public function canSuspendUsers(): bool
    {
        return $this->isSuperAdmin();
    }

    /**
     * Can force logout users from all sessions.
     * SUPER_ADMIN ONLY — destructive action.
     */
    public function canForceLogout(): bool
    {
        return $this->isSuperAdmin();
    }

    /**
     * Can flag transactions as fraud.
     * SUPER_ADMIN ONLY (Day 6).
     */
    public function canFlagTransactions(): bool
    {
        return $this->isSuperAdmin();
    }

    /**
     * Can manage admin accounts (promote, demote, revoke).
     * SUPER_ADMIN ONLY (Day 7).
     */
    public function canManageAdmins(): bool
    {
        return $this->isSuperAdmin();
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

    /**
     * Get the default redirect path after login based on user role.
     */
    public function getDefaultRedirectPath(): string
    {
        return $this->isAdmin() ? '/admin' : '/dashboard';
    }
    
    /**
     * Admin who revoked this user's admin role (if applicable).
     */
    public function adminRoleRevoker()
    {
        return $this->belongsTo(User::class, 'admin_role_revoked_by');
    }
}
