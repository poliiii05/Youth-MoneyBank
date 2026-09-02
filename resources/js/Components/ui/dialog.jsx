import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dialog — Radix under the hood.
 *
 * The modals here were hand-rolled overlay divs: eight copies of the same
 * markup, none of them trapping focus, locking body scroll, or closing on
 * Escape. Tab from an open modal and you landed on the page behind it.
 * Radix handles all of that, so the shells below only describe layout.
 */

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef(
    ({ className, children, showClose = true, ...props }, ref) => (
        <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
                ref={ref}
                className={cn(
                    // Bottom sheet on phones, centred panel from sm up.
                    "fixed z-50 flex flex-col bg-card shadow-2xl",
                    "inset-x-0 bottom-0 rounded-t-3xl max-h-[92vh]",
                    "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
                    "sm:w-full sm:max-w-md sm:rounded-3xl sm:max-h-[88vh]",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                    className
                )}
                {...props}
            >
                {children}

                {showClose && (
                    <DialogPrimitive.Close className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-sm active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                        <X size={16} strokeWidth={2.5} />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Content>
        </DialogPortal>
    )
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn("text-base font-black tracking-tight leading-tight truncate", className)}
        {...props}
    />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn("text-[10px] font-bold uppercase tracking-widest leading-tight", className)}
        {...props}
    />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
    Dialog,
    DialogTrigger,
    DialogPortal,
    DialogClose,
    DialogOverlay,
    DialogContent,
    DialogTitle,
    DialogDescription,
};