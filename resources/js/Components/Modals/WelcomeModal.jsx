// resources/js/Components/Modals/WelcomeModal.jsx
import { useState, useEffect } from 'react';
import {
    ChevronRight, ChevronLeft, Sparkles, Target,
    ShieldCheck, Wallet, Flame,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import YmbLogo from '@/Components/Common/YmbLogo';

const SLIDES = [
    {
        // The opening slide introduces the product, so it shows the mark
        // rather than a stock icon — the three bars are the tier ladder the
        // rest of the tour goes on to explain.
        brand: true,
        eyebrow: 'Welcome to',
        title: 'Youth MoneyBank',
        body: 'A savings app built for Filipino teens. Set a target, move money towards it, and watch the habit build.',
    },
    {
        icon: Wallet,
        eyebrow: 'Step one',
        title: 'Add money',
        body: 'Fund your wallet through PayPal Sandbox. This is a demo environment, so no real money changes hands.',
    },
    {
        icon: Target,
        eyebrow: 'Step two',
        title: 'Set a goal',
        body: 'Name what you are saving for — a phone, an emergency fund — and move money from your wallet into it.',
    },
    {
        icon: Flame,
        eyebrow: 'Keep going',
        title: 'Build a streak',
        body: 'Saving on consecutive days builds a streak. Milestones unlock at 7, 14, 30 days and beyond.',
    },
    {
        icon: ShieldCheck,
        eyebrow: 'As you grow',
        title: 'Unlock higher limits',
        body: 'You start at ₱5,000. A student ID raises it to ₱20,000, and a government ID to ₱100,000 once you turn 18.',
    },
];

export default function WelcomeModal({ isOpen, onClose }) {
    const [index, setIndex] = useState(0);
    const [completing, setCompleting] = useState(false);
    const [failed, setFailed] = useState(false);

    const slide = SLIDES[index];
    const Icon = slide.icon ?? Sparkles;
    const isLast = index === SLIDES.length - 1;
    const isFirst = index === 0;

    const complete = async () => {
        setCompleting(true);
        setFailed(false);

        try {
            const response = await fetch('/api/onboarding/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) throw new Error('Request failed');

            onClose();
        } catch (err) {
            // Closing anyway would look dismissed while the server still thinks
            // onboarding is unfinished — the tour would simply reappear next
            // visit with no explanation.
            console.error('Onboarding completion failed:', err);
            setFailed(true);
        } finally {
            setCompleting(false);
        }
    };

    const next = () => (isLast ? complete() : setIndex(index + 1));
    const prev = () => !isFirst && setIndex(index - 1);

    // Arrow keys, because this is a deck.
    useEffect(() => {
        if (!isOpen) return;

        const onKey = (e) => {
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, index]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && complete()}>
            <DialogContent showClose={false} className="sm:max-w-sm">

                {/* HERO */}
                <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-emerald-900 px-6 pt-8 pb-6 text-white">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-12 -left-8 w-36 h-36 bg-accent/20 rounded-full blur-2xl" />

                    <div className="relative flex flex-col items-center text-center">
                        {slide.brand ? (
                            <YmbLogo variant="dark" className="h-16 w-auto mb-4" />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                                <Icon size={30} strokeWidth={2} className="text-white" />
                            </div>
                        )}

                        <DialogDescription className="text-white/70 mb-1">
                            {slide.eyebrow}
                        </DialogDescription>
                        <DialogTitle className="text-2xl mb-2">{slide.title}</DialogTitle>
                    </div>
                </div>

                {/* BODY — fixed height so the panel doesn't jump between slides
                    of different lengths. */}
                <div className="px-6 py-5">
                    <p className="text-sm text-muted-foreground leading-relaxed text-center min-h-[64px]">
                        {slide.body}
                    </p>

                    {/* Progress dots, clickable */}
                    <div className="flex items-center justify-center gap-1.5 mt-4">
                        {SLIDES.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                aria-label={`Slide ${i + 1}`}
                                className={cn(
                                    'h-1.5 rounded-full transition-all cursor-pointer',
                                    i === index ? 'w-5 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground/40'
                                )}
                            />
                        ))}
                    </div>

                    {failed && (
                        <p className="text-[11px] text-destructive text-center mt-3">
                            Couldn't save your progress. Check your connection and try again.
                        </p>
                    )}
                </div>

                {/* FOOTER */}
                <div className="border-t border-border px-5 py-3 flex items-center gap-2">
                    {isFirst ? (
                        <Button variant="ghost" onClick={complete} disabled={completing} className="text-muted-foreground">
                            Skip tour
                        </Button>
                    ) : (
                        <Button variant="ghost" size="icon" onClick={prev} aria-label="Previous">
                            <ChevronLeft size={18} />
                        </Button>
                    )}

                    <div className="flex-1" />

                    <Button onClick={next} disabled={completing}>
                        {completing
                            ? 'Finishing…'
                            : isLast
                                ? "Start saving"
                                : <>Next <ChevronRight size={16} /></>}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}