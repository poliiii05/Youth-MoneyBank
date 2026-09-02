<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Deactivation, not deletion. A financial account has a ledger
            // behind it — dropping the row would orphan every transaction and
            // break the audit trail the rest of this project is built on.
            // Marking the account closed keeps the history intact and leaves
            // the door open to reactivating.
            $table->timestamp('deactivated_at')->nullable()->after('is_suspended');
            $table->index('deactivated_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['deactivated_at']);
            $table->dropColumn('deactivated_at');
        });
    }
};