// resources/js/Pages/User/Settings/TierUpgrade/EligibleState.jsx
import { useState } from 'react';
import { 
    Sparkles, Check, ShieldCheck,
    Sprout, Hammer, Crown,
} from 'lucide-react';
import TierUpgradeModal from '../../../../Components/Modals/TierUpgradeModal';
import { Button } from '@/Components/ui/button';

/**
 * Tier presentation.
 *
 * Colours come from the --tier-N tokens rather than being written out per
 * tier here, so the ladder on this page, the sidebar indicator and the goal
 * themes cannot drift apart.
 */
const TIER_DATA = {
    1: {
        name: 'Starter',
        icon: Sprout,
        limitLabel: '₱5,000',
        requires: 'Email or Google sign-in',
        var: 'var(--tier-1)',
    },
    2: {
        name: 'Builder',
        icon: Hammer,
        limitLabel: '₱20,000',
        requires: 'Verified student ID',
        var: 'var(--tier-2)',
    },
    3: {
        name: 'Achiever',
        icon: Crown,
        limitLabel: '₱100,000',
        requires: 'Government ID · age 18+',
        var: 'var(--tier-3)',
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
                
                {/* CURRENT STATUS */}
                <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/40 p-5">
                    <span
                        className="absolute inset-y-0 left-0 w-1"
                        style={{ backgroundColor: currentTierData.var }}
                    />

                    <div className="flex items-center justify-between gap-3 pl-2">
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-muted-foreground mb-1">
                                Current status
                            </p>
                            <h2 className="text-2xl font-black text-foreground tracking-tight">
                                Tier {currentTier} — {currentTierData.name}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Balance limit{' '}
                                <span className="font-bold text-foreground tabular-nums">
                                    {currentTierData.limitLabel}
                                </span>
                            </p>
                        </div>

                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md shrink-0"
                            style={{ backgroundColor: currentTierData.var }}
                        >
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
                                className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
                                    isCurrent
                                        ? 'border-primary/40 bg-secondary/50 shadow-sm'
                                        : isComplete
                                        ? 'border-border bg-muted/40'
                                        : isNext
                                        ? 'border-border bg-card hover:border-primary/40'
                                        : 'border-border bg-card opacity-60'
                                }`}
                            >
                                {/* Tier colour as an edge, not a wash — three tinted
                                    blocks stacked made the ladder hard to read. */}
                                <span
                                    className="absolute inset-y-0 left-0 w-1"
                                    style={{ backgroundColor: tierData.var, opacity: isComplete ? 0.4 : 1 }}
                                />

                                <div className="flex items-center justify-between gap-3 pl-2">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div
                                            className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${isComplete ? 'opacity-60' : ''}`}
                                            style={{ backgroundColor: tierData.var }}
                                        >
                                            <TierIcon size={20} className="text-white" strokeWidth={2.5} />
                                        </div>
                                        
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="text-base font-bold text-foreground leading-tight">
                                                    {tierData.name}
                                                </h3>
                                                {isCurrent && (
                                                    <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                        Current
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-muted-foreground">
                                                Up to{' '}
                                                <span className="font-bold text-foreground tabular-nums">
                                                    {tierData.limitLabel}
                                                </span>
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                {tierData.requires}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="shrink-0">
                                        {isComplete && (
                                            <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center">
                                                <Check size={16} className="text-success" strokeWidth={3} />
                                            </div>
                                        )}
                                        {isCurrent && (
                                            <div className="w-9 h-9 rounded-full bg-secondary border border-primary/30 flex items-center justify-center">
                                                <Check size={16} className="text-primary" strokeWidth={3} />
                                            </div>
                                        )}
                                        {isNext && (
                                            <Button size="sm" onClick={() => setIsModalOpen(true)}>
                                                <Sparkles size={12} strokeWidth={2.5} /> Upgrade
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <p className="text-[11px] text-muted-foreground text-center pt-1">
                    Upgrading takes a document upload and an admin review.
                </p>
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