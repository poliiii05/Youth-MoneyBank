<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
    public function addMoney(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:50', 
            'transaction_id' => 'required|string',
            'status' => 'required|string',
            'remarks' => 'nullable|string'
        ]);

        $user = auth()->user();

        DB::transaction(function () use ($user, $request) {
            
            $wallet = $user->wallet()->firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0.00, 'savings_balance' => 0.00]
            );

            // 1. Idagdag sa Balance
            $wallet->balance += $request->amount;
            $wallet->save();

            // 2. Gumawa ng Record sa Transactions Table
            $user->transactions()->create([
                'title' => 'Add Money via PayPal', // <-- IDINAGDAG NATIN ITO PARA MAWALA YUNG ERROR
                'type' => 'cash_in',
                'amount' => $request->amount,
                'reference_id' => $request->transaction_id,
                'status' => 'completed',
                'description' => $request->remarks ?? 
                'PayPal Cash In',
                'is_positive' => true // <-- IDINAGDAG NATIN ITO PARA SA ERROR MO
            ]);
        });

        return back()->with('success', 'Money added successfully!');
    }
}