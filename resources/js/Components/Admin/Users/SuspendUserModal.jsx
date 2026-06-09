// resources/js/Components/Admin/Users/SuspendUserModal.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { Ban, CheckCircle2, X, AlertTriangle } from 'lucide-react';

export default function SuspendUserModal({ isOpen, onClose, targetUser }) {
    const [reason, setReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const isSuspending = !targetUser.is_suspended;

    const handleSubmit = () => {
        setError('');
        if (reason.trim().length < 10) {
            setError('Please provide a detailed reason (min 10 characters).');
            return;
        }

        setIsProcessing(true);
        router.post(`/admin/users/${targetUser.id}/toggle-suspension`, {
            reason: reason.trim(),
        }, {
            onFinish: () => setIsProcessing(false),
            onSuccess: () => {
                onClose();
                setReason('');
            },
            onError: (errors) => setError(errors.reason || 'Failed to update status.'),
        });
    };

    const charsRemaining = 500 - reason.length;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isSuspending ? 'bg-red-100' : 'bg-emerald-100'
                        }`}>
                            {isSuspending 
                                ? <Ban size={20} className="text-red-600" strokeWidth={2.5} />
                                : <CheckCircle2 size={20} className="text-emerald-600" strokeWidth={2.5} />
                            }
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">
                                {isSuspending ? 'Suspend Account' : 'Reactivate Account'}
                            </h3>
                            <p className="text-[10px] text-slate-500 font-medium">
                                {isSuspending ? 'Block user access' : 'Restore user access'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={isProcessing} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-40">
                        <X size={16} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-5 space-y-3">
                    <p className="text-sm text-slate-700">
                        {isSuspending 
                            ? <>Suspend <strong>{targetUser.name}'s</strong> account? They will be logged out and unable to access the app.</>
                            : <>Reactivate <strong>{targetUser.name}'s</strong> account? They will regain full access.</>
                        }
                    </p>

                    <div>
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 block">
                            Reason <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={isSuspending 
                                ? "e.g., Suspicious activity detected, fraud investigation pending..."
                                : "e.g., Investigation completed, user verified..."
                            }
                            rows={3}
                            disabled={isProcessing}
                            maxLength={500}
                            className={`w-full px-3 py-2 text-xs font-medium border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                                error ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-50'
                            }`}
                        />
                        <div className="flex items-center justify-between mt-1">
                            {error ? (
                                <p className="text-[10px] font-bold text-red-600">{error}</p>
                            ) : (
                                <p className="text-[10px] text-slate-500 font-medium">Audit trail logged</p>
                            )}
                            <p className="text-[10px] font-bold text-slate-500">{charsRemaining} left</p>
                        </div>
                    </div>

                    {isSuspending && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertTriangle size={14} className="text-red-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                            <p className="text-[11px] text-red-800 font-medium">
                                User cannot log in until reactivated. All active sessions will be invalidated.
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
                    <button onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isProcessing || reason.trim().length < 10}
                        className={`px-4 py-2 text-white text-xs font-black rounded-lg shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                            isSuspending 
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                        }`}>
                        {isProcessing 
                            ? (isSuspending ? 'Suspending...' : 'Reactivating...') 
                            : (isSuspending ? 'Suspend Account' : 'Reactivate Account')
                        }
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}