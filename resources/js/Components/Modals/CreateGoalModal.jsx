// resources/js/Components/Modals/CreateGoalModal.jsx
import { useForm } from '@inertiajs/react';
import { Target, Smartphone, Gamepad2, Plane, ShoppingBag, PiggyBank, Landmark, Umbrella, GraduationCap, X, Loader2 } from 'lucide-react';

export default function CreateGoalModal({ isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title: '',
        subtitle: '',
        target_amount: '',
        icon_name: 'PiggyBank',
        color_theme: 'bg-emerald-500',
    });

    if (!isOpen) return null;

    const submit = (e) => {
        e.preventDefault();
        // Clear muna ang lumang errors bago mag-submit ulit
        clearErrors(); 
        
        post('/goals', {
            preserveScroll: true,
            onSuccess: () => {
                reset(); // Clear form kapag successful
                onClose(); // Isara ang modal
            },
            // Kapag may error galing backend, hindi magsasara ang modal
        });
    };

    const icons = [
        { name: 'PiggyBank', component: <PiggyBank size={24} /> },
        { name: 'Landmark', component: <Landmark size={24} /> },
        { name: 'Umbrella', component: <Umbrella size={24} /> },
        { name: 'Target', component: <Target size={24} /> },
        { name: 'Smartphone', component: <Smartphone size={24} /> },
        { name: 'Gamepad2', component: <Gamepad2 size={24} /> },
        { name: 'Plane', component: <Plane size={24} /> },
        { name: 'ShoppingBag', component: <ShoppingBag size={24} /> },
        { name: 'GraduationCap', component: <GraduationCap size={24} /> },
    ];

    const colors = [
        { value: 'bg-emerald-500', display: 'bg-emerald-500' },
        { value: 'bg-blue-500', display: 'bg-blue-500' },
        { value: 'bg-purple-500', display: 'bg-purple-500' },
        { value: 'bg-amber-500', display: 'bg-amber-500' },
        { value: 'bg-rose-500', display: 'bg-rose-500' },
    ];

    const renderActiveIcon = () => {
        const found = icons.find(i => i.name === data.icon_name);
        return found ? found.component : <PiggyBank size={24} />;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            
            <div className="bg-slate-50 rounded-[2rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative animate-in fade-in zoom-in-95 duration-200">
                
                <button 
                    onClick={() => { reset(); clearErrors(); onClose(); }}
                    className="absolute top-4 right-4 p-2 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors z-10 cursor-pointer shadow-sm"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col lg:flex-row overflow-y-auto">
                    
                    {/* LEFT COLUMN: THE FORM */}
                    <div className="flex-1 bg-white p-6 sm:p-8 lg:p-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Set a New Goal 🚀</h2>
                            <p className="text-sm text-slate-500 font-medium mt-1 mb-8">What are you saving up for? Define it to achieve it.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                
                                {/* Title (NILAGYAN NG REQUIRED) */}
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Goal Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. iPhone 15 Pro, Emergency Fund"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 outline-none transition-all ${errors.title ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'}`}
                                    />
                                    {errors.title && <p className="text-xs text-red-500 mt-1.5 font-semibold flex items-center gap-1">⚠️ {errors.title}</p>}
                                </div>

                                {/* Subtitle (OPTIONAL KAYA WALANG REQUIRED) */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Short Description</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. By December 2026"
                                        value={data.subtitle}
                                        onChange={e => setData('subtitle', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Target Amount (NILAGYAN NG REQUIRED at MIN=50) */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Target Amount (₱) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="50"
                                        placeholder="5000"
                                        value={data.target_amount}
                                        onChange={e => setData('target_amount', e.target.value)}
                                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-black focus:bg-white focus:ring-2 outline-none transition-all ${errors.target_amount ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'}`}
                                    />
                                    {errors.target_amount && <p className="text-xs text-red-500 mt-1.5 font-semibold flex items-center gap-1">⚠️ {errors.target_amount}</p>}
                                </div>
                            </div>

                            {/* Icon Picker */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Choose an Icon</label>
                                <div className="flex flex-wrap gap-3">
                                    {icons.map((icon) => (
                                        <button
                                            type="button"
                                            key={icon.name}
                                            onClick={() => setData('icon_name', icon.name)}
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${data.icon_name === icon.name ? 'bg-slate-800 text-white shadow-md scale-105' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
                                        >
                                            {icon.component}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Theme Picker */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Color Theme</label>
                                <div className="flex flex-wrap gap-3">
                                    {colors.map((color) => (
                                        <button
                                            type="button"
                                            key={color.value}
                                            onClick={() => setData('color_theme', color.value)}
                                            className={`w-10 h-10 rounded-full ${color.display} flex items-center justify-center transition-all border-4 cursor-pointer ${data.color_theme === color.value ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                                        ></button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <button 
                                    type="button"
                                    onClick={() => { reset(); clearErrors(); onClose(); }}
                                    className="px-6 py-3.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={processing} 
                                    className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-200 hover:bg-blue-700 transition-all focus:ring-4 focus:ring-blue-100 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {processing ? <Loader2 size={18} className="animate-spin" /> : 'Create Savings Goal'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT COLUMN: LIVE PREVIEW CARD */}
                    <div className="w-full lg:w-96 bg-slate-50 p-6 sm:p-8 lg:p-10 shrink-0 border-l border-slate-100 flex flex-col justify-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center lg:text-left">Live Card Preview</p>
                        
                        <div className="bg-white rounded-[1.5rem] p-6 shadow-xl border border-slate-100 relative overflow-hidden w-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${data.color_theme.replace('bg-', 'bg-').replace('500', '50')} ${data.color_theme.replace('bg-', 'text-')}`}>
                                    {renderActiveIcon()}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-500">
                                    0%
                                </span>
                            </div>

                            <div>
                                <h3 className="font-black text-slate-900 text-xl tracking-tight mb-1 truncate">
                                    {data.title || "Your Goal Name"}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mb-6 truncate">
                                    {data.subtitle || "Short description"}
                                </p>
                                
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-3xl font-black text-slate-900 tracking-tight">₱0</p>
                                </div>

                                <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden"></div>
                                <p className={`text-[10px] font-bold text-right uppercase tracking-wider text-slate-400`}>
                                    Target: ₱{data.target_amount ? Number(data.target_amount).toLocaleString() : '0'}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}