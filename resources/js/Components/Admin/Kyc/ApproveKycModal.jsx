// resources/js/Components/Admin/Kyc/ApproveKycModal.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import ModalShell from '../../Modals/ModalShell';
import { Button } from '@/Components/ui/button';

export default function ApproveKycModal({ isOpen, onClose, application }) {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!application) return null;

    const handleApprove = () => {
        setIsProcessing(true);
        router.post(`/admin/kyc/${application.id}/approve`, {}, {
            onFinish: () => setIsProcessing(false),
            onSuccess: () => onClose(),
        });
    };

    return (
        <ModalShell
            isOpen={isOpen}
            onClose={onClose}
            eyebrow="Review decision"
            title="Approve application"
            icon={CheckCircle2}
            isProcessing={isProcessing}
            processingLabel="Approving…"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={isProcessing} className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={handleApprove} disabled={isProcessing} className="flex-[2]">
                        Approve &amp; upgrade to T{application.target_tier}
                    </Button>
                </>
            }
        >
            <p className="text-sm text-foreground leading-relaxed mb-4">
                You are about to approve <strong>{application.user.name}</strong>'s KYC application.
            </p>

            <dl className="rounded-xl border border-success/25 bg-success/5 p-3 space-y-1.5 mb-4">
                <Row label="User">{application.user.name}</Row>
                <Row label="Tier upgrade">
                    T{application.original_tier} → T{application.target_tier}
                </Row>
                <Row label="Documents">{application.documents.length} files</Row>
            </dl>

            {/* No mention of notifying the user: nothing in the approval path
                sends mail, and telling a reviewer otherwise would have them
                assume the applicant already knows. */}
            <p className="text-[11px] text-muted-foreground leading-relaxed">
                This upgrades the tier immediately and raises the account's balance
                limit. The change appears in the user's account the next time they
                open it — no message is sent, so tell them separately if they are
                waiting on it.
            </p>
        </ModalShell>
    );
}

function Row({ label, children }) {
    return (
        <div className="flex justify-between gap-3 text-xs">
            <dt className="text-muted-foreground font-medium">{label}</dt>
            <dd className="font-bold text-foreground text-right">{children}</dd>
        </div>
    );
}