// resources/js/Pages/Support/Show.jsx
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import UserLayout from '../../Components/Layouts/UserLayout';
import { 
    ArrowLeft, Send, X, FileText, Clock, CheckCircle2, XCircle,
    AlertCircle, MessageCircle, Shield, User as UserIcon, Bot,
} from 'lucide-react';

export default function SupportShow({ auth, ticket, messages = [] }) {
    const user = auth?.user;
    const messagesEndRef = useRef(null);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);

    const replyForm = useForm({
        message: '',
    });

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleReply = (e) => {
        e.preventDefault();
        if (replyForm.data.message.trim().length < 1) return;
        replyForm.post(`/support/${ticket.id}/reply`, {
            preserveScroll: true,
            onSuccess: () => replyForm.reset('message'),
        });
    };

    const handleClose = () => {
        router.post(`/support/${ticket.id}/close`);
    };

    const statusStyles = {
        open: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Open' },
        in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'In Progress' },
        awaiting_user: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Waiting on You' },
        resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Resolved' },
        closed: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: 'Closed' },
    };
    const status = statusStyles[ticket.status] || statusStyles.open;

    return (
        <UserLayout user={user} header="Support Ticket">
            <Head title={`${ticket.public_reference_id} | Support`} />

            {/* Back link */}
            <Link
                href="/support"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4 cursor-pointer"
            >
                <ArrowLeft size={14} strokeWidth={2.5} />
                Back to Support
            </Link>

            <div className="max-w-3xl space-y-4">
                {/* Ticket header */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                    <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${status.bg} ${status.text} ${status.border}`}>
                                        {status.label}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        #{ticket.public_reference_id}
                                    </span>
                                </div>
                                <h2 className="text-base font-black text-slate-900">{ticket.subject}</h2>
                                <p className="text-[10px] text-slate-500 font-medium mt-1">
                                    Created {ticket.created_relative} · {ticket.created_at}
                                </p>
                            </div>
                            
                            {ticket.is_actionable && (
                                <button
                                    onClick={() => setShowCloseConfirm(true)}
                                    className="shrink-0 px-3 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                                >
                                    <XCircle size={11} strokeWidth={2.5} />
                                    Close Ticket
                                </button>
                            )}
                        </div>

                        {/* Metadata pills */}
                        <div className="flex items-center gap-1.5 flex-wrap text-[9px] font-bold uppercase tracking-widest">
                            <span className="px-2 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded">
                                {ticket.category}
                            </span>
                            <span className={`px-2 py-1 rounded border ${
                                ticket.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                                ticket.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                                {ticket.priority} priority
                            </span>
                            {ticket.assignee && (
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                                    Assigned to {ticket.assignee.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Related transaction */}
                    {ticket.transaction && (
                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <FileText size={12} className="text-slate-500" strokeWidth={2.5} />
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Related Transaction</p>
                            </div>
                            <Link 
                                href={`/transactions/${ticket.transaction.id}`}
                                className="flex items-center gap-2 mt-1.5 group cursor-pointer"
                            >
                                <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">{ticket.transaction.title}</span>
                                <span className="text-[10px] font-bold text-slate-500">#{ticket.transaction.reference}</span>
                                <span className={`text-[10px] font-bold ${
                                    ticket.transaction.is_positive ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                    {ticket.transaction.is_positive ? '+' : '-'}₱{ticket.transaction.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Messages */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <MessageCircle size={14} className="text-slate-600" strokeWidth={2.5} />
                            <h3 className="text-sm font-black text-slate-900">Conversation</h3>
                            <span className="text-[10px] font-bold text-slate-400">({messages.length} {messages.length === 1 ? 'message' : 'messages'})</span>
                        </div>
                    </div>
                    
                    <div className="p-5 space-y-3 max-h-[500px] overflow-y-auto">
                        {messages.map(msg => (
                            <MessageBubble key={msg.id} message={msg} currentUserId={user.id} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Reply box */}
                {ticket.is_actionable ? (
                    <form onSubmit={handleReply} className="bg-white rounded-2xl border border-slate-200 p-4">
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-2 block">
                            Your Reply
                        </label>
                        <textarea
                            value={replyForm.data.message}
                            onChange={(e) => replyForm.setData('message', e.target.value)}
                            disabled={replyForm.processing}
                            maxLength={5000}
                            rows={3}
                            placeholder="Type your message..."
                            className="w-full px-3 py-2 text-sm font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none"
                        />
                        {replyForm.errors.message && (
                            <p className="text-[10px] font-bold text-red-600 mt-1">{replyForm.errors.message}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-[10px] text-slate-400 font-medium">
                                {replyForm.data.message.length}/5000
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
                            This ticket is {ticket.status}. To submit a new question, please create a new ticket.
                        </p>
                        <Link
                            href="/support/new"
                            className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer transition-all"
                        >
                            Create New Ticket
                        </Link>
                    </div>
                )}
            </div>

            {/* Close confirmation modal */}
            {showCloseConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5">
                        <h3 className="text-base font-black text-slate-900 mb-2">Close this ticket?</h3>
                        <p className="text-xs text-slate-600 font-medium mb-4">
                            Are you sure you want to close this ticket? You won't be able to send more messages, but you can create a new ticket anytime.
                        </p>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => setShowCloseConfirm(false)}
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
        </UserLayout>
    );
}

function MessageBubble({ message, currentUserId }) {
    const isUserMessage = message.sender_role === 'user';
    const isSystemMessage = message.is_system;
    const isAdmin = message.sender_role === 'admin' || message.sender_role === 'super_admin';

    if (isSystemMessage) {
        return (
            <div className="flex justify-center my-2">
                <div className="px-3 py-1.5 bg-slate-100 rounded-full">
                    <p className="text-[10px] font-bold text-slate-600">{message.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex gap-2 ${isUserMessage ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className="shrink-0">
                {isAdmin ? (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield size={14} className="text-blue-700" strokeWidth={2.5} />
                    </div>
                ) : message.sender_role === 'ai' ? (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Bot size={14} className="text-purple-700" strokeWidth={2.5} />
                    </div>
                ) : (
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <UserIcon size={14} className="text-slate-700" strokeWidth={2.5} />
                    </div>
                )}
            </div>

            {/* Bubble */}
            <div className={`flex-1 max-w-[75%] ${isUserMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[10px] font-black ${
                        isAdmin ? 'text-blue-700' : 
                        message.sender_role === 'ai' ? 'text-purple-700' : 'text-slate-700'
                    }`}>
                        {message.sender?.name || 'System'}
                    </span>
                    {isAdmin && (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            Support Agent
                        </span>
                    )}
                    {message.sender_role === 'ai' && (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                            AI Assistant
                        </span>
                    )}
                </div>
                <div className={`rounded-2xl px-3 py-2 ${
                    isUserMessage 
                        ? 'bg-blue-600 text-white' 
                        : isAdmin 
                            ? 'bg-blue-50 border border-blue-200 text-slate-900' 
                            : 'bg-slate-100 text-slate-900'
                }`}>
                    <p className="text-xs font-medium whitespace-pre-wrap break-words">{message.message}</p>
                </div>
                <p className="text-[9px] text-slate-400 font-medium mt-1">
                    {message.created_relative} · {message.created_formatted}
                </p>
            </div>
        </div>
    );
}