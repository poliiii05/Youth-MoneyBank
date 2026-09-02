// resources/js/Components/Modals/AllocateFundsModal.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { PlusCircle, ArrowRight, PiggyBank } from 'lucide-react';
import { useModalEnterKey } from '../../Hooks/useModalEnterKey';
import { resolveGoalTheme } from '@/lib/goalThemes';
import { cn } from '@/lib/utils';
import ModalShell from './ModalShell';
import AmountField from './AmountField';
import { Button } from '@/Components/ui/button';

export default function AllocateFundsModal({ isOpen, onClose, goal, savingsPoolBalance = 0 }) {
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
    const remainingToTarget = goal ? goal.target_amount - goal.current_amount : 0;

    // Two ceilings apply: what is in the pool, and what the goal still needs.
    // The lower one is the real limit.
    const maxAllowable = Math.max(Math.min(savingsPoolBalance, remainingToTarget), 0);
    const isAmountValid = numericAmount >= 1 && numericAmount <= maxAllowable;

    const limitReason =
        numericAmount <= 0 ? '' :
        numericAmount > savingsPoolBalance ? `Only ₱${savingsPoolBalance.toLocaleString('en-PH')} available in your savings pool.` :
        numericAmount > remainingToTarget ? `This goal only needs ₱${remainingToTarget.toLocaleString('en-PH')} more.` :
        '';

    const handleSubmit = () => {
        if (!isAmountValid || isProcessing) return;
        setIsProcessing(true);
        setErrorMsg('');
        router.post(`/goals/${goal.id}/allocate`, { amount: numericAmount }, {
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
    const progressAfter = goal.target_amount > 0
        ? ((goal.current_amount + numericAmount) / goal.target_amount) * 100
        : 0;

    return (
        <ModalShell
            isOpen={isOpen}
            onClose={onClose}
            eyebrow="Add funds to"
            title={goal.title}
            icon={PlusCircle}
            isProcessing={isProcessing}
            processingLabel="Moving money…"
            success={isSuccess ? {
                title: 'Funds allocated',
                amount: numericAmount,
                message: `Now ₱${(goal.current_amount + numericAmount).toLocaleString('en-PH')} towards ${goal.title}.`,
            } : null}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!isAmountValid || isProcessing} className="flex-[2]">
                        <PlusCircle size={15} strokeWidth={2.5} /> Add Funds
                    </Button>
                </>
            }
        >
            {/* Where the money is coming from and going to. */}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 py-2.5 mb-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <PiggyBank size={15} className="text-primary" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground leading-tight">Savings pool</p>
                        <p className="text-xs font-bold text-foreground tabular-nums leading-tight">
                            ₱{savingsPoolBalance.toLocaleString('en-PH')}
                        </p>
                    </div>
                </div>

                <ArrowRight size={15} className="text-muted-foreground shrink-0" strokeWidth={2.5} />

                <div className="flex items-center gap-2 min-w-0 flex-1 justify-end text-right">
                    <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground leading-tight truncate">{goal.title}</p>
                        <p className="text-xs font-bold text-foreground tabular-nums leading-tight">
                            ₱{Number(goal.current_amount).toLocaleString('en-PH')}
                        </p>
                    </div>
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0', theme.bg)}>
                        <PlusCircle size={15} strokeWidth={2.5} />
                    </div>
                </div>
            </div>

            <AmountField
                value={amount}
                onChange={setAmount}
                max={maxAllowable}
                maxLabel="You can add"
                presets={[50, 100, 200, 500]}
                error={errorMsg || limitReason}
                disabled={maxAllowable <= 0}
            />

            {/* What the goal will look like afterwards. */}
            {numericAmount > 0 && isAmountValid && (
                <div className="mt-4">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1 tabular-nums">
                        <span>After adding</span>
                        <span className="font-bold text-foreground">{Math.min(progressAfter, 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                            className={cn('h-2 rounded-full transition-all duration-500', theme.bg)}
                            style={{ width: `${Math.min(progressAfter, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {maxAllowable <= 0 && (
                <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
                    {remainingToTarget <= 0
                        ? 'This goal has already reached its target.'
                        : 'Your savings pool is empty. Transfer money into savings first.'}
                </p>
            )}
        </ModalShell>
    );
}