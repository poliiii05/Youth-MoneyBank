// resources/js/Pages/User/Settings/TierUpgrade/DocumentSlot.jsx
import { useState, useRef } from 'react';
import { Check, Upload, Sparkles, X, FileText, Image as ImageIcon } from 'lucide-react';
import { showError } from '../../../../utils/toast';

export default function DocumentSlot({ doc, selected, onSelect, onClear }) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const isSelected = !!selected;
    const isSample = selected?.type === 'sample';
    const isUpload = selected?.type === 'upload';

    const validateFile = (file) => {
        const maxSize = 5 * 1024 * 1024;
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

    const handleClick = () => {
        if (isSelected) return;
        fileInputRef.current?.click();
    };

    const handleUseSample = (e) => {
        e.stopPropagation();
        onSelect({
            type: 'sample',
            name: `Sample ${doc.label}.pdf`,
        });
    };

    const formatSize = (bytes) => {
        if (!bytes) return '';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        return (bytes / 1024).toFixed(2) + ' KB';
    };

    return (
        <div className={`rounded-xl border-2 transition-all overflow-hidden ${
            isSelected 
                ? isSample 
                    ? 'bg-secondary/30 border-primary/40'
                    : 'bg-secondary/40 border-primary'
                : isDragging
                    ? 'bg-secondary border-primary border-dashed'
                    : 'bg-card border-dashed border-input hover:border-primary'
        }`}>
            
            {/* HEADER: Document label */}
            <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected 
                        ? isSample 
                            ? 'bg-primary text-white'
                            : 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                }`}>
                    {isSelected ? <Check size={18} strokeWidth={3} /> : <FileText size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">{doc.label}</p>
                    <p className="text-[11px] text-muted-foreground font-medium">{doc.description}</p>
                </div>
                {isSelected && (
                    <button
                        onClick={onClear}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-muted hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors cursor-pointer shrink-0 active:scale-95"
                        title="Remove"
                    >
                        <X size={12} strokeWidth={2.5} />
                    </button>
                )}
            </div>

            {/* BODY: Selected file or upload area */}
            {isSelected ? (
                <div className={`mx-4 mb-4 p-3 rounded-lg ${isSample ? 'bg-secondary/50' : 'bg-secondary/40'}`}>
                    <div className="flex items-center gap-2">
                        {isSample ? (
                            <Sparkles size={14} className="text-primary shrink-0" />
                        ) : (
                            <ImageIcon size={14} className="text-primary shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold truncate text-foreground">
                                {selected.name}
                            </p>
                            {selected.size && (
                                <p className="text-[9px] text-primary font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    {formatSize(selected.size)}
                                </p>
                            )}
                        </div>
                        <span className="text-[8px] font-bold uppercase tracking-widest shrink-0 text-primary">
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
                                ? 'border-primary bg-secondary'
                                : 'border-input hover:border-primary hover:bg-secondary/30'
                        }`}
                    >
                        <Upload size={18} className="text-muted-foreground mx-auto mb-1.5" strokeWidth={2} />
                        <p className="text-[11px] font-bold text-foreground">
                            Drag file here or tap to upload
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                            JPG, PNG, or PDF · Max 5MB
                        </p>
                    </div>

                    {/* Use Sample button */}
                    <button
                        onClick={handleUseSample}
                        className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 bg-secondary hover:bg-secondary text-primary text-[10px] font-bold rounded-lg transition-colors cursor-pointer border border-primary/25 active:scale-95"
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