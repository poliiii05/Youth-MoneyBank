// resources/js/Components/Admin/Users/OverrideTierModal.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { TrendingUp, X, AlertTriangle } from 'lucide-react';

export default function OverrideTierModal({ isOpen, onClose, targetUser }) {
    const [newTier, setNewTier] = useState(targetUser.kyc_tier);
    const [reason, setReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        setError('');
        if (reason.trim().length < 10) {
            setError('Please provide a detailed reason (min 10 characters).');
            return;
        }
        if (newTier === targetUser.kyc_tier) {
            setError('Please select a different tier.');
            return;
        }

        setIsProcessing(true);
        router.post(`/admin/users/${targetUser.id}/override-tier`, {
            new_tier: newTier,
            reason: reason.trim(),
        }, {
            onFinish: () => setIsProcessing(false),
            onSuccess: () => {
                onClose();
                setReason('');
            },
            onError: (errors) => setError(errors.reason || errors.new_tier || 'Failed to override tier.'),
        });
    };

    const charsRemaining = 500 - reason.length;
    const tiers = [
        { id: 1, label: 'Tier 1 — Starter', limit: '₱5K' },
        { id: 2, label: 'Tier 2 — Builder', limit: '₱20K' },
        { id: 3, label: 'Tier 3 — Achiever', limit: '₱100K' },
    ];

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <TrendingUp size={20} className="text-blue-600" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">Override Tier</h3>
                            <p className="text-[10px] text-slate-500 font-medium">Manual tier adjustment</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={isProcessing} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-40">
                        <X size={16} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-5 space-y-3">
                    <p className="text-sm text-slate-700">
                        Override <strong>{targetUser.name}'s</strong> tier from <strong>Tier {targetUser.kyc_tier}</strong> to:
                    </p>

                    <div className="space-y-2">
                        {tiers.map((tier) => (
                            <button
                                key={tier.id}
                                onClick={() => setNewTier(tier.id)}
                                className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all cursor-pointer ${
                                    newTier === tier.id
                                        ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-100'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="text-left">
                                    <p className="text-xs font-black text-slate-900">{tier.label}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Limit: {tier.limit}</p>
                                </div>
                                {tier.id === targetUser.kyc_tier && (
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Current</span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 block">
                            Reason <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Compliance review approved, manual upgrade per banking ops decision..."
                            rows={3}
                            disabled={isProcessing}
                            maxLength={500}
                            className={`w-full px-3 py-2 text-xs font-medium border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                                error ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-50'
                            }`}
                        />
                        <div className="flex items-center justify-between mt-1">
                            {error ? (
                                <p className="text-[10px] font-bold text-red-600">{error}</p>
                            ) : (
                                <p className="text-[10px] text-slate-500 font-medium">Audit trail logged</p>
                            )}
                            <p className="text-[10px] font-bold text-slate-500">{charsRemaining} left</p>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <p className="text-[11px] text-amber-800 font-medium">
                            This action bypasses normal KYC review. Use only for legitimate cases.
                        </p>
                    </div>
                </div>

                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
                    <button onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isProcessing || newTier === targetUser.kyc_tier || reason.trim().length < 10}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-lg shadow-md shadow-blue-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                        {isProcessing ? 'Updating...' : `Set to Tier ${newTier}`}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}