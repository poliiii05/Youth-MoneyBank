// resources/js/Components/Wallet/AddMoneyModal.jsx
import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    X, ChevronLeft, Building2, Smartphone, Store,
    CheckCircle2, Loader2, ArrowRight, AlertCircle, Sparkles,
    Wallet, Receipt, PartyPopper,
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PRESET_AMOUNTS = [100, 200, 500, 1000];

const STEP_TITLES = {
    1: 'Add money',
    2: 'Fund via PayPal',
    3: 'Transfer complete',
};

// ── Method option card ──────────────────────────────────────────────────────
function MethodCard({ icon, label, sublabel, badge, badgeVariant = 'available', onClick, disabled, iconBg }) {
    const badgeStyles = {
        available: 'bg-secondary text-primary border border-primary/25',
        soon: 'bg-muted text-muted-foreground border border-border',
    };

    return (
        <button
            onClick={!disabled ? onClick : undefined}
            disabled={disabled}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all duration-200 text-left
                ${disabled
                    ? 'border-border bg-muted/60 opacity-60 cursor-not-allowed'
                    : 'border-border bg-card hover:border-primary hover:shadow-md hover:shadow-primary/10 hover:-translate-y-0.5 cursor-pointer group active:scale-[0.98]'
                }`}
        >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                disabled 
                    ? 'bg-muted' 
                    : `${iconBg || 'bg-muted'} group-hover:scale-105 group-hover:rotate-3`
            }`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold leading-tight transition-colors ${
                    disabled ? 'text-muted-foreground' : 'text-foreground group-hover:text-primary'
                }`}>
                    {label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate font-medium">{sublabel}</p>
            </div>
            {badge && (
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex-shrink-0 ${badgeStyles[badgeVariant]}`}>
                    {badge}
                </span>
            )}
            {!disabled && (
                <ArrowRight size={16} className="text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" strokeWidth={2.5} />
            )}
        </button>
    );
}

// ── Main modal ──────────────────────────────────────────────────────────────
export default function AddMoneyModal({ isOpen, onClose }) {
    const { auth, finances, kyc_tier } = usePage().props;
    const user = auth?.user;

    const currentTier = kyc_tier || user?.kyc_tier || 1;
    const maxLimit = finances?.max_limit || (currentTier === 3 ? 100000 : currentTier === 2 ? 20000 : 5000);
    const mainBalance = finances?.main_balance || 0;
    const totalHoldings = finances?.total_holdings ?? mainBalance;
    const remainingLimit = finances?.remaining_capacity ?? (maxLimit - totalHoldings);
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
        setAmount(numValue.toLocaleString('en-US'));

        if (numValue > remainingLimit) {
            setErrorMsg(`Exceeds your tier limit. You can add up to ₱${remainingLimit.toLocaleString('en-US')} more.`);
        } else {
            setErrorMsg('');
        }
    };

    const handlePreset = (val) => {
        if (isLimitReached) return;

        setAmount(val.toLocaleString('en-US'));

        if (val > remainingLimit) {
            setErrorMsg(`Exceeds your tier limit. You can add up to ₱${remainingLimit.toLocaleString('en-US')} more.`);
        } else {
            setErrorMsg('');
        }
    };

    const hasErrorUI = errorMsg !== '' || isLimitReached;
    const usagePercent = maxLimit > 0 ? (totalHoldings / maxLimit) * 100 : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-foreground/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 relative">
                
                {/* ── CENTER LOADING OVERLAY ── */}
                {isProcessing && (
                    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
                        <div className="relative mb-4">
                            <div className="w-14 h-14 rounded-full bg-secondary animate-pulse"></div>
                            <Loader2 className="w-8 h-8 text-primary animate-spin absolute inset-0 m-auto" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-sm font-black text-foreground tracking-tight mb-1">Processing Payment</h3>
                        <p className="text-[11px] font-medium text-muted-foreground text-center px-6">
                            Securely processing your transaction...
                        </p>
                    </div>
                )}

               {/* ── HERO HEADER (with gradient + icon) ── */}
                <div className={`relative overflow-hidden px-5 py-5 ${
                    step === 3 
                        ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700' 
                        : 'bg-gradient-to-br from-primary via-primary to-emerald-900'
                }`}>
                    {/* Background decorative blurs */}
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-300/20 rounded-full blur-xl"></div>
                    
                    <div className="relative flex items-center justify-between gap-3">
                        {/* LEFT GROUP — icon + text (left-aligned together) */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Back button (only on step 2) */}
                            {step === 2 && (
                                <button
                                    onClick={() => setStep(1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-sm active:scale-95 shrink-0"
                                >
                                    <ChevronLeft size={16} strokeWidth={2.5} />
                                </button>
                            )}

                            {/* Icon */}
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner shrink-0">
                                {step === 3 ? (
                                    <PartyPopper size={18} className="text-white" strokeWidth={2.5} />
                                ) : (
                                    <Wallet size={18} className="text-white" strokeWidth={2.5} />
                                )}
                            </div>

                            {/* Text */}
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-tight">
                                    Step {step} of 3
                                </p>
                                <h2 className="text-base font-black text-white tracking-tight leading-tight truncate">
                                    {STEP_TITLES[step]}
                                </h2>
                            </div>
                        </div>

                        {/* RIGHT — close button */}
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-sm active:scale-95 shrink-0"
                        >
                            <X size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="max-h-[75vh] overflow-y-auto">

                    {/* ════ STEP 1: SELECT METHOD ════ */}
                    {step === 1 && (
                        <div className="px-5 py-5">
                            {/* Tier limit summary card */}
                            <div className="bg-gradient-to-br from-secondary to-secondary/50 border border-primary/25 rounded-xl p-3.5 mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center">
                                            <Sparkles size={13} className="text-primary" strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-primary">Tier Capacity</p>
                                            <p className="text-xs font-bold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                ₱{remainingLimit.toLocaleString('en-US')} <span className="text-muted-foreground font-medium">available</span>
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-primary" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {usagePercent.toFixed(0)}% used
                                    </span>
                                </div>
                                <div className="w-full bg-card rounded-full h-1.5 overflow-hidden border border-primary/15">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-700 ${
                                            usagePercent >= 90 ? 'bg-destructive' 
                                            : usagePercent >= 70 ? 'bg-amber-500' 
                                            : 'bg-primary'
                                        }`}
                                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <p className="text-[10px] font-semibold text-muted-foreground mb-3">
                                Choose funding source
                            </p>

                            <div className="space-y-2.5">
                                <MethodCard
                                    icon={
                                        <span className="font-black text-[#003087] italic text-base leading-none">
                                            P<span className="text-[#009cde]">P</span>
                                        </span>
                                    }
                                    iconBg="bg-blue-50"
                                    label="PayPal"
                                    sublabel="Sandbox environment • No real money"
                                    badge="Available"
                                    badgeVariant="available"
                                    onClick={() => setStep(2)}
                                    disabled={isLimitReached}
                                />
                                <MethodCard 
                                    icon={<Smartphone size={18} className="text-muted-foreground" strokeWidth={2} />} 
                                    iconBg="bg-muted"
                                    label="E-wallets" 
                                    sublabel="GCash, Maya, GrabPay" 
                                    badge="Soon" 
                                    badgeVariant="soon" 
                                    disabled 
                                />
                                <MethodCard 
                                    icon={<Building2 size={18} className="text-muted-foreground" strokeWidth={2} />} 
                                    iconBg="bg-muted"
                                    label="Linked bank" 
                                    sublabel="InstaPay / PESONet" 
                                    badge="Soon" 
                                    badgeVariant="soon" 
                                    disabled 
                                />
                                <MethodCard 
                                    icon={<Store size={18} className="text-muted-foreground" strokeWidth={2} />} 
                                    iconBg="bg-muted"
                                    label="Over-the-counter" 
                                    sublabel="7-Eleven, Cebuana, SM" 
                                    badge="Soon" 
                                    badgeVariant="soon" 
                                    disabled 
                                />
                            </div>

                            {/* Limit reached prompt */}
                            {isLimitReached && (
                                <button 
                                    onClick={() => {
                                        onClose();
                                        router.get('/settings?tab=upgrade');
                                    }}
                                    className="mt-4 w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-200"
                                >
                                    <Sparkles size={14} strokeWidth={2.5} /> Upgrade Tier to Continue
                                </button>
                            )}
                        </div>
                    )}

                    {/* ════ STEP 2: AMOUNT + PAYPAL ════ */}
                    {step === 2 && (
                        <div className="px-5 py-5">

                            {/* Account holder — a fact, not a field. Rendering it as a
                                disabled input made it look broken and read badly to
                                screen readers, when nothing here is editable. */}
                            <div className="mb-4 flex items-center justify-between rounded-xl bg-muted px-3.5 py-2.5">
                                <span className="text-[10px] font-semibold text-muted-foreground">
                                    Adding to
                                </span>
                                <span className="text-xs font-bold text-foreground truncate ml-3">
                                    {user?.name ?? 'Loading…'}
                                </span>
                            </div>

                            {/* Amount input — bigger and more prominent */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[10px] font-semibold text-muted-foreground">
                                        Amount
                                    </label>
                                    <span className="text-[10px] font-medium text-muted-foreground">
                                        Available: <span className={hasErrorUI ? 'text-destructive' : 'text-primary'} style={{ fontVariantNumeric: 'tabular-nums' }}>₱{remainingLimit.toLocaleString('en-US')}</span>
                                    </span>
                                </div>
                                <div className="relative">
                                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl pointer-events-none select-none ${hasErrorUI ? 'text-destructive/60' : 'text-muted-foreground/50'}`}>
                                        ₱
                                    </span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        disabled={isLimitReached}
                                        placeholder={isLimitReached ? "0" : "Enter amount"}
                                        autoFocus
                                        style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
                                        className={`w-full pl-11 pr-3 py-3.5 border-2 rounded-xl text-xl font-black outline-none transition-all
                                            ${hasErrorUI 
                                                ? 'bg-destructive/5 border-destructive/40 focus:ring-4 focus:ring-destructive/10 text-destructive' 
                                                : 'bg-background border-border focus:border-primary focus:ring-4 focus:ring-primary/10 text-foreground'
                                            }
                                            ${isLimitReached ? 'cursor-not-allowed bg-destructive/5 border-destructive/40 placeholder:text-destructive/60' : 'placeholder:text-muted-foreground/50'}
                                        `}
                                    />
                                </div>
                                
                                {/* Error Message Display */}
                                <div className={`min-h-[18px] mt-1.5 transition-all duration-300 ${hasErrorUI ? 'opacity-100' : 'opacity-0'}`}>
                                    {hasErrorUI && (
                                        <p className="text-[10px] font-bold text-destructive flex items-center gap-1">
                                            <AlertCircle size={11} strokeWidth={2.5} /> 
                                            {isLimitReached ? "Tier limit reached. Upgrade to add more." : errorMsg} 
                                        </p>
                                    )}
                                </div>

                                {/* Min amount hint */}
                                {!hasErrorUI && numericAmount > 0 && numericAmount < 50 && (
                                    <p className="text-[10px] font-medium text-muted-foreground mt-1.5">
                                        Minimum amount is ₱50
                                    </p>
                                )}
                            </div>

                            {/* Preset chips — interactive with hover/active */}
                            <div className="mb-4">
                                <p className="text-[10px] font-semibold text-muted-foreground mb-2">
                                    Quick amounts
                                </p>
                                <div className="grid grid-cols-4 gap-2">
                                    {PRESET_AMOUNTS.map((preset) => {
                                        const isDisabled = isLimitReached || preset > remainingLimit;
                                        const isSelected = numericAmount === preset;
                                        return (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => handlePreset(preset)}
                                                disabled={isDisabled}
                                                className={`py-2.5 rounded-xl text-xs font-black border-2 transition-all duration-150 active:scale-95 ${
                                                    isDisabled
                                                        ? 'bg-muted text-muted-foreground/50 border-border cursor-not-allowed'
                                                        : isSelected
                                                            ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 cursor-pointer'
                                                            : 'bg-background text-foreground border-border hover:border-primary hover:bg-secondary/40 hover:text-primary hover:-translate-y-0.5 hover:shadow-sm cursor-pointer'
                                                }`}
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                ₱{preset.toLocaleString()}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className="mb-5">
                                <label className="block text-[10px] font-semibold text-muted-foreground mb-1.5">
                                    Remarks <span className="normal-case font-normal text-muted-foreground">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    disabled={isLimitReached}
                                    placeholder="e.g. Allowance, savings…"
                                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium transition-all outline-none 
                                        ${isLimitReached 
                                            ? 'bg-muted border-border text-muted-foreground cursor-not-allowed placeholder:text-muted-foreground/50' 
                                            : 'bg-background border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10'
                                        }`}
                                />
                            </div>

                            {/* PayPal Integration or Subtle Upgrade Prompt */}
                            <div className="pt-2">
                                {isLimitReached ? (
                                    <button 
                                        onClick={() => {
                                            onClose();
                                            router.get('/settings?tab=upgrade');
                                        }}
                                        className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-200 active:scale-[0.98]"
                                    >
                                        <Sparkles size={14} strokeWidth={2.5} /> Upgrade Tier to Continue
                                    </button>
                                ) : isAmountValid ? (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <p className="text-[10px] font-bold text-muted-foreground mb-2 text-center">
                                            Continue with PayPal to complete
                                        </p>
                                        <PayPalScriptProvider options={initialOptions}>
                                            <PayPalButtons
                                                style={{ layout: "vertical", shape: "rect", color: "blue", label: "pay", height: 40 }}
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
                                    <div className="bg-muted border border-border rounded-xl py-3 px-4 text-center">
                                        <p className="text-[11px] font-bold text-muted-foreground">
                                            Enter an amount to continue
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                            Minimum ₱50 up to your tier limit
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ════ STEP 3: SUCCESS ════ */}
                    {step === 3 && (
                        <div className="px-5 py-6 flex flex-col items-center text-center">

                            {/* Animated success circle */}
                            <div className="relative mb-4">
                                <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl animate-pulse"></div>
                                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-300 animate-in zoom-in duration-500">
                                    <CheckCircle2 size={32} className="text-white" strokeWidth={2.5} />
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-foreground mb-1 tracking-tight">
                                Cash in successful!
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium mb-5">
                                Your wallet has been updated 🎉
                            </p>

                            {/* Amount highlight */}
                            <div className="w-full bg-gradient-to-br from-secondary to-secondary/50 border-2 border-primary/25 rounded-2xl p-4 mb-4">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Amount Added</p>
                                <p className="text-3xl font-black text-primary" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                                    +₱{numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            {/* Receipt details */}
                            <div className="w-full bg-muted rounded-xl border border-border divide-y divide-border text-left mb-5">
                                <div className="flex justify-between items-center px-4 py-2.5">
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Method</span>
                                    <span className="text-xs font-bold text-foreground">PayPal Express</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-2.5">
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Account</span>
                                    <span className="text-xs font-bold text-foreground truncate ml-2 max-w-[180px]">{user?.name}</span>
                                </div>
                                {remarks && (
                                    <div className="flex justify-between items-center px-4 py-2.5">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Remarks</span>
                                        <span className="text-xs font-bold text-foreground truncate ml-2 max-w-[180px]">{remarks}</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="w-full flex gap-2">
                                <button
                                    onClick={() => {
                                        handleClose();
                                        router.get('/transactions');
                                    }}
                                    className="flex-1 py-2.5 bg-background border border-border hover:border-primary/40 hover:bg-muted text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
                                >
                                    <Receipt size={13} strokeWidth={2.5} /> View Transactions
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-2.5 bg-primary hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-200 active:scale-[0.98]"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}