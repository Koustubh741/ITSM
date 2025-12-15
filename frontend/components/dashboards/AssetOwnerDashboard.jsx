import { useState } from 'react';
import { Package, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function AssetOwnerDashboard() {
    const [verificationPending, setVerificationPending] = useState([
        { id: 'AST-001', name: 'MacBook Pro M3', assigned_date: '2024-03-10' },
        { id: 'AST-009', name: 'Dell 27" Monitor', assigned_date: '2024-03-12' }
    ]);

    const activeAssets = [
        { id: 'AST-882', name: 'iPhone 15 Pro', tag: 'MOB-882', status: 'Active', return_due: '2025-01-10' },
        { id: 'AST-104', name: 'Ergonomic Chair', tag: 'FUR-104', status: 'Active', return_due: 'N/A' }
    ];

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white">My Asset Responsibility</h1>
                <p className="text-slate-400">Manage your assigned equipment and verification requests</p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider">Total Assigned</p>
                            <h3 className="text-3xl font-bold text-white mt-1">4</h3>
                        </div>
                        <Package className="text-blue-500" />
                    </div>
                </div>
                <div className="glass-card p-6 border-l-4 border-amber-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider">Pending Verification</p>
                            <h3 className="text-3xl font-bold text-white mt-1">2</h3>
                        </div>
                        <Clock className="text-amber-500" />
                    </div>
                </div>
                <div className="glass-card p-6 border-l-4 border-emerald-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider">Active Issues</p>
                            <h3 className="text-3xl font-bold text-white mt-1">0</h3>
                        </div>
                        <CheckCircle className="text-emerald-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Verification Queue */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-400" />
                        Verification Required
                    </h3>
                    <div className="space-y-3">
                        {verificationPending.map(item => (
                            <div key={item.id} className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-white">{item.name}</p>
                                    <p className="text-xs text-slate-400">Assigned: {item.assigned_date}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded text-sm hover:bg-emerald-500/20">Accept</button>
                                    <button className="px-3 py-1.5 bg-rose-500/10 text-rose-400 rounded text-sm hover:bg-rose-500/20">Report</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* My Assets */}
                <div className="glass-panel p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">My Active Assets</h3>
                        <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="text-xs uppercase bg-white/5 text-slate-300">
                                <tr>
                                    <th className="px-4 py-3">Asset</th>
                                    <th className="px-4 py-3">Tag</th>
                                    <th className="px-4 py-3">Due Date</th>
                                    <th className="px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {activeAssets.map(asset => (
                                    <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{asset.name}</td>
                                        <td className="px-4 py-3">{asset.tag}</td>
                                        <td className="px-4 py-3">{asset.return_due}</td>
                                        <td className="px-4 py-3">
                                            <button className="text-xs text-rose-400 hover:text-rose-300 border border-current px-2 py-0.5 rounded">Return</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
