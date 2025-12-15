import { ShoppingCart, FileText, Calendar, CreditCard } from 'lucide-react';

export default function ProcurementManagerDashboard() {
    const prQueue = [
        { id: 'PR-1029', requester: 'John Doe', item: 'MacBook Pro M3 Max', cost: '₹2,40,000', status: 'Pending Approval' },
        { id: 'PR-1030', requester: 'Jane Smith', item: 'Dell UltraSharp 27', cost: '₹45,000', status: 'Approved' }
    ];

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">Procurement Hub</h1>
                    <p className="text-slate-400">Manage purchasing, vendors, and budgets</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400">Quarterly Budget Remaining</p>
                    <p className="text-2xl font-bold text-emerald-400">₹12,50,000</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">8</h3>
                            <p className="text-xs text-slate-400">Open PRs</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">3</h3>
                            <p className="text-xs text-slate-400">Pending POs</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">12</h3>
                            <p className="text-xs text-slate-400">Expected Deliveries</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-rose-500/20 text-rose-400">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">2</h3>
                            <p className="text-xs text-slate-400">Invoice Discrepancies</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-white mb-4">Purchase Request Queue</h3>
                <table className="w-full text-sm text-left">
                    <thead className="text-slate-500 border-b border-white/10">
                        <tr>
                            <th className="pb-2">REQ ID</th>
                            <th className="pb-2">Requester</th>
                            <th className="pb-2">Item</th>
                            <th className="pb-2">Est. Cost</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-300">
                        {prQueue.map(pr => (
                            <tr key={pr.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                                <td className="py-3 font-mono text-xs text-slate-400">{pr.id}</td>
                                <td className="py-3">{pr.requester}</td>
                                <td className="py-3 font-medium text-white">{pr.item}</td>
                                <td className="py-3">{pr.cost}</td>
                                <td className="py-3">
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${pr.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                        {pr.status}
                                    </span>
                                </td>
                                <td className="py-3">
                                    {pr.status === 'Pending Approval' ? (
                                        <button className="text-blue-400 hover:text-blue-300 font-medium text-xs">Review</button>
                                    ) : (
                                        <button className="text-emerald-400 hover:text-emerald-300 font-medium text-xs">Create PO</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
