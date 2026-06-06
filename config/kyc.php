<?php

return [
    /*
    |--------------------------------------------------------------------------
    | KYC Auto-Approval Mode
    |--------------------------------------------------------------------------
    |
    | When true, all submitted KYC applications are auto-approved immediately.
    | Used in production deployments where real KYC review isn't feasible
    | (BSP/Data Privacy Act compliance for student projects).
    |
    | Set via .env: KYC_AUTO_APPROVE=true|false
    |
    */
    'auto_approve' => env('KYC_AUTO_APPROVE', false),

    /*
    |--------------------------------------------------------------------------
    | Storage Disk
    |--------------------------------------------------------------------------
    | 
    | Disk used to store KYC documents. Must be a private disk (not public).
    |
    */
    'storage_disk' => env('KYC_STORAGE_DISK', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Document Retention (hours)
    |--------------------------------------------------------------------------
    |
    | How long to keep KYC documents before auto-deletion.
    | For Phase D portfolio: 24 hours.
    |
    */
    'retention_hours' => env('KYC_RETENTION_HOURS', 24),

    /*
    |--------------------------------------------------------------------------
    | Required Documents Per Tier
    |--------------------------------------------------------------------------
    |
    | Documents required for each tier upgrade.
    | Tier 2 needs: ID Front, ID Back, Selfie
    | Tier 3 needs: All Tier 2 + Proof of Address + Income Statement
    |
    */
    'required_documents' => [
        2 => ['school_id_front', 'school_id_back', 'selfie'],
        3 => ['valid_id_front', 'valid_id_back', 'address_proof'],
    ],

    /*
    |--------------------------------------------------------------------------
    | File Upload Constraints
    |--------------------------------------------------------------------------
    */
    'max_file_size_mb' => env('KYC_MAX_FILE_SIZE_MB', 5),
    'allowed_mime_types' => [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf',
    ],
];