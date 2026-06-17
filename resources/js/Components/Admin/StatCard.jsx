// resources/js/Components/Admin/StatCard.jsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Reusable stat card for admin dashboard.
 * Features subtle gradient backgrounds per color variant.
 */
export default function StatCard({ 
    label, 
    value, 
    icon: Icon, 
    color = 'slate', 
    trend = null, 
    onClick = null,
    subText = null,
}) {
    const colorMap = {
        blue: { 
            bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50', 
            iconBg: 'bg-blue-500/10', 
            iconText: 'text-blue-600',
            border: 'border-blue-100',
            hoverBorder: 'hover:border-blue-300',
        },
        emerald: { 
            bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50', 
            iconBg: 'bg-emerald-500/10', 
            iconText: 'text-emerald-600',
            border: 'border-emerald-100',
            hoverBorder: 'hover:border-emerald-300',
        },
        amber: { 
            bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50', 
            iconBg: 'bg-amber-500/10', 
            iconText: 'text-amber-600',
            border: 'border-amber-100',
            hoverBorder: 'hover:border-amber-300',
        },
        purple: { 
            bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50', 
            iconBg: 'bg-purple-500/10', 
            iconText: 'text-purple-600',
            border: 'border-purple-100',
            hoverBorder: 'hover:border-purple-300',
        },
        red: { 
            bg: 'bg-gradient-to-br from-red-50 to-red-100/50', 
            iconBg: 'bg-red-500/10', 
            iconText: 'text-red-600',
            border: 'border-red-100',
            hoverBorder: 'hover:border-red-300',
        },
        slate: { 
            bg: 'bg-gradient-to-br from-slate-50 to-slate-100/50', 
            iconBg: 'bg-slate-500/10', 
            iconText: 'text-slate-600',
            border: 'border-slate-200',
            hoverBorder: 'hover:border-slate-300',
        },
    };
    const c = colorMap[color] || colorMap.slate;

    const renderTrend = () => {
        if (!trend) return null;
        const TrendIcon = trend.direction === 'up' ? TrendingUp 
            : trend.direction === 'down' ? TrendingDown 
            : Minus;
        const trendColor = trend.direction === 'up' ? 'text-emerald-700 bg-emerald-100/80' 
            : trend.direction === 'down' ? 'text-red-700 bg-red-100/80'
            : 'text-slate-600 bg-slate-100/80';
        return (
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${trendColor}`}>
                <TrendIcon size={10} strokeWidth={2.5} />
                {trend.value}
            </div>
        );
    };

    const Wrapper = onClick ? 'button' : 'div';
    const wrapperProps = onClick ? { onClick, type: 'button' } : {};

    return (
        <Wrapper
            {...wrapperProps}
            className={`relative ${c.bg} rounded-xl border ${c.border} p-4 transition-all text-left overflow-hidden ${
                onClick ? `${c.hoverBorder} hover:shadow-md cursor-pointer` : ''
            }`}
        >
            {/* Subtle decoration corner */}
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${c.iconBg} opacity-40 blur-xl`}></div>
            
            {/* Content */}
            <div className="relative">
                <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.iconBg} ${c.iconText}`}>
                        <Icon size={16} strokeWidth={2.5} />
                    </div>
                    {renderTrend()}
                </div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{value}</p>
                {subText && (
                    <p className={`text-[10px] font-bold mt-1 ${
                        subText.startsWith('+') ? 'text-emerald-700' : 'text-slate-500'
                    }`}>
                        {subText}
                    </p>
                )}
            </div>
        </Wrapper>
    );
}