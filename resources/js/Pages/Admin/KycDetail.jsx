// resources/js/Pages/Admin/KycDetail.jsx
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import { ChevronLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function KycDetail({ auth, application, pendingCounts = {} }) {
    const user = auth?.user;

    // Status badge
    const StatusBadge = ({ status }) => {
        const styles = {
            pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'PENDING' },
            approved: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'APPROVED' },
            rejected: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'REJECTED' },
        };
        const style = styles[status] || styles.pending;
        const Icon = style.icon;
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border ${style.color}`}>
                <Icon size={11} strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{style.label}</span>
            </div>
        );
    };

    return (
        <AdminLayout user={user} header="KYC Review" pendingCounts={pendingCounts}>
            <Head title={`KYC #${application.id} | Admin`} />

            <div className="max-w-5xl space-y-4">
                {/* Back button */}
                <Link 
                    href="/admin/kyc"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                    <ChevronLeft size={14} strokeWidth={2.5} />
                    Back to KYC Reviews
                </Link>

                {/* Header card */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            {application.user.profile_picture ? (
                                <img 
                                    src={application.user.profile_picture}
                                    alt={application.user.name}
                                    className="w-14 h-14 rounded-full border border-slate-200 object-cover"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                                    {(application.user.name || '?').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h1 className="text-lg font-black text-slate-900 tracking-tight">{application.user.name}</h1>
                                <p className="text-xs text-slate-500 font-medium">{application.user.email}</p>
                            </div>
                        </div>
                        <StatusBadge status={application.status} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                        <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Application ID</p>
                            <p className="text-sm font-bold text-slate-900">#{application.id}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tier Upgrade</p>
                            <p className="text-sm font-bold text-slate-900">T{application.user.current_tier} → T{application.target_tier}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Submitted</p>
                            <p className="text-sm font-bold text-slate-900">{application.submitted_formatted}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Documents</p>
                            <p className="text-sm font-bold text-slate-900">{application.documents.length} files</p>
                        </div>
                    </div>
                </div>

                {/* Placeholder for documents + actions */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h2 className="text-sm font-black text-slate-900 mb-3">Documents</h2>
                    <div className="space-y-2">
                        {application.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="text-xs font-bold text-slate-900">{doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{doc.file_name}</p>
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                                    doc.is_sample 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                    {doc.is_sample ? 'Sample' : 'Uploaded'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Approve/Reject actions (Day 4 implementation) */}
                {application.status === 'pending' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                        <p className="text-xs font-bold text-amber-900 mb-2">Day 4 — Coming Soon</p>
                        <p className="text-[11px] text-amber-800">Approve / Reject actions will be implemented next.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}