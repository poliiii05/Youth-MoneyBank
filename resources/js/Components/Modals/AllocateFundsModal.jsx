// resources/js/Components/Modals/AllocateFundsModal.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, PiggyBank, Target, AlertCircle, Loader2, Sparkles, ArrowRight, PlusCircle } from 'lucide-react';
import { useModalEnterKey } from '../../Hooks/useModalEnterKey';

const PRESET_AMOUNTS = [50, 100, 200, 500];

export default function AllocateFundsModal({ isOpen, onClose, goal, savingsPoolBalance = 0 }) {
    const [amount, setAmount] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setErrorMsg('');
            setIsProcessing(false);
            setIsSuccess(false);
        }
    }, [isOpen, goal?.id]);

    const numericAmount = Number(amount.replace(/,/g, '')) || 0;
    const remainingToTarget = goal ? goal.target_amount - goal.current_amount : 0;
    const maxAllowable = Math.min(savingsPoolBalance, remainingToTarget);
    const isAmountValid = numericAmount >= 1 && numericAmount <= maxAllowable;

    const hasInsufficientBalance = numericAmount > savingsPoolBalance && numericAmount > 0;
    const exceedsTarget = numericAmount > remainingToTarget && numericAmount > 0;
    const hasErrorUI = errorMsg !== '' || hasInsufficientBalance || exceedsTarget;
    const isGoalFull = remainingToTarget <= 0;

    const handleSubmit = () => {
        if (!isAmountValid || isProcessing) return;
        setIsProcessing(true);
        router.post(`/goals/${goal.id}/allocate`, { amount: numericAmount }, {
            preserveScroll: true,
            onSuccess: () => { setIsProcessing(false); setIsSuccess(true); },
            onError: (errors) => {
                setIsProcessing(false);
                setErrorMsg(errors.amount || 'An error occurred. Please try again.');
            }
        });
    };

    useModalEnterKey({
        isOpen,
        isSuccess,
        canSubmit: isAmountValid,
        isProcessing,
        onSuccess: onClose,
        onSubmit: handleSubmit,
    });

    if (!isOpen || !goal) return null;

    const handleAmountChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        if (!rawValue) { setAmount(''); setErrorMsg(''); return; }
        const numValue = Number(rawValue);
        setAmount(numValue.toLocaleString('en-US'));
        if (numValue > savingsPoolBalance) {
            setErrorMsg(`Insufficient savings. You have ₱${savingsPoolBalance.toLocaleString('en-US')} in your pool.`);
        } else if (numValue > remainingToTarget) {
            setErrorMsg(`Exceeds goal target. Maximum: ₱${remainingToTarget.toLocaleString('en-US')}.`);
        } else {
            setErrorMsg('');
        }
    };

    const handlePreset = (val) => {
        setAmount(val.toLocaleString('en-US'));
        if (val > savingsPoolBalance) {
            setErrorMsg(`Insufficient savings. You have ₱${savingsPoolBalance.toLocaleString('en-US')} in your pool.`);
        } else if (val > remainingToTarget) {
            setErrorMsg(`Exceeds goal target. Maximum: ₱${remainingToTarget.toLocaleString('en-US')}.`);
        } else {
            setErrorMsg('');
        }
    };

    const goalProgress = (goal.current_amount / goal.target_amount) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 relative max-h-[90vh] flex flex-col">
                
                {/* Processing overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center">
                        <div className="relative mb-4">
                            <div className="w-14 h-14 rounded-full bg-emerald-100 animate-pulse"></div>
                            <Loader2 className="w-8 h-8 text-emerald-700 animate-spin absolute inset-0 m-auto" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-sm font-black text-slate-900">Allocating Funds</h3>
                    </div>
                )}

                {/* HERO HEADER */}
                <div className={`relative overflow-hidden px-5 py-5 ${
                    isSuccess 
                        ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700' 
                        : 'bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900'
                }`}>
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-300/20 rounded-full blur-xl"></div>
                    
                    <div className="relative flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner shrink-0">
                                <PlusCircle size={18} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-tight">
                                    {isSuccess ? 'Success' : 'Add funds to'}
                                </p>
                                <h2 className="text-base font-black text-white tracking-tight leading-tight truncate">
                                    {isSuccess ? 'Funds allocated!' : goal.title}
                                </h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-sm active:scale-95 shrink-0">
                            <X size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {isSuccess ? (
                    <div className="px-5 py-6 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl animate-pulse"></div>
                            <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-300 animate-in zoom-in duration-500">
                                <Sparkles size={32} className="text-white" strokeWidth={2.5} />
                            </div>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-1">Allocation complete!</h3>
                        <p className="text-xs text-slate-500 font-medium mb-5">
                            <span className="font-bold text-slate-800" style={{ fontVariantNumeric: 'tabular-nums' }}>₱{numericAmount.toLocaleString('en-US')}</span> added to '{goal.title}' 🎯
                        </p>
                        <button onClick={onClose} className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-200 active:scale-[0.98]">
                            Back to goals
                        </button>
                    </div>
                ) : isGoalFull ? (
                    <div className="px-5 py-8 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl animate-pulse"></div>
                            <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-300">
                                <Sparkles size={32} className="text-white" strokeWidth={2.5} />
                            </div>
                        </div>
                        <h3 className="text-base font-black text-slate-900 mb-1">Goal already reached!</h3>
                        <p className="text-xs text-slate-500 font-medium mb-5">This goal is fully funded 🎉</p>
                        <button onClick={onClose} className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-200 active:scale-[0.98]">
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        {/* BODY */}
                        <div className="flex-1 overflow-y-auto px-5 py-5">
                            
                            {/* Goal status card */}
                            <div className="mb-4 p-3 bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${goal.color_theme}`}>
                                            <Target size={14} strokeWidth={2.5} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-900 truncate">{goal.title}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-700 shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {goalProgress.toFixed(0)}% done
                                    </span>
                                </div>
                                <div className="w-full bg-white rounded-full h-1.5 overflow-hidden mb-2">
                                    <div className={`h-full ${goal.color_theme} rounded-full transition-all duration-700`} style={{ width: `${Math.min(goalProgress, 100)}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    <span>Saved: <span className="font-bold text-slate-700">₱{goal.current_amount.toLocaleString('en-US')}</span></span>
                                    <span>Target: <span className="font-bold text-slate-700">₱{goal.target_amount.toLocaleString('en-US')}</span></span>
                                </div>
                            </div>

                            {/* Savings pool indicator */}
                            <div className="mb-4 flex items-center justify-between px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <PiggyBank size={14} className="text-emerald-700" strokeWidth={2.5} />
                                    <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">From Savings Pool</span>
                                </div>
                                <span className="text-xs font-black text-emerald-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    ₱{savingsPoolBalance.toLocaleString('en-US')}
                                </span>
                            </div>

                            {/* Amount input */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount to allocate</label>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Max: <span className={hasErrorUI ? 'text-red-600' : 'text-emerald-700'} style={{ fontVariantNumeric: 'tabular-nums' }}>₱{maxAllowable.toLocaleString('en-US')}</span>
                                    </span>
                                </div>
                                <div className="relative">
                                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl pointer-events-none select-none ${hasErrorUI ? 'text-red-400' : 'text-slate-300'}`}>₱</span>
                                    <input 
                                        type="text" 
                                        inputMode="numeric" 
                                        value={amount} 
                                        onChange={handleAmountChange} 
                                        placeholder="Enter amount" 
                                        autoFocus
                                        style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
                                        className={`w-full pl-11 pr-3 py-3.5 border-2 rounded-xl text-xl font-black outline-none transition-all ${
                                            hasErrorUI 
                                                ? 'bg-red-50/30 border-red-300 focus:ring-4 focus:ring-red-100 text-red-900' 
                                                : 'bg-white border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 text-slate-900 placeholder:text-slate-300'
                                        }`} 
                                    />
                                </div>
                                <div className={`min-h-[18px] mt-1.5 transition-all duration-300 ${hasErrorUI ? 'opacity-100' : 'opacity-0'}`}>
                                    {hasErrorUI && (
                                        <p className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                                            <AlertCircle size={11} strokeWidth={2.5} /> {errorMsg}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Quick amounts */}
                            <div className="mb-4">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Quick amounts</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {PRESET_AMOUNTS.map((preset) => {
                                        const isDisabled = preset > maxAllowable;
                                        const isSelected = numericAmount === preset;
                                        return (
                                            <button 
                                                key={preset} 
                                                type="button" 
                                                onClick={() => handlePreset(preset)} 
                                                disabled={isDisabled}
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                                className={`py-2.5 rounded-xl text-xs font-black border-2 transition-all duration-150 active:scale-95 ${
                                                    isDisabled 
                                                        ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' 
                                                        : isSelected
                                                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-200 scale-105 cursor-pointer'
                                                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-emerald-700 hover:-translate-y-0.5 cursor-pointer'
                                                }`}
                                            >
                                                ₱{preset}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="border-t border-slate-200 px-5 py-3 flex items-center gap-3 flex-shrink-0 bg-slate-50/50">
                            <button onClick={onClose} className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer active:scale-95">
                                Cancel
                            </button>
                            <button 
                                onClick={handleSubmit} 
                                disabled={!isAmountValid || isProcessing}
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer active:scale-[0.98] ${
                                    isAmountValid && !isProcessing 
                                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-200' 
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {isAmountValid ? `Allocate ₱${numericAmount.toLocaleString('en-US')}` : 'Enter an amount'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}