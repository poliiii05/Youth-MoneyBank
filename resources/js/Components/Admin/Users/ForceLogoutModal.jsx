// resources/js/Components/Admin/Users/ForceLogoutModal.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { LogOut, X, AlertTriangle } from 'lucide-react';

export default function ForceLogoutModal({ isOpen, onClose, targetUser }) {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = () => {
        setIsProcessing(true);
        router.post(`/admin/users/${targetUser.id}/force-logout`, {}, {
            onFinish: () => setIsProcessing(false),
            onSuccess: () => onClose(),
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <LogOut size={20} className="text-amber-600" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900">Force Logout</h3>
                            <p className="text-[10px] text-slate-500 font-medium">End all sessions</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={isProcessing} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-40">
                        <X size={16} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-5 space-y-3">
                    <p className="text-sm text-slate-700">
                        Force logout <strong>{targetUser.name}</strong> from all active sessions?
                    </p>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <div>
                            <p className="text-[11px] text-amber-800 font-bold mb-1">This will:</p>
                            <ul className="text-[11px] text-amber-800 font-medium space-y-0.5 list-disc list-inside">
                                <li>End all active sessions across devices</li>
                                <li>User will need to log in again</li>
                                <li>Useful for suspicious activity or compromised accounts</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
                    <button onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isProcessing}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-lg shadow-md shadow-amber-200 cursor-pointer disabled:opacity-60">
                        {isProcessing ? 'Logging out...' : 'Force Logout'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}