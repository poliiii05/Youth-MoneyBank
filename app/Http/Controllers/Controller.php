<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use App\Models\KycApplication;
use App\Models\SupportTicket;

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
            'cs' => SupportTicket::whereIn('status', ['open', 'in_progress'])
                ->where(function ($q) {
                    $q->whereNull('assigned_to')
                      ->orWhereHas('messages', function ($q2) {
                          $q2->where('sender_role', 'user')
                             ->where('read_by_admin', false);
                      });
                })
                ->count(),
        ];
    }
}