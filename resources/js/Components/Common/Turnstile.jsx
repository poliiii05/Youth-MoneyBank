// resources/js/components/common/Turnstile.jsx
import { useEffect, useRef, useState } from 'react';

/**
 * Cloudflare Turnstile wrapper (Vite + Inertia React)
 * - Put site key into VITE_TURNSTILE_SITE_KEY in your project's root .env
 * - Calls onToken(token) when it receives a client token (send to server to verify)
 *
 * Usage:
 *  <Turnstile onToken={(token) => handleToken(token)} />
 */
export default function Turnstile({ onToken, onError }) {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);
    const hasRenderedRef = useRef(false);

    useEffect(() => {
        // Load Turnstile script if not already loaded
        const loadTurnstile = () => {
            if (document.querySelector('script[src*="turnstile"]')) {
                initializeTurnstile();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;
            script.onload = initializeTurnstile;
            document.head.appendChild(script);
        };

        const initializeTurnstile = () => {
            if (!window.turnstile || !containerRef.current || hasRenderedRef.current) {
                return;
            }

            try {
                // Get site key from environment variable
                const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACCXzxGBQrb5Aa0c';

                widgetIdRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    callback: (token) => {
                        if (onToken) onToken(token);
                    },
                    'error-callback': (error) => {
                        console.error('Turnstile error:', error);
                        if (onError) onError(error);
                    },
                    'expired-callback': () => {
                        console.log('Turnstile token expired');
                        if (onToken) onToken(null);
                    },
                    theme: 'light',
                    size: 'normal',
                });

                hasRenderedRef.current = true;
            } catch (error) {
                console.error('Error rendering Turnstile:', error);
                if (onError) onError(error);
            }
        };

        loadTurnstile();

        // Cleanup function
        return () => {
            if (window.turnstile && widgetIdRef.current !== null) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch (e) {
                    console.error('Error removing Turnstile widget:', e);
                }
            }
            hasRenderedRef.current = false;
        };
    }, []);

    return (
        <div className="flex justify-center">
            <div ref={containerRef}></div>
        </div>
    );
}
