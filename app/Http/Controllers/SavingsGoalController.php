<?php

namespace App\Http\Controllers;

use App\Support\Money;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SavingsGoalController extends Controller
{
   public function index()
{
    $user = auth()->user();
    $wallet = $user->wallet;

    // Lahat ng computation sa CENTS, then convert to pesos for display
    $mainBalanceCents = $wallet ? $wallet->balance_cents : 0;
    $unallocatedSavingsCents = $wallet ? $wallet->savings_balance_cents : 0;
    $allocatedGoalsCents = $user->savingsGoals()->sum('current_amount_cents');
    $totalSavingsCents = $unallocatedSavingsCents + $allocatedGoalsCents;

    $goals = $user->savingsGoals()
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($goal) {
            return [
                'id' => $goal->id,
                'title' => $goal->title,
                'subtitle' => $goal->subtitle,
                'current_amount' => (float) $goal->current_amount_pesos,
                'target_amount' => (float) $goal->target_amount_pesos,
                'icon_name' => $goal->icon_name,
                'color_theme' => $goal->color_theme,
                'status' => $goal->status,
            ];
        });

    return Inertia::render('User/Goals', [
                'auth' => ['user' => $user],
                'goals' => $goals,
                'finances' => [
                    'total_savings' => (float) ($totalSavingsCents / 100),
                    'allocated' => (float) ($allocatedGoalsCents / 100),
                    'unallocated' => (float) ($unallocatedSavingsCents / 100),
                    'main_balance' => (float) ($mainBalanceCents / 100),
                    'savings_pool_balance' => (float) ($unallocatedSavingsCents / 100),  // ← BAGO ITO (alias for clarity)
                ]
            ]);
}
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'target_amount' => 'required|numeric|min:50',
            'icon_name' => 'required|string',
            'color_theme' => 'required|string',
        ]);

        // Convert peso input to cents for storage
        auth()->user()->savingsGoals()->create([
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'target_amount_cents' => Money::pesosToCents($validated['target_amount']),
            'current_amount_cents' => 0,
            'icon_name' => $validated['icon_name'],
            'color_theme' => $validated['color_theme'],
        ]);

        return back()->with('success', 'Goal created successfully!');
    }
}