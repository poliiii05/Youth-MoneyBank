// resources/js/Components/Admin/Kyc/RejectKycModal.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { XCircle, X, AlertTriangle } from 'lucide-react';

export default function RejectKycModal({ isOpen, onClose, application }) {
    const [reason, setReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleReject = () => {
        setError('');

        if (reason.trim().length < 10) {
            setError('Please provide a more detailed reason (at least 10 characters).');
            return;
        }

        if (reason.length > 500) {
            setError('Reason cannot exceed 500 characters.');
            return;
        }

        setIsProcessing(true);
        router.post(`/admin/kyc/${application.id}/reject`, {
            reason: reason.trim(),
        }, {
            onFinish: () => setIsProcessing(false),
            onSuccess: () => {
                onClose();
                setReason('');
            },
            onError: (errors) => {
                setError(errors.reason || 'Failed to reject. Please try again.');
            },
        });
    };

    const charsRemaining = 500 - reason.length;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle size={20} className="text-red-600" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">Reject Application</h3>
                            <p className="text-[10px] text-slate-500 font-medium">Provide a reason</p>
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
                        Reject <strong>{application.user.name}'s</strong> Tier {application.target_tier} application?
                    </p>

                    <div>
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 block">
                            Rejection Reason <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Documents are unclear, ID information doesn't match account details, missing required documents..."
                            rows={4}
                            disabled={isProcessing}
                            className={`w-full px-3 py-2 text-xs font-medium border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                                error 
                                    ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
                                    : 'border-slate-200 focus:border-blue-400 focus:ring-blue-50'
                            }`}
                            maxLength={500}
                        />
                        <div className="flex items-center justify-between mt-1">
                            {error ? (
                                <p className="text-[10px] font-bold text-red-600">{error}</p>
                            ) : (
                                <p className="text-[10px] text-slate-500 font-medium">Minimum 10 characters</p>
                            )}
                            <p className={`text-[10px] font-bold ${
                                charsRemaining < 50 ? 'text-amber-600' : 'text-slate-500'
                            }`}>
                                {charsRemaining} left
                            </p>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                            The user will see this reason. Please be clear and constructive so they can address the issue and re-apply.
                        </p>
                    </div>
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
                        onClick={handleReject}
                        disabled={isProcessing || reason.trim().length < 10}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-lg transition-all shadow-md shadow-red-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Rejecting...' : 'Reject Application'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}