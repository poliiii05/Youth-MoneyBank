<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->boolean('is_flagged')->default(false)->after('status');
            $table->timestamp('flagged_at')->nullable()->after('is_flagged');
            $table->string('flag_reason', 500)->nullable()->after('flagged_at');
            $table->foreignId('flagged_by')->nullable()->after('flag_reason')
                ->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['flagged_by']);
            $table->dropColumn(['is_flagged', 'flagged_at', 'flag_reason', 'flagged_by']);
        });
    }
};