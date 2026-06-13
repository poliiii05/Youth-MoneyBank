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
            
            // Ticket this message belongs to
            $table->foreignId('ticket_id')->constrained('support_tickets')->cascadeOnDelete();
            
            // Sender (user or admin)
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->string('sender_role', 20); // user, admin, super_admin, ai
            
            // Message content
            $table->text('message');
            
            // Metadata for special message types
            $table->boolean('is_system')->default(false); // System notifications (status changes, etc.)
            $table->boolean('is_ai_generated')->default(false); // For AI Support later
            
            // Read status (for unread counters)
            $table->boolean('read_by_user')->default(false);
            $table->boolean('read_by_admin')->default(false);
            
            $table->timestamps();
            
            $table->index('ticket_id');
            $table->index(['ticket_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_messages');
    }
};