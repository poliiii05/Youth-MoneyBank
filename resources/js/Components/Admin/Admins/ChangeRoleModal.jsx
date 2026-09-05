// resources/js/Components/Admin/Admins/ChangeRoleModal.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { Edit, X, Crown, ShieldCheck } from 'lucide-react';

export default function ChangeRoleModal({ isOpen, onClose, admin }) {
    const [newRole, setNewRole] = useState(admin.admin_role === 'super_admin' ? 'admin' : 'super_admin');
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
        router.post(`/admin/admins/${admin.id}/change-role`, {
            new_role: newRole,
            reason: reason.trim(),
        }, {
            onFinish: () => setIsProcessing(false),
            onSuccess: () => {
                onClose();
                setReason('');
            },
            onError: (errors) => setError(Object.values(errors)[0] || 'Failed to change role.'),
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                            <Edit size={20} className="text-accent" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-foreground">Change Role</h3>
                            <p className="text-[10px] text-muted-foreground font-medium">{admin.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={isProcessing} className="p-1 hover:bg-muted rounded-lg cursor-pointer disabled:opacity-40">
                        <X size={16} className="text-muted-foreground" />
                    </button>
                </div>

                <div className="p-5 space-y-3">
                    <p className="text-xs text-foreground">
                        Change <strong>{admin.name}'s</strong> role from <strong>{admin.role_label}</strong> to:
                    </p>

                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => setNewRole('admin')}
                            disabled={isProcessing || admin.admin_role === 'admin'}
                            className={`w-full flex items-center gap-3 p-3 border rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left ${
                                newRole === 'admin' ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border hover:border-input'
                            }`}
                        >
                            <ShieldCheck size={16} className="text-primary" strokeWidth={2.5} />
                            <div className="flex-1">
                                <p className="text-xs font-black text-foreground">Admin</p>
                                <p className="text-[10px] text-muted-foreground font-medium">Day-to-day operations</p>
                            </div>
                            {admin.admin_role === 'admin' && <span className="text-[9px] font-bold text-muted-foreground uppercase">Current</span>}
                        </button>
                        <button
                            type="button"
                            onClick={() => setNewRole('super_admin')}
                            disabled={isProcessing || admin.admin_role === 'super_admin'}
                            className={`w-full flex items-center gap-3 p-3 border rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left ${
                                newRole === 'super_admin' ? 'border-amber-400 bg-accent/10 ring-2 ring-amber-100' : 'border-border hover:border-input'
                            }`}
                        >
                            <Crown size={16} className="text-accent" strokeWidth={2.5} />
                            <div className="flex-1">
                                <p className="text-xs font-black text-foreground">Super Admin</p>
                                <p className="text-[10px] text-muted-foreground font-medium">Full access</p>
                            </div>
                            {admin.admin_role === 'super_admin' && <span className="text-[9px] font-bold text-muted-foreground uppercase">Current</span>}
                        </button>
                    </div>

                  
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
                </div>
               

                <div className="px-5 py-4 bg-muted border-t border-border flex gap-2 justify-end">
                    <button onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-xs font-bold text-foreground hover:bg-muted rounded-lg cursor-pointer disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isProcessing || newRole === admin.admin_role || reason.trim().length < 10}
                        className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-xs font-black rounded-lg shadow-md shadow-accent/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                        {isProcessing ? 'Updating...' : 'Change Role'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}