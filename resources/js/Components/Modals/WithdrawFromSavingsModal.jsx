// resources/js/Components/Modals/WithdrawFromSavingsModal.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, Wallet, PiggyBank, AlertCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';

const PRESET_AMOUNTS = [50, 100, 200, 500];

export default function WithdrawFromSavingsModal({ isOpen, onClose, savingsPoolBalance = 0 }) {
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
    }, [isOpen]);

    if (!isOpen) return null;

    const numericAmount = Number(amount.replace(/,/g, '')) || 0;
    const isAmountValid = numericAmount >= 1 && numericAmount <= savingsPoolBalance;
    const hasErrorUI = errorMsg !== '' || (numericAmount > savingsPoolBalance && numericAmount > 0);

    const handleAmountChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        
        if (!rawValue) {
            setAmount('');
            setErrorMsg('');
            return;
        }

        const numValue = Number(rawValue);
        setAmount(numValue.toLocaleString('en-US'));

        if (numValue > savingsPoolBalance) {
            setErrorMsg(`Insufficient savings. You have ₱${savingsPoolBalance.toLocaleString('en-US')} in your pool.`);
        } else {
            setErrorMsg('');
        }
    };

    const handlePreset = (val) => {
        setAmount(val.toLocaleString('en-US'));
        if (val > savingsPoolBalance) {
            setErrorMsg(`Insufficient savings. You have ₱${savingsPoolBalance.toLocaleString('en-US')} in your pool.`);
        } else {
            setErrorMsg('');
        }
    };

    const handleSubmit = () => {
        if (!isAmountValid || isProcessing) return;

        setIsProcessing(true);
        router.post('/savings/withdraw', {
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

    const isPoolEmpty = savingsPoolBalance <= 0;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 relative">

                {isProcessing && (
                    <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" strokeWidth={2.5} />
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">Withdrawing</h3>
                        <p className="text-[10px] font-medium text-slate-500 text-center px-6">
                            Moving money to your main wallet.
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                    <div className="w-7 h-7" />
                    <h2 className="text-[13px] font-bold text-slate-900 tracking-tight">
                        {isSuccess ? 'Withdrawal complete' : 'Withdraw from Savings'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                    >
                        <X size={14} />
                    </button>
                </div>

                <div className="max-h-[80vh] overflow-y-auto">
                    
                    {isSuccess ? (
                        <div className="px-5 py-6 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                                <Sparkles size={24} className="text-blue-500" strokeWidth={2} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1 tracking-tight">
                                Withdrawal complete!
                            </h3>
                            <p className="text-[11px] text-slate-500 mb-4">
                                <span className="font-bold text-slate-800">₱{numericAmount.toLocaleString('en-US')}</span> moved to your main wallet.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                                Back to goals
                            </button>
                        </div>
                    ) : isPoolEmpty ? (
                        <div className="px-5 py-8 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                <PiggyBank size={24} className="text-slate-400" strokeWidth={2} />
                            </div>
                            <p className="text-sm font-bold text-slate-900 mb-1">Nothing to withdraw</p>
                            <p className="text-[10px] text-slate-500 font-medium">
                                Your savings is empty.
                            </p>
                        </div>
                    ) : (
                        <div className="px-5 py-5">

                            <div className="flex items-center justify-between gap-3 mb-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex-1 text-center">
                                    <div className="flex items-center justify-center gap-1.5 mb-1">
                                        <PiggyBank size={12} className="text-emerald-600" />
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Savings</span>
                                    </div>
                                    <p className="text-sm font-black text-slate-900">₱{savingsPoolBalance.toLocaleString('en-US')}</p>
                                </div>
                                <ArrowRight size={16} className="text-slate-400" />
                                <div className="flex-1 text-center">
                                    <div className="flex items-center justify-center gap-1.5 mb-1">
                                        <Wallet size={12} className="text-blue-600" />
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Main Wallet</span>
                                    </div>
                                    <p className="text-sm font-black text-blue-700">
                                        +₱{numericAmount > 0 ? numericAmount.toLocaleString('en-US') : '0'}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Amount
                                </label>
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
                                        autoFocus
                                        className={`w-full pl-7 pr-3 py-2 border rounded-xl text-base font-semibold outline-none transition-all
                                            ${hasErrorUI 
                                                ? 'bg-red-50/20 border-red-400 focus:ring-4 focus:ring-red-50 text-red-900' 
                                                : 'bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-slate-900'
                                            }`}
                                    />
                                </div>

                                <div className={`min-h-[16px] mt-1.5 transition-all duration-300 ${hasErrorUI ? 'opacity-100' : 'opacity-0'}`}>
                                    {hasErrorUI && (
                                        <p className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
                                            <AlertCircle size={10} /> {errorMsg}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2 mb-5">
                                {PRESET_AMOUNTS.map((preset) => {
                                    const isDisabled = preset > savingsPoolBalance;
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

                            <button
                                onClick={handleSubmit}
                                disabled={!isAmountValid || isProcessing}
                                className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                    isAmountValid && !isProcessing
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {isAmountValid ? `Withdraw ₱${numericAmount.toLocaleString('en-US')}` : 'Enter an amount'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}