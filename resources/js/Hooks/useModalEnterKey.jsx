// resources/js/hooks/useModalEnterKey.js
import { useEffect } from 'react';

/**
 * useModalEnterKey - Global Enter key handler for modals.
 * 
 * Press Enter to trigger primary action (submit) or close success state.
 * 
 * Usage:
 *   useModalEnterKey({
 *     isOpen,
 *     isSuccess,
 *     canSubmit,
 *     isProcessing,
 *     onSuccess: onClose,
 *     onSubmit: handleSubmit,
 *   });
 */
export function useModalEnterKey({ isOpen, isSuccess, canSubmit, isProcessing, onSuccess, onSubmit }) {
    useEffect(() => {
        if (!isOpen) return;

        const handleEnter = (e) => {
            if (e.key !== 'Enter') return;
            if (e.target.tagName === 'TEXTAREA') return;
            
            e.preventDefault();

            if (isSuccess) {
                onSuccess?.();
            } else if (canSubmit && !isProcessing) {
                onSubmit?.();
            }
        };

        window.addEventListener('keydown', handleEnter);
        return () => window.removeEventListener('keydown', handleEnter);
    }, [isOpen, isSuccess, canSubmit, isProcessing, onSuccess, onSubmit]);
}