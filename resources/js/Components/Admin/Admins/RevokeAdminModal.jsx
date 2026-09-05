// resources/js/Components/Admin/Admins/RevokeAdminModal.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { Ban, X, AlertTriangle } from 'lucide-react';

export default function RevokeAdminModal({ isOpen, onClose, admin }) {
    const [reason, setReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        setError('');
        if (reason.trim().length < 10) {
            setError('Please provide a detailed reason (min 10 characters).');
            return;
        }

        setIsProcessing(true);
        router.post(`/admin/admins/${admin.id}/revoke`, {
            reason: reason.trim(),
        }, {
            onFinish: () => setIsProcessing(false),
            onSuccess: () => {
                onClose();
                setReason('');
            },
            onError: (errors) => setError(Object.values(errors)[0] || 'Failed to revoke admin role.'),
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-destructive/15 flex items-center justify-center">
                            <Ban size={20} className="text-destructive" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-foreground">Revoke Admin Access</h3>
                            <p className="text-[10px] text-muted-foreground font-medium">{admin.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={isProcessing} className="p-1 hover:bg-muted rounded-lg cursor-pointer disabled:opacity-40">
                        <X size={16} className="text-muted-foreground" />
                    </button>
                </div>

                <div className="p-5 space-y-3">
                    <p className="text-xs text-foreground">
                        Remove <strong>{admin.name}'s</strong> <strong>{admin.role_label}</strong> access? They will become a regular user.
                    </p>

                    {/* Reason */}
                        <div>
                            <label className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-1.5 block">
                                Reason <span className="text-destructive">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g., New hire for customer support team"
                                rows={3}
                                disabled={isProcessing}
                                maxLength={500}
                                className={`w-full px-3 py-2 text-xs font-medium border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                                    error ? 'border-destructive/40 focus:border-destructive focus:ring-destructive/10' : 'border-border focus:border-primary focus:ring-primary/10'
                                }`}
                            />
                            
                                {/* Character counter + validation */}
                                <div className="flex items-center justify-between mt-1">
                                    {error ? (
                                        <p className="text-[10px] font-bold text-destructive">{error}</p>
                                    ) : (
                                        <p className={`text-[10px] font-bold ${
                                            reason.trim().length >= 10 ? 'text-success' : 'text-destructive'
                                        }`}>
                                            {reason.trim().length >= 10 
                                                ? '✓ Minimum reached' 
                                                : `${10 - reason.trim().length} more characters needed`
                                            }
                                        </p>
                                    )}
                                    <p className="text-[10px] font-medium text-muted-foreground">
                                        {reason.length}/500
                                    </p>
                                </div>
                        </div>

                    <div className="bg-destructive/10 border border-destructive/25 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle size={14} className="text-destructive shrink-0 mt-0.5" strokeWidth={2.5} />
                        <p className="text-[11px] text-destructive font-medium">
                            User will lose admin access immediately. Their previous actions remain logged for audit.
                        </p>
                    </div>
                </div>

                <div className="px-5 py-4 bg-muted border-t border-border flex gap-2 justify-end">
                    <button onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-xs font-bold text-foreground hover:bg-muted rounded-lg cursor-pointer disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isProcessing || reason.trim().length < 10}
                        className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-white text-xs font-black rounded-lg shadow-md shadow-destructive/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                        {isProcessing ? 'Revoking...' : 'Revoke Access'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}