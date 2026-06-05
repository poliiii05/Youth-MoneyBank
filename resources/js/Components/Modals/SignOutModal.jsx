// resources/js/Components/Modals/SignOutModal.jsx
import { X, LogOut, AlertTriangle } from 'lucide-react';

export default function SignOutModal({ isOpen, onClose, onConfirm, isProcessing }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">           
<div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">                
                {/* HEADER */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                    <div className="w-7 h-7" />
                    <h2 className="text-[13px] font-bold text-slate-900 tracking-tight">
                        Confirm Sign Out
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* BODY */}
                <div className="px-5 py-5 flex flex-col items-center text-center">
                    
                    {/* Icon */}
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-3">
                        <LogOut size={24} className="text-red-500" strokeWidth={2} />
                    </div>

                    {/* Heading */}
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                        Sign out of Youth MoneyBank?
                    </h3>
                    
                    {/* Description */}
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-5 max-w-xs">
                        You'll need to log in again next time to access your account.
                    </p>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="py-2.5 text-xs font-bold rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className="py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all shadow-md shadow-red-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                            {isProcessing ? 'Signing out...' : 'Sign Out'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}