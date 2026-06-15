// resources/js/Pages/Admin/CustomerSupport/TicketDetail.jsx
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../../Components/Layouts/AdminLayout';

import { 
    ArrowLeft, Send, X, FileText, Clock, CheckCircle2, XCircle,
    AlertCircle, MessageCircle, Shield, User as UserIcon, Bot,
    UserCheck, Headphones, Wallet, PiggyBank, BadgeCheck,
} from 'lucide-react';

export default function AdminTicketDetail({ auth, ticket, user, messages = [], recentTransactions = [], pendingCounts = {} }) {
    const admin = auth?.user;
    const messagesEndRef = useRef(null);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [polledMessages, setPolledMessages] = useState(messages);
    const [polledTicket, setPolledTicket] = useState(ticket);
    const pollIntervalRef = useRef(null);

    const replyForm = useForm({ message: '' });
    const resolveForm = useForm({ resolution_notes: '' });

    useEffect(() => {
    pollIntervalRef.current = setInterval(async () => {
        try {
            const response = await fetch(`/admin/customer-support/${ticket.id}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Inertia': 'true',
                    'X-Inertia-Version': document.querySelector('meta[name="inertia-version"]')?.content || '',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.props?.messages) {
                    setPolledMessages(data.props.messages);
                    if (data.props.ticket) setPolledTicket(data.props.ticket);
                }
            }
        } catch (err) {
            console.error('Admin polling error:', err);
        }
    }, 3000); // 3 seconds (faster than user's 5s for snappier UX)

    return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
}, [ticket.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleReply = (e) => {
        e.preventDefault();
        if (!replyForm.data.message.trim()) return;
        replyForm.post(`/admin/customer-support/${ticket.id}/reply`, {
            preserveScroll: true,
            onSuccess: () => replyForm.reset('message'),
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
        open: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Open' },
        in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'In Progress' },
        awaiting_user: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Waiting User' },
        resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Resolved' },
        closed: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: 'Closed' },
    };
    const status = statusStyles[ticket.status] || statusStyles.open;

    return (
        <AdminLayout user={admin} header="Customer Support" pendingCounts={pendingCounts}>
            <Head title={`${ticket.public_reference_id} | Customer Support`} />

            {/* Back link */}
            <Link
                href="/admin/customer-support"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4 cursor-pointer"
            >
                <ArrowLeft size={14} strokeWidth={2.5} />
                Back to Queue
            </Link>

            {/* 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* LEFT: Chat (2/3 width) */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Ticket header */}   
                        <div className="bg-white rounded-2xl border border-slate-200 p-4">                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                    <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${status.bg} ${status.text} ${status.border}`}>
                                        {status.label}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        #{ticket.public_reference_id}
                                    </span>
                                    <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${
                                        ticket.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                                        ticket.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                        'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}>
                                        {ticket.priority} priority
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded border border-slate-200">
                                        {ticket.category}
                                    </span>
                                </div>
                                <h2 className="text-base font-black text-slate-900">{ticket.subject}</h2>
                                <p className="text-[10px] text-slate-500 font-medium mt-1">
                                    Created {ticket.created_relative} · {ticket.created_at}
                                </p>
                            </div>
                        </div>

                        {/* Assignment + Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                            {ticket.assignee ? (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                                    <Shield size={11} strokeWidth={2.5} />
                                    Assigned to {ticket.assignee.name}
                                </span>
                            ) : (
                                <button
                                    onClick={handleAssignToMe}
                                    className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer transition-colors"
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
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <CheckCircle2 size={11} strokeWidth={2.5} />
                                            Resolve
                                        </button>
                                        <button
                                            onClick={() => setShowCloseModal(true)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <XCircle size={11} strokeWidth={2.5} />
                                            Close
                                        </button>
                                    </>
                                )}
                                {ticket.is_closed && (
                                    <button
                                        onClick={handleReopen}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg cursor-pointer transition-colors"
                                    >
                                        Reopen
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                            <MessageCircle size={14} className="text-slate-600" strokeWidth={2.5} />
                            <h3 className="text-sm font-black text-slate-900">Conversation</h3>
<span className="text-[10px] font-bold text-slate-400">({polledMessages.length} {polledMessages.length === 1 ? 'message' : 'messages'})</span>                        </div>
                        
                        <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto bg-slate-50">
                            {polledMessages.length === 0 ? (
                                <p className="text-xs text-slate-400 font-medium text-center py-8">No messages yet</p>
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
                        <form onSubmit={handleReply} className="bg-white rounded-2xl border border-slate-200 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block">
                                    Reply to User
                                </label>
                                <span className="text-[9px] font-bold text-slate-400">Quick replies:</span>
                            </div>
                            
                            {/* Quick reply templates */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <QuickReply text="Hi! How can I help you?" onSelect={(t) => replyForm.setData('message', t)} />
                                <QuickReply text="Could you provide more details about your concern?" onSelect={(t) => replyForm.setData('message', t)} />
                                <QuickReply text="Are you still there?" onSelect={(t) => replyForm.setData('message', t)} />
                                <QuickReply text="Let me check that for you. One moment please." onSelect={(t) => replyForm.setData('message', t)} />
                                <QuickReply text="Your issue has been resolved. Is there anything else?" onSelect={(t) => replyForm.setData('message', t)} />
                                <QuickReply text="Thank you for your patience!" onSelect={(t) => replyForm.setData('message', t)} />
                            </div>

                            <textarea
                                value={replyForm.data.message}
                                onChange={(e) => replyForm.setData('message', e.target.value)}
                                disabled={replyForm.processing}
                                maxLength={5000}
                                rows={3}
                                placeholder="Type your reply..."
                                className="w-full px-3 py-2 text-sm font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none"
                            />
                            {replyForm.errors.message && (
                                <p className="text-[10px] font-bold text-red-600 mt-1">{replyForm.errors.message}</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-[10px] text-slate-400 font-medium">
                                    {replyForm.data.message.length}/5000 · You will appear as "{admin?.name} (Agent)"
                                </p>
                                <button
                                    type="submit"
                                    disabled={replyForm.processing || replyForm.data.message.trim().length < 1}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send size={12} strokeWidth={2.5} />
                                    {replyForm.processing ? 'Sending...' : 'Send Reply'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                            <p className="text-xs font-bold text-slate-600">
                                This ticket is {ticket.status}. Reopen to send more messages.
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT: Sidebar (1/3 width) */}
                <div className="lg:col-span-1 space-y-4">
                    {/* User card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Customer</p>
                        <div className="flex items-center gap-3 mb-3">
                            {user.profile_picture ? (
                                <img src={user.profile_picture} alt={user.name} className="w-12 h-12 rounded-full" />
                            ) : (
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                    <UserIcon size={18} className="text-slate-500" strokeWidth={2.5} />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                                <p className="text-[10px] text-slate-500 font-medium truncate">{user.email}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-1.5 pt-3 border-t border-slate-100">
                            <CompactRow label="Tier" value={`Tier ${user.tier}`} />
                            <CompactRow label="Account #" value={user.account_number || '—'} />
                            <CompactRow label="Member since" value={user.member_since} />
                            {user.is_suspended && (
                                <div className="mt-2 px-2 py-1 bg-red-50 border border-red-200 rounded text-[10px] font-black text-red-700 text-center">
                                    ⚠ ACCOUNT SUSPENDED
                                </div>
                            )}
                        </div>

                        <Link
                            href={`/admin/users/${user.id}`}
                            className="mt-3 block text-center px-3 py-2 text-[10px] font-black text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors border border-blue-200"
                        >
                            View Full Profile →
                        </Link>
                    </div>

                    {/* Balance card (if available) */}
                    {(user.wallet_balance !== null || user.savings_balance !== null) && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Balance</p>
                            <div className="space-y-2">
                                {user.wallet_balance !== null && (
                                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Wallet size={12} className="text-slate-600" strokeWidth={2.5} />
                                            <span className="text-[10px] font-bold text-slate-700">Wallet</span>
                                        </div>
                                        <span className="text-xs font-black text-slate-900">
                                            ₱{user.wallet_balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}
                                {user.savings_balance !== null && (
                                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <PiggyBank size={12} className="text-slate-600" strokeWidth={2.5} />
                                            <span className="text-[10px] font-bold text-slate-700">Savings</span>
                                        </div>
                                        <span className="text-xs font-black text-slate-900">
                                            ₱{user.savings_balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recent transactions */}
                    {recentTransactions.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Recent Transactions</p>
                            <div className="space-y-2">
                                {recentTransactions.slice(0, 5).map(tx => (
                                    <Link
                                        key={tx.id}
                                        href={`/admin/transactions/${tx.id}`}
                                        className="block p-2 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold text-slate-700 truncate">{tx.title}</p>
                                                <p className="text-[9px] text-slate-500 font-medium">
                                                    #{tx.reference} · {tx.created_relative}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-black ${tx.is_positive ? 'text-emerald-600' : 'text-red-600'}`}>
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
                        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4">
                            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2">Resolution Notes</p>
                            <p className="text-xs text-emerald-900 font-medium">{ticket.resolution_notes}</p>
                            {ticket.resolver && (
                                <p className="text-[10px] text-emerald-700 font-bold mt-2">
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5">
                        <h3 className="text-base font-black text-slate-900 mb-2">Resolve this ticket</h3>
                        <p className="text-xs text-slate-600 font-medium mb-4">
                            Mark this conversation as resolved. The user can reopen if needed.
                        </p>
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 block">
                            Resolution Notes (optional)
                        </label>
                        <textarea
                            value={resolveForm.data.resolution_notes}
                            onChange={(e) => resolveForm.setData('resolution_notes', e.target.value)}
                            maxLength={1000}
                            rows={3}
                            placeholder="What was the resolution?"
                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none"
                        />
                        <div className="flex items-center justify-end gap-2 mt-4">
                            <button
                                onClick={() => setShowResolveModal(false)}
                                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResolve}
                                disabled={resolveForm.processing}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer disabled:opacity-60"
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5">
                        <h3 className="text-base font-black text-slate-900 mb-2">Close this ticket?</h3>
                        <p className="text-xs text-slate-600 font-medium mb-4">
                            The ticket will be permanently closed. The user will need to create a new ticket for further help.
                        </p>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => setShowCloseModal(false)}
                                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
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
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
            <span className="text-[10px] font-bold text-slate-700">{value}</span>
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
                <div className="px-3 py-1.5 bg-slate-200 rounded-full max-w-[85%]">
                    <p className="text-[10px] font-medium text-slate-700 text-center">{message.message}</p>
                </div>
            </div>
        );
    }

    let avatarClass = 'w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center shrink-0';
    let avatarIcon = <UserIcon size={12} className="text-slate-700" strokeWidth={2.5} />;
    if (isAdmin) {
        avatarClass = 'w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0';
        avatarIcon = <Shield size={12} className="text-blue-700" strokeWidth={2.5} />;
    } else if (isAi) {
        avatarClass = 'w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center shrink-0';
        avatarIcon = <Bot size={12} className="text-purple-700" strokeWidth={2.5} />;
    }

    let bubbleClass = 'bg-white border border-slate-200 text-slate-900 rounded-tl-md';
    if (isAdmin) {
        bubbleClass = 'bg-blue-50 border border-blue-200 text-slate-900 rounded-tl-md';
    } else if (isAi) {
        bubbleClass = 'bg-purple-50 border border-purple-200 text-slate-900 rounded-tl-md';
    }

    // Admin perspective: user messages on LEFT (received), admin/AI on RIGHT (own/team)
    // But here we treat everything chronologically — user left, admin/AI right is reversed from user view
    const onRight = isAdmin;
    
    return (
        <div className={'flex gap-2 ' + (onRight ? 'flex-row-reverse' : 'flex-row')}>
            <div className={avatarClass}>{avatarIcon}</div>
            <div className={'flex flex-col max-w-[75%] ' + (onRight ? 'items-end' : 'items-start')}>
                <div className="flex items-center gap-1.5 mb-0.5 px-1">
                    <span className={'text-[10px] font-black ' + (isAdmin ? 'text-blue-700' : (isAi ? 'text-purple-700' : 'text-slate-700'))}>
                        {message.sender?.name || 'Unknown'}
                    </span>
                    {isAdmin && (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            Agent
                        </span>
                    )}
                    {isAi && (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                            AI
                        </span>
                    )}
                </div>
                <div className={'rounded-2xl px-3 py-2 ' + (isUserMessage ? 'bg-blue-600 text-white rounded-tr-md' : bubbleClass)}>
                    <p className="text-xs font-medium whitespace-pre-wrap break-words leading-relaxed">{message.message}</p>
                </div>
                <p className="text-[9px] text-slate-400 font-medium mt-0.5 px-1">
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
            className="px-2.5 py-1 text-[10px] font-bold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-lg cursor-pointer transition-all whitespace-nowrap"
        >
            {preview}
        </button>
    );
}