import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely, resolving conflicts (e.g. "px-2 px-4" -> "px-4").
 * Standard shadcn/ui helper — used by every primitive in Components/ui.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}