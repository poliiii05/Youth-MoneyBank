<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Unique index para hindi pwedeng mag-create ng dalawang transactions
            // na pareho ang reference_id (idempotency enforcement)
            $table->unique('reference_id');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropUnique(['reference_id']);
        });
    }
};