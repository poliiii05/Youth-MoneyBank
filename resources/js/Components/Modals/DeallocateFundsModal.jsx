// resources/js/Components/Modals/DeallocateFundsModal.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { MinusCircle, ArrowRight, PiggyBank } from 'lucide-react';
import { useModalEnterKey } from '../../Hooks/useModalEnterKey';
import { resolveGoalTheme } from '@/lib/goalThemes';
import { cn } from '@/lib/utils';
import ModalShell from './ModalShell';
import AmountField from './AmountField';
import { Button } from '@/Components/ui/button';

export default function DeallocateFundsModal({ isOpen, onClose, goal }) {
    const [amount, setAmount] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setErrorMsg('');
            setIsProcessing(false);
            setIsSuccess(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, goal?.id]);

    const numericAmount = Number(amount.replace(/,/g, '')) || 0;
    const maxAllowable = goal?.current_amount || 0;
    const isAmountValid = numericAmount >= 1 && numericAmount <= maxAllowable;

    const limitReason = numericAmount > maxAllowable && numericAmount > 0
        ? `This goal only holds ₱${maxAllowable.toLocaleString('en-PH')}.`
        : '';

    const handleSubmit = () => {
        if (!isAmountValid || isProcessing) return;
        setIsProcessing(true);
        setErrorMsg('');
        router.post(`/goals/${goal.id}/deallocate`, { amount: numericAmount }, {
            preserveScroll: true,
            onSuccess: () => { setIsProcessing(false); setIsSuccess(true); },
            onError: (errors) => {
                setIsProcessing(false);
                setErrorMsg(errors.amount || 'An error occurred. Please try again.');
            },
        });
    };

    useModalEnterKey({
        isOpen,
        isSuccess,
        canSubmit: isAmountValid,
        isProcessing,
        onSuccess: onClose,
        onSubmit: handleSubmit,
    });

    if (!goal) return null;

    const theme = resolveGoalTheme(goal.color_theme);

    return (
        <ModalShell
            isOpen={isOpen}
            onClose={onClose}
            eyebrow="Unallocate from"
            title={goal.title}
            icon={MinusCircle}
            tone="accent"
            isProcessing={isProcessing}
            processingLabel="Moving money back…"
            success={isSuccess ? {
                title: 'Funds returned',
                amount: numericAmount,
                message: 'Back in your savings pool, ready for another goal.',
            } : null}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!isAmountValid || isProcessing} className="flex-[2]">
                        <MinusCircle size={15} strokeWidth={2.5} /> Unallocate
                    </Button>
                </>
            }
        >
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 py-2.5 mb-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0', theme.bg)}>
                        <MinusCircle size={15} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground leading-tight truncate">{goal.title}</p>
                        <p className="text-xs font-bold text-foreground tabular-nums leading-tight">
                            ₱{maxAllowable.toLocaleString('en-PH')}
                        </p>
                    </div>
                </div>

                <ArrowRight size={15} className="text-muted-foreground shrink-0" strokeWidth={2.5} />

                <div className="flex items-center gap-2 min-w-0 flex-1 justify-end text-right">
                    <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground leading-tight">Savings pool</p>
                        <p className="text-xs font-bold text-foreground leading-tight">Available again</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <PiggyBank size={15} className="text-primary" strokeWidth={2.5} />
                    </div>
                </div>
            </div>

            <AmountField
                value={amount}
                onChange={setAmount}
                max={maxAllowable}
                maxLabel="In this goal"
                presets={[10, 50, 100, 500]}
                error={errorMsg || limitReason}
                disabled={maxAllowable <= 0}
                tone="accent"
            />

            <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
                This moves money out of the goal and back to your savings pool.
                Nothing leaves your account.
            </p>
        </ModalShell>
    );
}