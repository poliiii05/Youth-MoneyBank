// resources/js/Components/Admin/Transactions/ManualCreditModal.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { Banknote, X, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ManualCreditModal({ isOpen, onClose, transaction }) {
    const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
    const [correctionProof, setCorrectionProof] = useState('');
    const [notes, setNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        setError('');
        
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (correctionProof.trim().length < 5) {
            setError('Payment proof reference is required (min 5 characters).');
            return;
        }
        if (notes.trim().length < 20) {
            setError('Please provide detailed notes (min 20 characters).');
            return;
        }

        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        const fromCs = params.get('from') === 'cs';

        setIsProcessing(true);
        router.post(`/admin/transactions/${transaction.id}/manual-credit`, {
            amount: amountNum,
            correction_proof: correctionProof.trim(),
            notes: notes.trim(),
            from: fromCs ? 'cs' : null,
        }, {
            onFinish: () => setIsProcessing(false),
            onSuccess: () => {
                onClose();
                setAmount('');
                setCorrectionProof('');
                setNotes('');
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                setError(firstError || 'Failed to apply manual credit.');
            },
        });
    };

    const formatPeso = (amt) => '₱' + Number(amt).toLocaleString('en-PH', { 
        minimumFractionDigits: 2, maximumFractionDigits: 2 
    });

    const charsRemaining = 1000 - notes.length;
    const isValid = amount && parseFloat(amount) > 0 && correctionProof.trim().length >= 5 && notes.trim().length >= 20;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Banknote size={20} className="text-emerald-600" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">Manual Credit</h3>
                            <p className="text-[10px] text-slate-500 font-medium">Add funds to user's wallet</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={isProcessing} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-40">
                        <X size={16} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-5 space-y-3 overflow-y-auto">
                    {/* Transaction summary */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-2">Original Failed Transaction</p>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-700 font-bold">Reference:</span>
                                <span className="text-slate-900 font-black">#{transaction.public_reference_id || transaction.id}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-700 font-bold">User:</span>
                                <span className="text-slate-900 font-black">{transaction.user.name}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-700 font-bold">Original Amount:</span>
                                <span className="text-red-700 font-black">{formatPeso(transaction.amount)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-700 font-bold">Status:</span>
                                <span className="text-slate-900 font-black uppercase">{transaction.status}</span>
                            </div>
                        </div>
                    </div>

                   {/* Amount */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 block">
                                Credit Amount (₱) <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                disabled={isProcessing}
                                className="w-full px-3 py-2 text-sm font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
                            />
                        </div>

                        {/* Proof */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 block">
                                Payment Proof <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={correctionProof}
                                onChange={(e) => setCorrectionProof(e.target.value)}
                                placeholder="e.g., PayPal Charge ID PAY-12345"
                                disabled={isProcessing}
                                maxLength={255}
                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 block">
                                Resolution Notes <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="What action did you take to resolve this?"
                                rows={3}
                                disabled={isProcessing}
                                maxLength={1000}
                                className={`w-full px-3 py-2 text-xs font-medium border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                                    error ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-50'
                                }`}
                            />
                            {error && (
                                <p className="text-[10px] font-bold text-red-600 mt-1">{error}</p>
                            )}
                        </div>
                    </div>

                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end shrink-0">
                    <button onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isProcessing || !isValid}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg shadow-md shadow-emerald-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                        {isProcessing ? 'Processing...' : `Credit ${formatPeso(amount || 0)}`}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}