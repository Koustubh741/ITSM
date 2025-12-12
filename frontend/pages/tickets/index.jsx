import Link from 'next/link';
import Head from 'next/link';
import { ArrowLeft, Plus, Ticket, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TicketsDashboard() {
    const [stats, setStats] = useState({ open: 0, pending: 0, closed: 0 });
    const [recentTickets, setRecentTickets] = useState([]);

    useEffect(() => {
        // Mock Data Load
        setStats({ open: 14, pending: 5, closed: 128 });
        setRecentTickets([
            { id: 'TCK-2023-001', subject: 'Laptop Screen Flicker', priority: 'High', status: 'Open', user: 'Sarah Connor', created: '2023-12-10' },
            { id: 'TCK-2023-002', subject: 'Software Install Request', priority: 'Low', status: 'Pending', user: 'Kyle Reese', created: '2023-12-09' },
            { id: 'TCK-2023-003', subject: 'Keyboard Replacement', priority: 'Medium', status: 'Closed', user: 'T-800', created: '2023-12-08' },
        ]);
    }, []);

    const getPriorityColor = (p) => {
        if (p === 'High') return 'text-red-400 bg-red-500/10 border-red-500/20';
        if (p === 'Medium') return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    };

    return (
        <div className="min-h-screen p-8 bg-slate-950 text-slate-100">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/enterprise-features" className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent">Help Desk & Tickets</h1>
                            <p className="text-slate-400 mt-1">Manage support requests and issues</p>
                        </div>
                    </div>
                    <Link href="/tickets/new" className="btn btn-primary bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-rose-500/20">
                        <Plus size={20} /> New Ticket
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/tickets/all?status=Open" className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-rose-500/30 hover:bg-white/10 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.open}</div>
                                <div className="text-sm text-slate-400">Open Tickets</div>
                            </div>
                        </div>
                    </Link>
                    <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                                <Clock size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.pending}</div>
                                <div className="text-sm text-slate-400">Pending Actions</div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.closed}</div>
                                <div className="text-sm text-slate-400">Closed This Month</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Tickets Section */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* List */}
                    <div className="flex-1 glass-panel rounded-2xl bg-slate-900 border border-white/10 overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Ticket size={20} className="text-slate-500" /> Recent Activity
                            </h3>
                            <Link href="/tickets/all" className="text-sm text-blue-400 hover:text-blue-300">View All Tickets</Link>
                        </div>
                        <div className="divide-y divide-white/5">
                            {recentTickets.map(ticket => (
                                <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block p-4 hover:bg-white/5 transition-colors group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-slate-200 group-hover:text-rose-400 transition-colors">{ticket.subject}</div>
                                            <div className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                                                <span className="font-mono text-xs opacity-70">{ticket.id}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Clock size={12} /> {ticket.created}</span>
                                                <span>•</span>
                                                <span>{ticket.user}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                            <span className="text-xs text-slate-500">{ticket.status}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions / Knowledge Base Mock */}
                    <div className="w-full lg:w-80 space-y-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-900/20 to-purple-900/20 border border-white/10">
                            <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                            <p className="text-sm text-slate-400 mb-4">Check the knowledge base for common asset issues before raising a ticket.</p>
                            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors">
                                Search Knowledge Base
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
