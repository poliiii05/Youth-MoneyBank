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
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isSuspending ? 'bg-destructive/15' : 'bg-success/15'
                        }`}>
                            {isSuspending 
                                ? <Ban size={20} className="text-destructive" strokeWidth={2.5} />
                                : <CheckCircle2 size={20} className="text-success" strokeWidth={2.5} />
                            }
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-foreground">
                                {isSuspending ? 'Suspend Account' : 'Reactivate Account'}
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-medium">
                                {isSuspending ? 'Block user access' : 'Restore user access'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={isProcessing} className="p-1 hover:bg-muted rounded-lg cursor-pointer disabled:opacity-40">
                        <X size={16} className="text-muted-foreground" />
                    </button>
                </div>

                <div className="p-5 space-y-3">
                    <p className="text-sm text-foreground">
                        {isSuspending 
                            ? <>Suspend <strong>{targetUser.name}'s</strong> account? They will be logged out and unable to access the app.</>
                            : <>Reactivate <strong>{targetUser.name}'s</strong> account? They will regain full access.</>
                        }
                    </p>

                    <div>
                        <label className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-1.5 block">
                            Reason <span className="text-destructive">*</span>
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
                                error ? 'border-destructive/40 focus:border-destructive focus:ring-destructive/10' : 'border-border focus:border-primary focus:ring-primary/10'
                            }`}
                        />
                        <div className="flex items-center justify-between mt-1">
                            {error ? (
                                <p className="text-[10px] font-bold text-destructive">{error}</p>
                            ) : (
                                <p className="text-[10px] text-muted-foreground font-medium">Audit trail logged</p>
                            )}
                            <p className="text-[10px] font-bold text-muted-foreground">{charsRemaining} left</p>
                        </div>
                    </div>

                    {isSuspending && (
                        <div className="bg-destructive/10 border border-destructive/25 rounded-lg p-3 flex items-start gap-2">
                            <AlertTriangle size={14} className="text-destructive shrink-0 mt-0.5" strokeWidth={2.5} />
                            <p className="text-[11px] text-destructive font-medium">
                                User cannot log in until reactivated. All active sessions will be invalidated.
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-5 py-4 bg-muted border-t border-border flex gap-2 justify-end">
                    <button onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-xs font-bold text-foreground hover:bg-muted rounded-lg cursor-pointer disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isProcessing || reason.trim().length < 10}
                        className={`px-4 py-2 text-white text-xs font-black rounded-lg shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                            isSuspending 
                                ? 'bg-destructive hover:bg-destructive/90 shadow-destructive/25'
                                : 'bg-success hover:bg-success/90 shadow-success/25'
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