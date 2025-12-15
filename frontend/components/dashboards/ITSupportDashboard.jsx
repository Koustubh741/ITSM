import { Wrench, ShieldCheck, Terminal, AlertCircle } from 'lucide-react';

export default function ITSupportDashboard() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white">Technician Workbench</h1>
                <p className="text-slate-400">Device readiness, support tickets, and configuration tasks</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Quick Stats */}
                <div className="glass-card p-5 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20">
                    <p className="text-indigo-300 text-xs font-bold uppercase">Pending Setup</p>
                    <h3 className="text-3xl font-bold text-white mt-1">14</h3>
                    <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                        <Terminal size={12} /> 4 imaging tasks queued
                    </div>
                </div>
                <div className="glass-card p-5 bg-gradient-to-br from-rose-500/10 to-rose-600/5 border-rose-500/20">
                    <p className="text-rose-300 text-xs font-bold uppercase">Open Tickets</p>
                    <h3 className="text-3xl font-bold text-white mt-1">8</h3>
                    <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                        <AlertCircle size={12} /> 2 high priority
                    </div>
                </div>
                <div className="glass-card p-5">
                    <p className="text-emerald-300 text-xs font-bold uppercase">Ready to Deploy</p>
                    <h3 className="text-3xl font-bold text-white mt-1">5</h3>
                </div>
                <div className="glass-card p-5">
                    <p className="text-slate-400 text-xs font-bold uppercase">Disposal Wipe</p>
                    <h3 className="text-3xl font-bold text-white mt-1">20</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-0 overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <h3 className="font-bold text-white">New Assets Pending Setup</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {['MacBook Pro M3 (Startups Team)', 'Dell XPS 15 (Design Team)', 'ThinkPad X1 (Sales)'].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-slate-400">
                                        <Wrench size={14} />
                                    </div>
                                    <span className="text-sm text-slate-200">{item}</span>
                                </div>
                                <button className="text-xs bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1.5 rounded">Start Config</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-0 overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <h3 className="font-bold text-white">Security Compliance Gaps</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {['Endpoint protection outdated (3 devices)', 'OS Patch Missing (Windows 11 23H2)'].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={16} className="text-rose-400" />
                                    <span className="text-sm text-rose-100">{item}</span>
                                </div>
                                <button className="text-xs text-rose-400 hover:text-rose-300 border border-rose-500/30 px-2 py-1 rounded">Fix</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
