<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('admin_role_revoked_at')->nullable()->after('admin_role_granted_by');
            $table->foreignId('admin_role_revoked_by')->nullable()->after('admin_role_revoked_at')
                ->constrained('users')->nullOnDelete();
            $table->string('admin_role_change_reason', 500)->nullable()->after('admin_role_revoked_by');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['admin_role_revoked_by']);
            $table->dropColumn(['admin_role_revoked_at', 'admin_role_revoked_by', 'admin_role_change_reason']);
        });
    }
};