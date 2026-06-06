<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kyc_applications', function (Blueprint $table) {
            $table->id();
            
            // The user submitting the application
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();
            
            // Target tier (the tier the user is trying to reach)
            $table->unsignedTinyInteger('target_tier'); // 2 or 3
            
            // Application status
            $table->enum('status', ['pending', 'approved', 'rejected'])
                  ->default('pending');
            
            // Timestamps for the application lifecycle
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            
            // Admin who reviewed (nullable for auto-approval)
            $table->foreignId('reviewed_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            
            // Rejection reason (only if status = rejected)
            $table->text('rejection_reason')->nullable();
            
            // Auto-approval flag (true if production auto-approved)
            $table->boolean('auto_approved')->default(false);
            
            $table->timestamps();
            
            // Indexes for common queries
            $table->index(['user_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kyc_applications');
    }
};