<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\SupportMessage;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupportController extends Controller
{
    /**
     * Display list of user's tickets.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $status = $request->query('status', 'all'); // all|open|in_progress|resolved|closed

        $query = SupportTicket::where('user_id', $user->id)
            ->with(['latestMessage', 'transaction:id,public_reference_id,title']);

        if ($status !== 'all') {
            if ($status === 'open') {
                $query->whereIn('status', ['open', 'in_progress', 'awaiting_user']);
            } else {
                $query->where('status', $status);
            }
        }

        $tickets = $query->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($t) use ($user) {
                return [
                    'id' => $t->id,
                    'public_reference_id' => $t->public_reference_id,
                    'subject' => $t->subject,
                    'category' => $t->category,
                    'priority' => $t->priority,
                    'status' => $t->status,
                    'transaction' => $t->transaction ? [
                        'id' => $t->transaction->id,
                        'reference' => $t->transaction->public_reference_id,
                        'title' => $t->transaction->title,
                    ] : null,
                    'unread_count' => $t->unreadCountFor('user'),
                    'last_message_preview' => $t->latestMessage?->message 
                        ? substr($t->latestMessage->message, 0, 100) 
                        : null,
                    'created_at' => $t->created_at?->toIso8601String(),
                    'created_relative' => $t->created_at?->diffForHumans(),
                    'updated_at' => $t->updated_at?->toIso8601String(),
                    'updated_relative' => $t->updated_at?->diffForHumans(),
                ];
            });

        // Counts for filter tabs
        $counts = [
            'all' => SupportTicket::where('user_id', $user->id)->count(),
            'open' => SupportTicket::where('user_id', $user->id)
                ->whereIn('status', ['open', 'in_progress', 'awaiting_user'])->count(),
            'resolved' => SupportTicket::where('user_id', $user->id)
                ->where('status', 'resolved')->count(),
            'closed' => SupportTicket::where('user_id', $user->id)
                ->where('status', 'closed')->count(),
        ];

        return Inertia::render('Support/Index', [
            'tickets' => $tickets,
            'filters' => ['status' => $status],
            'counts' => $counts,
        ]);
    }

    /**
     * Display new ticket form.
     */
    public function create(Request $request)
    {
        $user = $request->user();
        $transactionId = $request->query('transaction_id');

        $transaction = null;
        if ($transactionId) {
            $transaction = Transaction::where('id', $transactionId)
                ->where('user_id', $user->id)
                ->first();
            
            if ($transaction) {
                $transaction = [
                    'id' => $transaction->id,
                    'reference' => $transaction->public_reference_id,
                    'title' => $transaction->title,
                    'amount' => (float) $transaction->amount_pesos,
                    'is_positive' => $transaction->is_positive,
                    'status' => $transaction->status,
                ];
            }
        }

        return Inertia::render('Support/Create', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Submit a new support ticket.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'subject' => 'required|string|min:5|max:200',
            'category' => 'required|string|in:general,transaction,kyc,account,other',
            'priority' => 'required|string|in:low,normal,high,urgent',
            'message' => 'required|string|min:20|max:5000',
            'transaction_id' => 'nullable|integer|exists:transactions,id',
        ], [
            'subject.min' => 'Subject must be at least 5 characters.',
            'message.min' => 'Please provide more details (min 20 characters).',
        ]);

        // Verify transaction belongs to user if provided
        if (!empty($validated['transaction_id'])) {
            $txExists = Transaction::where('id', $validated['transaction_id'])
                ->where('user_id', $user->id)
                ->exists();
            if (!$txExists) {
                return back()->withErrors(['transaction_id' => 'Invalid transaction.']);
            }
        }

        $ticket = SupportTicket::create([
            'user_id' => $user->id,
            'transaction_id' => $validated['transaction_id'] ?? null,
            'subject' => $validated['subject'],
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'status' => 'open',
        ]);

        // First message from user
        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $user->id,
            'sender_role' => 'user',
            'message' => $validated['message'],
            'read_by_user' => true, // user sent it, already "read"
            'read_by_admin' => false,
        ]);

        \Log::info('User created support ticket', [
            'ticket_id' => $ticket->id,
            'reference' => $ticket->public_reference_id,
            'user_id' => $user->id,
            'category' => $validated['category'],
            'priority' => $validated['priority'],
        ]);

        return redirect()->route('support.show', $ticket->id)
            ->with('success', "Ticket #{$ticket->public_reference_id} created. Our team will respond soon.");
    }

    /**
     * View a specific ticket with messages.
     */
    public function show(Request $request, int $id)
    {
        $user = $request->user();

        $ticket = SupportTicket::where('id', $id)
            ->where('user_id', $user->id)
            ->with([
                'messages.sender:id,name,profile_picture,admin_role',
                'transaction:id,public_reference_id,title,amount_cents,is_positive,status',
                'assignee:id,name',
            ])
            ->firstOrFail();

        // Mark all admin/system messages as read by user
        SupportMessage::where('ticket_id', $ticket->id)
            ->where('sender_role', '!=', 'user')
            ->where('read_by_user', false)
            ->update(['read_by_user' => true]);

        $messages = $ticket->messages->map(function ($m) {
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
                'created_formatted' => $m->created_at?->format('M j, Y g:i A'),
                'created_relative' => $m->created_at?->diffForHumans(),
            ];
        });

        return Inertia::render('Support/Show', [
            'ticket' => [
                'id' => $ticket->id,
                'public_reference_id' => $ticket->public_reference_id,
                'subject' => $ticket->subject,
                'category' => $ticket->category,
                'priority' => $ticket->priority,
                'status' => $ticket->status,
                'is_actionable' => $ticket->isActionable(),
                'transaction' => $ticket->transaction ? [
                    'id' => $ticket->transaction->id,
                    'reference' => $ticket->transaction->public_reference_id,
                    'title' => $ticket->transaction->title,
                    'amount' => (float) ($ticket->transaction->amount_cents / 100),
                    'is_positive' => $ticket->transaction->is_positive,
                    'status' => $ticket->transaction->status,
                ] : null,
                'assignee' => $ticket->assignee ? [
                    'id' => $ticket->assignee->id,
                    'name' => $ticket->assignee->name,
                ] : null,
                'created_at' => $ticket->created_at?->format('M j, Y g:i A'),
                'created_relative' => $ticket->created_at?->diffForHumans(),
                'resolved_at' => $ticket->resolved_at?->format('M j, Y g:i A'),
            ],
            'messages' => $messages,
        ]);
    }

    /**
     * User sends a reply in their ticket.
     */
    public function reply(Request $request, int $id)
    {
        $user = $request->user();

        $validated = $request->validate([
            'message' => 'required|string|min:1|max:5000',
        ]);

        $ticket = SupportTicket::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if (!$ticket->isActionable()) {
            return back()->withErrors([
                'ticket' => 'This ticket is closed. Please create a new one.',
            ]);
        }

        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $user->id,
            'sender_role' => 'user',
            'message' => $validated['message'],
            'read_by_user' => true,
            'read_by_admin' => false,
        ]);

        // Update ticket status to indicate user replied
        if ($ticket->status === 'awaiting_user') {
            $ticket->update(['status' => 'in_progress']);
        }
        
        // Touch ticket for updated_at
        $ticket->touch();

        return back()->with('success', 'Reply sent.');
    }

    /**
     * User can close their own ticket.
     */
    public function close(Request $request, int $id)
    {
        $user = $request->user();

        $ticket = SupportTicket::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if ($ticket->status === 'closed') {
            return back()->withErrors(['ticket' => 'Ticket is already closed.']);
        }

        $ticket->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        // System message
        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $user->id,
            'sender_role' => 'user',
            'message' => 'Ticket closed by user.',
            'is_system' => true,
            'read_by_user' => true,
            'read_by_admin' => false,
        ]);

        return redirect()->route('support.index')
            ->with('success', 'Ticket closed. Thank you for your feedback!');
    }
}