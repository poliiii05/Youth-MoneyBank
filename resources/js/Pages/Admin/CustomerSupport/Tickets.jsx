// resources/js/Pages/Admin/CustomerSupport/Tickets.jsx
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Components/Layouts/AdminLayout';
import { 
    Headphones, Search, Filter, MessageCircle, 
    CheckCircle2, XCircle, Clock, AlertCircle, ArrowRight,
    Shield, User as UserIcon,
} from 'lucide-react';

export default function AdminCustomerSupportTickets({ auth, tickets = [], counts = {}, filters = {}, pendingCounts = {} }) {
    const admin = auth?.user;
    const [search, setSearch] = useState(filters.search || '');
    const [activeStatus, setActiveStatus] = useState(filters.status || 'open');
    const [activePriority, setActivePriority] = useState(filters.priority || null);

    const handleStatusChange = (status) => {
        setActiveStatus(status);
        router.get('/admin/customer-support', 
            { status, priority: activePriority, search }, 
            { preserveState: true, preserveScroll: true }
        );
    };

    const handlePriorityChange = (priority) => {
        const newPriority = activePriority === priority ? null : priority;
        setActivePriority(newPriority);
        router.get('/admin/customer-support', 
            { status: activeStatus, priority: newPriority, search }, 
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/customer-support', 
            { status: activeStatus, priority: activePriority, search }, 
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <AdminLayout user={admin} header="Customer Support" pendingCounts={pendingCounts}>
            <Head title="Customer Support | Admin" />

            {/* Hero card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Headphones size={22} className="text-blue-700" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-900">Customer Support Queue</h2>
                            <p className="text-[11px] text-slate-500 font-medium">
                                {counts.open || 0} active conversations · {counts.urgent || 0} urgent · {counts.unassigned || 0} unassigned
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3 mb-4 flex flex-wrap items-center gap-2">
                {/* Status tabs */}
                <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
                    <FilterTab label="Open" count={counts.open} active={activeStatus === 'open'} onClick={() => handleStatusChange('open')} />
                    <FilterTab label="Resolved" count={counts.resolved} active={activeStatus === 'resolved'} onClick={() => handleStatusChange('resolved')} />
                    <FilterTab label="Closed" count={counts.closed} active={activeStatus === 'closed'} onClick={() => handleStatusChange('closed')} />
                    <FilterTab label="All" count={counts.all} active={activeStatus === 'all'} onClick={() => handleStatusChange('all')} />
                </div>

                {/* Priority chips */}
                <div className="flex items-center gap-1 ml-2 border-l border-slate-200 pl-2">
                    <PriorityChip label="Urgent" priority="urgent" active={activePriority === 'urgent'} onClick={() => handlePriorityChange('urgent')} />
                    <PriorityChip label="High" priority="high" active={activePriority === 'high'} onClick={() => handlePriorityChange('high')} />
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="ml-auto flex items-center gap-2 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by reference, subject, or user..."
                            className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                        />
                    </div>
                </form>
            </div>

            {/* Tickets list */}
            {tickets.length > 0 ? (
                <div className="space-y-2">
                    {tickets.map(ticket => (
                        <TicketRow key={ticket.id} ticket={ticket} />
                    ))}
                </div>
            ) : (
                <EmptyState activeStatus={activeStatus} />
            )}
        </AdminLayout>
    );
}

function FilterTab({ label, count, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
            {label}
            {count > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    active ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                }`}>
                    {count}
                </span>
            )}
        </button>
    );
}

function PriorityChip({ label, priority, active, onClick }) {
    const colors = {
        urgent: active ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-700 border-red-200 hover:border-red-400',
        high: active ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-orange-700 border-orange-200 hover:border-orange-400',
    };
    return (
        <button
            onClick={onClick}
            className={`px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all cursor-pointer ${colors[priority]}`}
        >
            {label}
        </button>
    );
}

function TicketRow({ ticket }) {
    const statusStyles = {
        open: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Open', icon: MessageCircle },
        in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'In Progress', icon: Clock },
        awaiting_user: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Waiting User', icon: AlertCircle },
        resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Resolved', icon: CheckCircle2 },
        closed: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: 'Closed', icon: XCircle },
    };
    
    const status = statusStyles[ticket.status] || statusStyles.open;
    const StatusIcon = status.icon;

    return (
        <Link
            href={`/admin/customer-support/${ticket.id}`}
            className="block bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
        >
            <div className="flex items-start gap-3">
                {/* User avatar */}
                <div className="shrink-0">
                    {ticket.user.profile_picture ? (
                        <img src={ticket.user.profile_picture} alt={ticket.user.name} className="w-10 h-10 rounded-full" />
                    ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <UserIcon size={16} className="text-slate-500" strokeWidth={2.5} />
                        </div>
                    )}
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Top row: badges */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${status.bg} ${status.text} ${status.border}`}>
                            <StatusIcon size={9} strokeWidth={2.5} />
                            {status.label}
                        </span>
                        {ticket.priority === 'urgent' && (
                            <span className="inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border bg-red-50 text-red-700 border-red-200">
                                Urgent
                            </span>
                        )}
                        {ticket.priority === 'high' && (
                            <span className="inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border bg-orange-50 text-orange-700 border-orange-200">
                                High
                            </span>
                        )}
                        <span className="inline-flex items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1.5">
                            T{ticket.user.tier}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            #{ticket.public_reference_id}
                        </span>
                        {ticket.unread_admin > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-500 text-white text-[9px] font-black">
                                {ticket.unread_admin} new
                            </span>
                        )}
                    </div>

                    {/* Subject */}
                    <p className="text-sm font-black text-slate-900 mb-0.5 truncate">{ticket.subject}</p>
                    
                    {/* User name */}
                    <p className="text-[11px] text-slate-600 font-medium mb-1">
                        <span className="font-bold">{ticket.user.name}</span>
                        {ticket.user.is_suspended && <span className="ml-1.5 text-red-600 font-bold">⚠ Suspended</span>}
                    </p>
                    
                    {/* Last message preview */}
                    {ticket.last_message_preview && (
                        <p className="text-[11px] text-slate-500 font-medium italic line-clamp-1">
                            {ticket.last_message_role === 'user' && '👤 '}
                            {ticket.last_message_role === 'ai' && '🤖 '}
                            {(ticket.last_message_role === 'admin' || ticket.last_message_role === 'super_admin') && '🛡️ '}
                            "{ticket.last_message_preview}"
                        </p>
                    )}
                </div>

                {/* Right side: meta */}
                <div className="shrink-0 text-right flex flex-col items-end gap-1">
                    <p className="text-[10px] text-slate-400 font-bold">{ticket.updated_relative}</p>
                    {ticket.assignee ? (
                        <p className="text-[9px] text-slate-500 font-medium">
                            Assigned to <span className="font-bold">{ticket.assignee.name}</span>
                        </p>
                    ) : (
                        <p className="text-[9px] text-amber-600 font-black uppercase tracking-widest">Unassigned</p>
                    )}
                    <ArrowRight size={12} className="text-slate-400" strokeWidth={2.5} />
                </div>
            </div>
        </Link>
    );
}

function EmptyState({ activeStatus }) {
    const messages = {
        open: { title: 'No open tickets', desc: 'All tickets are resolved or closed. Great job!' },
        resolved: { title: 'No resolved tickets', desc: 'Resolved tickets will appear here.' },
        closed: { title: 'No closed tickets', desc: 'Closed tickets will appear here.' },
        all: { title: 'No tickets found', desc: 'No tickets match your current filters.' },
    };
    const msg = messages[activeStatus] || messages.all;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={28} className="text-slate-400" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-black text-slate-900 mb-1">{msg.title}</h3>
            <p className="text-xs text-slate-500 font-medium">{msg.desc}</p>
        </div>
    );
}