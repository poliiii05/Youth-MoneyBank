// resources/js/Components/Admin/Kyc/RejectKycModal.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { XCircle, AlertTriangle } from 'lucide-react';
import ModalShell from '../../Modals/ModalShell';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { cn } from '@/lib/utils';

const MIN_REASON = 10;
const MAX_REASON = 500;

export default function RejectKycModal({ isOpen, onClose, application }) {
    const [reason, setReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    if (!application) return null;

    const trimmed = reason.trim();
    const canSubmit = trimmed.length >= MIN_REASON && reason.length <= MAX_REASON;
    const charsLeft = MAX_REASON - reason.length;

    const handleReject = () => {
        if (!canSubmit) return;
        setError('');
        setIsProcessing(true);

        router.post(`/admin/kyc/${application.id}/reject`, { reason: trimmed }, {
            onFinish: () => setIsProcessing(false),
            onSuccess: () => {
                onClose();
                setReason('');
            },
            onError: (errors) => setError(errors.reason || 'Failed to reject. Please try again.'),
        });
    };

    const handleClose = () => {
        setReason('');
        setError('');
        onClose();
    };

    return (
        <ModalShell
            isOpen={isOpen}
            onClose={handleClose}
            eyebrow="Review decision"
            title="Reject application"
            icon={XCircle}
            tone="destructive"
            isProcessing={isProcessing}
            processingLabel="Rejecting…"
            footer={
                <>
                    <Button variant="outline" onClick={handleClose} disabled={isProcessing} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={!canSubmit || isProcessing}
                        className="flex-1"
                    >
                        Reject application
                    </Button>
                </>
            }
        >
            <p className="text-sm text-foreground leading-relaxed mb-4">
                You are about to reject <strong>{application.user.name}</strong>'s
                application for Tier {application.target_tier}.
            </p>

            <div className="mb-4">
                <div className="flex items-baseline justify-between mb-1.5">
                    <Label htmlFor="reject-reason">
                        Reason <span className="text-destructive">*</span>
                    </Label>
                    <span className={cn(
                        'text-[10px] tabular-nums',
                        charsLeft < 50 ? 'text-destructive' : 'text-muted-foreground'
                    )}>
                        {charsLeft} left
                    </span>
                </div>

                <textarea
                    id="reject-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    maxLength={MAX_REASON}
                    autoFocus
                    placeholder="e.g. The uploaded ID is blurred and the birth date cannot be read."
                    className={cn(
                        'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors resize-none',
                        'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        error && 'border-destructive'
                    )}
                />

                {/* The reason is what the applicant reads on their KYC status
                    page, so it is written to them rather than filed as an
                    internal note. */}
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                    This is shown to the applicant. Say what was wrong and what to
                    change, so their next submission can succeed.
                    {trimmed.length > 0 && trimmed.length < MIN_REASON && (
                        <span className="text-destructive font-semibold">
                            {' '}At least {MIN_REASON} characters.
                        </span>
                    )}
                </p>

                {error && (
                    <p className="text-[11px] font-semibold text-destructive mt-1.5 flex items-start gap-1">
                        <AlertTriangle size={12} className="mt-0.5 shrink-0" /> {error}
                    </p>
                )}
            </div>

            <div className="rounded-xl border border-accent/30 bg-accent/10 p-3">
                <p className="text-[11px] text-accent-foreground leading-relaxed">
                    The user stays on Tier {application.original_tier} and can apply
                    again once they have fixed the issue.
                </p>
            </div>
        </ModalShell>
    );
}