<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // CS resolution tracking
            $table->boolean('is_resolved')->default(false)->after('flagged_by');
            $table->timestamp('resolved_at')->nullable()->after('is_resolved');
            $table->string('resolution_type', 50)->nullable()->after('resolved_at'); // 'refunded', 'reprocessed', 'cancelled', 'verified'
            $table->text('resolution_notes')->nullable()->after('resolution_type');
            $table->foreignId('resolved_by')->nullable()->after('resolution_notes')
                ->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['resolved_by']);
            $table->dropColumn(['is_resolved', 'resolved_at', 'resolution_type', 'resolution_notes', 'resolved_by']);
        });
    }
};