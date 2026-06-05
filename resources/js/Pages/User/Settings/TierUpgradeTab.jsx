// resources/js/Pages/User/Settings/TierUpgradeTab.jsx
import { useState } from 'react';
import { Sparkles, Shield, Check, AlertTriangle, ImageIcon, Upload, Phone, Trophy, ArrowRight, Lock, Star } from 'lucide-react';
import UploadWarningModal from '../../../Components/Modals/UploadWarningModal';
import { showError, showInfo } from '../../../utils/toast';

export default function TierUpgradeTab({ profile }) {
    const currentTier = Number(profile.kyc_tier || 1);
    const nextTier = currentTier + 1;
    
    // State for upload warning modal
    const [warningOpen, setWarningOpen] = useState(false);
    const [warningTarget, setWarningTarget] = useState(null);

    // State for document selections
    const [documents, setDocuments] = useState({
        school_id_front: null,
        school_id_back: null,
        selfie: null,
        // For Tier 3:
        valid_id_front: null,
        valid_id_back: null,
        address_proof: null,
    });

    // Handle "Use Sample" — uses pre-made demo image
    const handleUseSample = (docKey) => {
        setDocuments(prev => ({
            ...prev,
            [docKey]: { type: 'sample', name: getSampleName(docKey) }
        }));
    };

    // Handle "Upload Real" — shows warning first
    const handleUploadClick = (docKey) => {
        setWarningTarget(docKey);
        setWarningOpen(true);
    };

    // After user clicks "Continue with upload" in modal
    const handleContinueUpload = () => {
        // Trigger hidden file input
        const fileInput = document.getElementById(`file-input-${warningTarget}`);
        if (fileInput) fileInput.click();
    };

    // Handle file selection
    const handleFileSelected = (docKey, file) => {
        if (!file) return;
        setDocuments(prev => ({
            ...prev,
            [docKey]: { type: 'real', name: file.name, file }
        }));
    };

    // Handle submit
    const handleSubmit = () => {
        const requiredDocs = nextTier === 2 
            ? ['school_id_front', 'school_id_back', 'selfie']
            : ['valid_id_front', 'valid_id_back', 'address_proof'];

        const missing = requiredDocs.filter(key => !documents[key]);
        
       if (missing.length > 0) {
            showError(`Please complete all required documents (${missing.length} remaining).`);
            return;
        }

        // Phase D will handle the actual submission
        console.log('KYC Application would be submitted:', documents);
        showInfo('This is a demo. Real KYC verification is coming soon.');
     };

    // STATE 3: Tier 3 (max tier)
    if (currentTier === 3) {
        return <MaxTierState />;
    }

    // STATE 1 & 2: Eligible (no pending submission yet)
    return (
        <div className="space-y-6">

            {/* DEMO MODE BANNER */}
            <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <AlertTriangle size={16} className="text-amber-600" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-amber-900 mb-1">Demo Mode</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                        This is a portfolio simulation. Use the <strong>Sample Documents</strong> below to test the KYC flow without uploading real personal IDs. Real uploads are auto-deleted within 24 hours.
                    </p>
                </div>
            </div>

            {/* CURRENT TIER OVERVIEW */}
            <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-3">Tier Progress</h3>
                <TierProgressBar currentTier={currentTier} />
            </div>

            {/* WHY UPGRADE */}
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

            {/* REQUIRED DOCUMENTS */}
            <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
                    Required Documents for Tier {nextTier}
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-4">
                    Upload your documents or use samples to test the flow
                </p>

                <div className="space-y-3">
                    {getRequiredDocs(nextTier).map((doc) => (
                        <DocumentUploadCard
                            key={doc.key}
                            doc={doc}
                            selected={documents[doc.key]}
                            onUseSample={() => handleUseSample(doc.key)}
                            onUploadClick={() => handleUploadClick(doc.key)}
                            onFileSelected={(file) => handleFileSelected(doc.key, file)}
                        />
                    ))}
                </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-slate-200">
                <button
                    onClick={handleSubmit}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-600 text-amber-950 text-sm font-black rounded-xl transition-all shadow-md shadow-amber-200 cursor-pointer"
                >
                    <Sparkles size={16} strokeWidth={2.5} />
                    Submit Tier {nextTier} Application
                    <ArrowRight size={16} strokeWidth={2.5} />
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                    Application will be auto-approved in demo mode (Phase D implementation)
                </p>
            </div>

            {/* WARNING MODAL */}
            <UploadWarningModal
                isOpen={warningOpen}
                onClose={() => setWarningOpen(false)}
                onUseSample={() => handleUseSample(warningTarget)}
                onContinueUpload={handleContinueUpload}
                documentType={warningTarget}
            />
        </div>
    );
}

// ─────────────────────────────────────────
// Tier 3 max state
// ─────────────────────────────────────────
function MaxTierState() {
    return (
        <div className="py-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-200 mb-4">
                <Trophy size={36} className="text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">Achiever Member ★</h3>
            <p className="text-sm text-slate-500 font-medium max-w-md mb-5">
                You've reached the highest tier. All features are unlocked.
            </p>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 max-w-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1">Balance Limit</p>
                        <p className="text-lg font-black text-amber-900">₱100,000</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1">Tier Level</p>
                        <p className="text-lg font-black text-amber-900">3 / 3</p>
                    </div>
                </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-5">
                Thank you for completing your KYC journey 🎉
            </p>
        </div>
    );
}

// ─────────────────────────────────────────
// Tier progress visual
// ─────────────────────────────────────────
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
                        <div className={`flex flex-col items-center flex-1 ${idx < tiers.length - 1 ? '' : ''}`}>
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

// ─────────────────────────────────────────
// Document upload card
// ─────────────────────────────────────────
function DocumentUploadCard({ doc, selected, onUseSample, onUploadClick, onFileSelected }) {
    const Icon = doc.icon || ImageIcon;
    const isSelected = !!selected;

    return (
        <div className={`p-4 rounded-xl border-2 transition-all ${
            isSelected 
                ? 'bg-emerald-50/30 border-emerald-300'
                : 'bg-white border-dashed border-slate-300'
        }`}>
            <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                    {isSelected ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{doc.label}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{doc.description}</p>
                    {isSelected && (
                        <p className="text-[10px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                            <Check size={10} strokeWidth={3} />
                            {selected.type === 'sample' ? 'Sample document selected' : `Uploaded: ${selected.name}`}
                        </p>
                    )}
                </div>
            </div>

            {!isSelected && (
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={onUseSample}
                        className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                    >
                        <Sparkles size={11} strokeWidth={2.5} /> Use Sample
                    </button>
                    <button
                        onClick={onUploadClick}
                        className="flex items-center justify-center gap-1.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                    >
                        <Upload size={11} strokeWidth={2.5} /> Upload File
                    </button>
                </div>
            )}

            {/* Hidden file input — triggered after warning modal */}
            <input
                type="file"
                id={`file-input-${doc.key}`}
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => onFileSelected(e.target.files?.[0])}
                className="hidden"
            />
        </div>
    );
}

// ─────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────
function getUpgradeBenefits(tier) {
    if (tier === 2) {
        return [
            'Balance limit: ₱5,000 → ₱20,000',
            'Higher transaction limits',
            'Unlock peer-to-peer transfers',
            'Access to savings goals (up to 10)',
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

function getRequiredDocs(tier) {
    if (tier === 2) {
        return [
            { key: 'school_id_front', label: 'School ID (Front)', description: 'Clear photo of your student ID front', icon: ImageIcon },
            { key: 'school_id_back', label: 'School ID (Back)', description: 'Clear photo of your student ID back', icon: ImageIcon },
            { key: 'selfie', label: 'Selfie with ID', description: 'Selfie holding your school ID', icon: ImageIcon },
        ];
    }
    if (tier === 3) {
        return [
            { key: 'valid_id_front', label: 'Government ID (Front)', description: 'Passport, driver\'s license, or national ID', icon: Shield },
            { key: 'valid_id_back', label: 'Government ID (Back)', description: 'Back of your government-issued ID', icon: Shield },
            { key: 'address_proof', label: 'Proof of Address', description: 'Utility bill or bank statement (within 3 months)', icon: ImageIcon },
        ];
    }
    return [];
}

function getSampleName(docKey) {
    const names = {
        school_id_front: 'sample-school-id-front.jpg',
        school_id_back: 'sample-school-id-back.jpg',
        selfie: 'sample-selfie.jpg',
        valid_id_front: 'sample-valid-id-front.jpg',
        valid_id_back: 'sample-valid-id-back.jpg',
        address_proof: 'sample-address-proof.jpg',
    };
    return names[docKey] || 'sample-document.jpg';
}