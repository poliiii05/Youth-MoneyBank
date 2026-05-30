// resources/js/Components/Modals/DeleteGoalModal.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, AlertTriangle, Loader2, Sparkles, PiggyBank, ArrowRight, Trash2 } from 'lucide-react';
import { useModalEnterKey } from '../../hooks/useModalEnterKey';

export default function DeleteGoalModal({ isOpen, onClose, goal }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [confirmText, setConfirmText] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setIsProcessing(false);
            setIsSuccess(false);
            setErrorMsg('');
            setConfirmText('');
        }
    }, [isOpen, goal?.id]);

    const hasMoneyToReturn = goal?.current_amount > 0;
    const canDelete = confirmText.trim().toUpperCase() === 'DELETE';

    const handleDelete = () => {
        if (!canDelete || isProcessing) return;
        setIsProcessing(true);
        setErrorMsg('');
        router.post(`/goals/${goal.id}/delete`, {}, {
            preserveScroll: true,
            onSuccess: () => { setIsProcessing(false); setIsSuccess(true); },
            onError: (errors) => {
                setIsProcessing(false);
                setErrorMsg(errors.goal || 'Failed to delete goal. Please try again.');
            }
        });
    };

    useModalEnterKey({
        isOpen,
        isSuccess,
        canSubmit: canDelete,
        isProcessing,
        onSuccess: onClose,
        onSubmit: handleDelete,
    });

    if (!isOpen || !goal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 relative">
                {isProcessing && (
                    <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-3" strokeWidth={2.5} />
                        <h3 className="text-sm font-bold text-slate-900">Deleting Goal</h3>
                    </div>
                )}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                    <div className="w-7 h-7" />
                    <h2 className="text-[13px] font-bold text-slate-900">{isSuccess ? 'Goal deleted' : 'Delete goal'}</h2>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"><X size={14} /></button>
                </div>
                <div className="max-h-[80vh] overflow-y-auto">
                    {isSuccess ? (
                        <div className="px-5 py-6 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                <Sparkles size={24} className="text-emerald-500" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1">Goal deleted!</h3>
                            <p className="text-[11px] text-slate-500 mb-4">
                                {hasMoneyToReturn ? `₱${goal.current_amount.toLocaleString('en-US')} returned to your savings pool.` : 'The goal has been removed.'}
                            </p>
                            <button onClick={onClose} className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg cursor-pointer">Back to goals</button>
                        </div>
                    ) : (
                        <div className="px-5 py-5">
                            <div className="flex flex-col items-center text-center mb-4">
                                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-3">
                                    <AlertTriangle size={28} className="text-red-500" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1">Delete this goal?</h3>
                                <p className="text-[11px] text-slate-500 max-w-xs">
                                    You're about to permanently delete <span className="font-bold text-slate-800">'{goal.title}'</span>. This action cannot be undone.
                                </p>
                            </div>
                            {hasMoneyToReturn && (
                                <div className="mb-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                                    <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest mb-2">What will happen to your money</p>
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <div className="flex-1 text-center">
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <div className={`w-3 h-3 rounded ${goal.color_theme}`}></div>
                                                <span className="text-[9px] font-bold text-slate-500 uppercase truncate">{goal.title}</span>
                                            </div>
                                            <p className="text-xs font-black text-slate-900">₱{goal.current_amount.toLocaleString('en-US')}</p>
                                        </div>
                                        <ArrowRight size={14} className="text-slate-400" />
                                        <div className="flex-1 text-center">
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <PiggyBank size={12} className="text-emerald-600" />
                                                <span className="text-[9px] font-bold text-slate-500 uppercase">Savings Pool</span>
                                            </div>
                                            <p className="text-xs font-black text-emerald-700">+₱{goal.current_amount.toLocaleString('en-US')}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="mb-4">
                                <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">
                                    Type <span className="font-black text-red-600">DELETE</span> to confirm
                                </label>
                                <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Type DELETE here" autoFocus
                                    className={`w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none transition-all uppercase tracking-wider ${canDelete ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-4 focus:ring-red-100' : 'border-slate-200 bg-white text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-50'}`} />
                            </div>
                            {errorMsg && (
                                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-[10px] font-semibold text-red-700">{errorMsg}</p>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button onClick={onClose} disabled={isProcessing} className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer">Cancel</button>
                                <button onClick={handleDelete} disabled={!canDelete || isProcessing}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${canDelete && !isProcessing ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                                    <Trash2 size={14} strokeWidth={2.5} /> Delete Goal
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}