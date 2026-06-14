<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            
            // Ticket owner
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            
            // Optional: linked transaction
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->nullOnDelete();
            
            // Public reference ID (TKT-XXXXXXXX)
            $table->string('public_reference_id', 50)->unique();
            
            // Ticket details
            $table->string('subject', 200);
            $table->string('category', 50)->default('general');
            // Categories: general, transaction, kyc, account, security, other
            
            $table->string('priority', 20)->default('normal');
            // Priorities: low, normal, high, urgent
            
            $table->string('status', 20)->default('open');
            // Statuses: open, in_progress, awaiting_user, resolved, closed
            
            // Assignment
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();
            
            // Resolution
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('resolution_notes')->nullable();
            
            // Closure
            $table->timestamp('closed_at')->nullable();
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index('user_id');
            $table->index('status');
            $table->index(['status', 'created_at']);
            $table->index(['user_id', 'status']);
            $table->index('assigned_to');
            $table->index('transaction_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_tickets');
    }
};