<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Links a correction transaction to the original failed transaction
            $table->foreignId('parent_transaction_id')->nullable()
                ->after('public_reference_id')
                ->constrained('transactions')->nullOnDelete();
            
            // External payment proof (PayPal charge ID, GCash ref, etc.)
            $table->string('correction_proof', 255)->nullable()->after('parent_transaction_id');
            
            // Index for fast lookups
            $table->index('parent_transaction_id');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['parent_transaction_id']);
            $table->dropIndex(['parent_transaction_id']);
            $table->dropColumn(['parent_transaction_id', 'correction_proof']);
        });
    }
};