import { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import YmbLogo from '@/Components/Common/YmbLogo';

/**
 * Spotlight — a coach-mark tour over real interface elements.
 *
 * Steps point at elements by `data-tour` attribute rather than by CSS class,
 * so restyling a component cannot silently break the tour. A step whose target
 * is missing from the page is skipped instead of leaving a cutout over
 * nothing — the dashboard renders different things depending on the account,
 * and a tour that highlights empty space teaches nothing.
 *
 * The cutout is a large box-shadow on a transparent element rather than an SVG
 * mask: one element, no reflow, and the dimming stays put while the page
 * behind it scrolls.
 */

const PADDING = 8;
const TOOLTIP_WIDTH = 300;
const GAP = 14;

export default function Spotlight({ steps = [], isOpen, onComplete }) {
    const [index, setIndex] = useState(0);
    const [rect, setRect] = useState(null);
    const [visibleSteps, setVisibleSteps] = useState([]);

    // Resolve which steps actually have a target on this page.
    useEffect(() => {
        if (!isOpen) return;
        // A step without a target is an intro card, so it always survives.
        setVisibleSteps(steps.filter((s) => !s.target || document.querySelector(`[data-tour="${s.target}"]`)));
        setIndex(0);
    }, [isOpen, steps]);

    const step = visibleSteps[index];

    const measure = useCallback(() => {
        if (!step || !step.target) return;
        const el = document.querySelector(`[data-tour="${step.target}"]`);
        if (!el) return;
        setRect(el.getBoundingClientRect());
    }, [step]);

    useLayoutEffect(() => {
        if (!isOpen || !step) return;

        if (!step.target) {
            setRect(null);
            return;
        }

        const el = document.querySelector(`[data-tour="${step.target}"]`);
        if (!el) return;

        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Measure after the scroll settles, then keep it in sync.
        const timer = setTimeout(measure, 320);
        window.addEventListener('resize', measure);
        window.addEventListener('scroll', measure, true);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', measure);
            window.removeEventListener('scroll', measure, true);
        };
    }, [isOpen, step, measure]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') onComplete?.();
            if (e.key === 'ArrowRight') advance();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, index, visibleSteps.length]);

    const advance = () => {
        if (index < visibleSteps.length - 1) {
            setIndex(index + 1);
        } else {
            onComplete?.();
        }
    };

    if (!isOpen || !step) return null;

    // Intro card — dimmed page, nothing highlighted, brand in the middle.
    if (!step.target) {
        return createPortal(
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-foreground/60" onClick={onComplete} />

                <div className="relative w-full max-w-sm rounded-3xl bg-card border border-border shadow-2xl overflow-hidden">
                    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-emerald-900 px-6 pt-8 pb-6 text-center">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute -bottom-12 -left-8 w-36 h-36 bg-accent/20 rounded-full blur-2xl" />

                        <div className="relative flex flex-col items-center">
                            <YmbLogo variant="dark" className="h-14 w-auto mb-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">
                                Welcome to
                            </p>
                            <p className="text-2xl font-black text-white tracking-tight">
                                {step.title}
                            </p>
                        </div>
                    </div>

                    <div className="px-6 py-5 text-center">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {step.body}
                        </p>
                    </div>

                    <div className="border-t border-border px-5 py-3 flex items-center justify-between">
                        <Button variant="ghost" onClick={onComplete} className="text-muted-foreground">
                            Skip tour
                        </Button>
                        <Button onClick={advance}>
                            Show me around <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    // Everything below needs a measured target, so it waits for one.
    if (!rect) return null;

    const isLast = index === visibleSteps.length - 1;

    // Prefer below the target; flip above when there is no room.
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeBelow = spaceBelow > 190;

    const top = placeBelow ? rect.bottom + GAP : rect.top - GAP;
    const left = Math.min(
        Math.max(rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2, 12),
        window.innerWidth - TOOLTIP_WIDTH - 12
    );

    return createPortal(
        <div className="fixed inset-0 z-[70]">

            {/* Cutout: a transparent box whose enormous shadow dims everything
                else. pointer-events-none so the highlighted control stays
                clickable — the point is to show it working, not to lock it. */}
            <div
                className="absolute rounded-xl pointer-events-none transition-all duration-300 ease-out"
                style={{
                    top: rect.top - PADDING,
                    left: rect.left - PADDING,
                    width: rect.width + PADDING * 2,
                    height: rect.height + PADDING * 2,
                    boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.62)',
                    outline: '2px solid var(--primary)',
                    outlineOffset: '2px',
                }}
            />

            {/* Click-through blocker everywhere except the cutout */}
            <div className="absolute inset-0" onClick={onComplete} />

            <div
                className="absolute w-[300px] rounded-2xl bg-popover border border-border shadow-2xl p-4 transition-all duration-300 ease-out"
                style={{
                    top,
                    left,
                    transform: placeBelow ? 'none' : 'translateY(-100%)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-bold text-foreground">{step.title}</p>
                    <button
                        onClick={onComplete}
                        aria-label="End tour"
                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer -mt-0.5"
                    >
                        <X size={15} />
                    </button>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {step.body}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        {visibleSteps.map((_, i) => (
                            <span
                                key={i}
                                className={cn(
                                    'h-1.5 rounded-full transition-all',
                                    i === index ? 'w-4 bg-primary' : 'w-1.5 bg-border'
                                )}
                            />
                        ))}
                    </div>

                    <Button size="sm" onClick={advance}>
                        {isLast ? 'Got it' : <>Next <ChevronRight size={14} /></>}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}