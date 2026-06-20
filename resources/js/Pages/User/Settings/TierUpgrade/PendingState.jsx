// resources/js/Pages/User/Settings/TierUpgrade/PendingState.jsx
import { Clock, FileCheck } from 'lucide-react';

export default function PendingState({ application }) {
    const submittedDate = application.submitted_at 
        ? new Date(application.submitted_at).toLocaleDateString('en-PH', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : '—';

    const docCount = application.documents?.length || 0;

    return (
        <div className="py-8 flex flex-col items-center text-center">
            {/* Icon — amber (pending state, intentional) */}
            <div className="relative mb-4">
                <div className="absolute inset-0 bg-amber-200 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-200">
                    <Clock size={36} className="text-white" strokeWidth={2.5} />
                </div>
            </div>

            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
                Application Under Review
            </h3>
            <p className="text-sm text-slate-500 font-medium max-w-md mb-6">
                Your Tier {application.target_tier} application has been submitted. We'll notify you once it's reviewed.
            </p>

            {/* Application details card */}
            <div className="bg-amber-50/40 border border-amber-200 rounded-xl p-5 w-full max-w-md">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Submitted</p>
                        <p className="text-xs font-bold text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>{submittedDate}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Target Tier</p>
                        <p className="text-xs font-bold text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>Tier {application.target_tier}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Documents</p>
                        <p className="text-xs font-bold text-slate-900 flex items-center gap-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            <FileCheck size={12} className="text-emerald-700" />
                            {docCount} submitted
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Application ID</p>
                        <p className="text-xs font-mono font-bold text-slate-700" style={{ fontVariantNumeric: 'tabular-nums' }}>#{application.id}</p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-200">
                    <p className="text-[10px] text-amber-800 font-medium leading-relaxed text-left">
                        ⏱️ Reviews typically take 1-3 business days. You'll receive a notification when there's an update.
                    </p>
                </div>
            </div>
        </div>
    );
}