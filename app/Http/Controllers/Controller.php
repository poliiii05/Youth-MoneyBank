<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use App\Models\KycApplication;
use App\Models\Transaction;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;
    
    /**
     * Get pending counts for admin sidebar badges.
     * Shared across all admin controllers for consistent badge display.
     */
    protected function getAdminPendingCounts(): array
    {
        return [
            'kyc' => KycApplication::where('status', 'pending')->count(),
            'cs' => Transaction::where(function ($q) {
                $q->whereIn('status', ['failed', 'pending'])->orWhere('is_flagged', true);
            })->where('is_resolved', false)->count(),
        ];
    }
}