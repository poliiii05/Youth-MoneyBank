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
        $this->apiKey = env('GEMINI_API_KEY', '');
        $this->model = env('GEMINI_MODEL', 'gemini-2.5-flash-lite');
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

        return "You are a friendly customer service AI for Youth MoneyBank (YMB), a digital banking platform for Filipino youth.\n\n" .
            "YOUR ROLE:\n" .
            "- Help users with deposits, withdrawals, savings goals, KYC, and account issues\n" .
            "- Reply in Taglish (Tagalog + English mix)\n" .
            "- Keep responses concise (2-4 sentences)\n" .
            "- Use the user's name when appropriate\n\n" .
            "YMB BACKGROUND:\n" .
            "- Tiers: Tier 1 (₱5K), Tier 2 (₱20K), Tier 3 (₱100K) wallet limit\n" .
            "- Deposits via GCash and PayPal\n" .
            "- Help Center at /help with detailed articles\n\n" .
            "USER CONTEXT:\n{$userContext}\n\n" .
            "GUIDELINES:\n" .
            "1. Answer using user context above for balance/tier questions\n" .
            "2. For complex issues, suggest 'Talk to a Support Agent' button\n" .
            "3. NEVER make up balances or transaction IDs\n" .
            "4. NEVER ask for passwords or PINs\n\n" .
            "ESCALATION TRIGGERS:\n" .
            "- Lost money / failed transaction\n" .
            "- Suspected fraud\n" .
            "- User asks for human";
    }

    private function buildUserContext(User $user): string
    {
        try {
            $tier = $user->tier_level ?? 1;
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

            $walletBalance = 'N/A';
            if (isset($user->main_balance_cents)) {
                $walletBalance = '₱' . number_format($user->main_balance_cents / 100, 2);
            }

            $savingsBalance = 'N/A';
            if (isset($user->savings_balance_cents)) {
                $savingsBalance = '₱' . number_format($user->savings_balance_cents / 100, 2);
            }

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