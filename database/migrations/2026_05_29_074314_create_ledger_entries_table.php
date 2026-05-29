<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->id();
            
            // Link sa transaction na nag-trigger nito
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            
            // Link sa ledger account na apektado
            $table->foreignId('ledger_account_id')->constrained()->cascadeOnDelete();
            
            // Direction: 'debit' o 'credit'
            // debit = pera pumasok sa account na 'to
            // credit = pera lumabas sa account na 'to
            $table->string('direction');
            
            // Amount in cents (laging positive — yung direction ang nagsasabi ng flow)
            $table->unsignedBigInteger('amount_cents');
            
            $table->timestamps();
            
            // Indexes para mabilis ang queries
            $table->index('transaction_id');
            $table->index('ledger_account_id');
            $table->index('direction');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledger_entries');
    }
};