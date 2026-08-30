// resources/js/Components/Modals/DeallocateFundsModal.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, PiggyBank, Target, AlertCircle, Loader2, Sparkles, ArrowRight, MinusCircle } from 'lucide-react';
import { useModalEnterKey } from '../../Hooks/useModalEnterKey';

const PRESET_AMOUNTS = [10, 50, 100, 500];

export default function DeallocateFundsModal({ isOpen, onClose, goal }) {
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
    const maxAllowable = goal?.current_amount || 0;
    const isAmountValid = numericAmount >= 1 && numericAmount <= maxAllowable;
    const hasErrorUI = errorMsg !== '' || (numericAmount > maxAllowable && numericAmount > 0);

    const handleSubmit = () => {
        if (!isAmountValid || isProcessing) return;

        setIsProcessing(true);
        router.post(`/goals/${goal.id}/deallocate`, { amount: numericAmount }, {
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
        
        if (!rawValue) {
            setAmount('');
            setErrorMsg('');
            return;
        }

        const numValue = Number(rawValue);
        setAmount(numValue.toLocaleString('en-US'));

        if (numValue > maxAllowable) {
            setErrorMsg(`Maximum: ₱${maxAllowable.toLocaleString('en-US')} (current goal balance).`);
        } else {
            setErrorMsg('');
        }
    };

    const handlePreset = (val) => {
        setAmount(val.toLocaleString('en-US'));
        if (val > maxAllowable) {
            setErrorMsg(`Maximum: ₱${maxAllowable.toLocaleString('en-US')} (current goal balance).`);
        } else {
            setErrorMsg('');
        }
    };

    const handleSetMax = () => {
        setAmount(maxAllowable.toLocaleString('en-US'));
        setErrorMsg('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 relative max-h-[90vh] flex flex-col">

                {/* Processing overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center">
                        <div className="relative mb-4">
                            <div className="w-14 h-14 rounded-full bg-amber-100 animate-pulse"></div>
                            <Loader2 className="w-8 h-8 text-amber-700 animate-spin absolute inset-0 m-auto" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-sm font-black text-slate-900">Moving Funds Back</h3>
                    </div>
                )}

                {/* HERO HEADER — amber (caution, removing) */}
                <div className={`relative overflow-hidden px-5 py-5 ${
                    isSuccess 
                        ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700' 
                        : 'bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800'
                }`}>
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
                    
                    <div className="relative flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner shrink-0">
                                <MinusCircle size={18} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-tight">
                                    {isSuccess ? 'Success' : 'Unallocate from'}
                                </p>
                                <h2 className="text-base font-black text-white tracking-tight leading-tight truncate">
                                    {isSuccess ? 'Funds moved back!' : goal.title}
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
                        <h3 className="text-lg font-black text-slate-900 mb-1">Unallocation complete</h3>
                        <p className="text-xs text-slate-500 font-medium mb-5">
                            <span className="font-bold text-slate-800" style={{ fontVariantNumeric: 'tabular-nums' }}>₱{numericAmount.toLocaleString('en-US')}</span> moved back to your savings pool 🎉
                        </p>
                        <button onClick={onClose} className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-200 active:scale-[0.98]">
                            Back to goals
                        </button>
                    </div>
                ) : (
                    <>
                        {/* BODY */}
                        <div className="flex-1 overflow-y-auto px-5 py-5">

                            {/* Flow visualization */}
                            <div className="flex items-center justify-between gap-3 mb-5 p-3 bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-xl border border-slate-200">
                                <div className="flex-1 text-center min-w-0">
                                    <div className="flex items-center justify-center gap-1.5 mb-1">
                                        <div className={`w-3 h-3 rounded ${goal.color_theme}`}></div>
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider truncate">{goal.title}</span>
                                    </div>
                                    <p className="text-sm font-black text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        ₱{goal.current_amount.toLocaleString('en-US')}
                                    </p>
                                </div>
                                <ArrowRight size={16} className="text-amber-600" strokeWidth={2.5} />
                                <div className="flex-1 text-center min-w-0">
                                    <div className="flex items-center justify-center gap-1.5 mb-1">
                                        <PiggyBank size={12} className="text-emerald-700" strokeWidth={2.5} />
                                        <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Savings Pool</span>
                                    </div>
                                    <p className="text-sm font-black text-emerald-700" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        +₱{numericAmount > 0 ? numericAmount.toLocaleString('en-US') : '0'}
                                    </p>
                                </div>
                            </div>

                            {/* Amount input */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount to unallocate</label>
                                    <button
                                        type="button"
                                        onClick={handleSetMax}
                                        className="text-[10px] font-black text-amber-700 hover:text-amber-800 uppercase tracking-widest cursor-pointer active:scale-95 transition-all"
                                    >
                                        Use Max
                                    </button>
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
                                                : 'bg-white border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-50 text-slate-900 placeholder:text-slate-300'
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
                                                            ? 'bg-amber-700 text-white border-amber-700 shadow-md shadow-amber-200 scale-105 cursor-pointer'
                                                            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 hover:text-amber-700 hover:-translate-y-0.5 cursor-pointer'
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
                                        ? 'bg-amber-700 hover:bg-amber-800 text-white shadow-md shadow-amber-200' 
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {isAmountValid ? `Unallocate ₱${numericAmount.toLocaleString('en-US')}` : 'Enter an amount'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}