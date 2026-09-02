import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AmountField — the amount input, presets and limit messaging that all four
 * money-movement modals were each implementing separately.
 *
 * Keeping it in one place means the validation copy, the disabled preset rules
 * and the "max" affordance behave identically whether you are allocating,
 * unallocating, transferring or withdrawing.
 */
export default function AmountField({
    value,
    onChange,
    max,
    maxLabel = 'Available',
    presets = [50, 100, 200, 500],
    error,
    disabled = false,
    autoFocus = true,
    tone = 'primary',
}) {
    const numeric = Number(String(value).replace(/,/g, '')) || 0;
    const overMax = numeric > max;

    const setAmount = (n) => onChange(n ? Number(n).toLocaleString('en-US') : '');

    const handleChange = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        setAmount(raw);
    };

    const accent = tone === 'accent' ? 'text-accent-foreground' : 'text-primary';

    return (
        <div className="space-y-3">
            <div>
                <div className="flex items-baseline justify-between mb-1">
                    <Label htmlFor="amount-field">Amount</Label>
                    <button
                        type="button"
                        onClick={() => setAmount(Math.floor(max))}
                        disabled={disabled || max <= 0}
                        className={cn(
                            'text-[10px] font-semibold tabular-nums cursor-pointer hover:underline disabled:cursor-not-allowed disabled:no-underline',
                            overMax ? 'text-destructive' : 'text-muted-foreground'
                        )}
                    >
                        {maxLabel}: <span className={cn('font-bold', overMax ? 'text-destructive' : accent)}>
                            ₱{max.toLocaleString('en-PH')}
                        </span>
                    </button>
                </div>

                <div className="relative">
                    <span className={cn(
                        'absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl pointer-events-none select-none',
                        error || overMax ? 'text-destructive/60' : 'text-muted-foreground/50'
                    )}>
                        ₱
                    </span>
                    <Input
                        id="amount-field"
                        type="text"
                        inputMode="numeric"
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                        autoFocus={autoFocus}
                        placeholder="0"
                        className={cn(
                            'h-14 pl-11 text-xl font-black tabular-nums tracking-tight',
                            (error || overMax) && 'border-destructive focus-visible:ring-destructive/20'
                        )}
                    />
                </div>

                {/* Reserved height stops the layout jumping as errors come and go. */}
                <div className="min-h-[18px] mt-1">
                    {error && (
                        <p className="text-[10px] font-semibold text-destructive flex items-center gap-1">
                            <AlertCircle size={11} strokeWidth={2.5} /> {error}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {presets.map((preset) => {
                    const unavailable = disabled || preset > max;
                    const selected = numeric === preset;
                    return (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => setAmount(preset)}
                            disabled={unavailable}
                            className={cn(
                                'py-2 rounded-lg text-xs font-bold border transition-colors tabular-nums active:scale-95',
                                unavailable
                                    ? 'bg-muted text-muted-foreground/50 border-border cursor-not-allowed'
                                    : selected
                                        ? 'bg-primary text-primary-foreground border-primary cursor-pointer'
                                        : 'bg-background text-foreground border-border hover:border-primary hover:text-primary cursor-pointer'
                            )}
                        >
                            ₱{preset.toLocaleString()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}