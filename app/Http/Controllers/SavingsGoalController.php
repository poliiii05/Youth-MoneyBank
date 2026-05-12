<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;


class SavingsGoalController extends Controller

    {
        public function index()
    {
        $user = auth()->user();
        $wallet = $user->wallet;

        // Computations para sa taas na part (Finances Summary)
        $unallocatedSavings = $wallet ? $wallet->savings_balance : 0.00;
        $allocatedGoals = $user->savingsGoals()->sum('current_amount');
        $totalSavings = $unallocatedSavings + $allocatedGoals;

        // Kunin yung mga active goals
        $goals = $user->savingsGoals()->orderBy('created_at', 'desc')->get();
        
        // I-render natin yung main Goals page kasama yung finances data!
        return Inertia::render('User/Goals', [
            'goals' => $goals,
            'finances' => [
                'total_savings' => (float) $totalSavings,
                'allocated' => (float) $allocatedGoals,
                'unallocated' => (float) $unallocatedSavings,
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

        auth()->user()->savingsGoals()->create($validated);

        // Imbes na redirect, 'back()' lang para hindi mag-refresh yung page habang sumasara yung modal
        return back()->with('success', 'Goal created successfully!');
    }
    }
