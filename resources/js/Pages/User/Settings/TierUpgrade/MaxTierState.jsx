// resources/js/Pages/User/Settings/TierUpgrade/MaxTierState.jsx
import { Trophy } from 'lucide-react';

export default function MaxTierState() {
    return (
        <div className="py-8 flex flex-col items-center text-center">
            {/* Trophy icon — amber gold (premium/achievement) */}
            <div className="relative mb-4">
                <div className="absolute inset-0 bg-accent/25 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-accent to-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/25">
                    <Trophy size={36} className="text-white" strokeWidth={2.5} />
                </div>
            </div>

            <h3 className="text-lg font-black text-foreground tracking-tight mb-1">
                Achiever Member ★
            </h3>
            <p className="text-sm text-muted-foreground font-medium max-w-md mb-5">
                You've reached the highest tier. All features are unlocked.
            </p>

            {/* Benefits card */}
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30 rounded-xl p-4 max-w-sm w-full">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-accent-foreground uppercase tracking-widest mb-1">Balance Limit</p>
                        <p className="text-lg font-black text-foreground" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>₱100,000</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-accent-foreground uppercase tracking-widest mb-1">Tier Level</p>
                        <p className="text-lg font-black text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>3 / 3</p>
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-muted-foreground font-medium mt-5">
                Thank you for completing your KYC journey 🎉
            </p>
        </div>
    );
}