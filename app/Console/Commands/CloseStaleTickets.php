<?php

namespace App\Console\Commands;

use App\Models\SupportMessage;
use App\Models\SupportTicket;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CloseStaleTickets extends Command
{
    protected $signature = 'support:close-stale
                            {--days=3 : Days after an agent reply before closing}
                            {--abandoned=30 : Days without any user message before closing}
                            {--dry-run : Report what would close without changing anything}';

    protected $description = 'Close support tickets a user stopped replying to';

    /**
     * Close conversations the user walked away from.
     *
     * Only tickets sitting at "awaiting_user" qualify: that status means an
     * agent has answered and the ball is in the user's court. Anything still
     * "open" or "in_progress" is waiting on the team, and closing those would
     * hide work rather than finish it.
     *
     * Without this, a ticket someone abandoned mid-conversation stayed in the
     * queue forever, counted as open and competing for an agent's attention
     * against people who were actually waiting.
     */
    public function handle(): int
    {
        $days = max(1, (int) $this->option('days'));
        $abandonedDays = max(1, (int) $this->option('abandoned'));
        $dryRun = (bool) $this->option('dry-run');

        $closed = 0;

        // Case one: an agent replied and the user never came back. The ball was
        // in their court and they left it there.
        $awaiting = SupportTicket::where('status', 'awaiting_user')
            ->where('updated_at', '<=', now()->subDays($days))
            ->get();

        foreach ($awaiting as $ticket) {
            $this->line("  #{$ticket->id} — no reply since {$ticket->updated_at->diffForHumans()}");
            if (! $dryRun) {
                $this->closeTicket(
                    $ticket,
                    "This conversation was closed after {$days} days without a reply. "
                    . 'Start a new chat any time and we will pick it up from there.'
                );
            }
            $closed++;
        }

        // Case two: nobody has heard from the user in a long while, whatever the
        // status. A ticket where someone said "hi" two months ago and never
        // returned is not pending work — it is clutter competing with people
        // who are actually waiting. The earlier version only handled case one,
        // so these sat in the queue indefinitely.
        $abandoned = SupportTicket::whereIn('status', ['open', 'in_progress', 'awaiting_user'])
            ->whereDoesntHave('messages', function ($q) use ($abandonedDays) {
                $q->where('sender_role', 'user')
                  ->where('created_at', '>', now()->subDays($abandonedDays));
            })
            ->where('created_at', '<=', now()->subDays($abandonedDays))
            ->get();

        foreach ($abandoned as $ticket) {
            $this->line("  #{$ticket->id} — abandoned, no user message in {$abandonedDays}+ days");
            if (! $dryRun) {
                $this->closeTicket(
                    $ticket,
                    'This conversation was closed after a long period with no activity. '
                    . 'Start a new chat any time if you still need help.'
                );
            }
            $closed++;
        }

        if ($closed === 0) {
            $this->info('No stale tickets.');
            return self::SUCCESS;
        }

        $this->info(($dryRun ? 'Would close ' : 'Closed ') . $closed . ' ticket(s).');

        if (! $dryRun) {
            Log::info('Stale support tickets closed', ['count' => $closed]);
        }

        return self::SUCCESS;
    }

    /**
     * Close a ticket with a note written to the user, since that note is the
     * last thing they read if they ever open the thread again.
     */
    private function closeTicket(SupportTicket $ticket, string $note): void
    {
        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $ticket->user_id,
            'sender_role' => 'system',
            'message' => $note,
            'is_system' => true,
            'read_by_user' => false,
            'read_by_admin' => true,
        ]);

        $ticket->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);
    }
}