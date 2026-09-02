import { useState, useEffect, useRef } from 'react';

/**
 * Animate a number up to its target.
 *
 * Extracted from the landing page showcase so the real pages animate the same
 * way — a figure that builds reads as something being counted, which is the
 * impression a savings total should give.
 *
 * Respects the OS "reduce motion" setting by jumping straight to the value.
 */
export default function useCountUp(target, { duration = 1200 } = {}) {
    const [value, setValue] = useState(0);
    const frameRef = useRef();

    useEffect(() => {
        const prefersReduced = typeof window !== 'undefined'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReduced || !target) {
            setValue(target || 0);
            return;
        }

        const startedAt = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - startedAt) / duration, 1);
            // ease-out cubic — quick to start, settles gently on the figure
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(target * eased);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(tick);
            }
        };

        frameRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameRef.current);
    }, [target, duration]);

    return value;
}