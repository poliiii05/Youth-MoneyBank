
// resources/js/Components/Admin/StatCard.jsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Reusable stat card for admin dashboard.
 * 
 * Props:
 * - label: card title
 * - value: main stat (number or string)
 * - icon: lucide icon component
 * - color: tint color (blue, emerald, amber, purple, red, slate)
 * - trend: { value, direction } optional
 * - href: optional Link target
 */
export default function StatCard({ 
    label, 
    value, 
    icon: Icon, 
    color = 'slate', 
    trend = null, 
    onClick = null,
}) {
    const colorMap = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', accent: 'text-blue-700' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', accent: 'text-emerald-700' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', accent: 'text-amber-700' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', accent: 'text-purple-700' },
        red: { bg: 'bg-red-50', text: 'text-red-600', accent: 'text-red-700' },
        slate: { bg: 'bg-slate-100', text: 'text-slate-600', accent: 'text-slate-700' },
    };
    const c = colorMap[color] || colorMap.slate;

    const renderTrend = () => {
        if (!trend) return null;
        const TrendIcon = trend.direction === 'up' ? TrendingUp 
            : trend.direction === 'down' ? TrendingDown 
            : Minus;
        const trendColor = trend.direction === 'up' ? 'text-emerald-600 bg-emerald-50' 
            : trend.direction === 'down' ? 'text-red-600 bg-red-50'
            : 'text-slate-500 bg-slate-50';
        return (
            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${trendColor}`}>
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
            className={`bg-white rounded-xl border border-slate-200 p-4 transition-all text-left ${
                onClick ? 'hover:border-slate-300 hover:shadow-md cursor-pointer' : ''
            }`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.bg} ${c.text}`}>
                    <Icon size={16} strokeWidth={2.5} />
                </div>
                {renderTrend()}
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{value}</p>
        </Wrapper>
    );
}