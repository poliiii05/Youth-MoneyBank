<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kyc_documents', function (Blueprint $table) {
            $table->id();
            
            // Link to the parent application
            $table->foreignId('application_id')
                  ->constrained('kyc_applications')
                  ->cascadeOnDelete();
            
            // Type of document (id_front, id_back, selfie, etc.)
            $table->string('document_type', 50);
            
            // Path to the file in private storage (nullable for samples)
            $table->string('file_path', 500)->nullable();
            
            // Whether this is a "Use Sample" placeholder or actual upload
            $table->boolean('is_sample')->default(false);
            
            // Original filename (for display purposes)
            $table->string('file_name', 255)->nullable();
            
            // File size in bytes (nullable for samples)
            $table->unsignedBigInteger('file_size')->nullable();
            
            // MIME type (image/jpeg, image/png, application/pdf)
            $table->string('mime_type', 100)->nullable();
            
            $table->timestamps();
            
            // Index for common queries
            $table->index(['application_id', 'document_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kyc_documents');
    }
};