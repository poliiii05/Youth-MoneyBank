<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /**
     * Display system settings page.
     */
    public function index(Request $request)
    {
        $admin = $request->user();
        
        if (!$admin->isSuperAdmin()) {
            abort(403, 'Only Super Admin can access settings.');
        }

        // Load all settings grouped by category
        $allSettings = SystemSetting::orderBy('category')->orderBy('id')->get();
        
             $settings = [
            'config' => $allSettings->where('category', 'config')->map(fn($s) => $this->formatSetting($s))->values(),
        ];

        // System info
        $systemInfo = [
            'laravel_version' => app()->version(),
            'php_version' => PHP_VERSION,
            'database' => config('database.default'),
            'timezone' => config('app.timezone'),
            'environment' => app()->environment(),
            'total_users' => \App\Models\User::count(),
            'total_admins' => \App\Models\User::whereNotNull('admin_role')->count(),
            'total_transactions' => \App\Models\Transaction::count(),
            'maintenance_mode' => SystemSetting::isMaintenanceMode(),
        ];

        // Current admin's account info
            $adminInfo = [
                'name' => $admin->name,
                'email' => $admin->email,
                'phone_number' => $admin->phone_number,
                'profile_picture' => $admin->profile_picture,
                'admin_role' => $admin->admin_role,
                'role_label' => $admin->admin_role === 'super_admin' ? 'Super Admin' : 'Admin',
                'granted_at' => $admin->admin_role_granted_at?->format('M j, Y'),
                'granted_relative' => $admin->admin_role_granted_at?->diffForHumans(),
                'email_verified' => !is_null($admin->email_verified_at),
                'email_verified_at' => $admin->email_verified_at?->format('M j, Y'),
                'google_linked' => !is_null($admin->google_id),
                'created_at' => $admin->created_at?->format('M j, Y'),
                'created_relative' => $admin->created_at?->diffForHumans(),
                'last_login_relative' => $admin->updated_at?->diffForHumans(),
            ];

            return Inertia::render('Admin/Settings', [
                'auth' => ['user' => $admin],
                'settings' => $settings,
                'systemInfo' => $systemInfo,
                'adminInfo' => $adminInfo,
                'pendingCounts' => $this->getAdminPendingCounts(),
            ]);
    }

    /**
     * Update a single setting value.
     */
    public function update(Request $request)
    {
        $admin = $request->user();
        
        if (!$admin->isSuperAdmin()) {
            return back()->withErrors(['permission' => 'Only Super Admin can update settings.']);
        }

        $validated = $request->validate([
            'key' => 'required|string|exists:system_settings,key',
            'value' => 'required',
        ]);

        try {
            $setting = SystemSetting::where('key', $validated['key'])->firstOrFail();

            if ($setting->is_locked) {
                return back()->withErrors([
                    'setting' => "Setting '{$setting->label}' is locked and cannot be modified.",
                ]);
            }

            $oldValue = $setting->value;
            
            // Type validation
            $newValue = $validated['value'];
            if ($setting->type === 'boolean') {
                $newValue = (bool) $newValue;
            } elseif ($setting->type === 'integer') {
                if (!is_numeric($newValue) || $newValue < 0) {
                    return back()->withErrors([
                        'value' => 'Value must be a non-negative number.',
                    ]);
                }
                $newValue = (int) $newValue;
            }

            SystemSetting::set($validated['key'], $newValue, $admin->id);

            // Audit log
            AdminAuditLog::record([
                'actor_id' => $admin->id,
                'target_user_id' => null,
                'action_type' => 'update_setting',
                'category' => 'admin_management',
                'reason' => "Updated setting: {$setting->label}",
                'metadata' => [
                    'setting_key' => $setting->key,
                    'setting_label' => $setting->label,
                    'old_value' => $oldValue,
                    'new_value' => is_bool($newValue) ? ($newValue ? '1' : '0') : (string) $newValue,
                ],
            ]);

            \Log::info('Super admin updated system setting', [
                'admin_id' => $admin->id,
                'setting_key' => $setting->key,
                'old_value' => $oldValue,
                'new_value' => $newValue,
            ]);

            return back()->with('success', "{$setting->label} updated successfully.");

        } catch (\Exception $e) {
            \Log::error('Setting update failed', [
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors([
                'setting' => 'Failed to update setting: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Format a setting for frontend display.
     */
    private function formatSetting(SystemSetting $setting): array
    {
        $rawValue = $setting->value;
        $typedValue = match($setting->type) {
            'boolean' => (bool) $rawValue,
            'integer' => (int) $rawValue,
            default => $rawValue,
        };

        return [
            'id' => $setting->id,
            'key' => $setting->key,
            'value' => $typedValue,
            'type' => $setting->type,
            'category' => $setting->category,
            'label' => $setting->label,
            'description' => $setting->description,
            'is_locked' => $setting->is_locked,
            'updated_at' => $setting->updated_at?->diffForHumans(),
        ];
    }
    /**
     * Update admin profile (name and phone).
     */
    public function updateProfile(Request $request)
    {
        $admin = $request->user();
        
        if (!$admin->isSuperAdmin()) {
            return back()->withErrors(['permission' => 'Only Super Admin can update profile.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:100',
            'phone_number' => 'nullable|string|min:10|max:20|regex:/^[0-9+\s-]+$/',
        ], [
            'name.required' => 'Name is required.',
            'name.min' => 'Name must be at least 2 characters.',
            'phone_number.regex' => 'Phone number can only contain digits, spaces, + and -.',
            'phone_number.min' => 'Phone number must be at least 10 characters.',
        ]);

        try {
            $oldName = $admin->name;
            $oldPhone = $admin->phone_number;
            
            $changes = [];
            
            if ($oldName !== $validated['name']) {
                $changes['name'] = ['old' => $oldName, 'new' => $validated['name']];
            }
            if ($oldPhone !== ($validated['phone_number'] ?? null)) {
                $changes['phone_number'] = [
                    'old' => $oldPhone ?? '(none)', 
                    'new' => $validated['phone_number'] ?? '(none)'
                ];
            }

            if (empty($changes)) {
                return back()->with('info', 'No changes detected.');
            }

            $admin->update([
                'name' => $validated['name'],
                'phone_number' => $validated['phone_number'] ?? null,
            ]);

            // Audit log
            AdminAuditLog::record([
                'actor_id' => $admin->id,
                'target_user_id' => $admin->id,
                'action_type' => 'update_profile',
                'category' => 'admin_management',
                'reason' => 'Profile self-update',
                'metadata' => [
                    'changes' => $changes,
                    'self_action' => true,
                ],
            ]);

            \Log::info('Super admin updated profile', [
                'admin_id' => $admin->id,
                'changes' => $changes,
            ]);

            return back()->with('success', 'Profile updated successfully.');

        } catch (\Exception $e) {
            \Log::error('Profile update failed', [
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors([
                'profile' => 'Failed to update profile: ' . $e->getMessage(),
            ]);
        }
    }
}