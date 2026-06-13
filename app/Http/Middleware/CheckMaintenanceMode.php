<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     * Blocks regular users when maintenance mode is enabled. Admins bypass.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Admins always bypass
        if ($user && !is_null($user->admin_role)) {
            return $next($request);
        }
        
        // Check maintenance mode
        if (SystemSetting::isMaintenanceMode()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'System is currently under maintenance. Please try again later.',
                ], 503);
            }
            
            // For web requests, redirect to maintenance page
            return response()->view('maintenance', [], 503);
        }
        
        return $next($request);
    }
}