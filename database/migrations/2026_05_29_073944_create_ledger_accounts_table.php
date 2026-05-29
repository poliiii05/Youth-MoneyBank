<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ledger_accounts', function (Blueprint $table) {
            $table->id();
            
            // Type ng account: user_wallet, savings_goal, external, system
            $table->string('type');
            
            // Para sa user_wallet at savings_goal: linked sa user.
            // Para sa external/system accounts: null.
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            
            // Optional link sa specific savings goal (kung type = savings_goal)
            $table->foreignId('savings_goal_id')->nullable()->constrained()->cascadeOnDelete();
            
            // Human-readable name (e.g., "Wallet of User 1", "Dream Phone goal")
            $table->string('name');
            
            // Unique code para madaling hanapin (e.g., "WALLET_1", "GOAL_5")
            $table->string('code')->unique();
            
            $table->timestamps();
            
            // Index para mabilis ang lookups by type
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledger_accounts');
    }
};