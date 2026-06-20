// resources/js/Components/Modals/ViewDetailsModal.jsx
import { useState, useEffect } from 'react';
import { 
    X, Loader2, Target, ShieldAlert, Smartphone, ShoppingBag, PiggyBank, 
    Landmark, Umbrella, GraduationCap, Gamepad2, Plane,
    ArrowDownLeft, ArrowUpRight, Trophy, TrendingUp, Hash, Coins, 
    Plus, Minus, Sparkles, Calendar
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

    useModalEnterKey({
        isOpen,
        isSuccess: false,
        canSubmit: false,
        isProcessing: false,
        onSuccess: onClose,
        onSubmit: onClose,
    });

    if (!isOpen) return null;

    const goal = data?.goal;
    const history = data?.history || [];
    const stats = data?.stats || {};
    
    const progress = goal && goal.target_amount > 0 
        ? (goal.current_amount / goal.target_amount) * 100 
        : 0;
    
    const isComplete = progress >= 100;
    const SelectedIcon = goal ? getIcon(goal.icon_name) : Target;

    const handleAddFundsClick = () => {
        if (onAddFunds && goal) {
            onClose();
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 relative max-h-[90vh] flex flex-col">
                
                {/* HERO HEADER */}
                <div className="relative overflow-hidden px-5 py-5 bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900">
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-300/20 rounded-full blur-xl"></div>
                    
                    <div className="relative flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner shrink-0">
                                <Target size={18} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-tight">
                                    Goal details
                                </p>
                                <h2 className="text-base font-black text-white tracking-tight leading-tight truncate">
                                    {goal?.title || 'Loading...'}
                                </h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-sm active:scale-95 shrink-0">
                            <X size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto">
                    
                    {/* LOADING STATE */}
                    {loading && (
                        <div className="px-5 py-16 flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mb-3" strokeWidth={2.5} />
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

                    {/* CONTENT */}
                    {data && !loading && !error && (
                        <div className="px-5 py-5 space-y-4">

                            {/* HERO CARD */}
                            <div className={`p-4 rounded-2xl border ${isComplete ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200' : 'bg-gradient-to-br from-slate-50 to-emerald-50/30 border-slate-200'}`}>
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${goal.color_theme}`}>
                                        <SelectedIcon size={22} strokeWidth={2.5} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base font-bold text-slate-900 truncate">{goal.title}</h3>
                                        <p className="text-[11px] text-slate-500 font-medium truncate">{goal.subtitle || 'No description'}</p>
                                    </div>
                                    {isComplete && (
                                        <div className="bg-emerald-600 text-white px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                                            <Trophy size={10} /> Done
                                        </div>
                                    )}
                                </div>

                                {/* Progress bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between items-end mb-1.5">
                                        <p className="text-2xl font-black text-slate-900" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                                            ₱{goal.current_amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-[11px] font-bold text-slate-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                            / ₱{goal.target_amount.toLocaleString('en-PH')}
                                        </p>
                                    </div>
                                    <div className="w-full bg-white/60 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className={`h-2.5 rounded-full transition-all duration-1000 ${goal.color_theme}`}
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1.5 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {progress.toFixed(1)}% Completed
                                    </p>
                                </div>

                                {/* Achievement message — all emerald variations */}
                                <div className="pt-3 border-t border-white/60">
                                    {(() => {
                                        let message, emoji, color;
                                        if (progress >= 100) {
                                            emoji = '🏆';
                                            message = 'Goal completed! Amazing work.';
                                            color = 'text-emerald-700';
                                        } else if (progress >= 75) {
                                            emoji = '🔥';
                                            message = 'Almost there — just a little more!';
                                            color = 'text-amber-700';
                                        } else if (progress >= 50) {
                                            emoji = '💪';
                                            message = 'Halfway there — keep going!';
                                            color = 'text-emerald-700';
                                        } else if (progress >= 25) {
                                            emoji = '🌱';
                                            message = "You're on your way. Stay consistent!";
                                            color = 'text-emerald-700';
                                        } else if (progress > 0) {
                                            emoji = '🎯';
                                            message = 'Great start! Every peso counts.';
                                            color = 'text-slate-700';
                                        } else {
                                            emoji = '✨';
                                            message = 'Ready to start? Add your first allocation.';
                                            color = 'text-slate-500';
                                        }
                                        return (
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{emoji}</span>
                                                <p className={`text-[11px] font-bold ${color}`}>{message}</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* STATS CARDS — all emerald variations */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Coins size={12} className="text-emerald-700" strokeWidth={2.5} />
                                        <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Lifetime</span>
                                    </div>
                                    <p className="text-sm font-black text-emerald-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        ₱{stats.sum_allocated_lifetime?.toLocaleString('en-PH') || '0'}
                                    </p>
                                </div>
                                <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Hash size={12} className="text-emerald-700" strokeWidth={2.5} />
                                        <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Txns</span>
                                    </div>
                                    <p className="text-sm font-black text-emerald-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {(stats.total_allocations || 0) + (stats.total_deallocations || 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-emerald-50/40 border border-emerald-200/40 rounded-xl">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <TrendingUp size={12} className="text-emerald-700" strokeWidth={2.5} />
                                        <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Avg</span>
                                    </div>
                                    <p className="text-sm font-black text-emerald-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        ₱{stats.avg_allocation?.toLocaleString('en-PH') || '0'}
                                    </p>
                                </div>
                            </div>

                            {/* SAVINGS PACE CALCULATOR */}
                            {!isComplete && goal.current_amount < goal.target_amount && (
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <TrendingUp size={11} className="text-emerald-600" strokeWidth={2.5} />
                                        Savings Pace
                                    </h4>
                                    <SavingsPaceSection 
                                        remaining={goal.target_amount - goal.current_amount} 
                                    />
                                </div>
                            )}

                            {/* TRANSACTION HISTORY */}
                            {history.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        Transaction History
                                    </h4>
                                    <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                                        {history.map((entry) => {
                                            let actionLabel = entry.title;
                                            if (entry.type === 'allocate' || (entry.is_inflow && entry.type !== 'goal_deletion_return')) {
                                                actionLabel = `Added to goal`;
                                            } else if (entry.type === 'deallocate' || (!entry.is_inflow && entry.type !== 'goal_deletion_return')) {
                                                actionLabel = `Removed from goal`;
                                            } else if (entry.type === 'goal_deletion_return') {
                                                actionLabel = `Goal deletion return`;
                                            }
                                            
                                            return (
                                                <div key={entry.id} className="px-3 py-2.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${entry.is_inflow ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                                            {entry.is_inflow ? <ArrowDownLeft size={14} strokeWidth={2.5} /> : <ArrowUpRight size={14} strokeWidth={2.5} />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-bold text-slate-900 truncate">{actionLabel}</p>
                                                            <p className="text-[9px] text-slate-500 font-medium">{entry.created_at_human}</p>
                                                        </div>
                                                    </div>
                                                    <p className={`text-[11px] font-black shrink-0 ml-2 ${entry.is_inflow ? 'text-emerald-700' : 'text-slate-900'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                        {entry.is_inflow ? '+' : '−'}₱{entry.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* QUICK ACTIONS */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleAddFundsClick}
                                    disabled={isComplete}
                                    className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-black rounded-xl transition-all active:scale-[0.98] ${
                                        isComplete 
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                            : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-200 cursor-pointer'
                                    }`}
                                >
                                    <Plus size={14} strokeWidth={2.5} /> Add Funds
                                </button>
                                <button
                                    onClick={handleUnallocateClick}
                                    disabled={goal.current_amount <= 0}
                                    className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all active:scale-95 ${
                                        goal.current_amount <= 0
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : 'bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 text-slate-700 hover:text-emerald-700 cursor-pointer'
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
                                    className="text-[10px] font-bold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
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

// SavingsPaceSection — ALL EMERALD variations
function SavingsPaceSection({ remaining }) {
    const paces = [500, 1000, 2000, 5000];
    
    const calculateCompletion = (weeklyAmount) => {
        const weeksNeeded = Math.ceil(remaining / weeklyAmount);
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + (weeksNeeded * 7));
        
        return {
            weeks: weeksNeeded,
            years: weeksNeeded / 52,
            label: targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        };
    };

    // Emerald intensity variations (slow → fast)
    const PACE_STYLES = [
        { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-900', label: 'text-slate-600', hover: 'hover:bg-slate-100' },
        { bg: 'bg-emerald-50/40', border: 'border-emerald-200/60', text: 'text-emerald-900', label: 'text-emerald-700', hover: 'hover:bg-emerald-50/70' },
        { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', label: 'text-emerald-700', hover: 'hover:bg-emerald-100' },
        { bg: 'bg-emerald-100/60', border: 'border-emerald-300', text: 'text-emerald-900', label: 'text-emerald-800', hover: 'hover:bg-emerald-100' },
    ];

    return (
        <div className="space-y-1.5">
            <p className="text-[10px] text-slate-500 font-medium italic mb-2">
                Pick a weekly savings pace to see your timeline:
            </p>
            
            {paces.map((amount, idx) => {
                const completion = calculateCompletion(amount);
                const isFastest = idx === paces.length - 1;
                const style = PACE_STYLES[idx];

                return (
                    <div 
                        key={amount} 
                        className={`${style.bg} ${style.border} ${style.hover} border rounded-lg p-2.5 transition-colors relative`}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <Calendar size={12} className={style.label} strokeWidth={2.5} />
                                <div className="min-w-0">
                                    <p className={`text-[12px] font-black ${style.text} leading-tight`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        ₱{amount.toLocaleString('en-PH')}
                                        <span className={`text-[9px] font-bold ${style.label} ml-0.5`}>/week</span>
                                    </p>
                                    <p className={`text-[9px] font-bold ${style.label}`}>
                                        {completion.weeks} {completion.weeks === 1 ? 'week' : 'weeks'}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <p className={`text-[9px] font-bold ${style.label} uppercase tracking-widest`}>Reach by</p>
                                <p className={`text-[12px] font-black ${style.text}`}>{completion.label}</p>
                                {completion.years >= 1 && (
                                    <p className={`text-[9px] font-medium ${style.label}`}>
                                        ~{completion.years.toFixed(1)} {completion.years < 1.05 ? 'year' : 'years'}
                                    </p>
                                )}
                            </div>

                            {isFastest && (
                                <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-emerald-600 text-white text-[8px] font-black rounded uppercase tracking-widest">
                                    Fastest
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-slate-100">
                <Sparkles size={10} className="text-amber-600 mt-0.5 shrink-0" strokeWidth={2.5} />
                <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                    <span className="font-bold text-slate-700">Tip:</span> Even an extra ₱500/week can save you months!
                </p>
            </div>
        </div>
    );
}