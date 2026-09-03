// resources/js/Components/Admin/Transactions/ResolveTransactionModal.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { ClipboardCheck, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ResolveTransactionModal({ isOpen, onClose, transaction }) {
    const [resolutionType, setResolutionType] = useState('verified');
    const [notes, setNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        setError('');
        if (notes.trim().length < 10) {
            setError('Please provide detailed notes (min 10 characters).');
            return;
        }

        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        const fromCs = params.get('from') === 'cs';

        setIsProcessing(true);
        router.post(`/admin/transactions/${transaction.id}/resolve`, {
            resolution_type: resolutionType,
            notes: notes.trim(),
            from: fromCs ? 'cs' : null,
        }, {
                    onFinish: () => setIsProcessing(false),
            onSuccess: () => {
                onClose();
                setNotes('');
                setResolutionType('verified');
            },
            onError: (errors) => setError(errors.notes || errors.resolution_type || 'Failed to resolve.'),
        });
    };

    const resolutionOptions = [
        { id: 'verified', label: 'Verified', description: 'Transaction confirmed legitimate', color: 'emerald' },
        { id: 'refunded', label: 'Refunded', description: 'Money returned to user', color: 'amber' },
        { id: 'reprocessed', label: 'Reprocessed', description: 'Transaction retried successfully', color: 'blue' },
        { id: 'cancelled', label: 'Cancelled', description: 'Transaction voided', color: 'red' },
        { id: 'no_action', label: 'No Action', description: 'No action needed', color: 'slate' },
    ];

    const charsRemaining = 1000 - notes.length;
    const formatPeso = (amount) => '₱' + Number(amount).toLocaleString('en-PH', { 
        minimumFractionDigits: 2, maximumFractionDigits: 2 
    });

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                            <ClipboardCheck size={20} className="text-primary" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-foreground">Resolve Transaction</h3>
                            <p className="text-[10px] text-muted-foreground font-medium">Customer service action</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={isProcessing} className="p-1 hover:bg-muted rounded-lg cursor-pointer disabled:opacity-40">
                        <X size={16} className="text-muted-foreground" />
                    </button>
                </div>

                <div className="p-5 space-y-3 overflow-y-auto">
                    {/* Transaction summary */}
                    <div className="bg-muted border border-border rounded-lg p-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-foreground font-bold">Reference:</span>
                            <span className="text-foreground font-black">#{transaction.public_reference_id || transaction.id}</span>
                        </div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-foreground font-bold">User:</span>
                            <span className="text-foreground font-black">{transaction.user.name}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-foreground font-bold">Amount:</span>
                            <span className={`font-black ${transaction.is_positive ? 'text-success' : 'text-destructive'}`}>
                                {transaction.is_positive ? '+' : '-'}{formatPeso(transaction.amount)}
                            </span>
                        </div>
                    </div>

                    {/* Resolution Type */}
                    <div>
                        <label className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-2 block">
                            Resolution Type <span className="text-destructive">*</span>
                        </label>
                        <div className="space-y-1.5">
                            {resolutionOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setResolutionType(opt.id)}
                                    disabled={isProcessing}
                                    className={`w-full flex items-center justify-between p-2.5 border rounded-lg transition-all cursor-pointer text-left ${
                                        resolutionType === opt.id
                                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                            : 'border-border hover:border-input'
                                    }`}
                                >
                                    <div>
                                        <p className="text-xs font-black text-foreground">{opt.label}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium">{opt.description}</p>
                                    </div>
                                    {resolutionType === opt.id && (
                                        <CheckCircle2 size={14} className="text-primary shrink-0" strokeWidth={2.5} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-1.5 block">
                            Resolution Notes <span className="text-destructive">*</span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Contacted PayPal support — confirmed charge was successful but webhook failed. Manually credited user's wallet ₱500. User notified via email."
                            rows={4}
                            disabled={isProcessing}
                            maxLength={1000}
                            className={`w-full px-3 py-2 text-xs font-medium border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                                error ? 'border-red-300 focus:border-destructive focus:ring-destructive/10' : 'border-border focus:border-primary focus:ring-primary/10'
                            }`}
                        />
                       <div className="flex items-center justify-between mt-1">
                            {error ? (
                                <p className="text-[10px] font-bold text-destructive">{error}</p>
                            ) : (
                                <p className={`text-[10px] font-bold ${
                                    notes.trim().length >= 10 ? 'text-success' : 'text-destructive'
                                }`}>
                                    {notes.trim().length >= 10 
                                        ? '✓ Minimum reached' 
                                        : `${10 - notes.trim().length} more characters needed`
                                    }
                                </p>
                            )}
                            <p className="text-[10px] font-medium text-muted-foreground">
                                {notes.length}/1000
                            </p>
                        </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/25 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle size={14} className="text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                        <p className="text-[11px] text-primary font-medium">
                            Be specific about what action was taken. This serves as official record for compliance.
                        </p>
                    </div>
                </div>

                <div className="px-5 py-4 bg-muted border-t border-border flex gap-2 justify-end shrink-0">
                    <button onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-xs font-bold text-foreground hover:bg-muted rounded-lg cursor-pointer disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isProcessing || notes.trim().length < 10}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-black rounded-lg shadow-md shadow-primary/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                        {isProcessing ? 'Resolving...' : 'Resolve Transaction'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}