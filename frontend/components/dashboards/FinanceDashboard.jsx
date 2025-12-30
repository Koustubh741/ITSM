import { DollarSign, TrendingDown, PieChart, Download, CheckCircle, XCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAssetContext } from '@/contexts/AssetContext';

export default function FinanceDashboard() {
    const { requests, financeApprove, financeReject } = useAssetContext();

    // ENTERPRISE: Requests awaiting budget approval
    const budgetApprovals = requests.filter(r => r.currentOwnerRole === 'FINANCE' && r.procurementStage === 'PO_CREATED');

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
                        <h3 className="text-slate-400 text-sm font-bold uppercase">Pending Approvals</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{budgetApprovals.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Awaiting budget approval</p>
                </div>
            </div>

            {/* BUDGET APPROVAL QUEUE */}
            {budgetApprovals.length > 0 && (
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <DollarSign className="text-emerald-400" />
                        Budget Approval Queue
                        <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-500/20">{budgetApprovals.length}</span>
                    </h3>

                    <div className="space-y-4">
                        {budgetApprovals.map(req => (
                            <div key={req.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-lg font-bold text-white">{req.assetType}</h4>
                                            <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded font-mono border border-blue-500/20">
                                                {req.id}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-slate-500">Requested By:</span>
                                                <span className="text-white ml-2 font-medium">{req.requestedBy.name}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Department:</span>
                                                <span className="text-white ml-2 font-medium">{req.requestedBy.role}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Justification:</span>
                                                <span className="text-slate-300 ml-2">{req.justification}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Procurement Stage:</span>
                                                <span className="text-amber-400 ml-2 font-medium">📦 PO CREATED</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            const reason = prompt("Enter budget rejection reason:");
                                            if (reason) financeReject(req.id, reason, "Finance Manager");
                                        }}
                                        className="bg-rose-600 hover:bg-rose-500 text-white text-sm px-4 py-2 rounded-lg font-medium shadow-lg shadow-rose-500/10 transition-all flex items-center gap-2"
                                    >
                                        <XCircle size={16} /> Reject Budget
                                    </button>
                                    <button
                                        onClick={() => financeApprove(req.id, "Finance Manager")}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-lg font-medium shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-2"
                                    >
                                        <CheckCircle size={16} /> Approve Budget → Procurement
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
