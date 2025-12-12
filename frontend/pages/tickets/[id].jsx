import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Clock, User, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TicketDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const [ticket, setTicket] = useState(null);

    useEffect(() => {
        if (!id) return;
        // Mock Fetch
        setTicket({
            id: id,
            subject: 'Laptop Screen Flicker',
            description: 'Screen flickers when brightness is above 50%. This started happening after the last OS update.',
            priority: 'High',
            status: 'Open',
            user: 'Sarah Connor',
            created: '2023-12-10',
            asset: 'AST-1001 (MacBook Pro)',
            history: [
                { date: '2023-12-10 09:00', user: 'Sarah Connor', action: 'Ticket Created' },
                { date: '2023-12-10 10:15', user: 'Help Desk', action: 'Status changed to Open' },
                { date: '2023-12-11 08:30', user: 'Technician', action: 'Parts Ordered' }
            ]
        });
    }, [id]);

    if (!ticket) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;

    return (
        <div className="min-h-screen p-8 bg-slate-950 text-slate-100">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center space-x-4">
                    <Link href="/tickets" className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white">{ticket.subject}</h1>
                            <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-semibold">{ticket.priority}</span>
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-semibold">{ticket.status}</span>
                        </div>
                        <p className="text-slate-400 mt-1 font-mono text-sm">{ticket.id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="font-semibold text-lg mb-4 text-slate-200">Description</h3>
                            <p className="text-slate-300 leading-relaxed">{ticket.description}</p>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="font-semibold text-lg mb-4 text-slate-200 flex items-center gap-2">
                                <MessageSquare size={18} /> Activity Log
                            </h3>
                            <div className="space-y-6 border-l-2 border-white/10 pl-6 ml-2">
                                {ticket.history.map((h, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600" />
                                        <div className="text-sm font-semibold text-slate-200">{h.action}</div>
                                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                            <span>{h.user}</span>
                                            <span>•</span>
                                            <span>{h.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-2xl bg-slate-900 border border-white/10">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-4">Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Requester</div>
                                    <div className="flex items-center gap-2 text-slate-200 font-medium">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-300 border border-indigo-500/30">
                                            <User size={12} />
                                        </div>
                                        {ticket.user}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Created</div>
                                    <div className="flex items-center gap-2 text-slate-200">
                                        <Clock size={14} className="text-slate-500" /> {ticket.created}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <div className="text-xs text-slate-500 mb-1">Impacted Asset</div>
                                    <Link href="/assets/1" className="text-blue-400 hover:text-blue-300 text-sm font-mono block truncate">{ticket.asset}</Link>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-300 font-medium transition-colors">
                            Add Note / Update Status
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
