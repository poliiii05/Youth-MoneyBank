// resources/js/Components/Modals/EditGoalModal.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, AlertCircle, Loader2, Sparkles, Target, ShieldAlert, Smartphone, ShoppingBag, PiggyBank, Landmark, Umbrella, GraduationCap, Gamepad2, Plane, Edit2, CheckCircle2 } from 'lucide-react';
import { useModalEnterKey } from '../../Hooks/useModalEnterKey';

const ICON_OPTIONS = [
    { name: 'Target', Component: Target },
    { name: 'ShieldAlert', Component: ShieldAlert },
    { name: 'Smartphone', Component: Smartphone },
    { name: 'ShoppingBag', Component: ShoppingBag },
    { name: 'PiggyBank', Component: PiggyBank },
    { name: 'Landmark', Component: Landmark },
    { name: 'Umbrella', Component: Umbrella },
    { name: 'GraduationCap', Component: GraduationCap },
    { name: 'Gamepad2', Component: Gamepad2 },
    { name: 'Plane', Component: Plane },
];

// ALL EMERALD intensity variations
const COLOR_OPTIONS = [
    'bg-emerald-600',
    'bg-emerald-700',
    'bg-emerald-800',
    'bg-emerald-500',
    'bg-emerald-400',
];

const getIconComponent = (name) => {
    const found = ICON_OPTIONS.find(opt => opt.name === name);
    return found ? found.Component : Target;
};

export default function EditGoalModal({ isOpen, onClose, goal }) {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [iconName, setIconName] = useState('Target');
    const [colorTheme, setColorTheme] = useState('bg-emerald-600');
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen && goal) {
            setTitle(goal.title || '');
            setSubtitle(goal.subtitle || '');
            setTargetAmount((goal.target_amount || 0).toLocaleString('en-US'));
            setIconName(goal.icon_name || 'Target');
            setColorTheme(goal.color_theme || 'bg-emerald-600');
            setErrors({});
            setIsSuccess(false);
        }
    }, [isOpen, goal?.id]);

    const numericTarget = Number(targetAmount.replace(/,/g, '')) || 0;
    const currentAmount = goal?.current_amount || 0;
    const isTargetValid = numericTarget >= currentAmount && numericTarget >= 1;
    const isFormValid = title.trim().length > 0 && isTargetValid;

    const handleSubmit = () => {
        if (!isFormValid || isProcessing) return;
        setIsProcessing(true);
        setErrors({});
        router.post(`/goals/${goal.id}/update`, {
            title: title.trim(),
            subtitle: subtitle.trim() || null,
            target_amount: numericTarget,
            icon_name: iconName,
            color_theme: colorTheme,
        }, {
            preserveScroll: true,
            onSuccess: () => { setIsProcessing(false); setIsSuccess(true); },
            onError: (errs) => { setIsProcessing(false); setErrors(errs); }
        });
    };

    useModalEnterKey({
        isOpen,
        isSuccess,
        canSubmit: isFormValid,
        isProcessing,
        onSuccess: onClose,
        onSubmit: handleSubmit,
    });

    if (!isOpen || !goal) return null;

    const handleTargetChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        if (!rawValue) { 
            setTargetAmount(''); 
            setErrors({ ...errors, target_amount: null }); 
            return; 
        }
        const numValue = Number(rawValue);
        setTargetAmount(numValue.toLocaleString('en-US'));
        if (numValue < currentAmount) {
            setErrors({ ...errors, target_amount: `Cannot be less than allocated (₱${currentAmount.toLocaleString('en-US')}). Unallocate funds first.` });
        } else {
            setErrors({ ...errors, target_amount: null });
        }
    };

    const SelectedIcon = getIconComponent(iconName);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 relative max-h-[90vh] flex flex-col">
                
                {/* Processing overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center">
                        <div className="relative mb-4">
                            <div className="w-14 h-14 rounded-full bg-emerald-100 animate-pulse"></div>
                            <Loader2 className="w-8 h-8 text-emerald-700 animate-spin absolute inset-0 m-auto" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-sm font-black text-slate-900">Updating Goal</h3>
                    </div>
                )}

                {/* HERO HEADER */}
                <div className={`relative overflow-hidden px-5 py-5 ${
                    isSuccess 
                        ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700' 
                        : 'bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900'
                }`}>
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-300/20 rounded-full blur-xl"></div>
                    
                    <div className="relative flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner shrink-0">
                                {isSuccess ? (
                                    <CheckCircle2 size={18} className="text-white" strokeWidth={2.5} />
                                ) : (
                                    <Edit2 size={18} className="text-white" strokeWidth={2.5} />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-tight">
                                    {isSuccess ? 'Success' : 'Edit goal'}
                                </p>
                                <h2 className="text-base font-black text-white tracking-tight leading-tight truncate">
                                    {isSuccess ? 'Changes saved!' : (goal.title || 'Edit Goal')}
                                </h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-sm active:scale-95 shrink-0">
                            <X size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {isSuccess ? (
                    <div className="px-5 py-6 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl animate-pulse"></div>
                            <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-300 animate-in zoom-in duration-500">
                                <Sparkles size={32} className="text-white" strokeWidth={2.5} />
                            </div>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-1">Your goal has been updated</h3>
                        <p className="text-xs text-slate-500 font-medium mb-5">All changes saved successfully 🎉</p>
                        <button onClick={onClose} className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-200 active:scale-[0.98]">
                            Back to goals
                        </button>
                    </div>
                ) : (
                    <>
                        {/* BODY */}
                        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                            
                            {/* Live preview */}
                            <div className="p-3 bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0 ${colorTheme}`}>
                                        <SelectedIcon size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-slate-900 truncate">{title || 'Goal title'}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{subtitle || 'Goal subtitle'}</p>
                                    </div>
                                    <p className="text-[11px] font-bold text-emerald-700 shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        ₱{numericTarget > 0 ? numericTarget.toLocaleString('en-US') : '0'}
                                    </p>
                                </div>
                            </div>

                            {/* Title + Subtitle */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Title</label>
                                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Emergency" maxLength={50} autoFocus
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 text-slate-900" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Subtitle</label>
                                    <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Optional" maxLength={100}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 text-slate-900" />
                                </div>
                            </div>
                            {errors.title && (
                                <p className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
                                    <AlertCircle size={10} /> {errors.title}
                                </p>
                            )}

                            {/* Target Amount */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Target Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-base text-slate-300 pointer-events-none">₱</span>
                                    <input type="text" inputMode="numeric" value={targetAmount} onChange={handleTargetChange} placeholder="5,000"
                                        style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
                                        className={`w-full pl-8 pr-3 py-2 border rounded-lg text-sm font-bold outline-none transition-all ${
                                            errors.target_amount 
                                                ? 'bg-red-50/20 border-red-400 focus:ring-2 focus:ring-red-50 text-red-900' 
                                                : 'bg-white border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 text-slate-900'
                                        }`} />
                                </div>
                                {errors.target_amount && (
                                    <p className="text-[10px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle size={10} /> {errors.target_amount}
                                    </p>
                                )}
                                {currentAmount > 0 && !errors.target_amount && (
                                    <p className="text-[10px] text-slate-400 mt-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        Currently allocated: ₱{currentAmount.toLocaleString('en-US')}
                                    </p>
                                )}
                            </div>

                            {/* Icon + Color */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Icon</label>
                                    <div className="grid grid-cols-5 gap-1">
                                        {ICON_OPTIONS.map(({ name, Component }) => (
                                            <button key={name} type="button" onClick={() => setIconName(name)}
                                                className={`aspect-square rounded-md border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                                                    iconName === name 
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 scale-105' 
                                                        : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-400 hover:text-emerald-700'
                                                }`}>
                                                <Component size={14} strokeWidth={2} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Color</label>
                                    <div className="grid grid-cols-5 gap-1">
                                        {COLOR_OPTIONS.map((color) => (
                                            <button key={color} type="button" onClick={() => setColorTheme(color)}
                                                className={`aspect-square rounded-md transition-all cursor-pointer ${color} active:scale-95 ${
                                                    colorTheme === color 
                                                        ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' 
                                                        : 'hover:scale-105'
                                                }`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="border-t border-slate-200 px-5 py-3 flex items-center gap-3 flex-shrink-0 bg-slate-50/50">
                            <button onClick={onClose} className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer active:scale-95">
                                Cancel
                            </button>
                            <button onClick={handleSubmit} disabled={!isFormValid || isProcessing}
                                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer active:scale-[0.98] ${
                                    isFormValid && !isProcessing 
                                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-200' 
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}>
                                Save Changes
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}