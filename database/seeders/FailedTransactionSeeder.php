<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Support\Str;

class FailedTransactionSeeder extends Seeder
{
    /**
     * Seeds realistic failed/pending transactions for testing CS workflow.
     */
    public function run(): void
    {
        $users = User::whereNull('admin_role')->get();
        
        if ($users->isEmpty()) {
            $this->command->warn('⚠️  No regular users found. Skipping seeder.');
            return;
        }

        $scenarios = [
            [
                'title' => 'PayPal Add Money — Network Timeout',
                'type' => 'add_money',
                'amount_cents' => 50000,
                'is_positive' => true,
                'status' => 'pending',
            ],
            [
                'title' => 'PayPal Add Money — Provider Pending',
                'type' => 'add_money',
                'amount_cents' => 75000,
                'is_positive' => true,
                'status' => 'pending',
            ],
            [
                'title' => 'GCash Add Money — Verification Pending',
                'type' => 'add_money',
                'amount_cents' => 100000,
                'is_positive' => true,
                'status' => 'pending',
            ],
            [
                'title' => 'Transfer to Maria — Insufficient Funds',
                'type' => 'transfer',
                'amount_cents' => 200000,
                'is_positive' => false,
                'status' => 'failed',
            ],
            [
                'title' => 'GCash Withdrawal — Service Unavailable',
                'type' => 'withdrawal',
                'amount_cents' => 100000,
                'is_positive' => false,
                'status' => 'failed',
            ],
            [
                'title' => 'Transfer to John — Tier Limit Exceeded',
                'type' => 'transfer',
                'amount_cents' => 150000,
                'is_positive' => false,
                'status' => 'failed',
            ],
            [
                'title' => 'PayPal Add Money — Card Declined',
                'type' => 'add_money',
                'amount_cents' => 80000,
                'is_positive' => true,
                'status' => 'failed',
            ],
        ];

        $totalCreated = 0;
        
        foreach ($users as $user) {
            $count = rand(2, 3);
            for ($i = 0; $i < $count; $i++) {
                $scenario = $scenarios[array_rand($scenarios)];
                
                Transaction::create([
                    'user_id' => $user->id,
                    'title' => $scenario['title'],
                    'type' => $scenario['type'],
                    'amount_cents' => $scenario['amount_cents'],
                    'is_positive' => $scenario['is_positive'],
                    'status' => $scenario['status'],
                    'public_reference_id' => 'TXN-' . strtoupper(Str::random(8)),
                    'created_at' => now()->subHours(rand(1, 120)),
                    'updated_at' => now()->subHours(rand(1, 120)),
                ]);
                
                $totalCreated++;
            }
        }
        
        $this->command->info("✅ Created {$totalCreated} problem transactions for testing.");
    }
}