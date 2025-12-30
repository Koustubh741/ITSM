import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Archive, TrendingDown, AlertOctagon, CheckCircle, Package } from 'lucide-react';
import { useAssetContext } from '@/contexts/AssetContext';

export default function InventoryManagerDashboard() {
    const { requests, inventoryCheckAvailable, inventoryCheckNotAvailable, inventoryAllocateDelivered, assets } = useAssetContext();

    // ENTERPRISE: Requests awaiting inventory check
    const awaitingStockCheck = requests.filter(r => r.currentOwnerRole === 'ASSET_INVENTORY_MANAGER');

    // ENTERPRISE: Delivered items awaiting final allocation
    const awaitingAllocation = requests.filter(r => r.currentOwnerRole === 'ASSET_INVENTORY_MANAGER' && r.procurementStage === 'DELIVERED');

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

            {/* FULFILLMENT QUEUE (NEW) */}
            <div className="glass-panel p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Package className="text-emerald-400" />
                        Inventory Stock Check
                        <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-500/20">{awaitingStockCheck.length}</span>
                    </h3>
                </div>

                {awaitingStockCheck.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                        No requests awaiting stock check.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-slate-400 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-3 rounded-l-lg">Asset Request</th>
                                    <th className="p-3">Requested By</th>
                                    <th className="p-3">Approval</th>
                                    <th className="p-3 text-right rounded-r-lg">Stock Decision</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {awaitingStockCheck.map(req => (
                                    <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3">
                                            <div className="text-white font-medium">{req.assetType}</div>
                                            <div className="text-xs text-slate-500">{req.id}</div>
                                            <div className="text-xs text-slate-400 mt-1">{req.justification}</div>
                                        </td>
                                        <td className="p-3">
                                            <div className="text-slate-300">{req.requestedBy.name}</div>
                                            <div className="text-xs text-slate-500">{req.requestedBy.role}</div>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-xs px-2 py-1 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                IT APPROVED
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        const assetId = prompt(`Enter available asset ID for ${req.assetType}:`, "AST-" + Math.floor(Math.random() * 1000));
                                                        if (assetId) inventoryCheckAvailable(req.id, assetId, "Inventory Manager");
                                                    }}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-medium shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-2"
                                                >
                                                    <CheckCircle size={14} /> Asset Available
                                                </button>
                                                <button
                                                    onClick={() => inventoryCheckNotAvailable(req.id, "Inventory Manager")}
                                                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-4 py-2 rounded-lg font-medium shadow-lg shadow-amber-500/10 transition-all"
                                                >
                                                    Not Available → Procurement
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* SECTION 2: Allocate Delivered Items */}
            {awaitingAllocation.length > 0 && (
                <div className="glass-panel p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <CheckCircle className="text-green-400" />
                            Delivered Items - Final Allocation
                            <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/20">{awaitingAllocation.length}</span>
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-slate-400 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-3 rounded-l-lg">Asset Request</th>
                                    <th className="p-3">Requested By</th>
                                    <th className="p-3">Procurement</th>
                                    <th className="p-3 text-right rounded-r-lg">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {awaitingAllocation.map(req => (
                                    <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3">
                                            <div className="text-white font-medium">{req.assetType}</div>
                                            <div className="text-xs text-slate-500">{req.id}</div>
                                        </td>
                                        <td className="p-3">
                                            <div className="text-slate-300">{req.requestedBy.name}</div>
                                            <div className="text-xs text-slate-500">{req.requestedBy.role}</div>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-xs px-2 py-1 rounded font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                                ✓ DELIVERED
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <button
                                                onClick={() => {
                                                    const assetId = prompt(`Enter asset ID to allocate for ${req.assetType}:`, "AST-" + Math.floor(Math.random() * 1000));
                                                    if (assetId) inventoryAllocateDelivered(req.id, assetId, "Inventory Manager");
                                                }}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-medium shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-2 ml-auto"
                                            >
                                                <CheckCircle size={14} /> Allocate Asset → Complete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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
