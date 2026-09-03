// resources/js/Pages/Admin/KycDetail.jsx
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../Components/Layouts/AdminLayout';
import ApproveKycModal from '../../Components/Admin/Kyc/ApproveKycModal';
import RejectKycModal from '../../Components/Admin/Kyc/RejectKycModal';
import DocumentViewer from '../../Components/Admin/Kyc/DocumentViewer';
import Avatar from '../../Components/Admin/Avatar';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import { 
    ChevronLeft, CheckCircle2, XCircle, Clock, 
    Mail, CreditCard, Calendar, ShieldCheck,
    Eye, FileText, Image as ImageIcon,
} from 'lucide-react';

export default function KycDetail({ auth, application, pendingCounts = {} }) {
    const user = auth?.user;

    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [viewerDoc, setViewerDoc] = useState(null);

    // Mirrors User::canApproveKyc(), which returns isAdmin() — both admin and
    // super_admin may review. The old check looked for a "kyc_reviewer" role
    // that exists nowhere in the codebase, so a plain admin never saw the
    // approve and reject buttons despite the server allowing the action.
    const canReview = user?.admin_role === 'super_admin' || user?.admin_role === 'admin';
    const isSelfApplication = application.user.id === user?.id;
    const canActOnThis = canReview && !isSelfApplication;

    return (
        <AdminLayout user={user} header={`KYC Reviews #${application.id}`} pendingCounts={pendingCounts}>
            <Head title={`KYC #${application.id} | Admin`} />

            <div className="max-w-6xl space-y-4">
                {/* Back link */}
                <Link 
                    href="/admin/kyc"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    <ChevronLeft size={14} strokeWidth={2.5} />
                    Back to KYC Reviews
                </Link>

                {/* Header card */}
                <div className="bg-card rounded-xl border border-border p-5">
                    <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                        <div className="flex items-center gap-3">
                    <Avatar 
                        src={application.user.profile_picture}
                        name={application.user.name}
                        size="lg"
                    />
                    <div>
                        <h1 className="text-lg font-black text-foreground tracking-tight">{application.user.name}</h1>
                        <p className="text-xs text-muted-foreground font-medium">{application.user.email}</p>
                    </div>
                </div>
                        <StatusBadge status={application.status} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
                        <Stat label="Application ID" value={`#${application.id}`} />
                        <Stat label="Tier Upgrade" value={`T${application.original_tier} → T${application.target_tier}`} />
                        <Stat label="Submitted" value={application.submitted_formatted} />
                        <Stat label="Documents" value={`${application.documents.length} files`} />
                    </div>
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    
                    {/* User info sidebar */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="px-5 py-4 border-b border-border">
                            <h3 className="text-sm font-black text-foreground tracking-tight">User Information</h3>
                        </div>
                        <div className="p-5 space-y-3">
                            <InfoRow icon={Mail} label="Email" value={application.user.email}>
                                {application.user.email_verified && (
                                    <span className="ml-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 bg-success/10 text-success text-[8px] font-bold uppercase tracking-widest rounded">
                                        <ShieldCheck size={8} strokeWidth={2.5} />
                                        Verified
                                    </span>
                                )}
                            </InfoRow>
                            <InfoRow 
                                icon={CreditCard} 
                                label="Account Number" 
                                value={application.user.account_number} 
                            />
                            <InfoRow 
                                icon={Calendar} 
                                label="Member Since" 
                                value={application.user.member_since} 
                            />
                        </div>
                    </div>

                    {/* Documents section */}
                    <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
                        <div className="px-5 py-4 border-b border-border">
                            <h3 className="text-sm font-black text-foreground tracking-tight">Submitted Documents</h3>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                Click any document to view full preview
                            </p>
                        </div>
                        <div className="p-3 space-y-2">
                            {application.documents.map((doc) => (
                                <DocumentRow 
                                    key={doc.id} 
                                    document={doc} 
                                    onView={() => setViewerDoc(doc)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action area */}
                {application.status === 'pending' && (
                    <div className="bg-card border border-border rounded-xl p-5">
                        {!canReview ? (
                            <div className="flex items-start gap-3 p-4 bg-muted border border-border rounded-lg">
                                <Clock size={20} className="text-muted-foreground shrink-0 mt-0.5" strokeWidth={2.5} />
                                <div>
                                    <p className="text-sm font-black text-foreground mb-1">Review-only Access</p>
                                    <p className="text-xs text-muted-foreground">
                                        You can view this application but cannot approve or reject. Requires KYC Reviewer role.
                                    </p>
                                </div>
                            </div>
                        ) : isSelfApplication ? (
                            <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/30 rounded-lg">
                                <Clock size={20} className="text-accent shrink-0 mt-0.5" strokeWidth={2.5} />
                                <div>
                                    <p className="text-sm font-black text-amber-900 mb-1">Cannot Self-Review</p>
                                    <p className="text-xs text-amber-800">
                                        For security reasons, admins cannot approve or reject their own KYC applications.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-sm font-black text-foreground mb-1">Review Decision</h3>
                                <p className="text-xs text-muted-foreground font-medium mb-4">
                                    Approve to upgrade the user's tier, or reject with a clear reason.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setRejectOpen(true)}
                                        className="flex-1 sm:flex-none px-4 py-2.5 bg-card border-2 border-destructive/25 hover:bg-destructive/10 hover:border-red-300 text-destructive text-xs font-black rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={14} strokeWidth={2.5} />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => setApproveOpen(true)}
                                        className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition-all shadow-md shadow-emerald-200 cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={14} strokeWidth={2.5} />
                                        Approve & Upgrade
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Status info for non-pending */}
                {application.status === 'approved' && (
                    <div className="bg-success/10 border border-success/25 rounded-xl p-5">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 size={20} className="text-success shrink-0 mt-0.5" strokeWidth={2.5} />
                            <div className="flex-1">
                                <p className="text-sm font-black text-emerald-900 mb-1">Application Approved</p>
                                <p className="text-xs text-emerald-800">
                                    {application.auto_approved 
                                        ? 'Auto-approved in demo mode' 
                                        : `Reviewed by ${application.reviewer?.name || 'admin'} on ${application.reviewed_formatted}`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {application.status === 'rejected' && (
                    <div className="bg-destructive/10 border border-destructive/25 rounded-xl p-5">
                        <div className="flex items-start gap-3">
                            <XCircle size={20} className="text-destructive shrink-0 mt-0.5" strokeWidth={2.5} />
                            <div className="flex-1">
                                <p className="text-sm font-black text-red-900 mb-1">Application Rejected</p>
                                {application.rejection_reason && (
                                    <p className="text-xs text-red-800 mb-2">
                                        <span className="font-bold">Reason:</span> {application.rejection_reason}
                                    </p>
                                )}
                                <p className="text-[10px] text-destructive font-medium">
                                    Reviewed by {application.reviewer?.name || 'admin'} on {application.reviewed_formatted}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ApproveKycModal 
                isOpen={approveOpen} 
                onClose={() => setApproveOpen(false)} 
                application={application} 
            />
            <RejectKycModal 
                isOpen={rejectOpen} 
                onClose={() => setRejectOpen(false)} 
                application={application} 
            />
            <DocumentViewer 
                isOpen={viewerDoc !== null} 
                onClose={() => setViewerDoc(null)} 
                doc={viewerDoc} 
            />
        </AdminLayout>
    );
}

function Stat({ label, value }) {
    return (
        <div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
            <p className="text-sm font-bold text-foreground">{value}</p>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value, children }) {
    return (
        <div className="flex items-start gap-2.5">
            <Icon size={14} className="text-muted-foreground mt-0.5 shrink-0" strokeWidth={2} />
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-xs font-bold text-foreground break-words flex items-center flex-wrap">
                    {value}
                    {children}
                </p>
            </div>
        </div>
    );
}

function DocumentRow({ document, onView }) {
    const formattedType = document.document_type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

    const formatSize = (bytes) => {
        if (!bytes) return '—';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        return (bytes / 1024).toFixed(2) + ' KB';
    };

    const isPdf = document.mime_type === 'application/pdf';
    const Icon = isPdf ? FileText : ImageIcon;

    return (
        <button 
            onClick={onView}
            className="w-full flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted transition-colors cursor-pointer text-left group"
        >
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    document.is_sample 
                        ? 'bg-success/15 text-success' 
                        : 'bg-primary/15 text-primary'
                }`}>
                    <Icon size={16} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground">{formattedType}</p>
                    <p className="text-[10px] text-muted-foreground font-medium truncate">
                        {document.file_name} 
                        {document.file_size && ` · ${formatSize(document.file_size)}`}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                    document.is_sample 
                        ? 'bg-success/10 text-success border-success/25'
                        : 'bg-primary/10 text-primary border-primary/25'
                }`}>
                    {document.is_sample ? 'Sample' : 'Uploaded'}
                </span>
                <Eye size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={2.5} />
            </div>
        </button>
    );
}

function StatusBadge({ status }) {
    const styles = {
        pending: { color: 'bg-accent/10 text-accent-foreground border-accent/30', icon: Clock, label: 'PENDING' },
        approved: { color: 'bg-success/10 text-success border-success/25', icon: CheckCircle2, label: 'APPROVED' },
        rejected: { color: 'bg-destructive/10 text-destructive border-destructive/25', icon: XCircle, label: 'REJECTED' },
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${style.color}`}>
            <Icon size={11} strokeWidth={2.5} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{style.label}</span>
        </div>
    );
}