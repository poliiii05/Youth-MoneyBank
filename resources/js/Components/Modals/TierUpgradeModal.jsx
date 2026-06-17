// resources/js/Components/Modals/TierUpgradeModal.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
    X, Sparkles, ArrowRight, Check, Shield, FileText, 
    Image as ImageIcon, Sprout, Hammer, Crown,
} from 'lucide-react';
import DocumentSlot from '../../Pages/User/Settings/TierUpgrade/DocumentSlot';
import { showError } from '../../utils/toast';
import { useModalEnterKey } from '../../hooks/useModalEnterKey';

const TIER_ICONS = { 1: Sprout, 2: Hammer, 3: Crown };

const TIER_COLORS = {
    2: {
        bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        bgLight: 'bg-blue-50/40',
        border: 'border-blue-200',
        text: 'text-blue-900',
        accent: 'text-blue-700',
    },
    3: {
        bg: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500',
        bgLight: 'bg-amber-50/40',
        border: 'border-amber-200',
        text: 'text-amber-900',
        accent: 'text-amber-700',
    },
};

export default function TierUpgradeModal({ isOpen, onClose, currentTier, requiredDocs }) {
    const nextTier = currentTier + 1;
    const required = requiredDocs?.[nextTier] || [];

    const [documents, setDocuments] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setDocuments({});
            setIsProcessing(false);
        }
    }, [isOpen]);

    const handleSelectDoc = (docKey, data) => {
        setDocuments(prev => ({ ...prev, [docKey]: data }));
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
            onSuccess: () => {
                onClose();
            },
            onFinish: () => setIsProcessing(false),
            onError: () => {
                showError('Submission failed. Please try again.');
            },
        });
    };

    // Submit on Enter
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 relative max-h-[90vh] flex flex-col">
                
                {/* HERO HEADER (with tier color) */}
                <div className={`${colors.bg} px-5 py-4 relative overflow-hidden flex-shrink-0`}>
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                    
                    <div className="relative flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 border border-white/20">
                                <TierIcon size={20} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">Upgrade to</p>
                                <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                                    Tier {nextTier} — {tierName}
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer shrink-0"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="px-5 pt-3 pb-2 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Documents</span>
                        <span className="text-[10px] font-bold text-slate-700">
                            {completedCount} / {totalCount} complete
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'
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
                                    <Check size={13} className="text-emerald-600 mt-0.5 shrink-0" strokeWidth={2.5} />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

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
                        className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing || !canSubmit}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed ${
                            canSubmit && !isProcessing
                                ? `${colors.bg} text-white shadow-md hover:shadow-lg`
                                : 'bg-slate-100 text-slate-400'
                        }`}
                    >
                        {isProcessing ? (
                            <span>Submitting...</span>
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