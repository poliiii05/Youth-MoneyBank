<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_audit_logs', function (Blueprint $table) {
            $table->id();
            
            // Actor (admin who performed the action)
            $table->foreignId('actor_id')->constrained('users')->cascadeOnDelete();
            
            // Target (user being affected — for admin/user management)
            $table->foreignId('target_user_id')->nullable()->constrained('users')->nullOnDelete();
            
            // Action type (promote_admin, revoke_admin, change_role, suspend_user, override_tier, etc.)
            $table->string('action_type', 50)->index();
            
            // Action category (admin_management, user_management, transaction, kyc)
            $table->string('category', 30)->index();
            
            // Reason provided by actor
            $table->string('reason', 500);
            
            // Optional metadata (JSON for flexibility — old role, new role, amount, etc.)
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            
            // Compound index for fast lookups
            $table->index(['category', 'created_at']);
            $table->index(['target_user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_audit_logs');
    }
};