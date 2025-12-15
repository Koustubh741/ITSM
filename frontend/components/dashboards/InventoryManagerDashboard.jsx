import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Archive, TrendingDown, AlertOctagon } from 'lucide-react';

export default function InventoryManagerDashboard() {
    const stockData = [
        { name: 'Laptops', stock: 120, min: 50 },
        { name: 'Monitors', stock: 45, min: 40 },
        { name: 'Keyboards', stock: 200, min: 100 },
        { name: 'Headsets', stock: 15, min: 30 }, // Shortage
        { name: 'Cables', stock: 500, min: 100 },
    ];

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white">Stock Control</h1>
                <p className="text-slate-400">Inventory levels and replenishment alerts</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-slate-400 text-xs uppercase">Total SKUs</p>
                            <h3 className="text-3xl font-bold text-white">45</h3>
                        </div>
                        <Archive className="text-blue-500" />
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-slate-400 text-xs uppercase">Critical Shortages</p>
                            <h3 className="text-3xl font-bold text-rose-500">3</h3>
                        </div>
                        <AlertOctagon className="text-rose-500" />
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-slate-400 text-xs uppercase">To Reorder</p>
                            <h3 className="text-3xl font-bold text-amber-500">8</h3>
                        </div>
                        <TrendingDown className="text-amber-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-panel p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold text-white mb-6">Stock Levels by Category</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stockData}>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Stock Alerts</h3>
                    <div className="space-y-4">
                        {stockData.filter(i => i.stock < i.min).map(item => (
                            <div key={item.name} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-rose-400">{item.name}</span>
                                    <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full">Below Min</span>
                                </div>
                                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-rose-500 h-full" style={{ width: `${(item.stock / item.min) * 100}%` }}></div>
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-slate-400">
                                    <span>Current: {item.stock}</span>
                                    <span>Min: {item.min}</span>
                                </div>
                                <button className="mt-3 w-full py-1.5 text-xs font-semibold text-rose-950 bg-rose-400 rounded hover:bg-rose-300">
                                    Restock Now
                                </button>
                            </div>
                        ))}
                        <div className="p-4 bg-white/5 rounded-xl text-center cursor-pointer hover:bg-white/10">
                            <span className="text-sm text-slate-400">+ View Reconciliation Report</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
