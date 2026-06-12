// resources/js/Components/Admin/Transactions/FlagTransactionModal.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { Flag, X, AlertTriangle } from 'lucide-react';

export default function FlagTransactionModal({ isOpen, onClose, transaction }) {
    const [reason, setReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const isUnflag = transaction.is_flagged;

    const handleSubmit = () => {
        setError('');
        if (reason.trim().length < 10) {
            setError('Please provide a detailed reason (min 10 characters).');
            return;
        }

        setIsProcessing(true);
        router.post(`/admin/transactions/${transaction.id}/flag`, {
            reason: reason.trim(),
        }, {
            onFinish: () => setIsProcessing(false),
            onSuccess: () => {
                onClose();
                setReason('');
            },
            onError: (errors) => setError(errors.reason || 'Failed to update flag.'),
        });
    };

    const charsRemaining = 500 - reason.length;
    const formatPeso = (amount) => '₱' + Number(amount).toLocaleString('en-PH', { 
        minimumFractionDigits: 2, maximumFractionDigits: 2 
    });

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isUnflag ? 'bg-emerald-100' : 'bg-red-100'
                        }`}>
                            <Flag size={20} className={isUnflag ? 'text-emerald-600' : 'text-red-600'} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">
                                {isUnflag ? 'Remove Flag' : 'Flag Transaction'}
                            </h3>
                            <p className="text-[10px] text-slate-500 font-medium">
                                {isUnflag ? 'Mark as clean' : 'Mark for review'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={isProcessing} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-40">
                        <X size={16} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-5 space-y-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-700 font-bold">Transaction:</span>
                            <span className="text-slate-900 font-black">#{transaction.public_reference_id || transaction.id}</span>
                        </div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-700 font-bold">User:</span>
                            <span className="text-slate-900 font-black">{transaction.user.name}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-700 font-bold">Amount:</span>
                            <span className={`font-black ${transaction.is_positive ? 'text-emerald-700' : 'text-red-700'}`}>
                                {transaction.is_positive ? '+' : '-'}{formatPeso(transaction.amount)}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 block">
                            Reason <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={isUnflag 
                                ? "e.g., Investigation completed, transaction verified as legitimate..."
                                : "e.g., Unusual amount for tier level, suspicious timing pattern, potential fraud..."
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
                                <p className={`text-[10px] font-bold ${
                                    reason.trim().length >= 10 ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                    {reason.trim().length >= 10 
                                        ? '✓ Minimum reached' 
                                        : `${10 - reason.trim().length} more characters needed`
                                    }
                                </p>
                            )}
                            <p className="text-[10px] font-medium text-slate-400">
                                {reason.length}/500
                            </p>
                        </div>
                    </div>

                    <div className={`border rounded-lg p-3 flex items-start gap-2 ${
                        isUnflag ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                    }`}>
                        <AlertTriangle size={14} className={`shrink-0 mt-0.5 ${
                            isUnflag ? 'text-emerald-600' : 'text-amber-600'
                        }`} strokeWidth={2.5} />
                        <p className={`text-[11px] font-medium ${
                            isUnflag ? 'text-emerald-800' : 'text-amber-800'
                        }`}>
                            {isUnflag 
                                ? 'Confirm the transaction has been verified. The flag will be removed but the audit log remains.'
                                : 'Flagging marks this for compliance review. The user is not notified, and the transaction is not reversed.'
                            }
                        </p>
                    </div>
                </div>

                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
                    <button onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isProcessing || reason.trim().length < 10}
                        className={`px-4 py-2 text-white text-xs font-black rounded-lg shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                            isUnflag 
                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                                : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                        }`}>
                        {isProcessing 
                            ? (isUnflag ? 'Removing...' : 'Flagging...') 
                            : (isUnflag ? 'Remove Flag' : 'Flag Transaction')
                        }
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}