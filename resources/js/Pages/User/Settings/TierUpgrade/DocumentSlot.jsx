DocumentSlot.jsx// resources/js/Pages/User/Settings/TierUpgrade/DocumentSlot.jsx
import { useState, useRef } from 'react';
import { Check, Upload, Sparkles, X, FileText, Image as ImageIcon } from 'lucide-react';
import { showError } from '../../../../utils/toast';

export default function DocumentSlot({ doc, selected, onSelect, onClear }) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const isSelected = !!selected;
    const isSample = selected?.type === 'sample';
    const isUpload = selected?.type === 'upload';

    // Validate file
    const validateFile = (file) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        
        if (file.size > maxSize) {
            showError(`File too large. Max 5MB. (${doc.label})`);
            return false;
        }
        if (!allowedTypes.includes(file.type)) {
            showError(`Invalid file type. Use JPG, PNG, or PDF. (${doc.label})`);
            return false;
        }
        return true;
    };

    // Handle file from picker or drag-drop
    const handleFile = (file) => {
        if (!file) return;
        if (!validateFile(file)) return;
        
        onSelect({
            type: 'upload',
            name: file.name,
            file: file,
            size: file.size,
            mimeType: file.type,
        });
    };

    // Drag-drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        handleFile(file);
    };

    // Click handler — opens file picker
    const handleClick = () => {
        if (isSelected) return; // Don't re-open if already has file
        fileInputRef.current?.click();
    };

    // Use sample (skips file picker)
    const handleUseSample = (e) => {
        e.stopPropagation();
        onSelect({
            type: 'sample',
            name: `Sample ${doc.label}.pdf`,
        });
    };

    // Format file size
    const formatSize = (bytes) => {
        if (!bytes) return '';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        return (bytes / 1024).toFixed(2) + ' KB';
    };

    return (
        <div className={`rounded-xl border-2 transition-all overflow-hidden ${
            isSelected 
                ? isSample 
                    ? 'bg-emerald-50/30 border-emerald-300'
                    : 'bg-blue-50/30 border-blue-300'
                : isDragging
                    ? 'bg-blue-50 border-blue-400 border-dashed'
                    : 'bg-white border-dashed border-slate-300 hover:border-slate-400'
        }`}>
            
            {/* HEADER: Document label */}
            <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected 
                        ? isSample 
                            ? 'bg-emerald-500 text-white'
                            : 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                }`}>
                    {isSelected ? <Check size={18} strokeWidth={3} /> : <FileText size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{doc.label}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{doc.description}</p>
                </div>
                {isSelected && (
                    <button
                        onClick={onClear}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-600 text-slate-500 transition-colors cursor-pointer shrink-0"
                        title="Remove"
                    >
                        <X size={12} strokeWidth={2.5} />
                    </button>
                )}
            </div>

            {/* BODY: Selected file or upload area */}
            {isSelected ? (
                <div className={`mx-4 mb-4 p-3 rounded-lg ${isSample ? 'bg-emerald-100/50' : 'bg-blue-100/50'}`}>
                    <div className="flex items-center gap-2">
                        {isSample ? (
                            <Sparkles size={14} className="text-emerald-600 shrink-0" />
                        ) : (
                            <ImageIcon size={14} className="text-blue-600 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                            <p className={`text-[11px] font-bold truncate ${isSample ? 'text-emerald-900' : 'text-blue-900'}`}>
                                {selected.name}
                            </p>
                            {selected.size && (
                                <p className="text-[9px] text-blue-700 font-medium">
                                    {formatSize(selected.size)}
                                </p>
                            )}
                        </div>
                        <span className={`text-[8px] font-bold uppercase tracking-widest shrink-0 ${
                            isSample ? 'text-emerald-700' : 'text-blue-700'
                        }`}>
                            {isSample ? 'Sample' : 'Uploaded'}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="px-4 pb-4">
                    {/* Drag-drop area */}
                    <div
                        onClick={handleClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
                            isDragging 
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'
                        }`}
                    >
                        <Upload size={18} className="text-slate-400 mx-auto mb-1.5" strokeWidth={2} />
                        <p className="text-[11px] font-bold text-slate-700">
                            Drag file here or tap to upload
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                            JPG, PNG, or PDF · Max 5MB
                        </p>
                    </div>

                    {/* Use Sample button */}
                    <button
                        onClick={handleUseSample}
                        className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer border border-emerald-200"
                    >
                        <Sparkles size={11} strokeWidth={2.5} />
                        Or use Sample (for demo)
                    </button>
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
            />
        </div>
    );
}