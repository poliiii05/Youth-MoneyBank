import { cn } from '@/lib/utils';
import YmbLogo from './YmbLogo';

/**
 * YmbLockup — the full horizontal logo lockup.
 *
 * Mark + divider + wordmark + tagline, as inline SVG and live text rather
 * than a flat image. Replaces /images/YouthMoneyBank.png, which shipped a
 * white background and blue fills that fought the emerald theme.
 *
 * Because the wordmark is real text, it stays crisp at any zoom, is
 * selectable and readable by screen readers, and recolours with the theme.
 *
 * variant: 'brand' for light backgrounds, 'dark' for dark ones.
 * size:    'sm' | 'md' | 'lg'
 */
export default function YmbLockup({
    variant = 'brand',
    size = 'md',
    tagline = 'Filipino Teen Banking',
    showTagline = true,
    className,
    ...props
}) {
    const scale = {
        sm: { mark: 'h-8', word: 'text-lg', tag: 'text-[8px]', gap: 'gap-3' },
        md: { mark: 'h-12', word: 'text-2xl', tag: 'text-[10px]', gap: 'gap-4' },
        lg: { mark: 'h-16', word: 'text-4xl', tag: 'text-xs', gap: 'gap-5' },
    }[size];

    const onDark = variant === 'dark';

    return (
        <div className={cn('flex items-center', scale.gap, className)} {...props}>
            <YmbLogo variant={variant} className={cn(scale.mark, 'w-auto')} />

            {/* Divider rule */}
            <span
                className={cn(
                    'w-px self-stretch my-1',
                    onDark ? 'bg-emerald-400/40' : 'bg-primary/25'
                )}
                aria-hidden="true"
            />

            <div className="flex flex-col justify-center">
                <p className={cn(scale.word, 'font-bold leading-none tracking-tight')}>
                    <span className={onDark ? 'text-white' : 'text-foreground'}>Youth</span>
                    <span className={onDark ? 'text-emerald-400' : 'text-primary'}>MoneyBank</span>
                </p>

                {showTagline && (
                    <p
                        className={cn(
                            scale.tag,
                            'font-bold uppercase tracking-[0.18em] mt-1.5',
                            onDark ? 'text-emerald-400' : 'text-primary'
                        )}
                    >
                        {tagline}
                    </p>
                )}
            </div>
        </div>
    );
}