// resources/js/Pages/Admin/CustomerSupport/TicketDetail.jsx
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../../Components/Layouts/AdminLayout';

import { 
    ArrowLeft, Send, X, FileText, Clock, CheckCircle2, XCircle,
    AlertCircle, MessageCircle, Shield, User as UserIcon, Bot,
    UserCheck, Headphones, Wallet, PiggyBank, BadgeCheck,
} from 'lucide-react';

/** Canned openers and holding lines an agent reaches for repeatedly. */
const QUICK_REPLIES = [
    'Hi! How can I help you?',
    'Could you provide more details about your concern?',
    'Let me check that for you \u2014 one moment please.',
    'Are you still there?',
    'Your issue has been resolved. Is there anything else?',
    'Thank you for your patience!',
];

/** Priority an agent can set by hand. Escalation only ever reaches "high". */
const PRIORITIES = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

export default function AdminTicketDetail({ auth, ticket, user, messages = [], recentTransactions = [], pendingCounts = {} }) {
    const admin = auth?.user;
    const messagesEndRef = useRef(null);
    const replyRef = useRef(null);
    const [settingPriority, setSettingPriority] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [polledMessages, setPolledMessages] = useState(messages);
    const [polledTicket, setPolledTicket] = useState(ticket);
    const pollIntervalRef = useRef(null);

    const replyForm = useForm({ message: '' });
    const resolveForm = useForm({ resolution_notes: '' });

    // Keep the transcript in sync with whatever the server has.
    //
    // Three things were wrong before: the request was never aborted, so a poll
    // in flight when you navigated away resolved against a dead component; it
    // ran at the same rate whether the tab was in front of you or buried, which
    // is 1,200 requests an hour for a tab nobody is reading; and it kept polling
    // after the ticket was closed, when nothing more can arrive.
    useEffect(() => {
        if (polledTicket?.status === 'closed') return;

        const controller = new AbortController();

        const poll = async () => {
            if (document.hidden) return;

            try {
                const response = await fetch(`/admin/customer-support/${ticket.id}`, {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-Inertia': 'true',
                        'X-Inertia-Version': document.querySelector('meta[name="inertia-version"]')?.content || '',
                    },
                    signal: controller.signal,
                });

                if (!response.ok) return;

                const data = await response.json();
                if (data.props?.messages) {
                    setPolledMessages(data.props.messages);
                    if (data.props.ticket) setPolledTicket(data.props.ticket);
                }
            } catch (err) {
                if (err.name !== 'AbortError') console.error('Admin polling error:', err);
            }
        };

        pollIntervalRef.current = setInterval(poll, 3000);

        // Catch up straight away when the tab comes back, instead of waiting
        // out the interval on a transcript that may be minutes stale.
        const onVisible = () => { if (!document.hidden) poll(); };
        document.addEventListener('visibilitychange', onVisible);

        return () => {
            clearInterval(pollIntervalRef.current);
            document.removeEventListener('visibilitychange', onVisible);
            controller.abort();
        };
    }, [ticket.id, polledTicket?.status]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [polledMessages.length]);

    // Enter sends, Shift+Enter breaks the line. Without this the only way to
    // reply was reaching for the button, which is a lot of mouse travel when
    // working through a queue of tickets.
    const handleComposerKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleReply(e);
        }
    };

    const setPriority = (priority) => {
        if (priority === ticket.priority) return;
        setSettingPriority(true);
        router.post(`/admin/customer-support/${ticket.id}/priority`, { priority }, {
            preserveScroll: true,
            onFinish: () => setSettingPriority(false),
        });
    };

    const insertQuickReply = (text) => {
        const current = replyForm.data.message;
        const next = current.trim().length > 0 ? `${current.trimEnd()} ${text}` : text;
        replyForm.setData('message', next.slice(0, 5000));
        replyRef.current?.focus();
    };

    const handleReply = (e) => {
        e.preventDefault();
        if (!replyForm.data.message.trim()) return;
        replyForm.post(`/admin/customer-support/${ticket.id}/reply`, {
            preserveScroll: true,
            onSuccess: (page) => {
                replyForm.reset('message');
                // Show it immediately rather than waiting for the next poll.
                if (page?.props?.messages) setPolledMessages(page.props.messages);
                if (page?.props?.ticket) setPolledTicket(page.props.ticket);
            },
        });
    };

    const handleResolve = () => {
        resolveForm.post(`/admin/customer-support/${ticket.id}/resolve`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowResolveModal(false);
                resolveForm.reset('resolution_notes');
            },
        });
    };

    const handleClose = () => {
        router.post(`/admin/customer-support/${ticket.id}/close`);
    };

    const handleReopen = () => {
        router.post(`/admin/customer-support/${ticket.id}/reopen`);
    };

    const handleAssignToMe = () => {
        router.post(`/admin/customer-support/${ticket.id}/assign`, { admin_id: admin.id });
    };

    const statusStyles = {
        open: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/25', label: 'Open' },
        in_progress: { bg: 'bg-accent/10', text: 'text-accent-foreground', border: 'border-accent/30', label: 'In Progress' },
        awaiting_user: { bg: 'bg-accent/10', text: 'text-accent-foreground', border: 'border-accent/30', label: 'Waiting User' },
        resolved: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/25', label: 'Resolved' },
        closed: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', label: 'Closed' },
    };
    const status = statusStyles[ticket.status] || statusStyles.open;

    return (
        <AdminLayout user={admin} header="Customer Support" pendingCounts={pendingCounts}>
            <Head title={`${ticket.public_reference_id} | Customer Support`} />

            {/* Back link */}
            <Link
                href="/admin/customer-support"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-4 cursor-pointer"
            >
                <ArrowLeft size={14} strokeWidth={2.5} />
                Back to Queue
            </Link>

            {/* 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* LEFT: Chat (2/3 width) */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Ticket header */}   
                        <div className="bg-card rounded-2xl border border-border p-4">                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                    <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${status.bg} ${status.text} ${status.border}`}>
                                        {status.label}
                                    </span>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                        #{ticket.public_reference_id}
                                    </span>
                                    {/* Editable rather than a read-only badge. Escalation
                                        raises this to "high" on its own; urgent and low
                                        need someone who has read the conversation. */}
                                    <select
                                        value={ticket.priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        disabled={settingPriority}
                                        aria-label="Ticket priority"
                                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 ${
                                            ticket.priority === 'urgent' ? 'bg-destructive/10 text-destructive border-destructive/25' :
                                            ticket.priority === 'high' ? 'bg-accent/15 text-accent-foreground border-accent/30' :
                                            'bg-muted text-muted-foreground border-border'
                                        }`}
                                    >
                                        {PRIORITIES.map((p) => (
                                            <option key={p.value} value={p.value} className="text-foreground bg-popover">
                                                {p.label} priority
                                            </option>
                                        ))}
                                    </select>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1 bg-muted rounded border border-border">
                                        {ticket.category}
                                    </span>
                                </div>
                                <h2 className="text-base font-black text-foreground">{ticket.subject}</h2>
                                <p className="text-[10px] text-muted-foreground font-medium mt-1">
                                    Created {ticket.created_relative} · {ticket.created_at}
                                </p>
                            </div>
                        </div>

                        {/* Assignment + Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
                            {ticket.assignee ? (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/25">
                                    <Shield size={11} strokeWidth={2.5} />
                                    Assigned to {ticket.assignee.name}
                                </span>
                            ) : (
                                <button
                                    onClick={handleAssignToMe}
                                    className="inline-flex items-center gap-1.5 text-[10px] font-black text-accent-foreground bg-accent/10 hover:bg-accent/15 px-2.5 py-1 rounded-lg border border-accent/30 cursor-pointer transition-colors"
                                >
                                    <UserCheck size={11} strokeWidth={2.5} />
                                    Take this ticket
                                </button>
                            )}

                            <div className="ml-auto flex items-center gap-2">
                                {ticket.is_actionable && (
                                    <>
                                        <button
                                            onClick={() => setShowResolveModal(true)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-success bg-success/10 hover:bg-success/15 border border-success/25 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <CheckCircle2 size={11} strokeWidth={2.5} />
                                            Resolve
                                        </button>
                                        <button
                                            onClick={() => setShowCloseModal(true)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-foreground hover:bg-muted rounded-lg cursor-pointer transition-colors"
                                        >
                                            <XCircle size={11} strokeWidth={2.5} />
                                            Close
                                        </button>
                                    </>
                                )}
                                {ticket.is_closed && (
                                    <button
                                        onClick={handleReopen}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-accent-foreground bg-accent/10 hover:bg-accent/15 border border-accent/30 rounded-lg cursor-pointer transition-colors"
                                    >
                                        Reopen
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                            <MessageCircle size={14} className="text-muted-foreground" strokeWidth={2.5} />
                            <h3 className="text-sm font-black text-foreground">Conversation</h3>
<span className="text-[10px] font-bold text-muted-foreground">({polledMessages.length} {polledMessages.length === 1 ? 'message' : 'messages'})</span>                        </div>
                        
                        <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto bg-muted">
                            {polledMessages.length === 0 ? (
                                <p className="text-xs text-muted-foreground font-medium text-center py-8">No messages yet</p>
                            ) : (
                                <>
                                    {polledMessages.map(msg => (
                                        <MessageBubble key={msg.id} message={msg} adminId={admin?.id} />
                                    ))}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Reply box */}
                    {ticket.is_actionable ? (
                        <form onSubmit={handleReply} className="bg-card rounded-2xl border border-border p-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-bold text-foreground uppercase tracking-widest block">
                                    Reply to User
                                </label>
                                <span className="text-[9px] font-bold text-muted-foreground">Quick replies:</span>
                            </div>
                            
                            {/* Quick replies. These append to whatever is already
                                typed rather than replacing it — overwriting meant
                                a half-written reply vanished on one stray click. */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {QUICK_REPLIES.map((text) => (
                                    <QuickReply key={text} text={text} onSelect={insertQuickReply} />
                                ))}
                            </div>

                            <textarea
                                ref={replyRef}
                                value={replyForm.data.message}
                                onChange={(e) => replyForm.setData('message', e.target.value)}
                                onKeyDown={handleComposerKey}
                                disabled={replyForm.processing}
                                maxLength={5000}
                                rows={3}
                                placeholder="Type your reply…  (Enter to send, Shift+Enter for a new line)"
                                className="w-full px-3 py-2 text-sm font-medium border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                            />
                            {replyForm.errors.message && (
                                <p className="text-[10px] font-bold text-destructive mt-1">{replyForm.errors.message}</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-[10px] text-muted-foreground font-medium">
                                    {replyForm.data.message.length}/5000 · Sending as "{admin?.name} (Agent)"
                                </p>
                                <button
                                    type="submit"
                                    disabled={replyForm.processing || replyForm.data.message.trim().length < 1}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-black rounded-xl shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send size={12} strokeWidth={2.5} />
                                    {replyForm.processing ? 'Sending...' : 'Send Reply'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-muted border border-border rounded-2xl p-4 text-center">
                            <p className="text-xs font-bold text-muted-foreground">
                                This ticket is {ticket.status}. Reopen to send more messages.
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT: Sidebar (1/3 width) */}
                <div className="lg:col-span-1 space-y-4">
                    {/* User card */}
                    <div className="bg-card rounded-2xl border border-border p-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Customer</p>
                        <div className="flex items-center gap-3 mb-3">
                            {user.profile_picture ? (
                                <img src={user.profile_picture} alt={user.name} className="w-12 h-12 rounded-full" />
                            ) : (
                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                    <UserIcon size={18} className="text-muted-foreground" strokeWidth={2.5} />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-foreground truncate">{user.name}</p>
                                <p className="text-[10px] text-muted-foreground font-medium truncate">{user.email}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-1.5 pt-3 border-t border-border">
                            <CompactRow label="Tier" value={`Tier ${user.tier}`} />
                            <CompactRow label="Account #" value={user.account_number || '—'} />
                            <CompactRow label="Member since" value={user.member_since} />
                            {user.is_suspended && (
                                <div className="mt-2 px-2 py-1 bg-destructive/10 border border-destructive/25 rounded text-[10px] font-black text-destructive text-center">
                                    ⚠ ACCOUNT SUSPENDED
                                </div>
                            )}
                        </div>

                        <Link
                            href={`/admin/users/${user.id}`}
                            className="mt-3 block text-center px-3 py-2 text-[10px] font-black text-primary hover:bg-primary/10 rounded-lg cursor-pointer transition-colors border border-primary/25"
                        >
                            View Full Profile →
                        </Link>
                    </div>

                    {/* Balance card (if available) */}
                    {(user.wallet_balance !== null || user.savings_balance !== null) && (
                        <div className="bg-card rounded-2xl border border-border p-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Balance</p>
                            <div className="space-y-2">
                                {user.wallet_balance !== null && (
                                    <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Wallet size={12} className="text-muted-foreground" strokeWidth={2.5} />
                                            <span className="text-[10px] font-bold text-foreground">Wallet</span>
                                        </div>
                                        <span className="text-xs font-black text-foreground">
                                            ₱{user.wallet_balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}
                                {user.savings_balance !== null && (
                                    <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <PiggyBank size={12} className="text-muted-foreground" strokeWidth={2.5} />
                                            <span className="text-[10px] font-bold text-foreground">Savings</span>
                                        </div>
                                        <span className="text-xs font-black text-foreground">
                                            ₱{user.savings_balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recent transactions */}
                    {recentTransactions.length > 0 && (
                        <div className="bg-card rounded-2xl border border-border p-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Recent Transactions</p>
                            <div className="space-y-2">
                                {recentTransactions.slice(0, 5).map(tx => (
                                    <Link
                                        key={tx.id}
                                        href={`/admin/transactions/${tx.id}`}
                                        className="block p-2 bg-muted hover:bg-muted rounded-lg cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold text-foreground truncate">{tx.title}</p>
                                                <p className="text-[9px] text-muted-foreground font-medium">
                                                    #{tx.reference} · {tx.created_relative}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-black ${tx.is_positive ? 'text-success' : 'text-destructive'}`}>
                                                {tx.is_positive ? '+' : '-'}₱{tx.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resolution notes (if resolved) */}
                    {ticket.resolution_notes && (
                        <div className="bg-success/10 rounded-2xl border border-success/25 p-4">
                            <p className="text-[10px] font-bold text-success uppercase tracking-widest mb-2">Resolution Notes</p>
                            <p className="text-xs text-emerald-900 font-medium">{ticket.resolution_notes}</p>
                            {ticket.resolver && (
                                <p className="text-[10px] text-success font-bold mt-2">
                                    Resolved by {ticket.resolver.name}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Resolve modal */}
            {showResolveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-5">
                        <h3 className="text-base font-black text-foreground mb-2">Resolve this ticket</h3>
                        <p className="text-xs text-muted-foreground font-medium mb-4">
                            Mark this conversation as resolved. The user can reopen if needed.
                        </p>
                        <label className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-1.5 block">
                            Resolution Notes (optional)
                        </label>
                        <textarea
                            value={resolveForm.data.resolution_notes}
                            onChange={(e) => resolveForm.setData('resolution_notes', e.target.value)}
                            maxLength={1000}
                            rows={3}
                            placeholder="What was the resolution?"
                            className="w-full px-3 py-2 text-xs font-medium border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                        />
                        <div className="flex items-center justify-end gap-2 mt-4">
                            <button
                                onClick={() => setShowResolveModal(false)}
                                className="px-4 py-2 text-xs font-bold text-foreground hover:bg-muted rounded-xl cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResolve}
                                disabled={resolveForm.processing}
                                className="px-4 py-2 bg-success hover:bg-success/90 text-white text-xs font-black rounded-xl shadow-md cursor-pointer disabled:opacity-60"
                            >
                                {resolveForm.processing ? 'Resolving...' : 'Mark as Resolved'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Close modal */}
            {showCloseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-5">
                        <h3 className="text-base font-black text-foreground mb-2">Close this ticket?</h3>
                        <p className="text-xs text-muted-foreground font-medium mb-4">
                            The ticket will be permanently closed. The user will need to create a new ticket for further help.
                        </p>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => setShowCloseModal(false)}
                                className="px-4 py-2 text-xs font-bold text-foreground hover:bg-muted rounded-xl cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 bg-primary hover:bg-primary text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
                            >
                                Close Ticket
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

function CompactRow({ label, value }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
            <span className="text-[10px] font-bold text-foreground">{value}</span>
        </div>
    );
}

function MessageBubble({ message }) {
    const isUserMessage = message.sender_role === 'user';
    const isSystem = message.is_system || message.sender_role === 'system';
    const isAdmin = message.sender_role === 'admin' || message.sender_role === 'super_admin';
    const isAi = message.sender_role === 'ai' || message.is_ai_generated;

    if (isSystem) {
        return (
            <div className="flex justify-center my-1">
                <div className="px-3 py-1.5 bg-muted rounded-full max-w-[85%]">
                    <p className="text-[10px] font-medium text-foreground text-center">{message.message}</p>
                </div>
            </div>
        );
    }

    let avatarClass = 'w-7 h-7 bg-muted rounded-full flex items-center justify-center shrink-0';
    let avatarIcon = <UserIcon size={12} className="text-foreground" strokeWidth={2.5} />;
    if (isAdmin) {
        avatarClass = 'w-7 h-7 bg-primary/15 rounded-full flex items-center justify-center shrink-0';
        avatarIcon = <Shield size={12} className="text-primary" strokeWidth={2.5} />;
    } else if (isAi) {
        avatarClass = 'w-7 h-7 bg-accent/15 rounded-full flex items-center justify-center shrink-0';
        avatarIcon = <Bot size={12} className="text-accent-foreground" strokeWidth={2.5} />;
    }

    let bubbleClass = 'bg-card border border-border text-foreground rounded-tl-md';
    if (isAdmin) {
        bubbleClass = 'bg-primary/10 border border-primary/25 text-foreground rounded-tl-md';
    } else if (isAi) {
        bubbleClass = 'bg-accent/10 border border-accent/30 text-foreground rounded-tl-md';
    }

    // Admin perspective: user messages on LEFT (received), admin/AI on RIGHT (own/team)
    // But here we treat everything chronologically — user left, admin/AI right is reversed from user view
    const onRight = isAdmin;
    
    return (
        <div className={'flex gap-2 ' + (onRight ? 'flex-row-reverse' : 'flex-row')}>
            <div className={avatarClass}>{avatarIcon}</div>
            <div className={'flex flex-col max-w-[75%] ' + (onRight ? 'items-end' : 'items-start')}>
                <div className="flex items-center gap-1.5 mb-0.5 px-1">
                    <span className={'text-[10px] font-black ' + (isAdmin ? 'text-primary' : (isAi ? 'text-accent-foreground' : 'text-foreground'))}>
                        {message.sender?.name || 'Unknown'}
                    </span>
                    {isAdmin && (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/25">
                            Agent
                        </span>
                    )}
                    {isAi && (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/30">
                            AI
                        </span>
                    )}
                </div>
                <div className={'rounded-2xl px-3 py-2 ' + (isUserMessage ? 'bg-primary text-white rounded-tr-md' : bubbleClass)}>
                    <p className="text-xs font-medium whitespace-pre-wrap break-words leading-relaxed">{message.message}</p>
                </div>
                <p className="text-[9px] text-muted-foreground font-medium mt-0.5 px-1">
                    {message.created_relative} · {message.created_formatted}
                </p>
            </div>
        </div>
    );
}

function QuickReply({ text, onSelect }) {
    const preview = text.length > 30 ? text.slice(0, 30) + '...' : text;
    return (
        <button
            type="button"
            onClick={() => onSelect(text)}
            title={text}
            className="px-2.5 py-1 text-[10px] font-bold text-foreground bg-muted hover:bg-primary/10 hover:text-primary hover:border-primary/25 border border-border rounded-lg cursor-pointer transition-all whitespace-nowrap"
        >
            {preview}
        </button>
    );
}