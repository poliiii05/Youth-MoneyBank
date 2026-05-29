<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Flag kung na-post na ba sa ledger ang transaction na 'to
            // false = hindi pa naka-ledger (gaya ng existing cash-in mo)
            // true = may corresponding ledger entries na
            $table->boolean('ledger_posted')->default(false)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('ledger_posted');
        });
    }
};