<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique()->index();
            $table->text('value')->nullable();
            $table->string('type', 20)->default('string'); // string, boolean, integer, json
            $table->string('category', 50)->index(); // config, operations, compliance
            $table->string('label', 200);
            $table->text('description')->nullable();
            $table->boolean('is_locked')->default(false); // System-critical settings cannot be changed via UI
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Seed default settings
        $defaults = [
            // Configuration
            [
                'key' => 'tier_1_limit',
                'value' => '5000',
                'type' => 'integer',
                'category' => 'config',
                'label' => 'Tier 1 Wallet Limit',
                'description' => 'Maximum wallet balance for Tier 1 users (in PHP)',
                'is_locked' => true,
            ],
            [
                'key' => 'tier_2_limit',
                'value' => '20000',
                'type' => 'integer',
                'category' => 'config',
                'label' => 'Tier 2 Wallet Limit',
                'description' => 'Maximum wallet balance for Tier 2 users (in PHP)',
                'is_locked' => true,
            ],
            [
                'key' => 'tier_3_limit',
                'value' => '100000',
                'type' => 'integer',
                'category' => 'config',
                'label' => 'Tier 3 Wallet Limit',
                'description' => 'Maximum wallet balance for Tier 3 users (in PHP)',
                'is_locked' => true,
            ],
            [
                'key' => 'manual_credit_max',
                'value' => '1000000',
                'type' => 'integer',
                'category' => 'config',
                'label' => 'Manual Credit Maximum',
                'description' => 'Maximum amount per single Manual Credit action',
                'is_locked' => false,
            ],
            // Operations
            [
                'key' => 'maintenance_mode',
                'value' => '0',
                'type' => 'boolean',
                'category' => 'operations',
                'label' => 'Maintenance Mode',
                'description' => 'When enabled, regular users cannot perform actions. Admins still have full access.',
                'is_locked' => false,
            ],
            [
                'key' => 'allow_kyc_submissions',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'operations',
                'label' => 'Accept New KYC Submissions',
                'description' => 'When disabled, users cannot submit new tier upgrade applications',
                'is_locked' => false,
            ],
            [
                'key' => 'allow_new_registrations',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'operations',
                'label' => 'Accept New Registrations',
                'description' => 'When disabled, new users cannot create accounts',
                'is_locked' => false,
            ],
        ];

        foreach ($defaults as $setting) {
            \DB::table('system_settings')->insert(array_merge($setting, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};