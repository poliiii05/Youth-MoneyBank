// resources/js/Components/Admin/Dashboard/TierDistributionCard.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function TierDistributionCard({ data = [] }) {
    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-black text-foreground tracking-tight">Tier Distribution</h3>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Users by KYC tier</p>
            </div>
            
            {total === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-xs text-muted-foreground font-medium">No user data yet</p>
                </div>
            ) : (
                <div className="p-4 space-y-3">
                    <div className="h-32 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={32}
                                    outerRadius={60}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, idx) => (
                                        <Cell key={idx} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        fontSize: '11px', 
                                        fontWeight: 'bold',
                                        background: 'var(--foreground)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '6px 10px',
                                    }}
                                    // Recharts styles each row separately, so a
                                    // colour set on the container never reaches the
                                    // text — which left dark labels on a dark box.
                                    itemStyle={{ color: 'var(--background)' }}
                                    labelStyle={{ color: 'var(--background)' }}
                                    formatter={(value, name, props) => [`${value} users`, props.payload.title]}
                                    labelFormatter={() => ''}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border">
                        {data.map((tier, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: tier.color }}></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-1.5">
                                        <p className="text-[11px] font-bold text-foreground">{tier.name}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground">· {tier.title}</p>
                                    </div>
                                </div>
                                <p className="text-[11px] font-black text-foreground">{tier.value}</p>
                                <p className="text-[9px] font-bold text-muted-foreground min-w-[28px] text-right">{tier.percent}%</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}