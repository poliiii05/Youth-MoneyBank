import { useState, useEffect, useRef } from 'react';
import { X, Send, Headphones, Shield, User as UserIcon, Bot, UserCheck, AlertCircle } from 'lucide-react';

export default function ChatModal({ onClose, currentUser = null }) {
    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);
    const pollIntervalRef = useRef(null);
    const [isAiThinking, setIsAiThinking] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            setIsLoading(false);
            return;
        }
        loadConversation();
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const loadConversation = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/support/conversation', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!response.ok) throw new Error('Failed to load conversation');
            const data = await response.json();
            setTicket(data.ticket);
            setMessages(data.messages || []);
            startPolling(data.ticket.id);
        } catch (err) {
            setError('Failed to load conversation. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const startPolling = (ticketId) => {
        pollIntervalRef.current = setInterval(async () => {
            try {
                const response = await fetch('/api/support/conversation/' + ticketId + '/messages', {
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                });
                if (!response.ok) return;
                const data = await response.json();
                setMessages(data.messages || []);
                setTicket(data.ticket);
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 5000);
    };

    const sendMessage = async () => {
        const trimmed = inputText.trim();
        if (!trimmed || isSending || !ticket) return;

        setIsSending(true);
        setError('');

        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            sender: { name: currentUser?.name || 'You' },
            sender_role: 'user',
            message: trimmed,
            is_system: false,
            created_relative: 'just now',
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setInputText('');
        setIsAiThinking(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            const response = await fetch('/api/support/conversation/' + ticket.id + '/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ message: trimmed }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to send message');
            }

            const msgResponse = await fetch('/api/support/conversation/' + ticket.id + '/messages', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const msgData = await msgResponse.json();
            setMessages(msgData.messages || []);
        } catch (err) {
            setError(err.message);
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        } finally {
            setIsSending(false);
            setIsAiThinking(false);
        }
    };

    const requestAgent = async () => {
        if (!ticket) return;
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            await fetch('/api/support/conversation/' + ticket.id + '/request-agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });
            const msgResponse = await fetch('/api/support/conversation/' + ticket.id + '/messages', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const msgData = await msgResponse.json();
            setMessages(msgData.messages || []);
        } catch (err) {
            setError('Failed to request agent.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const hasAgentRequest = messages.some(m => m.message && m.message.indexOf('requested to speak') !== -1);

    if (!currentUser) {
        return (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
                <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[600px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <ChatHeader onClose={onClose} status={null} />
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                            <UserCheck size={24} className="text-blue-700" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 mb-1">Sign in to chat with us</h3>
                        <p className="text-[11px] text-slate-500 font-medium mb-4">Our support team is available for logged-in users only.</p>
                        <a href="/login" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer transition-all">Sign In</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col h-[90vh] sm:h-[600px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <ChatHeader onClose={onClose} status={ticket?.status} reference={ticket?.public_reference_id} />

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-xs text-slate-400 font-medium">Loading conversation...</p>
                        </div>
                    )}
                    {!isLoading && error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                            <AlertCircle size={14} className="text-red-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                            <p className="text-[11px] text-red-800 font-medium">{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && messages.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-xs text-slate-400 font-medium">No messages yet</p>
                        </div>
                    )}
                   {!isLoading && !error && messages.length > 0 && messages.map(msg => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}
                    {isAiThinking && (
                        <div className="flex gap-2">
                            <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                                <Bot size={12} className="text-purple-700" strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col items-start">
                                <div className="flex items-center gap-1.5 mb-0.5 px-1">
                                    <span className="text-[10px] font-black text-purple-700">AI Assistant</span>
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">AI</span>
                                </div>
                                <div className="rounded-2xl rounded-tl-md px-3 py-2 bg-purple-50 border border-purple-200">
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {ticket?.is_actionable && messages.length > 1 && !hasAgentRequest && (
                    <div className="px-4 py-2 bg-amber-50 border-t border-amber-200">
                        <button onClick={requestAgent} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-amber-100 text-amber-800 text-[11px] font-black rounded-lg border border-amber-300 cursor-pointer transition-colors">
                            <UserCheck size={12} strokeWidth={2.5} />
                            Talk to a Support Agent
                        </button>
                    </div>
                )}

                {ticket?.is_actionable && (
                    <div className="border-t border-slate-200 bg-white p-3">
                        <div className="flex items-end gap-2">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Type your message..."
                                disabled={isSending}
                                rows={2}
                                maxLength={5000}
                                className="flex-1 px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={isSending || inputText.trim().length === 0}
                                className="shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                aria-label="Send message"
                            >
                                <Send size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                )}

                {ticket && !ticket.is_actionable && (
                    <div className="border-t border-slate-200 bg-slate-50 p-4 text-center">
                        <p className="text-[11px] text-slate-600 font-bold">This conversation is closed</p>
                        <button onClick={loadConversation} className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-xl shadow-md cursor-pointer transition-all">
                            Start New Conversation
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ChatHeader({ onClose, status, reference }) {
    const statusLabels = {
        open: { label: 'Online', color: 'bg-emerald-400' },
        in_progress: { label: 'Active', color: 'bg-emerald-400' },
        awaiting_user: { label: 'Waiting on you', color: 'bg-amber-400' },
        resolved: { label: 'Resolved', color: 'bg-slate-400' },
        closed: { label: 'Closed', color: 'bg-slate-400' },
    };
    const statusInfo = statusLabels[status] || { label: 'Online', color: 'bg-emerald-400' };

    return (
        <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <Headphones size={18} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                    <h2 className="text-sm font-black truncate">Customer Service</h2>
                    <div className="flex items-center gap-1.5">
                        <span className={'w-1.5 h-1.5 rounded-full ' + statusInfo.color}></span>
                        <p className="text-[10px] text-blue-100 font-medium">
                            {statusInfo.label}
                            {reference && ' · #' + reference}
                        </p>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 hover:bg-white/10 rounded-lg flex items-center justify-center cursor-pointer transition-colors shrink-0" aria-label="Close chat">
                <X size={14} className="text-white" strokeWidth={2.5} />
            </button>
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

    let avatarClass = 'w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center';
    let avatarIcon = <UserIcon size={12} className="text-slate-700" strokeWidth={2.5} />;
    if (isAdmin) {
        avatarClass = 'w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center';
        avatarIcon = <Shield size={12} className="text-blue-700" strokeWidth={2.5} />;
    } else if (isAi) {
        avatarClass = 'w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center';
        avatarIcon = <Bot size={12} className="text-purple-700" strokeWidth={2.5} />;
    }

    let bubbleClass = 'bg-white border border-slate-200 text-slate-900 rounded-tl-md';
    if (isUserMessage) {
        bubbleClass = 'bg-blue-600 text-white rounded-tr-md';
    } else if (isAdmin) {
        bubbleClass = 'bg-blue-50 border border-blue-200 text-slate-900 rounded-tl-md';
    } else if (isAi) {
        bubbleClass = 'bg-purple-50 border border-purple-200 text-slate-900 rounded-tl-md';
    }

    return (
        <div className={'flex gap-2 ' + (isUserMessage ? 'flex-row-reverse' : 'flex-row')}>
            <div className="shrink-0">
                <div className={avatarClass}>{avatarIcon}</div>
            </div>
            <div className={'flex flex-col max-w-[75%] ' + (isUserMessage ? 'items-end' : 'items-start')}>
                {!isUserMessage && (
                    <div className="flex items-center gap-1.5 mb-0.5 px-1">
                        <span className={'text-[10px] font-black ' + (isAdmin ? 'text-blue-700' : (isAi ? 'text-purple-700' : 'text-slate-700'))}>
                            {isAi ? 'YMB Assistant' : (isAdmin ? (message.sender?.name + ' (Agent)') : (message.sender?.name || 'System'))}
                        </span>
                        {isAdmin && (
                            <span className="text-[8px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Agent</span>
                        )}
                        {isAi && (
                            <span className="text-[8px] font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">AI</span>
                        )}
                    </div>
                )}
                <div className={'rounded-2xl px-3 py-2 ' + bubbleClass}>
                    <p className="text-xs font-medium whitespace-pre-wrap break-words leading-relaxed">{message.message}</p>
                </div>
                <p className="text-[9px] text-slate-400 font-medium mt-0.5 px-1">
                    {message.created_relative || message.created_formatted}
                </p>
            </div>
        </div>
    );
}