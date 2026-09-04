<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    private string $apiKey;
    private string $model;
    private string $endpoint;

    public function __construct()
    {
        // config(), not env(). Once the config cache is built — which is the
        // normal state in production — env() returns null, so reading the key
        // this way meant the assistant silently stopped working and escalated
        // every conversation to a human instead.
        $this->apiKey = (string) config('services.gemini.api_key', '');
        $this->model = (string) config('services.gemini.model', 'gemini-2.5-flash-lite');
        $this->endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent";
    }

    public function generateResponse(User $user, array $conversationHistory): array
    {
        try {
            if (empty($this->apiKey)) {
                throw new \Exception('GEMINI_API_KEY not set in .env');
            }

            $systemPrompt = $this->buildSystemPrompt($user);
            $contents = $this->formatConversationForGemini($conversationHistory);

            if (empty($contents)) {
                $contents = [
                    ['role' => 'user', 'parts' => [['text' => 'Hello']]]
                ];
            }

            $finalContents = array_merge([
                ['role' => 'user', 'parts' => [['text' => $systemPrompt]]],
                ['role' => 'model', 'parts' => [['text' => 'Understood. I will help users as a YMB customer service AI.']]],
            ], $contents);

            $payload = [
                'contents' => $finalContents,
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 500,
                ],
            ];

            $response = Http::timeout(30)->post(
                $this->endpoint . '?key=' . $this->apiKey,
                $payload
            );

            if (!$response->successful()) {
                Log::error('Gemini API call failed', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                    'user_id' => $user->id,
                ]);
                
                return [
                    'response' => "I'm having trouble connecting right now. Let me transfer you to a human agent who can help.",
                    'should_escalate' => true,
                    'tokens_used' => 0,
                ];
            }

            $data = $response->json();
            $aiText = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
            $tokensUsed = $data['usageMetadata']['totalTokenCount'] ?? 0;

            if (empty($aiText)) {
                return [
                    'response' => "Hi! Paano kita matutulungan today?",
                    'should_escalate' => false,
                    'tokens_used' => $tokensUsed,
                ];
            }

            $shouldEscalate = $this->detectEscalation($aiText);

            return [
                'response' => trim($aiText),
                'should_escalate' => $shouldEscalate,
                'tokens_used' => $tokensUsed,
            ];

        } catch (\Exception $e) {
            Log::error('GeminiService exception', [
                'message' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return [
                'response' => "I'm experiencing technical difficulties. A human agent will assist you shortly.",
                'should_escalate' => true,
                'tokens_used' => 0,
            ];
        }
    }

    private function buildSystemPrompt(User $user): string
    {
        $userContext = $this->buildUserContext($user);

        // Everything listed here has to exist in the product. The prompt used to
        // say deposits came through "GCash and PayPal" and the assistant dutifully
        // told users to look for GCash, which is a "Soon" placeholder — sending
        // people hunting for a button that is not there and straight into support.
        return "You are a friendly customer service assistant for Youth MoneyBank (YMB), a savings platform for Filipino teenagers.\n\n" .
            "YOUR ROLE:\n" .
            "- Help with adding money, savings goals, tier upgrades, and account questions\n" .
            "- Reply in Taglish (Tagalog + English mix)\n" .
            "- Keep responses concise (2-4 sentences)\n" .
            "- Use the user's name when appropriate\n\n" .
            "WHAT YMB CAN DO:\n" .
            "- Tiers and balance limits: Tier 1 Starter ₱5,000 (email only), Tier 2 Builder ₱20,000 (student ID), Tier 3 Achiever ₱100,000 (government ID, 18+)\n" .
            "- Add money: PayPal only, via the \"Add Money\" button on the dashboard\n" .
            "- Savings goals: set a target, move money from the savings pool into a goal\n" .
            "- Savings pool: money moved out of the wallet and set aside\n" .
            "- Streaks and badges: saving on consecutive days, milestones at 7, 14, 30, 60, 100, 180 and 365 days\n" .
            "- Tier upgrades: submit a document in Settings, then an admin reviews it\n" .
            "- Help Center at /help\n\n" .
            "WHAT YMB CANNOT DO — never suggest these:\n" .
            "- No GCash, Maya, GrabPay, bank transfer or over-the-counter cash-in. PayPal only.\n" .
            "- No cash-out or withdrawal to a real bank account\n" .
            "- No sending money to other users\n" .
            "- No QR payments, debit cards, loans or investments\n" .
            "- This is a demonstration platform. Cash-in runs through the PayPal Sandbox and no real money moves.\n\n" .
            "USER CONTEXT:\n{$userContext}\n\n" .
            "GUIDELINES:\n" .
            "1. Answer balance and tier questions from the user context above\n" .
            "2. If you are unsure, say so and suggest the 'Talk to a Support Agent' button rather than guessing\n" .
            "3. NEVER invent balances, transaction IDs, features or payment methods\n" .
            "4. NEVER ask for passwords, PINs or card numbers\n\n" .
            "ESCALATION TRIGGERS:\n" .
            "- Money missing or a failed transaction\n" .
            "- Suspected fraud\n" .
            "- User asks for a human";
    }

    private function buildUserContext(User $user): string
    {
        try {
            // kyc_tier is the real column; tier_level does not exist, so this
            // always fell through to 1 and the assistant told every Tier 2 and
            // Tier 3 user they were on Tier 1.
            $tier = (int) ($user->kyc_tier ?? 1);
            $tierName = match($tier) {
                1 => 'Tier 1 (Starter)',
                2 => 'Tier 2 (Builder)',
                3 => 'Tier 3 (Achiever)',
                default => 'Unknown',
            };

            $tierLimit = match($tier) {
                1 => '₱5,000',
                2 => '₱20,000',
                3 => '₱100,000',
                default => 'N/A',
            };

            // Balances live on the wallet, not on the user, so reading them
            // from the user gave "N/A" to everyone.
            $wallet = $user->wallet;
            $walletBalance = $wallet
                ? '₱' . number_format($wallet->balance_cents / 100, 2)
                : 'N/A';
            $savingsBalance = $wallet
                ? '₱' . number_format($wallet->savings_balance_cents / 100, 2)
                : 'N/A';

            $recentTxStr = '  - No recent transactions';
            try {
                if (method_exists($user, 'transactions')) {
                    $recentTx = $user->transactions()
                        ->orderBy('created_at', 'desc')
                        ->limit(3)
                        ->get();

                    if ($recentTx->isNotEmpty()) {
                        $recentTxStr = $recentTx->map(function ($t) {
                            $sign = $t->is_positive ? '+' : '-';
                            $amount = number_format($t->amount_cents / 100, 2);
                            $date = $t->created_at->format('M j');
                            return "  - {$t->title}: {$sign}₱{$amount} ({$t->status}, {$date})";
                        })->implode("\n");
                    }
                }
            } catch (\Exception $e) {
                // Skip transactions if error
            }

            return "- Name: {$user->name}\n" .
                "- Tier: {$tierName} (max balance: {$tierLimit})\n" .
                "- Wallet balance: {$walletBalance}\n" .
                "- Savings balance: {$savingsBalance}\n" .
                "- Recent transactions:\n{$recentTxStr}";
        } catch (\Exception $e) {
            return "- Name: {$user->name}";
        }
    }

    private function formatConversationForGemini(array $messages): array
    {
        $formatted = [];

        foreach ($messages as $msg) {
            if ($msg['sender_role'] === 'system') continue;

            $role = match($msg['sender_role']) {
                'user' => 'user',
                'ai' => 'model',
                'admin', 'super_admin' => 'model',
                default => 'user',
            };

            $formatted[] = [
                'role' => $role,
                'parts' => [['text' => $msg['message']]],
            ];
        }

        return $formatted;
    }

    private function detectEscalation(string $aiResponse): bool
    {
        $escalationKeywords = [
            'talk to a support agent',
            'human agent',
            'transfer you',
            'agent will help',
            'agent will assist',
        ];

        $lower = strtolower($aiResponse);
        foreach ($escalationKeywords as $keyword) {
            if (str_contains($lower, $keyword)) return true;
        }

        return false;
    }
}