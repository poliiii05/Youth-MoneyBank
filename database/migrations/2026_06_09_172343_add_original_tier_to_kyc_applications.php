<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kyc_applications', function (Blueprint $table) {
            $table->tinyInteger('original_tier')->nullable()->after('target_tier');
        });
        
        // Backfill existing records — assume target_tier - 1
        \DB::table('kyc_applications')
            ->whereNull('original_tier')
            ->update([
                'original_tier' => \DB::raw('target_tier - 1'),
            ]);
    }

    public function down(): void
    {
        Schema::table('kyc_applications', function (Blueprint $table) {
            $table->dropColumn('original_tier');
        });
    }
};