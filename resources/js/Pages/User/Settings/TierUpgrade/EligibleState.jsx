// resources/js/Pages/User/Settings/TierUpgrade/EligibleState.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Sparkles, ArrowRight, Check, Shield, Image as ImageIcon, FileText } from 'lucide-react';
import DocumentSlot from './DocumentSlot';
import { showError } from '../../../../utils/toast';

export default function EligibleState({ currentTier, requiredDocs }) {
    const nextTier = currentTier + 1;
    const required = requiredDocs[nextTier] || [];

    const [documents, setDocuments] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

    // Update document selection
    const handleSelectDoc = (docKey, data) => {
        setDocuments(prev => ({ ...prev, [docKey]: data }));
    };

    // Clear document selection
    const handleClearDoc = (docKey) => {
        setDocuments(prev => {
            const next = { ...prev };
            delete next[docKey];
            return next;
        });
    };

    // Submit application
    const handleSubmit = () => {
        // Check all required docs present
        const missing = required.filter(key => !documents[key]);
        if (missing.length > 0) {
            showError(`Please complete all required documents (${missing.length} remaining).`);
            return;
        }

        setIsProcessing(true);

        // Build FormData with proper structure
        const formData = new FormData();
        formData.append('target_tier', nextTier);

        Object.entries(documents).forEach(([key, data]) => {
            formData.append(`documents[${key}][type]`, data.type);
            if (data.type === 'upload' && data.file) {
                formData.append(`documents[${key}][file]`, data.file);
            }
        });

        // Submit via Inertia (supports file uploads natively)
        router.post('/kyc/submit', formData, {
            forceFormData: true,
            onFinish: () => setIsProcessing(false),
            onError: () => {
                showError('Submission failed. Please try again.');
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Tier progress visual */}
            <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-3">Tier Progress</h3>
                <TierProgressBar currentTier={currentTier} />
            </div>

            {/* Why upgrade */}
            <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-4">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-3">
                    Why upgrade to Tier {nextTier}?
                </h4>
                <ul className="space-y-2">
                    {getUpgradeBenefits(nextTier).map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                            <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" strokeWidth={2.5} />
                            <span>{benefit}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Required documents */}
            <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
                    Required Documents for Tier {nextTier}
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-4">
                    Upload your documents or use samples to test the flow
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

            {/* Submit button */}
            <div className="pt-4 border-t border-slate-200">
                <button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-600 text-amber-950 text-sm font-black rounded-xl transition-all shadow-md shadow-amber-200 cursor-pointer disabled:opacity-60"
                >
                    {isProcessing ? (
                        <span>Submitting...</span>
                    ) : (
                        <>
                            <Sparkles size={16} strokeWidth={2.5} />
                            Submit Tier {nextTier} Application
                            <ArrowRight size={16} strokeWidth={2.5} />
                        </>
                    )}
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                    Documents are processed securely. Real uploads auto-deleted after 24 hours.
                </p>
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

// Tier progress visual
function TierProgressBar({ currentTier }) {
    const tiers = [
        { num: 1, name: 'Starter', limit: '₱5K' },
        { num: 2, name: 'Builder', limit: '₱20K' },
        { num: 3, name: 'Achiever', limit: '₱100K' },
    ];

    return (
        <div className="flex items-center justify-between gap-2">
            {tiers.map((tier, idx) => {
                const isComplete = currentTier > tier.num;
                const isCurrent = currentTier === tier.num;
                
                return (
                    <div key={tier.num} className="flex items-center flex-1 min-w-0">
                        <div className="flex flex-col items-center flex-1">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs mb-2 transition-all ${
                                isComplete 
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : isCurrent
                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md ring-4 ring-blue-100'
                                    : 'bg-slate-100 text-slate-400 border-2 border-dashed border-slate-300'
                            }`}>
                                {isComplete ? <Check size={14} strokeWidth={3} /> : tier.num}
                            </div>
                            <p className={`text-[10px] font-bold ${isCurrent ? 'text-blue-700' : isComplete ? 'text-emerald-700' : 'text-slate-400'}`}>
                                {tier.name}
                            </p>
                            <p className={`text-[9px] font-semibold ${isCurrent ? 'text-blue-600' : isComplete ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {tier.limit}
                            </p>
                            {isCurrent && (
                                <span className="text-[8px] font-black uppercase tracking-widest text-blue-700 mt-0.5">You</span>
                            )}
                        </div>
                        {idx < tiers.length - 1 && (
                            <div className={`h-0.5 flex-1 ${currentTier > tier.num ? 'bg-emerald-500' : 'bg-slate-200'} -translate-y-3`}></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}