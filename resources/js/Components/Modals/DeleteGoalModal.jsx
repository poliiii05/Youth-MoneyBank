// resources/js/Components/Modals/DeleteGoalModal.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { AlertTriangle, PiggyBank, ArrowRight, Trash2 } from 'lucide-react';
import { useModalEnterKey } from '../../Hooks/useModalEnterKey';
import { resolveGoalTheme } from '@/lib/goalThemes';
import { cn } from '@/lib/utils';
import ModalShell from './ModalShell';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

export default function DeleteGoalModal({ isOpen, onClose, goal }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [confirmText, setConfirmText] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setIsProcessing(false);
            setIsSuccess(false);
            setErrorMsg('');
            setConfirmText('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, goal?.id]);

    const hasMoneyToReturn = goal?.current_amount > 0;
    const canDelete = confirmText.trim().toUpperCase() === 'DELETE';

    const handleDelete = () => {
        if (!canDelete || isProcessing) return;
        setIsProcessing(true);
        setErrorMsg('');
        router.post(`/goals/${goal.id}/delete`, {}, {
            preserveScroll: true,
            onSuccess: () => { setIsProcessing(false); setIsSuccess(true); },
            onError: (errors) => {
                setIsProcessing(false);
                setErrorMsg(errors.goal || 'Failed to delete goal. Please try again.');
            },
        });
    };

    useModalEnterKey({
        isOpen,
        isSuccess,
        canSubmit: canDelete,
        isProcessing,
        onSuccess: onClose,
        onSubmit: handleDelete,
    });

    if (!goal) return null;

    const theme = resolveGoalTheme(goal.color_theme);

    return (
        <ModalShell
            isOpen={isOpen}
            onClose={onClose}
            eyebrow="Delete goal"
            title={goal.title}
            icon={Trash2}
            tone="destructive"
            isProcessing={isProcessing}
            processingLabel="Deleting goal…"
            success={isSuccess ? {
                title: 'Goal deleted',
                amount: hasMoneyToReturn ? goal.current_amount : null,
                message: hasMoneyToReturn
                    ? 'Returned to your savings pool, ready for another goal.'
                    : 'The goal has been removed.',
            } : null}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Keep goal
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={!canDelete || isProcessing}
                        className="flex-1"
                    >
                        <Trash2 size={15} strokeWidth={2.5} /> Delete
                    </Button>
                </>
            }
        >
            {/* What is being deleted */}
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/60 px-3 py-2 mb-4">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0', theme.bg)}>
                    <PiggyBank size={16} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate leading-tight">{goal.title}</p>
                    <p className="text-[10px] text-muted-foreground tabular-nums leading-tight">
                        ₱{Number(goal.current_amount).toLocaleString('en-PH')} of ₱{Number(goal.target_amount).toLocaleString('en-PH')}
                    </p>
                </div>
            </div>

            {/* Where the money goes. Stated plainly and up front, because
                "will I lose my money?" is the only question that matters here. */}
            {hasMoneyToReturn ? (
                <div className="rounded-xl border border-primary/25 bg-secondary p-3 mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-1.5">
                        <span className="tabular-nums">₱{Number(goal.current_amount).toLocaleString('en-PH')}</span>
                        <ArrowRight size={13} className="text-primary" strokeWidth={2.5} />
                        <span>Savings pool</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Your money is not lost. Everything allocated to this goal returns
                        to your savings pool and can be moved to another goal.
                    </p>
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-muted/60 p-3 mb-4">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        This goal has no money allocated to it, so nothing will be returned.
                    </p>
                </div>
            )}

            <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-3 mb-4 flex gap-2.5">
                <AlertTriangle size={15} className="text-destructive shrink-0 mt-0.5" strokeWidth={2.5} />
                <p className="text-[11px] text-destructive leading-relaxed font-medium">
                    This cannot be undone. The goal and its progress history will be removed.
                </p>
            </div>

            {/* Typed confirmation — deliberate friction on an irreversible action. */}
            <div>
                <Label htmlFor="delete-confirm" className="mb-1.5 block">
                    Type <span className="font-black text-destructive">DELETE</span> to confirm
                </Label>
                <Input
                    id="delete-confirm"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    autoComplete="off"
                    className={cn(
                        'font-bold tracking-widest uppercase',
                        canDelete && 'border-destructive/40'
                    )}
                />
            </div>

            {errorMsg && (
                <p className="text-[11px] text-destructive font-semibold mt-2">{errorMsg}</p>
            )}
        </ModalShell>
    );
}