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

    /**
     * Scale the axis to the data instead of to a fixed ceiling.
     *
     * The axis was pinned to PHP 0-100,000 regardless of what was plotted, so a
     * quiet week sat flat against the baseline and told you nothing, while a
     * busy month would have run off the top. Here the top of the axis is the
     * largest value rounded up to a round number, with headroom above it so the
     * peak never touches the frame.
     *
     * A floor keeps an empty period from collapsing into a meaningless
     * hairline: with no activity the chart still draws a readable grid rather
     * than a single line at zero.
     */
    const getYAxisDomain = (rows) => {
        const FLOOR = 1000;
        const HEADROOM = 1.25;

        const peak = Math.max(0, ...(rows || []).map((d) => Number(d.volume) || 0));
        const target = Math.max(peak * HEADROOM, FLOOR);

        // Round up to 1, 2 or 5 times a power of ten, so the labels land on
        // numbers people read easily rather than on whatever the data happened
        // to be — 4,200 becomes 6,000, not 5,250.
        const magnitude = Math.pow(10, Math.floor(Math.log10(target)));
        const normalised = target / magnitude;
        const step = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10;
        const max = step * magnitude;

        const tickCount = 5;
        const ticks = Array.from({ length: tickCount }, (_, i) => (max / (tickCount - 1)) * i);

        return { domain: [0, max], ticks };
    };

    // Sparse X-axis interval based sa view
    const getXAxisProps = () => {
        if (view === 'weekly') return { interval: 0 };       // All 7 days
        if (view === 'monthly') return { interval: 4 };      // Every 5th day
        return { interval: 0 };                              // All 12 months
    };

    const yAxisConfig = getYAxisDomain(current.chart_data);
    const xAxisProps = getXAxisProps();

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden h-full flex flex-col">
            <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-black text-foreground tracking-tight">Analytics</h3>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                        {current.period_label}
                    </p>
                </div>
                <PeriodTabs view={view} onChange={setView} />
            </div>

            <div className="px-5 py-3 border-b border-border grid grid-cols-3 gap-3">
                <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Volume</p>
                    <p className="text-base font-black text-foreground mt-0.5">{formatPesoShort(current.total_volume)}</p>
                </div>
                <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Transactions</p>
                    <p className="text-base font-black text-foreground mt-0.5">{current.transaction_count.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{current.trend_label}</p>
                    {current.trend ? (
                        <div className={`inline-flex items-center gap-1 mt-0.5 ${
                            current.trend.direction === 'up' ? 'text-success' : 'text-destructive'
                        }`}>
                            {current.trend.direction === 'up' 
                                ? <ArrowUp size={12} strokeWidth={3} />
                                : <ArrowDown size={12} strokeWidth={3} />
                            }
                            <span className="text-base font-black">{current.trend.value}%</span>
                        </div>
                    ) : (
                        <p className="text-base font-black text-muted-foreground mt-0.5">—</p>
                    )}
                </div>
            </div>

            <div className="flex-1 p-3 min-h-[250px] w-full">
                {current.chart_data && current.chart_data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={current.chart_data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--tier-2)" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="var(--tier-2)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis 
                                dataKey="label" 
                                tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                                interval={xAxisProps.interval}
                            />
                            <YAxis 
                                tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={formatPesoShort}
                                width={50}
                                domain={yAxisConfig.domain}
                                ticks={yAxisConfig.ticks}
                                interval={0}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    fontSize: '11px', 
                                    fontWeight: 'bold',
                                    background: 'var(--foreground)',
                                    border: 'none',
                                    borderRadius: '8px',
                                }}
                                itemStyle={{ color: 'var(--background)' }}
                                labelStyle={{ color: 'var(--background)', opacity: 0.7 }}
                                formatter={(value) => [formatPeso(value), 'Volume']}
                                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="volume" 
                                stroke="var(--tier-2)" 
                                strokeWidth={2.5}
                                fill="url(#colorVolume)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-xs text-muted-foreground font-medium">No data for this period</p>
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
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 shrink-0">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                        view === tab.id
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}