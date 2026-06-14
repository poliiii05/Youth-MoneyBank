<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\SupportMessage;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SupportController extends Controller
{
    /**
     * Get or create the user's active conversation.
     * Returns existing open ticket or creates a new one.
     */
    public function getOrCreateConversation(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check for existing open conversation
        $ticket = SupportTicket::where('user_id', $user->id)
            ->whereIn('status', ['open', 'in_progress', 'awaiting_user'])
            ->orderBy('updated_at', 'desc')
            ->first();

        $isNew = false;

        // Create new if none exists
        if (!$ticket) {
            $ticket = SupportTicket::create([
                'user_id' => $user->id,
                'subject' => 'Customer Service Inquiry',
                'category' => 'general',
                'priority' => 'normal',
                'status' => 'open',
            ]);

            // System welcome message
            SupportMessage::create([
                'ticket_id' => $ticket->id,
                'sender_id' => $user->id,
                'sender_role' => 'system',
                'message' => "Welcome to Youth MoneyBank Customer Service! How can we help you today?",
                'is_system' => true,
                'read_by_user' => true,
                'read_by_admin' => false,
            ]);

            $isNew = true;
        }

        return response()->json([
            'ticket' => $this->formatTicket($ticket),
            'messages' => $this->formatMessages($ticket->messages()->orderBy('created_at')->get()),
            'is_new' => $isNew,
        ]);
    }

    /**
     * Get messages for a conversation (used for polling).
     */
    public function getMessages(Request $request, int $ticketId): JsonResponse
    {
        $user = $request->user();

        $ticket = SupportTicket::where('id', $ticketId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Mark admin/system messages as read by user
        $ticket->markAsReadFor('user');

        return response()->json([
            'ticket' => $this->formatTicket($ticket),
            'messages' => $this->formatMessages(
                $ticket->messages()->with('sender:id,name,profile_picture,admin_role')->orderBy('created_at')->get()
            ),
        ]);
    }

    /**
     * Send a message in conversation.
     */
    public function sendMessage(Request $request, int $ticketId): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'message' => 'required|string|min:1|max:5000',
        ]);

        $ticket = SupportTicket::where('id', $ticketId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if (!$ticket->isActionable()) {
            return response()->json([
                'error' => 'This conversation is closed.',
            ], 422);
        }

        $message = SupportMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $user->id,
            'sender_role' => 'user',
            'message' => $validated['message'],
            'read_by_user' => true,
            'read_by_admin' => false,
        ]);

        // Status transition
        if ($ticket->status === 'awaiting_user') {
            $ticket->update(['status' => 'in_progress']);
        }
        
        $ticket->touch();

        // TODO Batch 2: Call AI service for response

        // For Batch 1: Mock auto-reply (system) so user knows message received
        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $user->id,
            'sender_role' => 'system',
            'message' => "Message received! Our team has been notified and will respond shortly. (AI integration coming in next phase.)",
            'is_system' => true,
            'read_by_user' => false,
            'read_by_admin' => false,
        ]);

        return response()->json([
            'success' => true,
            'message_id' => $message->id,
        ]);
    }

    /**
     * Request escalation to human agent.
     */
    public function requestAgent(Request $request, int $ticketId): JsonResponse
    {
        $user = $request->user();

        $ticket = SupportTicket::where('id', $ticketId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if (!$ticket->isActionable()) {
            return response()->json(['error' => 'Conversation closed.'], 422);
        }

        // Mark as needing human attention
        if ($ticket->status === 'open') {
            $ticket->update(['status' => 'in_progress']);
        }

        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $user->id,
            'sender_role' => 'system',
            'message' => 'User requested to speak with a support agent. An agent will join shortly.',
            'is_system' => true,
            'read_by_user' => true,
            'read_by_admin' => false,
        ]);

        \Log::info('User requested human agent', [
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Close current conversation.
     */
    public function close(Request $request, int $ticketId): JsonResponse
    {
        $user = $request->user();

        $ticket = SupportTicket::where('id', $ticketId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $ticket->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $user->id,
            'sender_role' => 'system',
            'message' => 'Conversation closed by user.',
            'is_system' => true,
            'read_by_user' => true,
            'read_by_admin' => false,
        ]);

        return response()->json(['success' => true]);
    }

    // ============================================================
    // FORMATTERS
    // ============================================================

    private function formatTicket(SupportTicket $ticket): array
    {
        return [
            'id' => $ticket->id,
            'public_reference_id' => $ticket->public_reference_id,
            'subject' => $ticket->subject,
            'status' => $ticket->status,
            'is_actionable' => $ticket->isActionable(),
            'created_at' => $ticket->created_at?->toIso8601String(),
            'created_relative' => $ticket->created_at?->diffForHumans(),
        ];
    }

    private function formatMessages($messages): array
    {
        return $messages->map(function ($m) {
            return [
                'id' => $m->id,
                'sender' => $m->sender ? [
                    'id' => $m->sender->id,
                    'name' => $m->sender->name,
                    'profile_picture' => $m->sender->profile_picture,
                ] : ['name' => 'System'],
                'sender_role' => $m->sender_role,
                'message' => $m->message,
                'is_system' => $m->is_system,
                'is_ai_generated' => $m->is_ai_generated,
                'created_at' => $m->created_at?->toIso8601String(),
                'created_formatted' => $m->created_at?->format('M j, g:i A'),
                'created_relative' => $m->created_at?->diffForHumans(),
            ];
        })->toArray();
    }
}