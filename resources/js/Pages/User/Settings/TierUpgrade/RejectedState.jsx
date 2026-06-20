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
                <div className="absolute inset-0 bg-red-200 rounded-full blur-xl"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-200">
                    <XCircle size={36} className="text-white" strokeWidth={2.5} />
                </div>
            </div>

            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
                Application Rejected
            </h3>
            <p className="text-sm text-slate-500 font-medium max-w-md mb-6">
                Unfortunately, your Tier {application.target_tier} application was not approved.
            </p>

            {/* Rejection details card */}
            <div className="bg-red-50/40 border border-red-200 rounded-xl p-5 w-full max-w-md mb-5">
                <div className="space-y-3 text-left">
                    <div>
                        <p className="text-[10px] font-bold text-red-800 uppercase tracking-widest mb-1">Reason</p>
                        <p className="text-sm font-semibold text-slate-900">
                            {application.rejection_reason || 'No reason provided.'}
                        </p>
                    </div>
                    <div className="pt-3 border-t border-red-200">
                        <p className="text-[10px] font-bold text-red-800 uppercase tracking-widest mb-1">Reviewed</p>
                        <p className="text-xs font-bold text-slate-700" style={{ fontVariantNumeric: 'tabular-nums' }}>{reviewedDate}</p>
                    </div>
                </div>
            </div>

            {/* Re-apply button — emerald (positive action) */}
            <button
                onClick={onReApply}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md shadow-emerald-200 active:scale-95"
            >
                <RefreshCw size={14} strokeWidth={2.5} />
                Re-apply for Tier {application.target_tier}
            </button>
            <p className="text-[10px] text-slate-400 font-medium mt-3 max-w-xs">
                Address the rejection reason above and submit again with the correct documents.
            </p>
        </div>
    );
}