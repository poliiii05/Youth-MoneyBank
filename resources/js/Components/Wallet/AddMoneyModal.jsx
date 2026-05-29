// resources/js/Components/Wallet/AddMoneyModal.jsx
import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    X, ChevronLeft, Building2, Smartphone, Store,
    CheckCircle2, Loader2, ArrowRight, AlertCircle, Sparkles
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PRESET_AMOUNTS = [100, 200, 500, 1000];

const STEP_TITLES = {
    1: 'Add money',
    2: 'Fund via PayPal',
    3: 'Transfer complete',
};

// ── Method option card ──────────────────────────────────────────────────────
function MethodCard({ icon, label, sublabel, badge, badgeVariant = 'available', onClick, disabled }) {
    const badgeStyles = {
        available: 'bg-emerald-50 text-emerald-700',
        soon: 'bg-slate-100 text-slate-400',
    };

    return (
        <div
            onClick={!disabled ? onClick : undefined}
            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-150
                ${disabled
                    ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                    : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm hover:shadow-blue-100 cursor-pointer group'
                }`}
        >
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight">{label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{sublabel}</p>
            </div>
            {badge && (
                <span className={`text-[8px] font-bold uppercase tracking-wide px-2 py-1 rounded-md flex-shrink-0 ${badgeStyles[badgeVariant]}`}>
                    {badge}
                </span>
            )}
            {!disabled && (
                <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors flex-shrink-0" />
            )}
        </div>
    );
}

// ── Main modal ──────────────────────────────────────────────────────────────
export default function AddMoneyModal({ isOpen, onClose }) {
    const { auth, finances, kyc_tier } = usePage().props;
    const user = auth?.user;

    // --- COMPUTE TIER LIMITS ---
    const currentTier = kyc_tier || user?.kyc_tier || 1;
    const maxLimit = finances?.max_limit || (currentTier === 3 ? 100000 : currentTier === 2 ? 20000 : 5000);
    const mainBalance = finances?.main_balance || 0;
    const remainingLimit = maxLimit - mainBalance;
    
    // Kapag less than 50 na ang natitira, hindi na pwede mag-cash in
    const isLimitReached = remainingLimit < 50;

    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState(''); 
    const [remarks, setRemarks] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const numericAmount = Number(amount.replace(/,/g, ''));
    const isAmountValid = numericAmount >= 50 && numericAmount <= remainingLimit;

    const initialOptions = {
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "PHP",
        intent: "capture",
    };

    const handleClose = () => {
        setStep(1);
        setAmount('');
        setRemarks('');
        setIsProcessing(false);
        setErrorMsg('');
        onClose();
    };

    const handleAmountChange = (e) => {
        if (isLimitReached) return;

        const rawValue = e.target.value.replace(/[^0-9]/g, '');

        if (!rawValue) {
            setAmount('');
            setErrorMsg('');
            return;
        }

        const numValue = Number(rawValue);

        // ALWAYS update the amount — let them type freely
        setAmount(numValue.toLocaleString('en-US'));

        // THEN show validation as a visual cue (without blocking input)
        if (numValue > remainingLimit) {
            setErrorMsg(`Maximum allowed for your tier is ₱${remainingLimit.toLocaleString('en-US')}.`);
        } else {
            setErrorMsg('');
        }
    };

    const handlePreset = (val) => {
        if (isLimitReached) return;

        // Always set the value
        setAmount(val.toLocaleString('en-US'));

        // Show validation if over limit (without blocking)
        if (val > remainingLimit) {
            setErrorMsg(`Maximum allowed for your tier is ₱${remainingLimit.toLocaleString('en-US')}.`);
        } else {
            setErrorMsg('');
        }
    };

    // Shortcut variable para malaman kung ire-red ang input box
    const hasErrorUI = errorMsg !== '' || isLimitReached;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            
            {/* Pinaliit ang width: sm:max-w-sm na lang para hindi masyadong malapad */}
     <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 relative">
                {/* ── CENTER LOADING OVERLAY ── */}
                {isProcessing && (
                    <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" strokeWidth={2.5} />
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">Processing Payment</h3>
                        <p className="text-[10px] font-medium text-slate-500 text-center px-6">
                            Please wait while we securely process your transaction.
                        </p>
                    </div>
                )}

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                    {step === 2 ? (
                        <button
                            onClick={() => setStep(1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={14} />
                        </button>
                    ) : (
                        <div className="w-7 h-7" />
                    )}

                    <h2 className="text-[13px] font-bold text-slate-900 tracking-tight">
                        {STEP_TITLES[step]}
                    </h2>

                    <button
                        onClick={handleClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="max-h-[80vh] overflow-y-auto">

                    {/* ════ STEP 1: SELECT METHOD ════ */}
                    {step === 1 && (
                        <div className="px-5 py-4">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                Funding source
                            </p>

                            <div className="space-y-2">
                                <MethodCard
                                    icon={
                                        <span className="font-black text-[#003087] italic text-xs leading-none">
                                            P<span className="text-[#009cde]">P</span>
                                        </span>
                                    }
                                    label="PayPal"
                                    sublabel="Real-time crediting • No fees"
                                    badge="Available"
                                    badgeVariant="available"
                                    onClick={() => setStep(2)}
                                />
                                <MethodCard icon={<Smartphone size={14} className="text-slate-400" />} label="E-wallets" sublabel="GCash, Maya, GrabPay" badge="Soon" badgeVariant="soon" disabled />
                                <MethodCard icon={<Building2 size={14} className="text-slate-400" />} label="Linked bank" sublabel="InstaPay / PESONet" badge="Soon" badgeVariant="soon" disabled />
                                <MethodCard icon={<Store size={14} className="text-slate-400" />} label="Over-the-counter" sublabel="7-Eleven, Cebuana, SM" badge="Soon" badgeVariant="soon" disabled />
                            </div>
                        </div>
                    )}

                    {/* ════ STEP 2: AMOUNT + PAYPAL ════ */}
                    {step === 2 && (
                        <div className="px-5 py-5">

                            {/* Account holder */}
                            <div className="mb-4">
                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Account holder
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={user?.name ?? 'Loading…'}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-500 cursor-not-allowed outline-none"
                                />
                            </div>

                            {/* Amount input */}
                            <div className="mb-2">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        Amount
                                    </label>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        Remaining Limit: <span className={`${hasErrorUI ? 'text-red-500' : 'text-blue-600'}`}>₱{remainingLimit.toLocaleString('en-US')}</span>
                                    </span>
                                </div>
                                <div className="relative">
                                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-sm pointer-events-none select-none ${hasErrorUI ? 'text-red-400' : 'text-slate-400'}`}>
                                        ₱
                                    </span>
                                    {/* Pinaliit ang font size mula text-2xl font-black papuntang text-base font-semibold */}
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        disabled={isLimitReached}
                                        placeholder={isLimitReached ? "0" : "Min. 50"}
                                        autoFocus
                                        className={`w-full pl-7 pr-3 py-2 border rounded-xl text-base font-semibold outline-none transition-all
                                            ${hasErrorUI 
                                                ? 'bg-red-50/20 border-red-400 focus:ring-4 focus:ring-red-50 text-red-900' 
                                                : 'bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-slate-900'
                                            }
                                            ${isLimitReached ? 'cursor-not-allowed bg-red-50 border-red-300 placeholder:text-red-400' : ''}
                                        `}
                                    />
                                </div>
                                
                                {/* Error Message Display */}
                                <div className={`min-h-[16px] mt-1.5 transition-all duration-300 ${hasErrorUI ? 'opacity-100' : 'opacity-0'}`}>
                                    {hasErrorUI && (
                                        <p className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
                                            <AlertCircle size={10} /> 
                                            {isLimitReached ? "You've reached your maximum wallet limit." : errorMsg}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Preset chips */}
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {PRESET_AMOUNTS.map((preset) => {
                                    const isDisabled = isLimitReached || preset > remainingLimit;
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
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                            }`}
                                        >
                                            ₱{preset.toLocaleString()}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Remarks */}
                            <div className="mb-5">
                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Remarks <span className="normal-case font-normal text-slate-400">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    disabled={isLimitReached}
                                    placeholder="e.g. Allowance, savings…"
                                    className={`w-full px-3 py-2 border rounded-lg text-xs transition-all outline-none 
                                        ${isLimitReached 
                                            ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed placeholder:text-slate-300' 
                                            : 'bg-white border-slate-200 text-slate-700 placeholder-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
                                        }`}
                                />
                            </div>

                            {/* PayPal Integration or Subtle Upgrade Prompt */}
                            <div className="pt-2">
                                {isLimitReached ? (
                                    <button 
                                        onClick={() => {
                                            onClose();
                                            router.get('/settings');
                                        }}
                                        className="w-full py-2 bg-white border border-purple-200 text-purple-600 text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-purple-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Sparkles size={12} /> Upgrade Account Tier
                                    </button>
                                ) : isAmountValid ? (
                                    <div className="animate-in fade-in duration-500">
                                        <PayPalScriptProvider options={initialOptions}>
                                            <PayPalButtons
                                                style={{ layout: "vertical", shape: "rect", color: "blue", label: "pay", height: 35 }}
                                                createOrder={(data, actions) => {
                                                    return actions.order.create({
                                                        purchase_units: [{
                                                            amount: { value: numericAmount.toString() },
                                                            description: remarks || "Youth MoneyBank Wallet Top-up",
                                                        }],
                                                    });
                                                }}
                                                onApprove={(data, actions) => {
                                                    setIsProcessing(true);
                                                    return actions.order.capture().then((details) => {
                                                        router.post('/wallet/add-money', {
                                                            amount: numericAmount,
                                                            remarks,
                                                            transaction_id: details.id,
                                                            status: details.status,
                                                        }, {
                                                            onSuccess: () => {
                                                                setIsProcessing(false);
                                                                setStep(3);
                                                            },
                                                            onError: () => {
                                                                setIsProcessing(false);
                                                                alert("Something went wrong with saving to the database.");
                                                            }
                                                        });
                                                    });
                                                }}
                                                onError={() => setIsProcessing(false)}
                                            />
                                        </PayPalScriptProvider>
                                    </div>
                                ) : (
                                    <p className="text-center text-[10px] font-medium text-slate-400 mt-2">
                                        Enter an amount from ₱50 up to your limit to proceed.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ════ STEP 3: SUCCESS ════ */}
                    {step === 3 && (
                        <div className="px-5 py-6 flex flex-col items-center text-center">

                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                <CheckCircle2 size={24} className="text-emerald-500" strokeWidth={2} />
                            </div>

                            <h3 className="text-base font-bold text-slate-900 mb-1 tracking-tight">
                                Cash in successful!
                            </h3>
                            <p className="text-[11px] text-slate-500 mb-4">
                                <span className="font-bold text-slate-800">₱{numericAmount.toLocaleString('en-US')}</span> has been added to your wallet.
                            </p>

                            <div className="w-full bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100 text-left mb-5">
                                <div className="flex justify-between items-center px-4 py-2">
                                    <span className="text-[10px] text-slate-500 font-medium">Method</span>
                                    <span className="text-[10px] font-bold text-slate-800">PayPal Express</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-2">
                                    <span className="text-[10px] text-slate-500 font-medium">Account</span>
                                    <span className="text-[10px] font-bold text-slate-800">{user?.name}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-2">
                                    <span className="text-[10px] text-slate-500 font-medium">Amount</span>
                                    <span className="text-[10px] font-bold text-emerald-600">+₱{numericAmount.toLocaleString('en-US')}</span>
                                </div>
                                {remarks && (
                                    <div className="flex justify-between items-center px-4 py-2">
                                        <span className="text-[10px] text-slate-500 font-medium">Remarks</span>
                                        <span className="text-[10px] font-bold text-slate-800">{remarks}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                                Back to dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}