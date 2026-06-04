// resources/js/Components/Modals/UploadWarningModal.jsx
import { AlertTriangle, X, ImageIcon } from 'lucide-react';

export default function UploadWarningModal({ isOpen, onClose, onUseSample, onContinueUpload, documentType }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
                
                {/* HEADER */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle size={14} className="text-amber-600" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-[13px] font-bold text-slate-900 tracking-tight">
                            Before You Upload
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* BODY */}
                <div className="px-5 py-5">
                    
                    {/* Warning message */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                        <p className="text-xs font-bold text-amber-900 mb-2">
                            ⚠️ This is a portfolio demo
                        </p>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                            Youth MoneyBank is not a licensed financial service. Your documents will not be actually verified or stored long-term. Uploaded files are automatically deleted after 24 hours.
                        </p>
                    </div>

                    {/* Recommendation */}
                    <div className="mb-5">
                        <p className="text-xs font-bold text-slate-700 mb-2">
                            We strongly recommend:
                        </p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                            Use the <strong className="text-emerald-700">Sample Document</strong> option instead of uploading your real ID. It will let you test the full KYC flow without any privacy risk.
                        </p>
                    </div>

                    {/* Required acknowledgment */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-5">
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                            <strong className="text-slate-900">If you proceed with upload:</strong> Please ensure you understand this is a demo, and only upload files you're comfortable being processed temporarily.
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2">
                        <button
                            onClick={() => {
                                onUseSample();
                                onClose();
                            }}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-200 cursor-pointer"
                        >
                            <ImageIcon size={14} strokeWidth={2.5} /> Use Sample Document Instead (Recommended)
                        </button>
                        <button
                            onClick={() => {
                                onContinueUpload();
                                onClose();
                            }}
                            className="w-full py-2.5 text-[11px] font-semibold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                        >
                            I understand, continue with upload
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}