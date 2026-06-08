// resources/js/Components/Admin/Dashboard/TierDistributionCard.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function TierDistributionCard({ data = [] }) {
    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Tier Distribution</h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Users by KYC tier</p>
            </div>
            
            {total === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-xs text-slate-500 font-medium">No user data yet</p>
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
                                        background: '#0f172a',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: 'white',
                                        padding: '6px 10px',
                                    }}
                                    formatter={(value, name, props) => [`${value} users`, props.payload.title]}
                                    labelFormatter={() => ''}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                        {data.map((tier, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: tier.color }}></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-1.5">
                                        <p className="text-[11px] font-bold text-slate-900">{tier.name}</p>
                                        <p className="text-[9px] font-bold text-slate-500">· {tier.title}</p>
                                    </div>
                                </div>
                                <p className="text-[11px] font-black text-slate-900">{tier.value}</p>
                                <p className="text-[9px] font-bold text-slate-500 min-w-[28px] text-right">{tier.percent}%</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}