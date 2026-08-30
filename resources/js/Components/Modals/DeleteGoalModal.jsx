// resources/js/Components/Modals/DeleteGoalModal.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, AlertTriangle, Loader2, Sparkles, PiggyBank, ArrowRight, Trash2 } from 'lucide-react';
import { useModalEnterKey } from '../../Hooks/useModalEnterKey';

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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 relative">
                
                {/* Processing overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center">
                        <div className="relative mb-4">
                            <div className="w-14 h-14 rounded-full bg-red-100 animate-pulse"></div>
                            <Loader2 className="w-8 h-8 text-red-600 animate-spin absolute inset-0 m-auto" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-sm font-black text-slate-900">Deleting Goal</h3>
                    </div>
                )}

                {/* HERO HEADER */}
                <div className={`relative overflow-hidden px-5 py-5 ${
                    isSuccess 
                        ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700'
                        : 'bg-gradient-to-br from-red-600 via-red-700 to-red-800'
                }`}>
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
                    
                    <div className="relative flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner shrink-0">
                                {isSuccess ? (
                                    <Sparkles size={18} className="text-white" strokeWidth={2.5} />
                                ) : (
                                    <AlertTriangle size={18} className="text-white" strokeWidth={2.5} />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-tight">
                                    {isSuccess ? 'Success' : 'Warning'}
                                </p>
                                <h2 className="text-base font-black text-white tracking-tight leading-tight truncate">
                                    {isSuccess ? 'Goal deleted!' : 'Delete this goal?'}
                                </h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-sm active:scale-95 shrink-0">
                            <X size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                <div className="max-h-[80vh] overflow-y-auto">
                    {isSuccess ? (
                        <div className="px-5 py-6 flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl animate-pulse"></div>
                                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-300 animate-in zoom-in duration-500">
                                    <Sparkles size={32} className="text-white" strokeWidth={2.5} />
                                </div>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-1">Goal removed</h3>
                            <p className="text-xs text-slate-500 font-medium mb-5">
                                {hasMoneyToReturn 
                                    ? <>₱{goal.current_amount.toLocaleString('en-US')} returned to your savings pool 🎉</> 
                                    : 'The goal has been removed.'
                                }
                            </p>
                            <button onClick={onClose} className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-200 active:scale-[0.98]">
                                Back to goals
                            </button>
                        </div>
                    ) : (
                        <div className="px-5 py-5">
                            <p className="text-sm text-slate-700 font-medium text-center mb-5">
                                You're about to permanently delete <span className="font-bold text-slate-900">'{goal.title}'</span>. This action cannot be undone.
                            </p>

                            {/* Money return notice — emerald accent */}
                            {hasMoneyToReturn && (
                                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-2">What happens to your money</p>
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex-1 text-center">
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <div className={`w-3 h-3 rounded ${goal.color_theme}`}></div>
                                                <span className="text-[9px] font-bold text-slate-500 uppercase truncate">{goal.title}</span>
                                            </div>
                                            <p className="text-xs font-black text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                ₱{goal.current_amount.toLocaleString('en-US')}
                                            </p>
                                        </div>
                                        <ArrowRight size={14} className="text-emerald-500" strokeWidth={2.5} />
                                        <div className="flex-1 text-center">
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <PiggyBank size={12} className="text-emerald-600" strokeWidth={2.5} />
                                                <span className="text-[9px] font-bold text-emerald-600 uppercase">Savings Pool</span>
                                            </div>
                                            <p className="text-xs font-black text-emerald-700" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                +₱{goal.current_amount.toLocaleString('en-US')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Type DELETE input */}
                            <div className="mb-4">
                                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">
                                    Type <span className="font-black text-red-600">DELETE</span> to confirm
                                </label>
                                <input 
                                    type="text" 
                                    value={confirmText} 
                                    onChange={(e) => setConfirmText(e.target.value)} 
                                    placeholder="Type DELETE here" 
                                    autoFocus
                                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-bold outline-none transition-all uppercase tracking-wider ${
                                        canDelete 
                                            ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-4 focus:ring-red-100' 
                                            : 'border-slate-200 bg-white text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-50'
                                    }`} 
                                />
                            </div>

                            {errorMsg && (
                                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-[10px] font-semibold text-red-700">{errorMsg}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button 
                                    onClick={onClose} 
                                    disabled={isProcessing} 
                                    className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl cursor-pointer transition-colors active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDelete} 
                                    disabled={!canDelete || isProcessing}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-black rounded-xl transition-all active:scale-[0.98] ${
                                        canDelete && !isProcessing 
                                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 cursor-pointer' 
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
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