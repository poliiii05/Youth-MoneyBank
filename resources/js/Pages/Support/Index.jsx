// resources/js/Pages/Support/Index.jsx
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '../../Components/Layouts/UserLayout';
import { 
    Headphones, Plus, MessageCircle, CheckCircle2, XCircle, 
    Clock, ArrowRight, AlertCircle, FileText,
} from 'lucide-react';

export default function SupportIndex({ auth, tickets = [], filters = {}, counts = {} }) {
    const user = auth?.user;
    const [activeStatus, setActiveStatus] = useState(filters.status || 'all');

    const handleStatusChange = (status) => {
        setActiveStatus(status);
        router.get('/support', { status }, { preserveState: true, preserveScroll: true });
    };

    return (
        <UserLayout user={user} header="Customer Support">
            <Head title="Support | Youth MoneyBank" />

            {/* Header card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[1.5rem] p-6 mb-4 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                            <Headphones size={28} className="text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black mb-1">How can we help?</h2>
                            <p className="text-sm text-blue-100 font-medium">
                                Submit a ticket and our team will assist you
                            </p>
                        </div>
                    </div>
                    
                    <Link
                        href="/support/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 text-sm font-black rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all whitespace-nowrap"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        New Ticket
                    </Link>
                </div>
            </div>

            {/* Status filter tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-1.5 mb-4 flex gap-1 overflow-x-auto">
                <FilterTab label="All" count={counts.all} active={activeStatus === 'all'} onClick={() => handleStatusChange('all')} />
                <FilterTab label="Open" count={counts.open} active={activeStatus === 'open'} onClick={() => handleStatusChange('open')} />
                <FilterTab label="Resolved" count={counts.resolved} active={activeStatus === 'resolved'} onClick={() => handleStatusChange('resolved')} />
                <FilterTab label="Closed" count={counts.closed} active={activeStatus === 'closed'} onClick={() => handleStatusChange('closed')} />
            </div>

            {/* Tickets list */}
            {tickets.length > 0 ? (
                <div className="space-y-2">
                    {tickets.map(ticket => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                </div>
            ) : (
                <EmptyState activeStatus={activeStatus} />
            )}
        </UserLayout>
    );
}

function FilterTab({ label, count, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                active 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
            {label}
            {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                    {count}
                </span>
            )}
        </button>
    );
}

function TicketCard({ ticket }) {
    const statusStyles = {
        open: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: MessageCircle, label: 'Open' },
        in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: 'In Progress' },
        awaiting_user: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: AlertCircle, label: 'Waiting on You' },
        resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2, label: 'Resolved' },
        closed: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: XCircle, label: 'Closed' },
    };
    
    const priorityStyles = {
        urgent: 'bg-red-50 text-red-700 border-red-200',
        high: 'bg-orange-50 text-orange-700 border-orange-200',
        normal: 'bg-slate-50 text-slate-600 border-slate-200',
        low: 'bg-slate-50 text-slate-500 border-slate-200',
    };
    
    const categoryLabels = {
        general: 'General',
        transaction: 'Transaction',
        kyc: 'KYC',
        account: 'Account',
        other: 'Other',
    };
    
    const status = statusStyles[ticket.status] || statusStyles.open;
    const StatusIcon = status.icon;

    return (
        <Link
            href={`/support/${ticket.id}`}
            className="block bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
        >
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${status.bg} ${status.text} ${status.border}`}>
                            <StatusIcon size={9} strokeWidth={2.5} />
                            {status.label}
                        </span>
                        {ticket.priority === 'urgent' && (
                            <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${priorityStyles.urgent}`}>
                                Urgent
                            </span>
                        )}
                        {ticket.priority === 'high' && (
                            <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${priorityStyles.high}`}>
                                High
                            </span>
                        )}
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            #{ticket.public_reference_id}
                        </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-1 truncate">{ticket.subject}</p>
                    {ticket.last_message_preview && (
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-1 italic">
                            "{ticket.last_message_preview}{ticket.last_message_preview.length >= 100 ? '...' : ''}"
                        </p>
                    )}
                </div>

                <div className="shrink-0 text-right flex flex-col items-end gap-1">
                    {ticket.unread_count > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-500 text-white text-[9px] font-black">
                            {ticket.unread_count} new
                        </span>
                    )}
                    <p className="text-[10px] text-slate-500 font-bold">{ticket.updated_relative}</p>
                </div>
            </div>

            {ticket.transaction && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                    <FileText size={10} strokeWidth={2.5} />
                    <span>Related: <span className="font-bold text-slate-700">{ticket.transaction.title}</span></span>
                    <span className="text-slate-400">·</span>
                    <span className="font-bold text-slate-700">#{ticket.transaction.reference}</span>
                </div>
            )}
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {categoryLabels[ticket.category] || ticket.category}
                </span>
                <ArrowRight size={12} className="text-slate-400" strokeWidth={2.5} />
            </div>
        </Link>
    );
}

function EmptyState({ activeStatus }) {
    const messages = {
        all: { title: 'No tickets yet', desc: 'You haven\'t created any support tickets.' },
        open: { title: 'No open tickets', desc: 'All your tickets are resolved or closed. Great!' },
        resolved: { title: 'No resolved tickets', desc: 'Resolved tickets will appear here.' },
        closed: { title: 'No closed tickets', desc: 'Closed tickets will appear here.' },
    };
    const msg = messages[activeStatus] || messages.all;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={28} className="text-slate-400" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-black text-slate-900 mb-1">{msg.title}</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">{msg.desc}</p>
            <Link
                href="/support/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer transition-all"
            >
                <Plus size={14} strokeWidth={2.5} />
                Create New Ticket
            </Link>
        </div>
    );
}