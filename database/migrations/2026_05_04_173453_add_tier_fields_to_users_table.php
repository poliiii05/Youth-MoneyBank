<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Default is Tier 1 kapag bagong gawa ang account
            $table->integer('kyc_tier')->default(1)->after('password');
            $table->boolean('is_parent')->default(false)->after('kyc_tier');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['kyc_tier', 'is_parent']);
        });
    }
};
