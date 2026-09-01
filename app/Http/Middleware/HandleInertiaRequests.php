<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            // Auth user (commonly already done)
            'auth' => [
                'user' => $request->user(),
            ],
            
            // How full the wallet is against the tier ceiling. Shared globally so
            // the layout can decide whether an upgrade prompt is worth showing,
            // without every page having to pass finances down.
            'tier_status' => function () use ($request) {
                $user = $request->user();

                if (! $user || $user->isAdmin()) {
                    return null;
                }

                $tier = (int) ($user->kyc_tier ?? 1);
                $max = \App\Services\TierLimitService::getMaxBalanceCents($tier);
                $held = \App\Services\TierLimitService::getTotalHoldingsCents($user);

                return [
                    'tier' => $tier,
                    'usage_percent' => $max > 0 ? round(($held / $max) * 100) : 0,
                ];
            },

            // Flash messages — surfaced as toasts in frontend
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'maintenanceMode' => fn () => \App\Models\SystemSetting::isMaintenanceMode(),
            ],
        ]);
    }
}