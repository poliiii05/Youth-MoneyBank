import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

/**
 * AmountForm — the amount field, presets and cap notice.
 *
 * The four money modals (allocate, unallocate, transfer, withdraw) were four
 * copies of this: same input, same preset grid, same "you only have X" error.
 * Extracting it means a fix to how money is entered applies to all of them at
 * once, and each modal file is left holding only its own context and endpoint.
 */
export default function AmountForm({
    amount,
    onAmountChange,
    presets = [],
    max = 0,
    maxLabel = 'Available',
    error = '',
    disabled = false,
    autoFocus = true,
}) {
    const numeric = Number(String(amount).replace(/,/g, '')) || 0;
    const overMax = numeric > max && numeric > 0;
    const showError = Boolean(error) || overMax;

    const setPreset = (value) => onAmountChange(value.toLocaleString('en-US'));

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="amount-input">Amount</Label>
                <span className="text-[10px] font-medium text-muted-foreground">
                    {maxLabel}:{' '}
                    <span className={cn('font-bold tabular-nums', showError ? 'text-destructive' : 'text-primary')}>
                        ₱{Number(max).toLocaleString('en-PH')}
                    </span>
                </span>
            </div>

            <div className="relative">
                <span className={cn(
                    'absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl pointer-events-none select-none',
                    showError ? 'text-destructive/60' : 'text-muted-foreground/50'
                )}>
                    ₱
                </span>
                <Input
                    id="amount-input"
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={onAmountChange ? (e) => onAmountChange(e.target.value) : undefined}
                    disabled={disabled}
                    autoFocus={autoFocus}
                    placeholder={disabled ? '0' : 'Enter amount'}
                    className={cn(
                        'h-14 pl-11 text-xl font-black tabular-nums tracking-tight',
                        showError && 'border-destructive focus-visible:ring-destructive/20 text-destructive'
                    )}
                />
            </div>

            {/* Reserved height, so the panel does not jump as errors come and go. */}
            <div className="min-h-[18px] mt-1.5">
                {showError && (
                    <p className="text-[10px] font-bold text-destructive flex items-center gap-1">
                        <AlertCircle size={11} strokeWidth={2.5} />
                        {error || `Maximum is ₱${Number(max).toLocaleString('en-PH')}.`}
                    </p>
                )}
            </div>

            {presets.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                    {presets.map((preset) => {
                        const unavailable = disabled || preset > max;
                        const selected = numeric === preset;

                        return (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => setPreset(preset)}
                                disabled={unavailable}
                                className={cn(
                                    'py-2 rounded-lg text-xs font-bold border transition-all tabular-nums',
                                    unavailable
                                        ? 'bg-muted text-muted-foreground/50 border-border cursor-not-allowed'
                                        : selected
                                            ? 'bg-primary text-primary-foreground border-primary shadow-sm cursor-pointer'
                                            : 'bg-background text-foreground border-border hover:border-primary hover:text-primary cursor-pointer'
                                )}
                            >
                                ₱{preset.toLocaleString()}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}