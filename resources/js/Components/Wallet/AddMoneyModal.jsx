// resources/js/Components/Wallet/AddMoneyModal.jsx
import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    X, ChevronLeft, Building2, Smartphone, Store,
    CheckCircle2, Loader2, ArrowRight
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PRESET_AMOUNTS = [100, 200, 500, 1000];

const STEP_TITLES = {
    1: 'Add money',
    2: 'Fund via PayPal',
    3: 'Transfer complete',
};

// ── Step indicator ──────────────────────────────────────────────────────────
function StepIndicator({ current, total = 3 }) {
    return (
        <div className="flex items-center gap-1.5 mb-6">
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                        i + 1 === current
                            ? 'w-6 bg-blue-600'
                            : i + 1 < current
                            ? 'w-4 bg-blue-200'
                            : 'w-4 bg-slate-200'
                    }`}
                />
            ))}
        </div>
    );
}

// ── Method option card ──────────────────────────────────────────────────────
function MethodCard({ icon, label, sublabel, badge, badgeVariant = 'available', onClick, disabled }) {
    const badgeStyles = {
        available: 'bg-emerald-50 text-emerald-700',
        soon: 'bg-slate-100 text-slate-400',
    };

    return (
        <div
            onClick={!disabled ? onClick : undefined}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-150
                ${disabled
                    ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                    : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm hover:shadow-blue-100 cursor-pointer group'
                }`}
        >
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{sublabel}</p>
            </div>
            {badge && (
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg flex-shrink-0 ${badgeStyles[badgeVariant]}`}>
                    {badge}
                </span>
            )}
            {!disabled && (
                <ArrowRight size={15} className="text-slate-300 group-hover:text-blue-400 transition-colors flex-shrink-0" />
            )}
        </div>
    );
}

// ── Main modal ──────────────────────────────────────────────────────────────
export default function AddMoneyModal({ isOpen, onClose }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [remarks, setRemarks] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const numericAmount = Number(amount);
    const isAmountValid = numericAmount >= 100;

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
        onClose();
    };

    const handlePreset = (val) => {
        setAmount(String(val));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            
            {/* Modal Container */}
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 relative">

                {/* ── CENTER LOADING OVERLAY ── */}
                {isProcessing && (
                    <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" strokeWidth={2.5} />
                        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">Processing Payment</h3>
                        <p className="text-xs font-medium text-slate-500 text-center px-8">
                            Please wait while we securely process your transaction. Do not close this window.
                        </p>
                    </div>
                )}

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    {step === 2 ? (
                        <button
                            onClick={() => setStep(1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    ) : (
                        <div className="w-8 h-8" />
                    )}

                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                        {STEP_TITLES[step]}
                    </h2>

                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="max-h-[80vh] overflow-y-auto">

                    {/* ════ STEP 1: SELECT METHOD ════ */}
                    {step === 1 && (
                        <div className="px-5 py-5">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                Funding source
                            </p>

                            <div className="space-y-2.5">
                                <MethodCard
                                    icon={
                                        <span className="font-black text-[#003087] italic text-base leading-none">
                                            P<span className="text-[#009cde]">P</span>
                                        </span>
                                    }
                                    label="PayPal"
                                    sublabel="Real-time crediting • No fees"
                                    badge="Available"
                                    badgeVariant="available"
                                    onClick={() => setStep(2)}
                                />
                                <MethodCard icon={<Smartphone size={18} className="text-slate-400" />} label="E-wallets" sublabel="GCash, Maya, GrabPay" badge="Soon" badgeVariant="soon" disabled />
                                <MethodCard icon={<Building2 size={18} className="text-slate-400" />} label="Linked bank" sublabel="InstaPay / PESONet" badge="Soon" badgeVariant="soon" disabled />
                                <MethodCard icon={<Store size={18} className="text-slate-400" />} label="Over-the-counter" sublabel="7-Eleven, Cebuana, SM" badge="Soon" badgeVariant="soon" disabled />
                            </div>
                        </div>
                    )}

                    {/* ════ STEP 2: AMOUNT + PAYPAL ════ */}
                    {step === 2 && (
                        <div className="px-5 py-6">
                            <StepIndicator current={2} />

                            {/* Account holder */}
                            <div className="mb-5">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Account holder
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={user?.name ?? 'Loading…'}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                                />
                            </div>

                            {/* Amount input */}
                            <div className="mb-3">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg pointer-events-none select-none">
                                        ₱
                                    </span>
                                    <input
                                        type="number"
                                        min="50"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Min. 50"
                                        className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-2xl font-black text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                            </div>

                            {/* Preset chips */}
                            <div className="grid grid-cols-4 gap-2 mb-5">
                                {PRESET_AMOUNTS.map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => handlePreset(preset)}
                                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                            numericAmount === preset
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                        }`}
                                    >
                                        ₱{preset.toLocaleString()}
                                    </button>
                                ))}
                            </div>

                            {/* Remarks */}
                            <div className="mb-6">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Remarks <span className="normal-case font-normal text-slate-400">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="e.g. Allowance, savings…"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                />
                            </div>

                            {/* PayPal Integration (Mas malinis na spacing) */}
                            <div className="pt-2">
                                {isAmountValid ? (
                                    <div className="animate-in fade-in duration-500">
                                        <PayPalScriptProvider options={initialOptions}>
                                            <PayPalButtons
                                                style={{ layout: "vertical", shape: "rect", color: "blue", label: "pay" }}
                                                createOrder={(data, actions) => {
                                                    return actions.order.create({
                                                        purchase_units: [{
                                                            amount: { value: amount },
                                                            description: remarks || "Youth MoneyBank Wallet Top-up",
                                                        }],
                                                    });
                                                }}
                                                onApprove={(data, actions) => {
                                                    setIsProcessing(true); // TATAWAGIN ANG LOADING SCREEN SA GITNA
                                                    return actions.order.capture().then((details) => {
                                                        router.post('/wallet/add-money', {
                                                            amount,
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
                                    <p className="text-center text-xs font-semibold text-slate-400 mt-2">
                                        Enter at least ₱100 to enable PayPal checkout.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ════ STEP 3: SUCCESS ════ */}
                    {step === 3 && (
                        <div className="px-5 py-8 flex flex-col items-center text-center">
                            <StepIndicator current={3} />

                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 size={32} className="text-emerald-500" strokeWidth={1.5} />
                            </div>

                            <h3 className="text-xl font-black text-slate-900 mb-1.5 tracking-tight">
                                Cash in successful!
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                <span className="font-bold text-slate-800">₱{Number(amount).toLocaleString()}</span> has been added to your wallet.
                            </p>

                            <div className="w-full bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100 text-left mb-6">
                                <div className="flex justify-between items-center px-4 py-3">
                                    <span className="text-xs text-slate-500 font-medium">Method</span>
                                    <span className="text-xs font-bold text-slate-800">PayPal Express</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-3">
                                    <span className="text-xs text-slate-500 font-medium">Account</span>
                                    <span className="text-xs font-bold text-slate-800">{user?.name}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-3">
                                    <span className="text-xs text-slate-500 font-medium">Amount</span>
                                    <span className="text-xs font-bold text-emerald-600">+₱{Number(amount).toLocaleString()}</span>
                                </div>
                                {remarks && (
                                    <div className="flex justify-between items-center px-4 py-3">
                                        <span className="text-xs text-slate-500 font-medium">Remarks</span>
                                        <span className="text-xs font-bold text-slate-800">{remarks}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-2xl transition-colors cursor-pointer"
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