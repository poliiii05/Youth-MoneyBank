// resources/js/Components/Admin/PageBreadcrumb.jsx
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

/**
 * Reusable breadcrumb for admin pages.
 * 
 * Props:
 * - items: array of { label, href? }
 *   Last item shown as current page (no href).
 */
export default function PageBreadcrumb({ items = [] }) {
    if (items.length === 0) return null;

    return (
        <nav className="flex items-center gap-1.5 text-xs">
            {items.map((item, idx) => {
                const isLast = idx === items.length - 1;
                return (
                    <span key={idx} className="flex items-center gap-1.5">
                        {item.href && !isLast ? (
                            <Link 
                                href={item.href}
                                className="font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className={`font-bold ${isLast ? 'text-slate-900' : 'text-slate-500'}`}>
                                {item.label}
                            </span>
                        )}
                        {!isLast && <ChevronRight size={12} className="text-slate-300" />}
                    </span>
                );
            })}
        </nav>
    );
}