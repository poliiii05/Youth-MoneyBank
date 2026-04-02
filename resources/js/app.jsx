// resources/js/app.jsx

import "./bootstrap";
import "../css/app.css";

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob("./Pages/**/*.jsx", { eager: true });
        
        // Try with .jsx extension
        let page = pages[`./Pages/${name}.jsx`];
        
        if (!page) {
            // Log available pages for debugging
            console.error(`Page not found: ./Pages/${name}.jsx`);
            console.log("Available pages:", Object.keys(pages));
        }
        
        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});