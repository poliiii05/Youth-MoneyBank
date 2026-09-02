// resources/js/Pages/User/Settings/TierUpgradeTab.jsx
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import EligibleState from './TierUpgrade/EligibleState';
import PendingState from './TierUpgrade/PendingState';
import RejectedState from './TierUpgrade/RejectedState';
import MaxTierState from './TierUpgrade/MaxTierState';

export default function TierUpgradeTab({ profile, kyc_status }) {
    const [reapplying, setReapplying] = useState(false);

    const status = kyc_status || {
        current_tier: Number(profile.kyc_tier || 1),
        has_application: false,
        application: null,
        is_demo_mode: false,
        required_documents: {
            2: ['school_id_front', 'school_id_back', 'selfie'],
            3: ['valid_id_front', 'valid_id_back', 'address_proof'],
        },
    };

    const currentTier = status.current_tier;
    const application = status.application;

    const renderState = () => {
        if (currentTier === 3) {
            return <MaxTierState />;
        }

        if (reapplying) {
            return (
                <EligibleState 
                    currentTier={currentTier} 
                    requiredDocs={status.required_documents}
                />
            );
        }

        if (status.has_application && application) {
            if (application.status === 'pending') {
                return <PendingState application={application} />;
            }
            if (application.status === 'rejected') {
                return (
                    <RejectedState 
                        application={application} 
                        onReApply={() => setReapplying(true)}
                    />
                );
            }
        }

        return (
            <EligibleState 
                currentTier={currentTier} 
                requiredDocs={status.required_documents}
            />
        );
    };

    return (
        <div className="space-y-6">
            {/* DEMO MODE BANNER — amber (informational) */}
            {status.is_demo_mode && currentTier < 3 && (
                <div className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/30 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 bg-accent/15 rounded-lg flex items-center justify-center shrink-0">
                        <AlertTriangle size={16} className="text-accent-foreground" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-foreground mb-1">Demo Mode</p>
                        <p className="text-[11px] text-accent-foreground leading-relaxed">
                            Applications are auto-approved in this portfolio deployment. Use the <strong>Sample Documents</strong> below to test the KYC flow without uploading real personal IDs. Real uploads are auto-deleted within 24 hours.
                        </p>
                    </div>
                </div>
            )}

            {renderState()}
        </div>
    );
}