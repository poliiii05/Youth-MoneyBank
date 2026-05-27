<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ==========================================
        // WALLETS TABLE: Convert balance to cents
        // ==========================================
        Schema::table('wallets', function (Blueprint $table) {
            // Step 1: Add new columns for cents (BIGINT UNSIGNED para sa malaki na values)
            $table->unsignedBigInteger('balance_cents')->default(0)->after('balance');
            $table->unsignedBigInteger('savings_balance_cents')->default(0)->after('savings_balance');
        });

        // Step 2: Convert existing values from pesos (DECIMAL) to cents (INTEGER)
        // ROUND ginagamit natin para sigurado walang floating-point error sa conversion
        DB::statement('UPDATE wallets SET balance_cents = ROUND(balance * 100)');
        DB::statement('UPDATE wallets SET savings_balance_cents = ROUND(savings_balance * 100)');

        // Step 3: Drop yung dating DECIMAL columns
        Schema::table('wallets', function (Blueprint $table) {
            $table->dropColumn(['balance', 'savings_balance']);
        });


        // ==========================================
        // TRANSACTIONS TABLE: Convert amount to cents
        // ==========================================
        Schema::table('transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('amount_cents')->default(0)->after('amount');
        });

        DB::statement('UPDATE transactions SET amount_cents = ROUND(amount * 100)');

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('amount');
        });


        // ==========================================
        // SAVINGS_GOALS TABLE: Convert amounts to cents
        // ==========================================
        Schema::table('savings_goals', function (Blueprint $table) {
            $table->unsignedBigInteger('target_amount_cents')->default(0)->after('target_amount');
            $table->unsignedBigInteger('current_amount_cents')->default(0)->after('current_amount');
        });

        DB::statement('UPDATE savings_goals SET target_amount_cents = ROUND(target_amount * 100)');
        DB::statement('UPDATE savings_goals SET current_amount_cents = ROUND(current_amount * 100)');

        Schema::table('savings_goals', function (Blueprint $table) {
            $table->dropColumn(['target_amount', 'current_amount']);
        });
    }

    public function down(): void
    {
        // Reverse: convert cents back to pesos (in case need natin mag-rollback)
        Schema::table('wallets', function (Blueprint $table) {
            $table->decimal('balance', 12, 2)->default(0.00)->after('balance_cents');
            $table->decimal('savings_balance', 12, 2)->default(0.00)->after('savings_balance_cents');
        });
        DB::statement('UPDATE wallets SET balance = balance_cents / 100');
        DB::statement('UPDATE wallets SET savings_balance = savings_balance_cents / 100');
        Schema::table('wallets', function (Blueprint $table) {
            $table->dropColumn(['balance_cents', 'savings_balance_cents']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->decimal('amount', 12, 2)->default(0.00)->after('amount_cents');
        });
        DB::statement('UPDATE transactions SET amount = amount_cents / 100');
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('amount_cents');
        });

        Schema::table('savings_goals', function (Blueprint $table) {
            $table->decimal('target_amount', 12, 2)->default(0.00)->after('target_amount_cents');
            $table->decimal('current_amount', 12, 2)->default(0.00)->after('current_amount_cents');
        });
        DB::statement('UPDATE savings_goals SET target_amount = target_amount_cents / 100');
        DB::statement('UPDATE savings_goals SET current_amount = current_amount_cents / 100');
        Schema::table('savings_goals', function (Blueprint $table) {
            $table->dropColumn(['target_amount_cents', 'current_amount_cents']);
        });
    }
};