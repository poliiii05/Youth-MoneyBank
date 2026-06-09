// resources/js/Components/Admin/Kyc/ApproveKycModal.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';

export default function ApproveKycModal({ isOpen, onClose, application }) {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleApprove = () => {
        setIsProcessing(true);
        router.post(`/admin/kyc/${application.id}/approve`, {}, {
            onFinish: () => setIsProcessing(false),
            onSuccess: () => onClose(),
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 size={20} className="text-emerald-600" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">Approve Application</h3>
                            <p className="text-[10px] text-slate-500 font-medium">Confirm this action</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        disabled={isProcessing}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                    >
                        <X size={16} className="text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                    <p className="text-sm text-slate-700 leading-relaxed">
                        You are about to approve <strong>{application.user.name}'s</strong> KYC application.
                    </p>

                    <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-3 space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-emerald-800 font-bold">User:</span>
                            <span className="text-emerald-900 font-black">{application.user.name}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-emerald-800 font-bold">Tier Upgrade:</span>
                            <span className="text-emerald-900 font-black">
                                T{application.original_tier} → T{application.target_tier}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-emerald-800 font-bold">Documents:</span>
                            <span className="text-emerald-900 font-black">{application.documents.length} files</span>
                        </div>
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        This will immediately upgrade the user's tier and grant access to higher transaction limits. The user will be notified.
                    </p>
                </div>

                {/* Footer buttons */}
                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition-all shadow-md shadow-emerald-200 cursor-pointer disabled:opacity-60"
                    >
                        {isProcessing ? 'Approving...' : `Approve & Upgrade to T${application.target_tier}`}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}