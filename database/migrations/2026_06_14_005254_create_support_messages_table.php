<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_messages', function (Blueprint $table) {
            $table->id();
            
            // Belongs to ticket
            $table->foreignId('ticket_id')->constrained('support_tickets')->cascadeOnDelete();
            
            // Sender
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->string('sender_role', 20);
            // Sender roles: user, admin, super_admin, ai, system
            
            // Message content
            $table->text('message');
            
            // Message metadata
            $table->boolean('is_system')->default(false);
            // System messages: status changes, assignments, closures
            
            $table->boolean('is_ai_generated')->default(false);
            // For Phase F-B: AI-generated responses
            
            // Read tracking
            $table->boolean('read_by_user')->default(false);
            $table->boolean('read_by_admin')->default(false);
            
            $table->timestamps();
            
            // Indexes
            $table->index('ticket_id');
            $table->index(['ticket_id', 'created_at']);
            $table->index('sender_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_messages');
    }
};