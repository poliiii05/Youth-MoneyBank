// resources/js/utils/toast.js
import toast from 'react-hot-toast';

/**
 * Standardized toast helpers for app-wide consistency.
 */

export const showSuccess = (message, options = {}) => {
    return toast.success(message, options);
};

export const showError = (message, options = {}) => {
    return toast.error(message, {
        duration: 4000,
        ...options,
    });
};

export const showInfo = (message, options = {}) => {
    return toast(message, {
        icon: 'ℹ️',
        ...options,
    });
};

export const showWarning = (message, options = {}) => {
    return toast(message, {
        icon: '⚠️',
        style: {
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #fcd34d',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: '600',
        },
        ...options,
    });
};

/**
 * Promise toast — shows loading, then success/error
 */
export const showPromise = (promise, messages) => {
    return toast.promise(promise, {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong',
    });
};

/**
 * Confirm dialog — replaces window.confirm()
 * Returns Promise<boolean>
 */
export const showConfirm = (message, options = {}) => {
    return new Promise((resolve) => {
        toast(
            (t) => (
                <div className="flex flex-col gap-3">
                    <p className="text-sm font-semibold text-slate-900">{message}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                resolve(true);
                            }}
                            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                                options.destructive
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {options.confirmText || 'Confirm'}
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                resolve(false);
                            }}
                            className="flex-1 py-1.5 px-3 text-xs font-bold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            {
                duration: Infinity,
                style: {
                    background: '#fff',
                    color: '#0f172a',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    maxWidth: '400px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                },
            }
        );
    });
};