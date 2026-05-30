// resources/js/Components/Modals/EditGoalModal.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, AlertCircle, Loader2, Sparkles, Target, ShieldAlert, Smartphone, ShoppingBag, PiggyBank, Landmark, Umbrella, GraduationCap, Gamepad2, Plane } from 'lucide-react';
import { useModalEnterKey } from '../../hooks/useModalEnterKey';

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

const COLOR_OPTIONS = ['bg-blue-500', 'bg-emerald-500', 'bg-red-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500'];

const getIconComponent = (name) => {
    const found = ICON_OPTIONS.find(opt => opt.name === name);
    return found ? found.Component : Target;
};

export default function EditGoalModal({ isOpen, onClose, goal }) {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [iconName, setIconName] = useState('Target');
    const [colorTheme, setColorTheme] = useState('bg-blue-500');
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen && goal) {
            setTitle(goal.title || '');
            setSubtitle(goal.subtitle || '');
            setTargetAmount((goal.target_amount || 0).toLocaleString('en-US'));
            setIconName(goal.icon_name || 'Target');
            setColorTheme(goal.color_theme || 'bg-blue-500');
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
        if (!rawValue) { setTargetAmount(''); setErrors({ ...errors, target_amount: null }); return; }
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 relative">
                {isProcessing && (
                    <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" strokeWidth={2.5} />
                        <h3 className="text-sm font-bold text-slate-900">Updating Goal</h3>
                    </div>
                )}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                    <div className="w-7 h-7" />
                    <h2 className="text-[13px] font-bold text-slate-900">{isSuccess ? 'Goal updated' : 'Edit goal'}</h2>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"><X size={14} /></button>
                </div>
                <div className="max-h-[80vh] overflow-y-auto">
                    {isSuccess ? (
                        <div className="px-5 py-6 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                <Sparkles size={24} className="text-emerald-500" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1">Changes saved!</h3>
                            <p className="text-[11px] text-slate-500 mb-4">Your goal has been updated.</p>
                            <button onClick={onClose} className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg cursor-pointer">Back to goals</button>
                        </div>
                    ) : (
                            <div className="px-5 py-4">
                                
                                {/* Live preview card — more compact */}
                                <div className="mb-3 p-2.5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0 ${colorTheme}`}>
                                            <SelectedIcon size={18} strokeWidth={2.5} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-slate-900 truncate">{title || 'Goal title'}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{subtitle || 'Goal subtitle'}</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-700 shrink-0">
                                            ₱{numericTarget > 0 ? numericTarget.toLocaleString('en-US') : '0'}
                                        </p>
                                    </div>
                                </div>

                                {/* Title + Subtitle in 2 columns */}
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Goal Title</label>
                                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Emergency" maxLength={50} autoFocus
                                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-50 text-slate-900" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subtitle</label>
                                        <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Optional" maxLength={100}
                                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-50 text-slate-900" />
                                    </div>
                                </div>
                                {errors.title && <p className="text-[10px] font-semibold text-red-500 mb-2 flex items-center gap-1"><AlertCircle size={10} /> {errors.title}</p>}

                                {/* Target Amount */}
                                <div className="mb-2">
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-semibold text-xs text-slate-400 pointer-events-none">₱</span>
                                        <input type="text" inputMode="numeric" value={targetAmount} onChange={handleTargetChange} placeholder="e.g., 5,000"
                                            className={`w-full pl-6 pr-2.5 py-1.5 border rounded-lg text-xs font-semibold outline-none transition-all ${errors.target_amount ? 'bg-red-50/20 border-red-400 focus:ring-2 focus:ring-red-50 text-red-900' : 'bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 text-slate-900'}`} />
                                    </div>
                                    {errors.target_amount && <p className="text-[10px] font-semibold text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.target_amount}</p>}
                                    {currentAmount > 0 && !errors.target_amount && <p className="text-[10px] text-slate-400 mt-0.5">Currently allocated: ₱{currentAmount.toLocaleString('en-US')}</p>}
                                </div>

                                {/* Icon + Color side-by-side */}
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Icon</label>
                                        <div className="grid grid-cols-5 gap-1">
                                            {ICON_OPTIONS.map(({ name, Component }) => (
                                                <button key={name} type="button" onClick={() => setIconName(name)}
                                                    className={`aspect-square rounded-md border flex items-center justify-center transition-all cursor-pointer ${iconName === name ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400'}`}>
                                                    <Component size={14} strokeWidth={2} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Color</label>
                                        <div className="grid grid-cols-4 gap-1">
                                            {COLOR_OPTIONS.map((color) => (
                                                <button key={color} type="button" onClick={() => setColorTheme(color)}
                                                    className={`aspect-square rounded-md transition-all cursor-pointer ${color} ${colorTheme === color ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'hover:scale-105'}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleSubmit} disabled={!isFormValid || isProcessing}
                                    className={`w-full py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${isFormValid && !isProcessing ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                                    Save Changes
                                </button>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}