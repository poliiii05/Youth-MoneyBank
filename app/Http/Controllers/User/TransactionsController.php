<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionsController extends Controller
{
    /**
     * Transactions list page.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $perPage = 10;
        $page = (int) $request->get('page', 1);
        $showAll = $request->get('show_all') === '1';

        $search = trim((string) $request->get('search', ''));
        $direction = $request->get('direction', 'all');   // all | in | out
        $from = $request->get('from');
        $to = $request->get('to');

        // Build query
        $query = $user->transactions()
            ->with(['ledgerEntries.ledgerAccount'])
            ->latest();

        if (!$showAll) {
            $query->where('created_at', '>=', now()->subDays(30));
        }

        // Filtering happens here rather than in the browser. Doing it client
        // side only ever searched the ten rows already on screen, so a match on
        // page three reported "no transactions found" while the record existed.
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('public_reference_id', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($direction === 'in') {
            $query->where('is_positive', true);
        } elseif ($direction === 'out') {
            $query->where('is_positive', false);
        }

        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

        $totalCount = $query->count();
        $totalPages = max(1, ceil($totalCount / $perPage));

        $transactions = $query
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'type' => $t->type,
                'amount' => (float) $t->amount_pesos,
                'is_positive' => $t->is_positive,
                'status' => $t->status,
                'reference_id' => $t->reference_id,
                'public_reference_id' => $t->public_reference_id,
                'created_at' => $t->created_at,
                'ledger_entries_count' => $t->ledgerEntries->count(),
            ]);

        $hasOlderTransactions = $user->transactions()
            ->where('created_at', '<', now()->subDays(30))
            ->exists();

        return Inertia::render('User/Transactions', [
            'auth' => ['user' => $user],
            'transactions' => $transactions,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'total_count' => $totalCount,
                'per_page' => $perPage,
                'from' => $totalCount > 0 ? ($page - 1) * $perPage + 1 : 0,
                'to' => min($page * $perPage, $totalCount),
            ],
            'filters' => [
                'show_all' => $showAll,
                'has_older' => $hasOlderTransactions,
                'search' => $search,
                'direction' => $direction,
                'from' => $from,
                'to' => $to,
            ],
            'summary' => $this->getMonthlySummary($user),
        ]);
    }

    /**
     * Stream the filtered history as CSV.
     *
     * Streamed rather than built in memory: an export is unbounded by design,
     * and holding every row before sending the first byte is how these endpoints
     * fall over once an account has real history behind it.
     */
    public function export(Request $request)
    {
        $user = $request->user();

        $query = $user->transactions()->latest();

        if ($request->get('show_all') !== '1') {
            $query->where('created_at', '>=', now()->subDays(30));
        }

        $search = trim((string) $request->get('search', ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('public_reference_id', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $direction = $request->get('direction', 'all');
        if ($direction === 'in') {
            $query->where('is_positive', true);
        } elseif ($direction === 'out') {
            $query->where('is_positive', false);
        }

        if ($from = $request->get('from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->get('to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        $filename = 'ymb-transactions-' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Reference ID', 'Date', 'Title', 'Type', 'Direction', 'Amount (PHP)', 'Status',
            ]);

            $query->chunk(500, function ($rows) use ($handle) {
                foreach ($rows as $t) {
                    fputcsv($handle, [
                        $t->public_reference_id,
                        $t->created_at->format('Y-m-d H:i:s'),
                        $t->title,
                        $t->type,
                        $t->is_positive ? 'in' : 'out',
                        number_format($t->amount_cents / 100, 2, '.', ''),
                        $t->status,
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    /**
     * Transaction detail page.
     */
    public function show(Request $request, Transaction $transaction)
    {
        $user = $request->user();

        if ($transaction->user_id !== $user->id) {
            abort(403, 'You do not have permission to view this transaction.');
        }

        $transaction->load(['ledgerEntries.ledgerAccount']);

        return Inertia::render('User/TransactionDetail', [
            'auth' => ['user' => $user],
            'transaction' => [
                'id' => $transaction->id,
                'title' => $transaction->title,
                'type' => $transaction->type,
                'amount' => (float) $transaction->amount_pesos,
                'is_positive' => $transaction->is_positive,
                'status' => $transaction->status,
                'description' => $transaction->description,
                'reference_id' => $transaction->reference_id,
                'public_reference_id' => $transaction->public_reference_id,
                'created_at' => $transaction->created_at,
                'ledger_entries' => $transaction->ledgerEntries
                    ->sortBy(fn($entry) => $entry->direction === 'debit' ? 0 : 1)
                    ->values()
                    ->map(fn($entry) => [
                        'id' => $entry->id,
                        'direction' => $entry->direction,
                        'amount' => (float) ($entry->amount_cents / 100),
                        'account_name' => $entry->ledgerAccount?->name ?? 'Unknown',
                        'account_type' => $entry->ledgerAccount?->type ?? 'unknown',
                        'account_code' => $entry->ledgerAccount?->code ?? null,
                    ]),
            ],
        ]);
    }

    /**
     * Calculate current month summary stats.
     * Always returns same numbers regardless of filters/pagination.
     */
    private function getMonthlySummary(User $user): array
    {
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();
        $completedStatuses = ['completed', 'success'];

        // Money In — positive transactions, this month, completed
        $moneyInCents = Transaction::where('user_id', $user->id)
            ->where('is_positive', true)
            ->whereIn('status', $completedStatuses)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('amount_cents');

        // Money Out — negative transactions, this month, completed
        $moneyOutCents = Transaction::where('user_id', $user->id)
            ->where('is_positive', false)
            ->whereIn('status', $completedStatuses)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('amount_cents');

        $moneyIn = $moneyInCents / 100;
        $moneyOut = $moneyOutCents / 100;

        return [
            'money_in' => $moneyIn,
            'money_out' => $moneyOut,
            'net' => $moneyIn - $moneyOut,
            'period_label' => $startOfMonth->format('F Y'), // "June 2026"
        ];
    }
}