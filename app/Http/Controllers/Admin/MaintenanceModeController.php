<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenanceModeController extends Controller
{
    /**
     * Display maintenance & operational controls page.
     */
    public function index(Request $request)
    {
        $admin = $request->user();
        
        if (!$admin->isSuperAdmin()) {
            abort(403, 'Only Super Admin can manage operational controls.');
        }

        $isMaintenanceActive = SystemSetting::isMaintenanceMode();

        // Load all operational toggles
        $toggles = SystemSetting::where('category', 'operations')
            ->orderByRaw("CASE WHEN `key` = 'maintenance_mode' THEN 0 ELSE 1 END")
            ->orderBy('id')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'key' => $s->key,
                    'value' => (bool) $s->value,
                    'label' => $s->label,
                    'description' => $s->description,
                    'updated_at' => $s->updated_at?->diffForHumans(),
                    'is_critical' => $s->key === 'maintenance_mode',
                ];
            });

        // Recent toggle history (all operations)
        $recentToggles = AdminAuditLog::where('category', 'admin_management')
            ->whereIn('action_type', ['toggle_maintenance', 'update_setting'])
            ->where(function ($q) {
                $q->whereJsonContains('metadata->setting_key', 'maintenance_mode')
                  ->orWhereJsonContains('metadata->setting_key', 'allow_kyc_submissions')
                  ->orWhereJsonContains('metadata->setting_key', 'allow_new_registrations');
            })
            ->with('actor:id,name,profile_picture')
            ->orderBy('created_at', 'desc')
            ->limit(15)
            ->get()
            ->map(function ($log) {
                $settingLabels = [
                    'maintenance_mode' => 'Maintenance Mode',
                    'allow_kyc_submissions' => 'KYC Submissions',
                    'allow_new_registrations' => 'New Registrations',
                ];
                
                $key = $log->metadata['setting_key'] ?? 'unknown';
                $newValue = ($log->metadata['new_value'] ?? '0') === '1';
                
                return [
                    'id' => $log->id,
                    'setting_label' => $settingLabels[$key] ?? $key,
                    'actor' => $log->actor ? [
                        'name' => $log->actor->name,
                        'profile_picture' => $log->actor->profile_picture,
                    ] : ['name' => 'System'],
                    'action' => $newValue ? 'Enabled' : 'Disabled',
                    'reason' => $log->reason,
                    'created_at' => $log->created_at?->format('M j, Y g:i A'),
                    'created_relative' => $log->created_at?->diffForHumans(),
                ];
            });

        // System impact stats
        $impactStats = [
            'regular_users' => \App\Models\User::whereNull('admin_role')
                ->where('is_suspended', false)
                ->count(),
            'active_admins' => \App\Models\User::whereNotNull('admin_role')->count(),
        ];

        return Inertia::render('Admin/MaintenanceMode', [
            'auth' => ['user' => $admin],
            'isMaintenanceActive' => $isMaintenanceActive,
            'toggles' => $toggles,
            'impactStats' => $impactStats,
            'recentToggles' => $recentToggles,
            'pendingCounts' => $this->getAdminPendingCounts(),
        ]);
    }

    /**
     * Toggle any operational setting (maintenance_mode, allow_kyc_submissions, etc.).
     */
    public function toggle(Request $request)
    {
        $admin = $request->user();
        
        if (!$admin->isSuperAdmin()) {
            return back()->withErrors(['permission' => 'Only Super Admin can toggle operational settings.']);
        }

        $validated = $request->validate([
            'key' => 'required|string|exists:system_settings,key',
            'enabled' => 'required|boolean',
            'reason' => 'required|string|min:10|max:500',
        ], [
            'reason.required' => 'A reason is required for this action.',
            'reason.min' => 'Please provide a detailed reason (min 10 characters).',
        ]);

        try {
            $setting = SystemSetting::where('key', $validated['key'])->firstOrFail();

            // Only allow toggling operations category settings
            if ($setting->category !== 'operations') {
                return back()->withErrors([
                    'setting' => 'This setting cannot be toggled here.',
                ]);
            }

            $oldValue = (bool) $setting->value;
            $newValue = $validated['enabled'];

            // Skip if no change
            if ($oldValue === $newValue) {
                return back()->withErrors([
                    'setting' => 'Setting is already in that state.',
                ]);
            }

            SystemSetting::set($validated['key'], $newValue, $admin->id);

            // Action type: toggle_maintenance for maintenance_mode, otherwise update_setting
            $actionType = $validated['key'] === 'maintenance_mode' 
                ? 'toggle_maintenance' 
                : 'update_setting';

            AdminAuditLog::record([
                'actor_id' => $admin->id,
                'target_user_id' => null,
                'action_type' => $actionType,
                'category' => 'admin_management',
                'reason' => $validated['reason'],
                'metadata' => [
                    'setting_key' => $setting->key,
                    'setting_label' => $setting->label,
                    'old_value' => $oldValue ? '1' : '0',
                    'new_value' => $newValue ? '1' : '0',
                ],
            ]);

            \Log::warning('Operational setting toggled', [
                'admin_id' => $admin->id,
                'admin_name' => $admin->name,
                'setting_key' => $setting->key,
                'old_state' => $oldValue ? 'ON' : 'OFF',
                'new_state' => $newValue ? 'ON' : 'OFF',
                'reason' => $validated['reason'],
            ]);

            $stateLabel = $newValue ? 'enabled' : 'disabled';
            return back()->with('success', "{$setting->label} {$stateLabel} successfully.");

        } catch (\Exception $e) {
            \Log::error('Operational toggle failed', [
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors([
                'setting' => 'Failed to toggle setting: ' . $e->getMessage(),
            ]);
        }
    }
}