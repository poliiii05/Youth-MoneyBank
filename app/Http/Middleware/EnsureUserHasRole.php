<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     * 
     * Usage in routes:
     *   ->middleware('role:super_admin')
     *   ->middleware('role:super_admin,kyc_reviewer')
     *   ->middleware('role:any')  ← any admin
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        // Must be logged in
        if (!$user) {
            abort(401, 'Unauthorized.');
        }

        // Must be an admin
        if (!$user->isAdmin()) {
            abort(403, 'Admin access required.');
        }

        // "any" → just needs to be an admin (no specific role check)
        if (in_array('any', $roles)) {
            return $next($request);
        }

        // Super admin always passes (god mode)
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // Check if user has any of the required roles
        if (!empty($roles) && !$user->hasAnyRole($roles)) {
            abort(403, 'You do not have permission to access this resource.');
        }

        return $next($request);
    }
}