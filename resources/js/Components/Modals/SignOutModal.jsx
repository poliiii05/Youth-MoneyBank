// resources/js/Components/Modals/SignOutModal.jsx
import { createPortal } from 'react-dom';

export default function SignOutModal({ isOpen, onClose, onConfirm, isProcessing }) {
    if (!isOpen) return null;

   return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* BODY */}
                    <div className="px-6 py-7 text-center">
                        <h3 className="text-base font-bold text-slate-900 mb-1 tracking-tight">
                            Logout
                        </h3>
                        <p className="text-sm text-slate-600 font-medium mb-6">
                            Are you sure you want to logout?
                        </p>
                        
                        {/* Buttons */}
                        <div className="grid grid-cols-2 gap-2.5">
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
                                className="py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all shadow-md shadow-red-200 cursor-pointer disabled:opacity-50"
                            >
                                {isProcessing ? '...' : 'YES'}
                            </button>
                        </div>
                    </div>
            </div>
        </div>,
        document.body
    );
}