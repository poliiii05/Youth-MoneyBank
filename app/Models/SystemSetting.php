<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SystemSetting extends Model
{
    protected $fillable = [
        'key', 'value', 'type', 'category', 'label', 
        'description', 'is_locked', 'updated_by',
    ];

    protected $casts = [
        'is_locked' => 'boolean',
    ];

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get a setting value by key with type casting.
     */
    public static function get(string $key, $default = null)
    {
        $cacheKey = "system_setting:{$key}";
        
        return Cache::remember($cacheKey, 3600, function () use ($key, $default) {
            $setting = self::where('key', $key)->first();
            
            if (!$setting) return $default;
            
            return match($setting->type) {
                'boolean' => (bool) $setting->value,
                'integer' => (int) $setting->value,
                'json' => json_decode($setting->value, true),
                default => $setting->value,
            };
        });
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, $value, ?int $updatedBy = null): bool
    {
        $setting = self::where('key', $key)->first();
        
        if (!$setting) return false;
        
        if ($setting->is_locked) {
            throw new \Exception("Setting '{$key}' is locked and cannot be modified via this method.");
        }

        // Cast to string for storage
        $valueToStore = match($setting->type) {
            'boolean' => $value ? '1' : '0',
            'json' => json_encode($value),
            default => (string) $value,
        };

        $setting->update([
            'value' => $valueToStore,
            'updated_by' => $updatedBy,
        ]);

        Cache::forget("system_setting:{$key}");
        
        return true;
    }

    /**
     * Check if maintenance mode is enabled.
     */
    public static function isMaintenanceMode(): bool
    {
        return self::get('maintenance_mode', false);
    }
}