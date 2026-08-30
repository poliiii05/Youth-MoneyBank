// resources/js/Components/Modals/CreateGoalModal.jsx
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Target, Smartphone, Gamepad2, Plane, ShoppingBag, PiggyBank, Landmark, Umbrella, GraduationCap, ShieldAlert, X, Loader2, Sparkles } from 'lucide-react';
import { useModalEnterKey } from '../../Hooks/useModalEnterKey';

// Template presets
const TEMPLATE_PRESETS = {
    'Emergency': {
        title: 'Emergency Fund',
        subtitle: 'For unexpected expenses',
        target_amount: '5000',
        icon_name: 'ShieldAlert',
        color_theme: 'bg-emerald-600',
    },
    'Phone': {
        title: 'New Phone',
        subtitle: 'Saving for an upgrade',
        target_amount: '15000',
        icon_name: 'Smartphone',
        color_theme: 'bg-emerald-600',
    },
    'Travel': {
        title: 'Travel Fund',
        subtitle: 'Adventure awaits',
        target_amount: '10000',
        icon_name: 'Plane',
        color_theme: 'bg-emerald-600',
    },
};

export default function CreateGoalModal({ isOpen, onClose, template = null }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title: '',
        subtitle: '',
        target_amount: '',
        icon_name: 'PiggyBank',
        color_theme: 'bg-emerald-600',
    });
    
    useEffect(() => {
        if (isOpen && template && TEMPLATE_PRESETS[template]) {
            const preset = TEMPLATE_PRESETS[template];
            setData({
                title: preset.title,
                subtitle: preset.subtitle,
                target_amount: preset.target_amount,
                icon_name: preset.icon_name,
                color_theme: preset.color_theme,
            });
        }
    }, [isOpen, template]);

    const isFormValid = data.title.trim().length > 0 && Number(data.target_amount) >= 50;

    const submit = (e) => {
        if (e) e.preventDefault();
        clearErrors();
        post('/goals', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    useModalEnterKey({
        isOpen,
        isSuccess: false,
        canSubmit: isFormValid,
        isProcessing: processing,
        onSuccess: onClose,
        onSubmit: () => submit(null),
    });

    if (!isOpen) return null;

    const icons = [
        { name: 'PiggyBank', component: <PiggyBank size={20} /> },
        { name: 'Target', component: <Target size={20} /> },
        { name: 'ShieldAlert', component: <ShieldAlert size={20} /> },
        { name: 'Smartphone', component: <Smartphone size={20} /> },
        { name: 'Landmark', component: <Landmark size={20} /> },
        { name: 'Umbrella', component: <Umbrella size={20} /> },
        { name: 'Plane', component: <Plane size={20} /> },
        { name: 'ShoppingBag', component: <ShoppingBag size={20} /> },
        { name: 'GraduationCap', component: <GraduationCap size={20} /> },
        { name: 'Gamepad2', component: <Gamepad2 size={20} /> },
    ];

    // ALL EMERALD intensity variations
    const colors = [
        { value: 'bg-emerald-600', label: 'Default' },
        { value: 'bg-emerald-700', label: 'Deep' },
        { value: 'bg-emerald-800', label: 'Darkest' },
        { value: 'bg-emerald-500', label: 'Bright' },
        { value: 'bg-emerald-400', label: 'Light' },
    ];

    const renderActiveIcon = () => {
        const found = icons.find(i => i.name === data.icon_name);
        return found ? found.component : <PiggyBank size={20} />;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 relative max-h-[90vh] flex flex-col">
                
                {/* HERO HEADER */}
                <div className="relative overflow-hidden px-5 py-5 bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900">
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-300/20 rounded-full blur-xl"></div>
                    
                    <div className="relative flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner shrink-0">
                                <Sparkles size={18} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-tight">
                                    Create new
                                </p>
                                <h2 className="text-base font-black text-white tracking-tight leading-tight truncate">
                                    Savings Goal 🎯
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={() => { reset(); clearErrors(); onClose(); }}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-sm active:scale-95 shrink-0"
                        >
                            <X size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto px-5 py-5">
                    
                    {/* Live preview card */}
                    <div className="mb-5 p-3 bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Preview</p>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${data.color_theme}`}>
                                {renderActiveIcon()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-slate-900 truncate">{data.title || 'Your Goal Name'}</p>
                                <p className="text-[11px] text-slate-500 font-medium truncate">{data.subtitle || 'Short description'}</p>
                            </div>
                            <p className="text-sm font-bold text-emerald-700 shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                ₱{data.target_amount ? Number(data.target_amount).toLocaleString('en-US') : '0'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        {/* Goal Name */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Goal Name <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                required 
                                placeholder="e.g. iPhone 15 Pro, Emergency Fund" 
                                value={data.title} 
                                onChange={e => setData('title', e.target.value)}
                                autoFocus
                                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-semibold outline-none transition-all ${
                                    errors.title 
                                        ? 'border-red-400 focus:ring-4 focus:ring-red-50 text-red-900' 
                                        : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 text-slate-900'
                                }`} 
                            />
                            {errors.title && (
                                <p className="text-[10px] text-red-500 mt-1 font-semibold">⚠️ {errors.title}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Short Description
                            </label>
                            <input 
                                type="text" 
                                placeholder="e.g. By December 2026" 
                                value={data.subtitle} 
                                onChange={e => setData('subtitle', e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-slate-900" 
                            />
                        </div>

                        {/* Target Amount */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Target Amount <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-lg text-slate-300 pointer-events-none">₱</span>
                                <input 
                                    type="text" 
                                    inputMode="numeric"
                                    required 
                                    placeholder="5,000" 
                                    value={data.target_amount ? Number(data.target_amount).toLocaleString('en-US') : ''}
                                    onChange={e => {
                                        const raw = e.target.value.replace(/[^0-9]/g, '');
                                        setData('target_amount', raw);
                                    }}
                                    style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
                                    className={`w-full pl-9 pr-3.5 py-2.5 bg-white border rounded-xl text-base font-bold outline-none transition-all ${
                                        errors.target_amount 
                                            ? 'border-red-400 focus:ring-4 focus:ring-red-50 text-red-900' 
                                            : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 text-slate-900'
                                    }`} 
                                />
                            </div>
                            {errors.target_amount && (
                                <p className="text-[10px] text-red-500 mt-1 font-semibold">⚠️ {errors.target_amount}</p>
                            )}
                            <p className="text-[10px] text-slate-400 font-medium mt-1">Minimum ₱50</p>
                        </div>

                        {/* Icon picker */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Choose Icon</label>
                            <div className="grid grid-cols-5 gap-2">
                                {icons.map((icon) => (
                                    <button 
                                        type="button" 
                                        key={icon.name} 
                                        onClick={() => setData('icon_name', icon.name)}
                                        className={`aspect-square rounded-xl flex items-center justify-center transition-all cursor-pointer border-2 active:scale-95 ${
                                            data.icon_name === icon.name 
                                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-200 scale-105' 
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-emerald-700'
                                        }`}
                                    >
                                        {icon.component}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color picker — ALL EMERALD intensities */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Color Intensity</label>
                            <div className="grid grid-cols-5 gap-2">
                                {colors.map((color) => (
                                    <button 
                                        type="button" 
                                        key={color.value} 
                                        onClick={() => setData('color_theme', color.value)}
                                        className={`aspect-square rounded-xl ${color.value} transition-all cursor-pointer active:scale-95 ${
                                            data.color_theme === color.value 
                                                ? 'ring-2 ring-offset-2 ring-slate-400 scale-110 shadow-md' 
                                                : 'hover:scale-105'
                                        }`}
                                        title={color.label}
                                    />
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                {/* FOOTER */}
                <div className="border-t border-slate-200 px-5 py-3 flex items-center gap-3 flex-shrink-0 bg-slate-50/50">
                    <button 
                        type="button" 
                        onClick={() => { reset(); clearErrors(); onClose(); }}
                        className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer active:scale-95"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={() => submit(null)}
                        disabled={processing || !isFormValid}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer active:scale-[0.98] ${
                            isFormValid && !processing
                                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-200'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {processing ? (
                            <>
                                <Loader2 size={14} className="animate-spin" strokeWidth={2.5} /> Creating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={14} strokeWidth={2.5} /> Create Goal
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}