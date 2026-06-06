<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Admin role (nullable — null = regular user)
            $table->string('admin_role', 30)
                  ->nullable()
                  ->after('kyc_tier');
            
            // Timestamp when role was granted
            $table->timestamp('admin_role_granted_at')
                  ->nullable()
                  ->after('admin_role');
            
            // Who granted the role (for audit)
            $table->foreignId('admin_role_granted_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete()
                  ->after('admin_role_granted_at');
                
            // Index for admin queries
            $table->index('admin_role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('admin_role_granted_by');
            $table->dropIndex(['admin_role']);
            $table->dropColumn(['admin_role', 'admin_role_granted_at']);
        });
    }
};