// resources/js/app.jsx

import "./bootstrap";
import "../css/app.css";
import { createInertiaApp, router } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import { Toaster } from 'react-hot-toast';
import { showSuccess, showError } from './utils/toast.jsx';
createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob("./Pages/**/*.jsx", { eager: true });
        
        let page = pages[`./Pages/${name}.jsx`];
        
        if (!page) {
            console.error(`Page not found: ./Pages/${name}.jsx`);
            console.log("Available pages:", Object.keys(pages));
        }
        
        return page;
    },
    setup({ el, App, props }) {
        // Listen for Inertia navigation — surface Laravel flash messages as toasts
        router.on('finish', (event) => {
            const flash = event.detail.page?.props?.flash;
            if (flash?.success) showSuccess(flash.success);
            if (flash?.error) showError(flash.error);
        });

        createRoot(el).render(
            <>
                <App {...props} />
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#fff',
                            color: '#0f172a',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            fontSize: '13px',
                            fontWeight: '600',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                            maxWidth: '400px',
                        },
                        success: {
                            iconTheme: { primary: '#10b981', secondary: '#fff' },
                        },
                        error: {
                            duration: 4000,
                            iconTheme: { primary: '#ef4444', secondary: '#fff' },
                        },
                    }}
                />
            </>
        );
    },
});