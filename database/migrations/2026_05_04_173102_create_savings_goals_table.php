<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('savings_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title'); 
            $table->string('subtitle')->nullable(); 
            $table->decimal('target_amount', 12, 2); 
            $table->decimal('current_amount', 12, 2)->default(0.00);
            $table->string('icon_name')->default('Target'); 
            $table->string('color_theme')->default('bg-blue-500'); 
            $table->string('status')->default('active'); 
            $table->timestamps();
        });
    }

   
    public function down(): void
    {
        Schema::dropIfExists('savings_goals');
    }
};
