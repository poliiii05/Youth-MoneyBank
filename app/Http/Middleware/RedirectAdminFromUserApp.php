<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectAdminFromUserApp
{
    /**
     * Redirects admin users away from the regular user app.
     * Admins should use /admin, not /dashboard.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Only redirect if admin is trying to access user routes
        // (not already on admin routes)
        if ($user && $user->isAdmin() && !$request->is('admin/*') && !$request->is('admin')) {
            return redirect('/admin');
        }
        
        return $next($request);
    }
}