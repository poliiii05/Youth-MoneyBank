<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerSupportTicketsController extends Controller
{
    /**
     * Display ticket queue with filters and counts.
     */
    public function index(Request $request)
    {
        $status = $request->query('status', 'open');
        $priority = $request->query('priority');
        $search = $request->query('search');

        $query = SupportTicket::with([
            'user:id,name,email,profile_picture,kyc_tier,is_suspended',
            'assignee:id,name',
            'latestMessage',
        ]);

        // Status filter
        if ($status === 'open') {
            $query->whereIn('status', ['open', 'in_progress', 'awaiting_user']);
        } elseif ($status === 'all') {
            // No filter
        } else {
            $query->where('status', $status);
        }

        // Priority filter
        if (in_array($priority, ['low', 'normal', 'high', 'urgent'])) {
            $query->where('priority', $priority);
        }

        // Search filter (reference ID or subject)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('public_reference_id', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($q2) => $q2->where('name', 'like', "%{$search}%"));
            });
        }

        $tickets = $query->orderByRaw("FIELD(priority, 'urgent', 'high', 'normal', 'low')")
            ->orderBy('updated_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'public_reference_id' => $t->public_reference_id,
                    'subject' => $t->subject,
                    'category' => $t->category,
                    'priority' => $t->priority,
                    'status' => $t->status,
                    'user' => [
                        'id' => $t->user->id,
                        'name' => $t->user->name,
                        'email' => $t->user->email,
                        'profile_picture' => $t->user->profile_picture,
                        'tier' => $t->user->kyc_tier,
                        'is_suspended' => (bool) $t->user->is_suspended,
                    ],
                    'assignee' => $t->assignee ? [
                        'id' => $t->assignee->id,
                        'name' => $t->assignee->name,
                    ] : null,
                    'unread_admin' => $t->unreadCountFor('admin'),
                    'last_message_preview' => $t->latestMessage?->message 
                        ? \Str::limit($t->latestMessage->message, 80) 
                        : null,
                    'last_message_role' => $t->latestMessage?->sender_role,
                    'created_relative' => $t->created_at?->diffForHumans(),
                    'updated_relative' => $t->updated_at?->diffForHumans(),
                ];
            });

        // Counts for filter tabs
        $counts = [
            'open' => SupportTicket::whereIn('status', ['open', 'in_progress', 'awaiting_user'])->count(),
            'urgent' => SupportTicket::whereIn('status', ['open', 'in_progress', 'awaiting_user'])
                ->where('priority', 'urgent')->count(),
            'resolved' => SupportTicket::where('status', 'resolved')->count(),
            'closed' => SupportTicket::where('status', 'closed')->count(),
            'all' => SupportTicket::count(),
            'unassigned' => SupportTicket::whereIn('status', ['open', 'in_progress'])
                ->whereNull('assigned_to')->count(),
        ];

        return Inertia::render('Admin/CustomerSupport/Tickets', [
    'auth' => ['user' => $request->user()],
    'tickets' => $tickets,
    'counts' => $counts,
    'filters' => [
        'status' => $status,
        'priority' => $priority,
        'search' => $search,
    ],
    'pendingCounts' => $this->getAdminPendingCounts(),
]);
    }

    /**
     * Show ticket detail with full message history.
     */
    public function show(int $id)
    {
        $admin = auth()->user();
        
        $ticket = SupportTicket::with([
            'user:id,name,email,phone_number,profile_picture,kyc_tier,is_suspended,account_number,created_at',
            'assignee:id,name',
            'resolver:id,name',
            'messages.sender:id,name,profile_picture,admin_role',
        ])->findOrFail($id);

        // Mark messages as read by admin
        $ticket->markAsReadFor('admin');

        // Format messages
        $messages = $ticket->messages->map(function ($m) {
            // Determine display name based on role
            if ($m->sender_role === 'ai') {
                $senderData = ['id' => 'ai', 'name' => 'YMB Assistant', 'profile_picture' => null];
            } elseif ($m->sender_role === 'system') {
                $senderData = ['id' => 'system', 'name' => 'System', 'profile_picture' => null];
            } elseif ($m->sender) {
                $senderData = [
                    'id' => $m->sender->id,
                    'name' => $m->sender->name,
                    'profile_picture' => $m->sender->profile_picture,
                ];
            } else {
                $senderData = ['id' => null, 'name' => 'Unknown', 'profile_picture' => null];
            }

            return [
                'id' => $m->id,
                'sender' => $senderData,
                'sender_role' => $m->sender_role,
                'message' => $m->message,
                'is_system' => $m->is_system,
                'is_ai_generated' => $m->is_ai_generated,
                'created_at' => $m->created_at?->toIso8601String(),
                'created_formatted' => $m->created_at?->format('M j, Y g:i A'),
                'created_relative' => $m->created_at?->diffForHumans(),
            ];
        });

        // Get user's recent transactions for context
        $recentTransactions = $ticket->user->transactions()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'reference' => $t->public_reference_id,
                'title' => $t->title,
                'amount' => (float) ($t->amount_cents / 100),
                'is_positive' => $t->is_positive,
                'status' => $t->status,
                'created_relative' => $t->created_at->diffForHumans(),
            ]);

        return Inertia::render('Admin/CustomerSupport/TicketDetail', [
            'auth' => ['user' => $admin],
            'ticket' => [
                'id' => $ticket->id,
                'public_reference_id' => $ticket->public_reference_id,
                'subject' => $ticket->subject,
                'category' => $ticket->category,
                'priority' => $ticket->priority,
                'status' => $ticket->status,
                'is_actionable' => $ticket->isActionable(),
                'is_closed' => $ticket->isClosed(),
                'assignee' => $ticket->assignee ? [
                    'id' => $ticket->assignee->id,
                    'name' => $ticket->assignee->name,
                ] : null,
                'resolver' => $ticket->resolver ? [
                    'id' => $ticket->resolver->id,
                    'name' => $ticket->resolver->name,
                ] : null,
                'resolution_notes' => $ticket->resolution_notes,
                'created_at' => $ticket->created_at?->format('M j, Y g:i A'),
                'created_relative' => $ticket->created_at?->diffForHumans(),
                'resolved_at' => $ticket->resolved_at?->format('M j, Y g:i A'),
                'is_assigned_to_me' => $ticket->assigned_to === $admin->id,
            ],
            'user' => [
                'id' => $ticket->user->id,
                'name' => $ticket->user->name,
                'email' => $ticket->user->email,
                'phone_number' => $ticket->user->phone_number,
                'profile_picture' => $ticket->user->profile_picture,
                'tier' => $ticket->user->kyc_tier,
                'account_number' => $ticket->user->account_number,
                'is_suspended' => (bool) $ticket->user->is_suspended,
                'member_since' => $ticket->user->created_at?->format('M Y'),
                'wallet_balance' => isset($ticket->user->main_balance_cents) 
                    ? (float) ($ticket->user->main_balance_cents / 100) 
                    : null,
                'savings_balance' => isset($ticket->user->savings_balance_cents) 
                    ? (float) ($ticket->user->savings_balance_cents / 100) 
                    : null,
            ],
            'messages' => $messages,
            'recentTransactions' => $recentTransactions,
            'pendingCounts' => $this->getAdminPendingCounts(),
        ]);
    }

    /**
     * Admin sends reply.
     */
    public function reply(Request $request, int $id)
    {
        $admin = auth()->user();

        $validated = $request->validate([
            'message' => 'required|string|min:1|max:5000',
        ]);

        $ticket = SupportTicket::findOrFail($id);

        if (!$ticket->isActionable()) {
            return back()->withErrors(['ticket' => 'This ticket is closed.']);
        }

        // Check if this is admin's first reply on this ticket
        $isFirstAdminReply = !$ticket->messages()
            ->whereIn('sender_role', ['admin', 'super_admin'])
            ->exists();

        // Auto-assign to current admin if unassigned
        if (!$ticket->assigned_to) {
            $ticket->update([
                'assigned_to' => $admin->id,
                'assigned_at' => now(),
            ]);
        }

        // Add intro greeting on first admin reply
        if ($isFirstAdminReply) {
            SupportMessage::create([
                'ticket_id' => $ticket->id,
                'sender_id' => $admin->id,
                'sender_role' => 'system',
                'message' => "Hi! I'm {$admin->name}, your support agent. I'm taking over from the AI assistant. Let me help you with your concern.",
                'is_system' => true,
                'read_by_user' => false,
                'read_by_admin' => true,
            ]);
        }

        // Update status to in_progress if still open
        if ($ticket->status === 'open') {
            $ticket->update(['status' => 'in_progress']);
        }

        $senderRole = $admin->admin_role === 'super_admin' ? 'super_admin' : 'admin';

        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $admin->id,
            'sender_role' => $senderRole,
            'message' => $validated['message'],
            'read_by_user' => false,
            'read_by_admin' => true,
        ]);

        // Transition to awaiting_user (waiting for user's response)
        $ticket->update(['status' => 'awaiting_user']);
        $ticket->touch();

        \Log::info('Admin replied to ticket', [
            'ticket_id' => $ticket->id,
            'admin_id' => $admin->id,
        ]);

        return back()->with('success', 'Reply sent.');
    }

    /**
     * Admin marks ticket as resolved.
     */
    public function resolve(Request $request, int $id)
    {
        $admin = auth()->user();

        $validated = $request->validate([
            'resolution_notes' => 'nullable|string|max:1000',
        ]);

        $ticket = SupportTicket::findOrFail($id);

        if ($ticket->isClosed()) {
            return back()->withErrors(['ticket' => 'Ticket is already closed.']);
        }

        $ticket->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'resolved_by' => $admin->id,
            'resolution_notes' => $validated['resolution_notes'] ?? null,
        ]);

        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $admin->id,
            'sender_role' => 'system',
            'message' => "Ticket marked as resolved by {$admin->name}.",
            'is_system' => true,
            'read_by_admin' => true,
            'read_by_user' => false,
        ]);

        \Log::info('Admin resolved ticket', [
            'ticket_id' => $ticket->id,
            'admin_id' => $admin->id,
        ]);

        return back()->with('success', 'Ticket marked as resolved.');
    }

    /**
     * Admin closes ticket entirely.
     */
    public function close(Request $request, int $id)
    {
        $admin = auth()->user();
        $ticket = SupportTicket::findOrFail($id);

        $ticket->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $admin->id,
            'sender_role' => 'system',
            'message' => "Ticket closed by {$admin->name}.",
            'is_system' => true,
            'read_by_admin' => true,
            'read_by_user' => false,
        ]);

        return redirect()->route('admin.customer-support.index')
            ->with('success', 'Ticket closed.');
    }

    /**
     * Admin reopens a resolved/closed ticket.
     */
    public function reopen(Request $request, int $id)
    {
        $admin = auth()->user();
        $ticket = SupportTicket::findOrFail($id);

        if ($ticket->status === 'open' || $ticket->status === 'in_progress') {
            return back()->withErrors(['ticket' => 'Ticket is already active.']);
        }

        $ticket->update([
            'status' => 'in_progress',
            'resolved_at' => null,
            'resolved_by' => null,
            'closed_at' => null,
        ]);

        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $admin->id,
            'sender_role' => 'system',
            'message' => "Ticket reopened by {$admin->name}.",
            'is_system' => true,
            'read_by_admin' => true,
            'read_by_user' => false,
        ]);

        return back()->with('success', 'Ticket reopened.');
    }

    /**
     * Admin assigns ticket to self or another admin.
     */
    public function assign(Request $request, int $id)
    {
        $admin = auth()->user();
        
        $validated = $request->validate([
            'admin_id' => 'nullable|integer|exists:users,id',
        ]);

        $ticket = SupportTicket::findOrFail($id);
        $assigneeId = $validated['admin_id'] ?? $admin->id;

        // Verify the assignee is actually an admin
        $assignee = User::where('id', $assigneeId)
            ->whereNotNull('admin_role')
            ->firstOrFail();

        $ticket->update([
            'assigned_to' => $assignee->id,
            'assigned_at' => now(),
        ]);

        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $admin->id,
            'sender_role' => 'system',
            'message' => "Ticket assigned to {$assignee->name}.",
            'is_system' => true,
            'read_by_admin' => true,
            'read_by_user' => false,
        ]);

        return back()->with('success', 'Ticket assigned.');
    }

    /**
     * Get pending counts for admin sidebar badges.
     */
    protected function getAdminPendingCounts(): array
    {
        return [
            'kyc' => \App\Models\KycApplication::where('status', 'pending')->count(),
            'cs' => SupportTicket::whereIn('status', ['open', 'in_progress'])
                ->where(function($q) {
                    $q->whereNull('assigned_to')
                    ->orWhereHas('messages', function($q2) {
                        $q2->where('sender_role', 'user')
                            ->where('read_by_admin', false);
                    });
                })
                ->count(),
        ];
    }
}