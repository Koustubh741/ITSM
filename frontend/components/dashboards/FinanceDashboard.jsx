import { DollarSign, TrendingDown, PieChart, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinanceDashboard() {
    const data = [
        { name: 'Jan', value: 4000000 },
        { name: 'Feb', value: 3950000 },
        { name: 'Mar', value: 3880000 },
        { name: 'Apr', value: 4200000 }, // Purchase spike
        { name: 'May', value: 4100000 },
        { name: 'Jun', value: 4020000 },
    ];

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Financial Governance</h1>
                    <p className="text-slate-400">Asset valuation, depreciation, and spend analysis</p>
                </div>
                <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg border border-white/10 transition-colors">
                    <Download size={18} /> Export Report
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                            <DollarSign size={24} />
                        </div>
                        <h3 className="text-slate-400 text-sm font-bold uppercase">Total Book Value</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">₹40.2 Lacs</p>
                    <p className="text-xs text-slate-500 mt-1">-5% YoY due to depreciation</p>
                </div>
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
                            <TrendingDown size={24} />
                        </div>
                        <h3 className="text-slate-400 text-sm font-bold uppercase">YTD Depreciation</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">₹3.8 Lacs</p>
                </div>
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-full bg-amber-500/20 text-amber-400">
                            <PieChart size={24} />
                        </div>
                        <h3 className="text-slate-400 text-sm font-bold uppercase">AMC Spend</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">₹5.2 Lacs</p>
                    <p className="text-xs text-slate-500 mt-1">Across 4 vendors</p>
                </div>
            </div>

            <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-white mb-6">Asset Value Trend (6 Months)</h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
