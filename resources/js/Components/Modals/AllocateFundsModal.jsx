
// resources/js/Components/Modals/AllocateFundsModal.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, PiggyBank, Wallet, Target, AlertCircle, Loader2, Sparkles } from 'lucide-react';

const PRESET_AMOUNTS = [50, 100, 200, 500];

export default function AllocateFundsModal({ isOpen, onClose, goal, savingsPoolBalance = 0 }) {
    const [amount, setAmount] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Reset state when modal opens/closes or goal changes
    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setErrorMsg('');
            setIsProcessing(false);
            setIsSuccess(false);
        }
    }, [isOpen, goal?.id]);

    if (!isOpen || !goal) return null;

    // Computations
    const numericAmount = Number(amount.replace(/,/g, '')) || 0;
    const remainingToTarget = goal.target_amount - goal.current_amount;
    const maxAllowable = Math.min(savingsPoolBalance, remainingToTarget);
    const isAmountValid = numericAmount >= 1 && numericAmount <= maxAllowable;
    
    // Determine error state
    const hasInsufficientBalance = numericAmount > mainBalance && numericAmount > 0;
    const exceedsTarget = numericAmount > remainingToTarget && numericAmount > 0;
    const hasErrorUI = errorMsg !== '' || hasInsufficientBalance || exceedsTarget;

    const handleAmountChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        
        if (!rawValue) {
            setAmount('');
            setErrorMsg('');
            return;
        }

        const numValue = Number(rawValue);
        setAmount(numValue.toLocaleString('en-US'));

        // Show validation message
        if (numValue > savingsPoolBalance) {
            setErrorMsg(`Insufficient savings. You have ₱${savingsPoolBalance.toLocaleString('en-US')} in your pool.`);
        } else if (numValue > remainingToTarget) {
            setErrorMsg(`Exceeds goal target. Maximum: ₱${remainingToTarget.toLocaleString('en-US')}.`);
        } else {
            setErrorMsg('');
        }
    };

    const handlePreset = (val) => {
        if (val > maxAllowable) {
            setAmount(val.toLocaleString('en-US'));
            if (val > savingsPoolBalance) {
                setErrorMsg(`Insufficient savings. You have ₱${savingsPoolBalance.toLocaleString('en-US')} in your pool.`);
            } else {
                setErrorMsg(`Exceeds goal target. Maximum: ₱${remainingToTarget.toLocaleString('en-US')}.`);
            }
            return;
        }
        setAmount(val.toLocaleString('en-US'));
        setErrorMsg('');
    };

    const handleSubmit = () => {
        if (!isAmountValid || isProcessing) return;

        setIsProcessing(true);
        router.post(`/goals/${goal.id}/allocate`, {
            amount: numericAmount,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsProcessing(false);
                setIsSuccess(true);
            },
            onError: (errors) => {
                setIsProcessing(false);
                if (errors.amount) {
                    setErrorMsg(errors.amount);
                } else {
                    setErrorMsg('An error occurred. Please try again.');
                }
            }
        });
    };

    // Goal is full
    const isGoalFull = remainingToTarget <= 0;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 relative">
                {/* LOADING OVERLAY */}
                {isProcessing && (
                    <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" strokeWidth={2.5} />
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">Allocating Funds</h3>
                        <p className="text-[10px] font-medium text-slate-500 text-center px-6">
                            Securing your savings towards your goal.
                        </p>
                    </div>
                )}

                {/* HEADER */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                    <div className="w-7 h-7" />
                    <h2 className="text-[13px] font-bold text-slate-900 tracking-tight">
                        {isSuccess ? 'Allocation complete' : 'Add funds to goal'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                    >
                        <X size={14} />
                    </button>
                </div>

                <div className="max-h-[80vh] overflow-y-auto">
                    
                    {/* SUCCESS STATE */}
                    {isSuccess ? (
                        <div className="px-5 py-6 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                <Sparkles size={24} className="text-emerald-500" strokeWidth={2} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1 tracking-tight">
                                Funds allocated!
                            </h3>
                            <p className="text-[11px] text-slate-500 mb-4">
                                <span className="font-bold text-slate-800">₱{numericAmount.toLocaleString('en-US')}</span> added to your '{goal.title}' goal.
                            </p>

                            <button
                                onClick={onClose}
                                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                                Back to goals
                            </button>
                        </div>
                    ) : (
                        /* INPUT STATE */
                        <div className="px-5 py-5">

                            {/* Goal info card */}
                            <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${goal.color_theme}`}>
                                            <Target size={14} strokeWidth={2.5} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-900">{goal.title}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500">
                                        {((goal.current_amount / goal.target_amount) * 100).toFixed(0)}% done
                                    </span>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                                    <span>Saved: <span className="font-bold text-slate-700">₱{goal.current_amount.toLocaleString('en-US')}</span></span>
                                    <span>Target: <span className="font-bold text-slate-700">₱{goal.target_amount.toLocaleString('en-US')}</span></span>
                                </div>
                            </div>

                            {/* Wallet balance display */}
                               <div className="mb-4 flex items-center justify-between px-3 py-2 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <PiggyBank size={14} className="text-emerald-600" />
                                        <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">From Savings Pool</span>
                                    </div>
                                    <span className="text-xs font-black text-emerald-900">
                                        ₱{savingsPoolBalance.toLocaleString('en-US')}
                                    </span>
                                </div>

                            {isGoalFull ? (
                                /* GOAL IS FULL */
                                <div className="text-center py-6">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3 mx-auto">
                                        <Sparkles size={24} className="text-emerald-500" strokeWidth={2} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 mb-1">Goal already reached!</p>
                                    <p className="text-[10px] text-slate-500 font-medium">
                                        This goal is at 100%. Congratulations!
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Amount input */}
                                    <div className="mb-2">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                Amount to allocate
                                            </label>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                Max: <span className={`${hasErrorUI ? 'text-red-500' : 'text-emerald-600'}`}>₱{maxAllowable.toLocaleString('en-US')}</span>
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-sm pointer-events-none select-none ${hasErrorUI ? 'text-red-400' : 'text-slate-400'}`}>
                                                ₱
                                            </span>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={amount}
                                                onChange={handleAmountChange}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && isAmountValid && !isProcessing) {
                                                        e.preventDefault();
                                                        handleSubmit();
                                                    }
                                                }}
                                                placeholder="Min. 1"
                                                className={`w-full pl-7 pr-3 py-2 border rounded-xl text-base font-semibold outline-none transition-all
                                                    ${hasErrorUI 
                                                        ? 'bg-red-50/20 border-red-400 focus:ring-4 focus:ring-red-50 text-red-900' 
                                                        : 'bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-slate-900'
                                                    }`}
                                                autoFocus
                                            />
                                        </div>
                                        
                                        {/* Error message */}
                                        <div className={`min-h-[16px] mt-1.5 transition-all duration-300 ${hasErrorUI ? 'opacity-100' : 'opacity-0'}`}>
                                            {hasErrorUI && (
                                                <p className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
                                                    <AlertCircle size={10} /> {errorMsg}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Preset chips */}
                                    <div className="grid grid-cols-4 gap-2 mb-5">
                                        {PRESET_AMOUNTS.map((preset) => {
                                            const isDisabled = preset > maxAllowable;
                                            return (
                                                <button
                                                    key={preset}
                                                    type="button"
                                                    onClick={() => handlePreset(preset)}
                                                    disabled={isDisabled}
                                                    className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                                        isDisabled
                                                            ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                                            : numericAmount === preset
                                                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 cursor-pointer'
                                                    }`}
                                                >
                                                    ₱{preset}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Submit button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!isAmountValid || isProcessing}
                                        className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                            isAmountValid && !isProcessing
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {isAmountValid ? `Allocate ₱${numericAmount.toLocaleString('en-US')}` : 'Enter an amount'}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}