// resources/js/Components/Modals/TransferToSavingsModal.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { ArrowDownLeft, ArrowRight, Wallet, PiggyBank } from 'lucide-react';
import { useModalEnterKey } from '../../Hooks/useModalEnterKey';
import ModalShell from './ModalShell';
import AmountField from './AmountField';
import { Button } from '@/Components/ui/button';

export default function TransferToSavingsModal({ isOpen, onClose, mainBalance = 0 }) {
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
    const isAmountValid = numericAmount >= 1 && numericAmount <= mainBalance;

    const limitReason = numericAmount > mainBalance && numericAmount > 0
        ? `Your wallet holds ₱${mainBalance.toLocaleString('en-PH')}.`
        : '';

    const handleSubmit = () => {
        if (!isAmountValid || isProcessing) return;
        setIsProcessing(true);
        setErrorMsg('');
        router.post('/savings/add', { amount: numericAmount }, {
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
            title="Transfer to Savings"
            icon={ArrowDownLeft}
            isProcessing={isProcessing}
            processingLabel="Transferring…"
            success={isSuccess ? {
                title: 'Transferred to savings',
                amount: numericAmount,
                message: 'Set aside and ready to allocate to a goal.',
            } : null}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!isAmountValid || isProcessing} className="flex-[2]">
                        <ArrowDownLeft size={15} strokeWidth={2.5} /> Transfer
                    </Button>
                </>
            }
        >
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 py-2.5 mb-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Wallet size={15} className="text-muted-foreground" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground leading-tight">Main wallet</p>
                        <p className="text-xs font-bold text-foreground tabular-nums leading-tight">
                            ₱{mainBalance.toLocaleString('en-PH')}
                        </p>
                    </div>
                </div>

                <ArrowRight size={15} className="text-muted-foreground shrink-0" strokeWidth={2.5} />

                <div className="flex items-center gap-2 min-w-0 flex-1 justify-end text-right">
                    <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground leading-tight">Savings pool</p>
                        <p className="text-xs font-bold text-foreground leading-tight">Set aside</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <PiggyBank size={15} className="text-primary" strokeWidth={2.5} />
                    </div>
                </div>
            </div>

            <AmountField
                value={amount}
                onChange={setAmount}
                max={mainBalance}
                maxLabel="In your wallet"
                presets={[100, 500, 1000, 2000]}
                error={errorMsg || limitReason}
                disabled={mainBalance <= 0}
            />

            <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
                Savings are kept separate from your spendable balance. You can move
                money back to your wallet at any time.
            </p>
        </ModalShell>
    );
}