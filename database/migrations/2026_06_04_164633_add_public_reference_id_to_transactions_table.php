<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // User-friendly reference ID (e.g., "TXN-2026-0001")
            // Per-user sequential, generated on creation
            $table->string('public_reference_id', 50)->nullable()->after('reference_id');
            
            // Index for fast lookups (kapag ginamit sa URL or search)
            $table->index('public_reference_id');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['public_reference_id']);
            $table->dropColumn('public_reference_id');
        });
    }
};