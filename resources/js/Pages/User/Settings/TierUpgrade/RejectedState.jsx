// resources/js/Pages/User/Settings/TierUpgrade/RejectedState.jsx
import { XCircle, RefreshCw } from 'lucide-react';

export default function RejectedState({ application, onReApply }) {
    const reviewedDate = application.reviewed_at 
        ? new Date(application.reviewed_at).toLocaleDateString('en-PH', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        })
        : '—';

    return (
        <div className="py-8 flex flex-col items-center text-center">
            {/* Icon — red (rejection, intentional) */}
            <div className="relative mb-4">
                <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-destructive to-destructive rounded-full flex items-center justify-center shadow-lg shadow-destructive/25">
                    <XCircle size={36} className="text-white" strokeWidth={2.5} />
                </div>
            </div>

            <h3 className="text-lg font-black text-foreground tracking-tight mb-1">
                Application Rejected
            </h3>
            <p className="text-sm text-muted-foreground font-medium max-w-md mb-6">
                Unfortunately, your Tier {application.target_tier} application was not approved.
            </p>

            {/* Rejection details card */}
            <div className="bg-destructive/5/40 border border-destructive/25 rounded-xl p-5 w-full max-w-md mb-5">
                <div className="space-y-3 text-left">
                    <div>
                        <p className="text-[10px] font-bold text-destructive uppercase tracking-widest mb-1">Reason</p>
                        <p className="text-sm font-semibold text-foreground">
                            {application.rejection_reason || 'No reason provided.'}
                        </p>
                    </div>
                    <div className="pt-3 border-t border-destructive/25">
                        <p className="text-[10px] font-bold text-destructive uppercase tracking-widest mb-1">Reviewed</p>
                        <p className="text-xs font-bold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{reviewedDate}</p>
                    </div>
                </div>
            </div>

            {/* Re-apply button — emerald (positive action) */}
            <button
                onClick={onReApply}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md shadow-primary/20 active:scale-95"
            >
                <RefreshCw size={14} strokeWidth={2.5} />
                Re-apply for Tier {application.target_tier}
            </button>
            <p className="text-[10px] text-muted-foreground font-medium mt-3 max-w-xs">
                Address the rejection reason above and submit again with the correct documents.
            </p>
        </div>
    );
}