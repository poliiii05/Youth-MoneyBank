<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class KycDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'document_type',
        'file_path',
        'is_sample',
        'file_name',
        'file_size',
        'mime_type',
    ];

    protected $casts = [
        'is_sample' => 'boolean',
        'file_size' => 'integer',
    ];

    /**
     * The parent application.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(KycApplication::class, 'application_id');
    }

    /**
     * Get formatted file size (KB or MB).
     */
    public function getFormattedSizeAttribute(): ?string
    {
        if (!$this->file_size) return null;
        
        $bytes = $this->file_size;
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        }
        return round($bytes / 1024, 2) . ' KB';
    }

    /**
     * Delete the actual file from storage when document is deleted.
     */
    protected static function booted(): void
    {
        static::deleting(function (KycDocument $document) {
            if (!$document->is_sample && $document->file_path) {
                Storage::disk('private')->delete($document->file_path);
            }
        });
    }
}