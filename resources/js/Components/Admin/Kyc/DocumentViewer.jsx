// resources/js/Components/Admin/Kyc/DocumentViewer.jsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, FileText, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function DocumentViewer({ isOpen, onClose, doc }) {
    const [imageError, setImageError] = useState(false);

    if (!isOpen || !doc) return null;

    const isImage = doc.mime_type?.startsWith('image/');
    const isPdf = doc.mime_type === 'application/pdf';
    const isSample = doc.is_sample;

    const formattedType = doc.document_type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

    const formatSize = (bytes) => {
        if (!bytes) return '—';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        return (bytes / 1024).toFixed(2) + ' KB';
    };

    const handleDownload = () => {
        if (!doc.preview_url) return;
        const link = document.createElement('a');
        link.href = doc.preview_url;
        link.download = doc.file_name || 'document';
        link.click();
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            isSample 
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-blue-100 text-blue-700'
                        }`}>
                            {isPdf ? <FileText size={18} strokeWidth={2.5} /> : <ImageIcon size={18} strokeWidth={2.5} />}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-black text-slate-900 truncate">{formattedType}</h3>
                            <p className="text-[10px] text-slate-500 font-medium truncate">
                                {doc.file_name} · {formatSize(doc.file_size)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {!isSample && doc.preview_url && (
                            <button
                                onClick={handleDownload}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Download"
                            >
                                <Download size={16} className="text-slate-600" />
                            </button>
                        )}
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                            <X size={16} className="text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Preview area */}
                <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center p-4">
                    {isSample ? (
                        <SamplePlaceholder type={formattedType} />
                    ) : isImage && doc.preview_url && !imageError ? (
                        <img 
                            src={doc.preview_url}
                            alt={formattedType}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                            onError={() => setImageError(true)}
                        />
                    ) : isPdf && doc.preview_url ? (
                        <iframe
                            src={doc.preview_url}
                            className="w-full h-full min-h-[500px] rounded-lg shadow-md bg-white"
                            title={formattedType}
                        />
                    ) : (
                        <UnavailablePlaceholder />
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                                isSample 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                                {isSample ? 'Sample Document' : 'Real Upload'}
                            </span>
                            {doc.mime_type && (
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                    {doc.mime_type}
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={onClose}
                            className="px-3 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

function SamplePlaceholder({ type }) {
    return (
        <div className="text-center p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={32} className="text-emerald-600" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Sample Document</h3>
            <p className="text-sm text-slate-700 font-medium max-w-sm mb-1">
                Sample {type} (Demo Mode)
            </p>
            <p className="text-xs text-slate-500 font-medium max-w-sm">
                This is a placeholder for demo purposes. In production, real user-uploaded documents will be displayed here.
            </p>
        </div>
    );
}

function UnavailablePlaceholder() {
    return (
        <div className="text-center p-8">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-slate-400" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Preview Unavailable</h3>
            <p className="text-sm text-slate-500 font-medium max-w-sm">
                Unable to display this document. Try downloading instead.
            </p>
        </div>
    );
}