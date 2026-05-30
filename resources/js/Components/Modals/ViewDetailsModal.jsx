// resources/js/Components/Modals/ViewDetailsModal.jsx
import { useState, useEffect } from 'react';
import { 
    X, Loader2, Target, ShieldAlert, Smartphone, ShoppingBag, PiggyBank, 
    Landmark, Umbrella, GraduationCap, Gamepad2, Plane,
    ArrowDownLeft, ArrowUpRight, Trophy, TrendingUp, Hash, Coins, 
    Plus, Minus, Sparkles, Calendar, CheckCircle2, Circle
} from 'lucide-react';
import { useModalEnterKey } from '../../hooks/useModalEnterKey';

const ICON_MAP = {
    Target, ShieldAlert, Smartphone, ShoppingBag, PiggyBank,
    Landmark, Umbrella, GraduationCap, Gamepad2, Plane,
};

const getIcon = (name) => ICON_MAP[name] || Target;

export default function ViewDetailsModal({ isOpen, onClose, goalId, onAddFunds, onUnallocate, onEdit }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    // Fetch details when modal opens
    useEffect(() => {
        if (!isOpen || !goalId) {
            setData(null);
            setError('');
            return;
        }

        setLoading(true);
        setError('');

        fetch(`/goals/${goalId}/details`, {
            headers: { 'Accept': 'application/json' },
        })
            .then((r) => {
                if (!r.ok) throw new Error('Failed to load details');
                return r.json();
            })
            .then((json) => {
                setData(json);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || 'An error occurred');
                setLoading(false);
            });
    }, [isOpen, goalId]);

    // Global Enter key — closes the modal (no submit action here)
    useModalEnterKey({
        isOpen,
        isSuccess: false,
        canSubmit: false,
        isProcessing: false,
        onSuccess: onClose,
        onSubmit: onClose,
    });

    if (!isOpen) return null;

    // Computations (only when data loaded)
    const goal = data?.goal;
    const history = data?.history || [];
    const stats = data?.stats || {};
    
    const progress = goal && goal.target_amount > 0 
        ? (goal.current_amount / goal.target_amount) * 100 
        : 0;
    
    const isComplete = progress >= 100;
    const milestones = [25, 50, 75, 100];
    const SelectedIcon = goal ? getIcon(goal.icon_name) : Target;

    const handleAddFundsClick = () => {
        if (onAddFunds && goal) {
            onClose();
            // Defer to ensure modal closes first
            setTimeout(() => onAddFunds(goal), 100);
        }
    };

    const handleUnallocateClick = () => {
        if (onUnallocate && goal) {
            onClose();
            setTimeout(() => onUnallocate(goal), 100);
        }
    };

    const handleEditClick = () => {
        if (onEdit && goal) {
            onClose();
            setTimeout(() => onEdit(goal), 100);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 relative">
                
                {/* HEADER */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                    <div className="w-7 h-7" />
                    <h2 className="text-[13px] font-bold text-slate-900 tracking-tight">
                        Goal Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* BODY */}
                <div className="max-h-[85vh] overflow-y-auto">
                    
                    {/* LOADING STATE */}
                    {loading && (
                        <div className="px-5 py-16 flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" strokeWidth={2.5} />
                            <p className="text-xs font-medium text-slate-500">Loading details...</p>
                        </div>
                    )}

                    {/* ERROR STATE */}
                    {error && !loading && (
                        <div className="px-5 py-16 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
                                <X size={24} className="text-red-500" strokeWidth={2} />
                            </div>
                            <p className="text-sm font-bold text-slate-900 mb-1">Couldn't load details</p>
                            <p className="text-[11px] text-slate-500">{error}</p>
                        </div>
                    )}

                    {/* CONTENT (when data loaded) */}
                    {data && !loading && !error && (
                        <div className="px-5 py-5 space-y-4">

                            {/* HERO CARD */}
                            <div className={`p-4 rounded-2xl ${isComplete ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200' : 'bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200'} border`}>
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${goal.color_theme}`}>
                                        <SelectedIcon size={22} strokeWidth={2.5} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base font-bold text-slate-900 truncate">{goal.title}</h3>
                                        <p className="text-[11px] text-slate-500 font-medium truncate">{goal.subtitle || 'No description'}</p>
                                    </div>
                                    {isComplete && (
                                        <div className="bg-emerald-500 text-white px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                                            <Trophy size={10} /> Done
                                        </div>
                                    )}
                                </div>

                                {/* Progress bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between items-end mb-1.5">
                                        <p className="text-2xl font-black text-slate-900 tracking-tight">
                                            ₱{goal.current_amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-[11px] font-bold text-slate-500">
                                            / ₱{goal.target_amount.toLocaleString('en-PH')}
                                        </p>
                                    </div>
                                    <div className="w-full bg-white/60 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className={`h-2.5 rounded-full transition-all duration-1000 ${goal.color_theme}`}
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1.5 text-right">
                                        {progress.toFixed(1)}% Completed
                                    </p>
                                </div>

                                {/* Milestones */}
                                <div className="flex justify-between items-center pt-3 border-t border-white/60">
                                    {milestones.map((milestone) => {
                                        const reached = progress >= milestone;
                                        return (
                                            <div key={milestone} className="flex flex-col items-center gap-0.5">
                                                {reached ? (
                                                    <CheckCircle2 size={14} className="text-emerald-500" strokeWidth={2.5} />
                                                ) : (
                                                    <Circle size={14} className="text-slate-300" strokeWidth={2} />
                                                )}
                                                <span className={`text-[9px] font-bold ${reached ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                    {milestone === 100 ? '🏆' : `${milestone}%`}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* STATS CARDS */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Coins size={12} className="text-blue-600" />
                                        <span className="text-[9px] font-bold text-blue-900/70 uppercase tracking-wider">Lifetime</span>
                                    </div>
                                    <p className="text-sm font-black text-blue-900">
                                        ₱{stats.sum_allocated_lifetime?.toLocaleString('en-PH') || '0'}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Hash size={12} className="text-purple-600" />
                                        <span className="text-[9px] font-bold text-purple-900/70 uppercase tracking-wider">Txns</span>
                                    </div>
                                    <p className="text-sm font-black text-purple-900">
                                        {(stats.total_allocations || 0) + (stats.total_deallocations || 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <TrendingUp size={12} className="text-emerald-600" />
                                        <span className="text-[9px] font-bold text-emerald-900/70 uppercase tracking-wider">Avg</span>
                                    </div>
                                    <p className="text-sm font-black text-emerald-900">
                                        ₱{stats.avg_allocation?.toLocaleString('en-PH') || '0'}
                                    </p>
                                </div>
                            </div>

                            {/* TRANSACTION HISTORY */}
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Transaction History
                                </h4>
                                {history.length > 0 ? (
                                    <div className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50 max-h-60 overflow-y-auto">
                                        {history.map((entry) => (
                                            <div key={entry.id} className="px-3 py-2.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${entry.is_inflow ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                                        {entry.is_inflow ? <ArrowDownLeft size={14} strokeWidth={2.5} /> : <ArrowUpRight size={14} strokeWidth={2.5} />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-bold text-slate-900 truncate">{entry.title}</p>
                                                        <p className="text-[9px] text-slate-500 font-medium">{entry.created_at_human}</p>
                                                    </div>
                                                </div>
                                                <p className={`text-[11px] font-black shrink-0 ml-2 ${entry.is_inflow ? 'text-emerald-600' : 'text-orange-600'}`}>
                                                    {entry.is_inflow ? '+' : '-'}₱{entry.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl px-3 py-4 flex flex-col items-center text-center">
                                        <Sparkles size={20} className="text-slate-400 mb-1.5" />
                                        <p className="text-[11px] font-bold text-slate-600">No activity yet</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Allocate some funds to start tracking</p>
                                    </div>
                                )}
                            </div>

                            {/* QUICK ACTIONS */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleAddFundsClick}
                                    disabled={isComplete}
                                    className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                                        isComplete 
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 cursor-pointer'
                                    }`}
                                >
                                    <Plus size={14} strokeWidth={2.5} /> Add Funds
                                </button>
                                <button
                                    onClick={handleUnallocateClick}
                                    disabled={goal.current_amount <= 0}
                                    className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                                        goal.current_amount <= 0
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : 'bg-white border border-slate-200 hover:border-slate-400 text-slate-700 cursor-pointer'
                                    }`}
                                >
                                    <Minus size={14} strokeWidth={2.5} /> Unallocate
                                </button>
                            </div>

                            {/* FOOTER */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                    <Calendar size={10} /> Created {goal.created_at_human}
                                </div>
                                <button
                                    onClick={handleEditClick}
                                    className="text-[10px] font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                                >
                                    Edit Goal →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}