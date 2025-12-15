import { ClipboardList, AlertTriangle, FileCheck, Search } from 'lucide-react';

export default function AuditOfficerDashboard() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white">Audit & Compliance</h1>
                <p className="text-slate-400">Physical verification and compliance monitoring</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 flex flex-col justify-between">
                    <div>
                        <p className="text-slate-400 text-xs uppercase">Verified (This Month)</p>
                        <h3 className="text-3xl font-bold text-emerald-400 mt-2">64%</h3>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: '64%' }}></div>
                    </div>
                </div>
                <div className="glass-card p-6">
                    <p className="text-slate-400 text-xs uppercase">Key Violations</p>
                    <h3 className="text-3xl font-bold text-rose-500 mt-2">18</h3>
                    <p className="text-xs text-rose-400 mt-1">Requires immediate attention</p>
                </div>
                <div className="glass-card p-6">
                    <p className="text-slate-400 text-xs uppercase">Compliance Score</p>
                    <h3 className="text-3xl font-bold text-blue-400 mt-2">A-</h3>
                    <p className="text-xs text-slate-400 mt-1">Top 15% of industry</p>
                </div>
                <div className="glass-card p-6 flex items-center justify-center">
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl w-full justify-center transition-all">
                        <FileCheck size={20} />
                        Generate Report
                    </button>
                </div>
            </div>

            <div className="glass-panel p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">System vs Physical Mismatch</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                        <input type="text" placeholder="Search asset tag..." className="bg-slate-800 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                    </div>
                </div>

                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-slate-300 text-xs uppercase">
                        <tr>
                            <th className="p-3 rounded-l-lg">Asset</th>
                            <th className="p-3">System Location</th>
                            <th className="p-3">Scanned Location</th>
                            <th className="p-3">Last Scan</th>
                            <th className="p-3 rounded-r-lg">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-400 divide-y divide-white/5">
                        <tr className="hover:bg-white/5">
                            <td className="p-3 font-medium text-white">Dell XPS 15 (AST-992)</td>
                            <td className="p-3">New York HQ</td>
                            <td className="p-3 text-amber-400">London Office</td>
                            <td className="p-3">2 hours ago</td>
                            <td className="p-3">
                                <button className="text-blue-400 hover:text-blue-300 mr-3">Update Sys</button>
                                <button className="text-rose-400 hover:text-rose-300">Flag</button>
                            </td>
                        </tr>
                        <tr className="hover:bg-white/5">
                            <td className="p-3 font-medium text-white">iPad Pro (AST-101)</td>
                            <td className="p-3">Warehouse A</td>
                            <td className="p-3 text-rose-400">Missing</td>
                            <td className="p-3">N/A</td>
                            <td className="p-3">
                                <button className="text-slate-300 hover:text-white">Investigate</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
