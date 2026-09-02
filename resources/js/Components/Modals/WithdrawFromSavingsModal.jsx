// resources/js/Components/Modals/WithdrawFromSavingsModal.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { ArrowUpRight, ArrowRight, Wallet, PiggyBank } from 'lucide-react';
import { useModalEnterKey } from '../../Hooks/useModalEnterKey';
import ModalShell from './ModalShell';
import AmountField from './AmountField';
import { Button } from '@/Components/ui/button';

export default function WithdrawFromSavingsModal({ isOpen, onClose, savingsPoolBalance = 0 }) {
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
    }, [isOpen]);

    const numericAmount = Number(amount.replace(/,/g, '')) || 0;
    const isAmountValid = numericAmount >= 1 && numericAmount <= savingsPoolBalance;

    const limitReason = numericAmount > savingsPoolBalance && numericAmount > 0
        ? `Only ₱${savingsPoolBalance.toLocaleString('en-PH')} is unallocated. Money inside goals must be unallocated first.`
        : '';

    const handleSubmit = () => {
        if (!isAmountValid || isProcessing) return;
        setIsProcessing(true);
        setErrorMsg('');
        router.post('/savings/withdraw', { amount: numericAmount }, {
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

    return (
        <ModalShell
            isOpen={isOpen}
            onClose={onClose}
            eyebrow="Move money"
            title="Withdraw from Savings"
            icon={ArrowUpRight}
            tone="accent"
            isProcessing={isProcessing}
            processingLabel="Withdrawing…"
            success={isSuccess ? {
                title: 'Moved to your wallet',
                amount: numericAmount,
                message: 'Available to spend from your main balance.',
            } : null}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!isAmountValid || isProcessing} className="flex-[2]">
                        <ArrowUpRight size={15} strokeWidth={2.5} /> Withdraw
                    </Button>
                </>
            }
        >
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
                        <p className="text-[10px] text-muted-foreground leading-tight">Main wallet</p>
                        <p className="text-xs font-bold text-foreground leading-tight">Spendable</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Wallet size={15} className="text-muted-foreground" strokeWidth={2.5} />
                    </div>
                </div>
            </div>

            <AmountField
                value={amount}
                onChange={setAmount}
                max={savingsPoolBalance}
                maxLabel="Unallocated"
                presets={[100, 500, 1000, 2000]}
                error={errorMsg || limitReason}
                disabled={savingsPoolBalance <= 0}
                tone="accent"
            />

            {/* The most common confusion here: savings shown on the page includes
                money inside goals, but only unallocated money can be withdrawn. */}
            <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
                Only money not allocated to a goal can be withdrawn. To free up more,
                unallocate it from a goal first.
            </p>
        </ModalShell>
    );
}