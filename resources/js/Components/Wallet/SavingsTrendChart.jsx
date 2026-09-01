import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Six-month savings trend.
 *
 * Reads the series the dashboard controller derives from the transactions
 * table, so what's plotted is the ledger — not a separate figure that could
 * drift away from it.
 */
export default function SavingsTrendChart({ data = [] }) {
    const hasActivity = data.some((d) => d.in > 0 || d.out > 0);

    const thisMonth = data[data.length - 1]?.saved ?? 0;
    const lastMonth = data[data.length - 2]?.saved ?? 0;
    const delta = thisMonth - lastMonth;
    const improving = delta >= 0;

    return (
        <div className="bg-card rounded-[1.5rem] shadow-sm border border-border p-5">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-base font-bold text-foreground tracking-tight">
                        Savings Trend
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Net amount saved each month
                    </p>
                </div>

                {hasActivity && (
                    <div
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            improving
                                ? 'bg-success/10 text-success'
                                : 'bg-destructive/10 text-destructive'
                        }`}
                    >
                        {improving ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {improving ? '+' : ''}₱{Math.abs(delta).toLocaleString('en-PH')}
                        <span className="font-medium opacity-70">vs last month</span>
                    </div>
                )}
            </div>

            {!hasActivity ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-sm font-medium text-foreground mb-1">
                        Nothing to chart yet
                    </p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                        Once you start adding money and moving it into savings, your
                        month-by-month progress shows up here.
                    </p>
                </div>
            ) : (
                <div className="h-56 -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="var(--border)"
                            />

                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                width={52}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                                tickFormatter={(v) => `₱${v >= 1000 ? `${v / 1000}k` : v}`}
                            />

                            <Tooltip
                                cursor={{ stroke: 'var(--border)' }}
                                contentStyle={{
                                    background: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
                                }}
                                labelStyle={{ color: 'var(--muted-foreground)', fontWeight: 700 }}
                                formatter={(value) => [
                                    `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
                                    'Net saved',
                                ]}
                            />

                            <Area
                                type="monotone"
                                dataKey="saved"
                                stroke="var(--primary)"
                                strokeWidth={2.5}
                                fill="url(#savingsFill)"
                                dot={{ r: 3, fill: 'var(--primary)', strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--card)' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}