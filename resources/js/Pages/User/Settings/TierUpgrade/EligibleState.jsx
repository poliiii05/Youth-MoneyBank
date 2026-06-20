// resources/js/Pages/User/Settings/TierUpgrade/EligibleState.jsx
import { useState } from 'react';
import { 
    Sparkles, Check, ShieldCheck,
    Sprout, Hammer, Crown,
} from 'lucide-react';
import TierUpgradeModal from '../../../../Components/Modals/TierUpgradeModal';

// PROGRESSIVE EMERALD → AMBER theme
const TIER_DATA = {
    1: {
        name: 'Starter',
        icon: Sprout,
        limit: 5000,
        limitLabel: '₱5,000',
        requires: 'Phone or Google Sign-In',
        color: {
            badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            iconBg: 'bg-emerald-500',
            ring: 'ring-emerald-200',
            bg: 'bg-emerald-50/40',
            border: 'border-emerald-200',
            text: 'text-emerald-700',
            textDeep: 'text-emerald-900',
            dot: 'bg-emerald-500',
        },
    },
    2: {
        name: 'Builder',
        icon: Hammer,
        limit: 20000,
        limitLabel: '₱20,000',
        requires: 'Student ID required',
        color: {
            badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            iconBg: 'bg-emerald-700',
            ring: 'ring-emerald-300',
            bg: 'bg-emerald-50/50',
            border: 'border-emerald-300',
            text: 'text-emerald-800',
            textDeep: 'text-emerald-950',
            dot: 'bg-emerald-700',
        },
    },
    3: {
        name: 'Achiever',
        icon: Crown,
        limit: 100000,
        limitLabel: '₱100,000',
        requires: 'Government ID + Age 18+',
        color: {
            badge: 'bg-amber-100 text-amber-800 border-amber-200',
            iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600',
            ring: 'ring-amber-200',
            bg: 'bg-amber-50/40',
            border: 'border-amber-200',
            text: 'text-amber-700',
            textDeep: 'text-amber-900',
            dot: 'bg-amber-500',
        },
    },
};

export default function EligibleState({ currentTier, requiredDocs }) {
    const nextTier = currentTier + 1;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currentTierData = TIER_DATA[currentTier];
    const CurrentIcon = currentTierData.icon;

    return (
        <>
            <div className="space-y-4">
                
                {/* SECTION 1: Current Status Hero Banner */}
                <div className={`bg-gradient-to-br ${
                    currentTier === 3
                        ? 'from-amber-50 via-amber-50/80 to-amber-100/50 border-amber-200'
                        : 'from-emerald-50 via-emerald-50/80 to-emerald-100/50 border-emerald-200'
                } border rounded-2xl p-5`}>
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck size={14} className={currentTierData.color.text} strokeWidth={2.5} />
                        <span className={`text-[10px] font-black ${currentTierData.color.text} uppercase tracking-widest`}>Current Status</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className={`text-2xl font-black ${currentTierData.color.textDeep} tracking-tight`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                                Tier {currentTier} — {currentTierData.name}
                            </h2>
                            <p className={`text-xs ${currentTierData.color.text} font-semibold mt-0.5`}>
                                Balance limit: <span style={{ fontVariantNumeric: 'tabular-nums' }}>{currentTierData.limitLabel}</span>
                            </p>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl ${currentTierData.color.iconBg} flex items-center justify-center shadow-md shadow-emerald-200/50 shrink-0`}>
                            <CurrentIcon size={26} className="text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* SECTION 2: Tier List Cards */}
                <div className="space-y-3">
                    {[1, 2, 3].map((tier) => {
                        const isComplete = currentTier > tier;
                        const isCurrent = currentTier === tier;
                        const isNext = tier === nextTier;
                        const tierData = TIER_DATA[tier];
                        const TierIcon = tierData.icon;

                        return (
                            <div 
                                key={tier}
                                className={`relative rounded-2xl p-4 transition-all ${
                                    isCurrent
                                        ? `${tierData.color.bg} border-2 ${tierData.color.border} ring-2 ${tierData.color.ring}`
                                        : isComplete
                                        ? 'bg-slate-50 border border-slate-200 opacity-80'
                                        : isNext
                                        ? `${tierData.color.bg} border ${tierData.color.border}`
                                        : 'bg-white border border-slate-200'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    {/* LEFT: Tier info */}
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={`w-11 h-11 rounded-xl ${tierData.color.iconBg} flex items-center justify-center shadow-sm shrink-0 ${isComplete ? 'opacity-60' : ''}`}>
                                            <TierIcon size={20} className="text-white" strokeWidth={2.5} />
                                        </div>
                                        
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${tierData.color.badge}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                    Tier {tier}
                                                </span>
                                                {isCurrent && (
                                                    <span className={`text-[10px] font-black ${tierData.color.text} flex items-center gap-1`}>
                                                        <span className={`w-1.5 h-1.5 ${tierData.color.dot} rounded-full animate-pulse`}></span>
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <h3 className="text-base font-black text-slate-900 leading-tight">{tierData.name}</h3>
                                            <p className="text-xs text-slate-600 font-bold mt-0.5">
                                                Limit: <span className="text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>{tierData.limitLabel}</span>
                                            </p>
                                            <p className="text-[11px] text-slate-500 font-medium mt-1">
                                                Requires: {tierData.requires}
                                            </p>
                                        </div>
                                    </div>

                                    {/* RIGHT: Status indicator / CTA */}
                                    <div className="shrink-0">
                                        {isComplete && (
                                            <div className="w-9 h-9 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center">
                                                <Check size={16} className="text-emerald-700" strokeWidth={3} />
                                            </div>
                                        )}
                                        {isCurrent && (
                                            <div className={`w-9 h-9 rounded-full bg-white border-2 ${tierData.color.border} flex items-center justify-center`}>
                                                <Check size={16} className={tierData.color.text} strokeWidth={3} />
                                            </div>
                                        )}
                                        {isNext && (
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-200 cursor-pointer flex items-center gap-1.5 active:scale-95"
                                            >
                                                <Sparkles size={12} strokeWidth={2.5} />
                                                Upgrade
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center pt-2">
                    <p className="text-[10px] text-slate-400 font-medium">
                        Click "Upgrade" to start your Tier {nextTier} application
                    </p>
                </div>
            </div>

            <TierUpgradeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentTier={currentTier}
                requiredDocs={requiredDocs}
            />
        </>
    );
}