import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ModalShell — the chrome every modal in this app was repeating by hand.
 *
 * Header, scrollable body, sticky footer, processing overlay and success state
 * all lived as near-identical copies in eight files. Pulling them here means a
 * change to modal behaviour happens once, and each modal file is left holding
 * only the thing that makes it different.
 *
 * tone: 'primary' for money coming in, 'accent' for money going out,
 * 'destructive' for removals.
 */

const TONES = {
    primary: 'from-primary via-primary to-emerald-900',
    accent: 'from-accent via-accent to-amber-600',
    destructive: 'from-destructive via-destructive to-red-800',
};

export default function ModalShell({
    isOpen,
    onClose,
    eyebrow,
    title,
    icon: Icon,
    tone = 'primary',
    children,
    footer,
    isProcessing = false,
    processingLabel = 'Processing…',
    success = null,
    className,
}) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
            <DialogContent className={className}>

                {/* HEADER */}
                <div className={cn('relative overflow-hidden px-5 py-4 shrink-0 bg-gradient-to-br', TONES[tone])}>
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />

                    <div className="relative flex items-center gap-2.5 min-w-0 pr-10">
                        {Icon && (
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shrink-0">
                                <Icon size={18} className="text-white" strokeWidth={2.5} />
                            </div>
                        )}
                        <div className="min-w-0">
                            {eyebrow && (
                                <DialogDescription className="text-white/70">
                                    {eyebrow}
                                </DialogDescription>
                            )}
                            <DialogTitle className="text-white">{title}</DialogTitle>
                        </div>
                    </div>
                </div>

                {/* SUCCESS replaces the body entirely — once it has happened,
                    the form that produced it is no longer the point. */}
                {success ? (
                    <div className="px-6 py-10 flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mb-4">
                            <CheckCircle2 size={28} className="text-success" strokeWidth={2.5} />
                        </div>

                        <h3 className="text-lg font-bold text-foreground mb-1">
                            {success.title}
                        </h3>

                        {success.amount != null && (
                            <p className="text-3xl font-black text-foreground tabular-nums tracking-tight my-2">
                                ₱{Number(success.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </p>
                        )}

                        {success.message && (
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                                {success.message}
                            </p>
                        )}

                        <Button onClick={onClose} size="lg" className="w-full mt-6" autoFocus>
                            Done
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* BODY */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 relative">
                            {isProcessing && (
                                <div className="absolute inset-0 z-10 bg-card/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                                    <Loader2 className="w-7 h-7 text-primary animate-spin" strokeWidth={2.5} />
                                    <p className="text-xs font-semibold text-muted-foreground">{processingLabel}</p>
                                </div>
                            )}
                            {children}
                        </div>

                        {/* FOOTER — sticky, so the primary action stays reachable
                            without scrolling to the bottom of a long form. */}
                        {footer && (
                            <div className="shrink-0 border-t border-border bg-card px-5 py-3 flex items-center gap-2">
                                {footer}
                            </div>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}