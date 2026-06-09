// resources/js/Components/Admin/Dashboard/ActivityAnalyticsCard.jsx
import { useState } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function ActivityAnalyticsCard({ analytics = null }) {
    const [view, setView] = useState('weekly');

    const defaultAnalytics = {
        weekly: { 
            total_volume: 0, transaction_count: 0, active_users: 0, 
            trend: null, trend_label: 'vs last week', period_label: '—', chart_data: [],
        },
        monthly: { 
            total_volume: 0, transaction_count: 0, active_users: 0, 
            trend: null, trend_label: 'vs last month', period_label: '—', chart_data: [],
        },
        yearly: { 
            total_volume: 0, transaction_count: 0, active_users: 0, 
            trend: null, trend_label: 'vs last year', period_label: '—', chart_data: [],
        },
    };
    const a = analytics || defaultAnalytics;
    const current = a[view] || a.weekly;

    const formatPeso = (amount) => '₱' + Number(amount).toLocaleString('en-PH', { 
        minimumFractionDigits: 0, maximumFractionDigits: 0 
    });

    const formatPesoShort = (amount) => {
    if (amount >= 1000000) {
        const value = amount / 1000000;
        return '₱' + (value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)) + 'M';
    }
    if (amount >= 1000) {
        const value = amount / 1000;
        return '₱' + (value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)) + 'K';
    }
    return '₱' + amount.toFixed(0);
};

        const getYAxisDomain = () => {
    return {
        domain: [0, 100000],
        ticks: [0, 20000, 40000, 60000, 80000, 100000],
    };
};

    // Sparse X-axis interval based sa view
    const getXAxisProps = () => {
        if (view === 'weekly') return { interval: 0 };       // All 7 days
        if (view === 'monthly') return { interval: 4 };      // Every 5th day
        return { interval: 0 };                              // All 12 months
    };

    const yAxisConfig = getYAxisDomain();
    const xAxisProps = getXAxisProps();

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">Analytics</h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {current.period_label}
                    </p>
                </div>
                <PeriodTabs view={view} onChange={setView} />
            </div>

            <div className="px-5 py-3 border-b border-slate-100 grid grid-cols-3 gap-3">
                <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Volume</p>
                    <p className="text-base font-black text-slate-900 mt-0.5">{formatPesoShort(current.total_volume)}</p>
                </div>
                <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Transactions</p>
                    <p className="text-base font-black text-slate-900 mt-0.5">{current.transaction_count.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{current.trend_label}</p>
                    {current.trend ? (
                        <div className={`inline-flex items-center gap-1 mt-0.5 ${
                            current.trend.direction === 'up' ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                            {current.trend.direction === 'up' 
                                ? <ArrowUp size={12} strokeWidth={3} />
                                : <ArrowDown size={12} strokeWidth={3} />
                            }
                            <span className="text-base font-black">{current.trend.value}%</span>
                        </div>
                    ) : (
                        <p className="text-base font-black text-slate-400 mt-0.5">—</p>
                    )}
                </div>
            </div>

            <div className="flex-1 p-3 min-h-[250px] w-full">
                {current.chart_data && current.chart_data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={current.chart_data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis 
                                dataKey="label" 
                                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                                interval={xAxisProps.interval}
                            />
                            <YAxis 
                                tick={{ fontSize: 9, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={formatPesoShort}
                                width={50}
                                domain={[0, 100000]}
                                ticks={[0, 20000, 40000, 60000, 80000, 100000]}
                                interval={0}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    fontSize: '11px', 
                                    fontWeight: 'bold',
                                    background: '#0f172a',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                }}
                                formatter={(value) => [formatPeso(value), 'Volume']}
                                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="volume" 
                                stroke="#3b82f6" 
                                strokeWidth={2.5}
                                fill="url(#colorVolume)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-xs text-slate-400 font-medium">No data for this period</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function PeriodTabs({ view, onChange }) {
    const tabs = [
        { id: 'weekly', label: 'Week' },
        { id: 'monthly', label: 'Month' },
        { id: 'yearly', label: 'Year' },
    ];
    return (
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 shrink-0">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                        view === tab.id
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}