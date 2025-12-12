import Link from 'next/link';
import Head from 'next/link';
import { ArrowLeft, Plus, History, CheckCircle, AlertOctagon, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AuditOverviewPage() {
    const [stats, setStats] = useState({ total: 0, compliant: 0, issues: 0 });
    const [history, setHistory] = useState([]);

    useEffect(() => {
        // Mock Data
        setStats({ total: 12, compliant: 98, issues: 2 });
        setHistory([
            { id: 101, location: 'New York Office', date: '2023-11-20', status: 'Completed', score: 98, auditor: 'John Doe' },
            { id: 102, location: 'London Branch', date: '2023-10-15', status: 'Completed', score: 95, auditor: 'Jane Smith' },
            { id: 103, location: 'Remote Employees', date: '2023-12-01', status: 'In Progress', score: 45, auditor: 'System' },
        ]);
    }, []);

    return (
        <div className="min-h-screen p-8 bg-slate-950 text-slate-100">
            {/* Head component specific for this page if needed, ignoring next/head import error in mock */}

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/enterprise-features" className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Asset Audit</h1>
                            <p className="text-slate-400 mt-1">Verify physical inventory and compliance</p>
                        </div>
                    </div>
                    <Link href="/audit/start" className="btn btn-primary bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-orange-500/20">
                        <Plus size={20} /> Start New Audit
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                <History size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.total}</div>
                                <div className="text-sm text-slate-400">Total Audits</div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.compliant}%</div>
                                <div className="text-sm text-slate-400">Avg. Compliance</div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
                                <AlertOctagon size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.issues}</div>
                                <div className="text-sm text-slate-400">Open Variances</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Table */}
                <div className="glass-panel rounded-2xl bg-slate-900 border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-semibold text-lg">Audit History</h3>
                        <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-slate-400 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Location / Scope</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Auditor</th>
                                <th className="px-6 py-3">Score</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {history.map(item => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-200">{item.location}</td>
                                    <td className="px-6 py-4 text-slate-400">{item.date}</td>
                                    <td className="px-6 py-4 text-slate-400">{item.auditor}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${item.score > 90 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                                                    style={{ width: `${item.score}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-300">{item.score}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Completed'
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'bg-blue-500/10 text-blue-400'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-white">Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
