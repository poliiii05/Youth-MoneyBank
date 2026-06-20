// resources/js/Components/Modals/TierUpgradeModal.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
    X, Sparkles, ArrowRight, Check, Shield, FileText, 
    Image as ImageIcon, Sprout, Hammer, Crown, Loader2, AlertCircle,
} from 'lucide-react';
import DocumentSlot from '../../Pages/User/Settings/TierUpgrade/DocumentSlot';
import { showError } from '../../utils/toast';
import { useModalEnterKey } from '../../hooks/useModalEnterKey';

const TIER_ICONS = { 1: Sprout, 2: Hammer, 3: Crown };

// PROGRESSIVE EMERALD → AMBER (matches Settings tier colors)
const TIER_COLORS = {
    2: {
        // Tier 2 Builder = EMERALD
        heroGradient: 'from-emerald-700 via-emerald-800 to-teal-900',
        bgLight: 'bg-emerald-50/40',
        border: 'border-emerald-200',
        text: 'text-emerald-900',
        accent: 'text-emerald-700',
        progressBar: 'bg-emerald-600',
        button: 'bg-emerald-700 hover:bg-emerald-800',
        buttonShadow: 'shadow-emerald-200',
        checkColor: 'text-emerald-700',
    },
    3: {
        // Tier 3 Achiever = AMBER (gold premium)
        heroGradient: 'from-amber-600 via-amber-700 to-amber-800',
        bgLight: 'bg-amber-50/40',
        border: 'border-amber-200',
        text: 'text-amber-900',
        accent: 'text-amber-700',
        progressBar: 'bg-amber-600',
        button: 'bg-amber-700 hover:bg-amber-800',
        buttonShadow: 'shadow-amber-200',
        checkColor: 'text-amber-700',
    },
};

export default function TierUpgradeModal({ isOpen, onClose, currentTier, requiredDocs }) {
    const nextTier = currentTier + 1;
    const required = requiredDocs?.[nextTier] || [];

    const [documents, setDocuments] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setDocuments({});
            setIsProcessing(false);
            setErrors({});
        }
    }, [isOpen]);

    const handleSelectDoc = (docKey, data) => {
        setDocuments(prev => ({ ...prev, [docKey]: data }));
        // Clear errors when user re-attempts
        setErrors({});
    };

    const handleClearDoc = (docKey) => {
        setDocuments(prev => {
            const next = { ...prev };
            delete next[docKey];
            return next;
        });
    };

    const handleSubmit = () => {
        const missing = required.filter(key => !documents[key]);
        if (missing.length > 0) {
            showError(`Please complete all required documents (${missing.length} remaining).`);
            return;
        }

        setIsProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append('target_tier', nextTier);

        Object.entries(documents).forEach(([key, data]) => {
            formData.append(`documents[${key}][type]`, data.type);
            if (data.type === 'upload' && data.file) {
                formData.append(`documents[${key}][file]`, data.file);
            }
        });

        router.post('/kyc/submit', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsProcessing(false);
                onClose();
            },
            onError: (errs) => {
                setIsProcessing(false);
                setErrors(errs);
                
                // Show specific error if available
                const errorMessages = Object.values(errs);
                if (errorMessages.length > 0) {
                    showError(errorMessages[0]);
                } else {
                    showError('Submission failed. Please check your documents and try again.');
                }
                
                console.error('KYC submission errors:', errs);
            },
        });
    };

    const canSubmit = required.every(key => documents[key]);
    useModalEnterKey({
        isOpen,
        isSuccess: false,
        canSubmit,
        isProcessing,
        onSubmit: handleSubmit,
    });

    if (!isOpen) return null;

    const TierIcon = TIER_ICONS[nextTier] || Sparkles;
    const colors = TIER_COLORS[nextTier] || TIER_COLORS[2];
    const benefits = getUpgradeBenefits(nextTier);
    const tierName = nextTier === 2 ? 'Builder' : nextTier === 3 ? 'Achiever' : 'Upgrade';
    
    const completedCount = required.filter(key => documents[key]).length;
    const totalCount = required.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 relative max-h-[90vh] flex flex-col">
                
                {/* Processing overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center">
                        <div className="relative mb-4">
                            <div className={`w-14 h-14 rounded-full ${nextTier === 3 ? 'bg-amber-100' : 'bg-emerald-100'} animate-pulse`}></div>
                            <Loader2 className={`w-8 h-8 ${colors.accent} animate-spin absolute inset-0 m-auto`} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-sm font-black text-slate-900">Submitting Application</h3>
                        <p className="text-[10px] font-medium text-slate-500 mt-1">Verifying your documents...</p>
                    </div>
                )}

                {/* HERO HEADER */}
                <div className={`relative overflow-hidden px-5 py-5 bg-gradient-to-br ${colors.heroGradient} flex-shrink-0`}>
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
                    
                    <div className="relative flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner shrink-0">
                                <TierIcon size={18} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-tight">
                                    Upgrade to
                                </p>
                                <h2 className="text-base font-black text-white tracking-tight leading-tight truncate">
                                    Tier {nextTier} — {tierName}
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-sm active:scale-95 shrink-0"
                        >
                            <X size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="px-5 pt-3 pb-2 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Documents</span>
                        <span className="text-[10px] font-bold text-slate-700" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {completedCount} / {totalCount} complete
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                progress === 100 ? 'bg-emerald-600' : colors.progressBar
                            }`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* SCROLLABLE BODY */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    
                    {/* Benefits */}
                    <div className={`${colors.bgLight} border ${colors.border} rounded-xl p-4`}>
                        <h4 className={`text-[10px] font-black ${colors.accent} uppercase tracking-widest mb-3 flex items-center gap-1.5`}>
                            <Sparkles size={11} strokeWidth={2.5} />
                            What you'll get
                        </h4>
                        <ul className="space-y-2">
                            {benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                                    <Check size={13} className={`${colors.checkColor} mt-0.5 shrink-0`} strokeWidth={2.5} />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Error display (general submission errors) */}
                    {(errors.submission || errors.documents || errors.target_tier) && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-red-900 mb-0.5">Submission failed</p>
                                <p className="text-[11px] text-red-700 font-medium">
                                    {errors.submission || errors.documents || errors.target_tier}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Required documents */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
                            Upload Required Documents
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium mb-3">
                            Use sample documents to test the flow without uploading real IDs
                        </p>

                        <div className="space-y-3">
                            {required.map((docKey) => {
                                const docInfo = getDocInfo(docKey);
                                return (
                                    <DocumentSlot
                                        key={docKey}
                                        doc={docInfo}
                                        selected={documents[docKey]}
                                        onSelect={(data) => handleSelectDoc(docKey, data)}
                                        onClear={() => handleClearDoc(docKey)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="border-t border-slate-200 px-5 py-3 flex items-center gap-3 flex-shrink-0 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-60 active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing || !canSubmit}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed active:scale-[0.98] ${
                            canSubmit && !isProcessing
                                ? `${colors.button} text-white shadow-md ${colors.buttonShadow}`
                                : 'bg-slate-100 text-slate-400'
                        }`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={14} className="animate-spin" strokeWidth={2.5} />
                                <span>Submitting...</span>
                            </>
                        ) : canSubmit ? (
                            <>
                                <Sparkles size={14} strokeWidth={2.5} />
                                Submit Application
                                <ArrowRight size={14} strokeWidth={2.5} />
                            </>
                        ) : (
                            <span>Complete documents to continue</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Document info helper
function getDocInfo(docKey) {
    const docs = {
        school_id_front: { 
            label: 'School ID (Front)', 
            description: 'Clear photo of your student ID front',
            icon: ImageIcon,
        },
        school_id_back: { 
            label: 'School ID (Back)', 
            description: 'Clear photo of your student ID back',
            icon: ImageIcon,
        },
        selfie: { 
            label: 'Selfie with ID', 
            description: 'Selfie holding your school ID',
            icon: ImageIcon,
        },
        valid_id_front: { 
            label: 'Government ID (Front)', 
            description: 'Passport, driver\'s license, or national ID',
            icon: Shield,
        },
        valid_id_back: { 
            label: 'Government ID (Back)', 
            description: 'Back of your government-issued ID',
            icon: Shield,
        },
        address_proof: { 
            label: 'Proof of Address', 
            description: 'Utility bill or bank statement (within 3 months)',
            icon: FileText,
        },
    };
    return docs[docKey] || { label: docKey, description: '', icon: FileText };
}

// Upgrade benefits per tier
function getUpgradeBenefits(tier) {
    if (tier === 2) {
        return [
            'Balance limit: ₱5,000 → ₱20,000',
            'Higher transaction limits',
            'Unlock peer-to-peer transfers',
            'Access to up to 10 savings goals',
        ];
    }
    if (tier === 3) {
        return [
            'Balance limit: ₱20,000 → ₱100,000',
            'Maximum transaction limits',
            'Priority customer support',
            'Unlimited savings goals',
            'Family allowance features',
        ];
    }
    return [];
}