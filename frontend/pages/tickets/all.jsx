import Link from 'next/link';
import { ArrowLeft, Filter, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AllTicketsPage() {
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        // Mock fetch
        const mockData = Array.from({ length: 15 }).map((_, i) => ({
            id: `TCK-2023-${100 + i}`,
            subject: `Issue Report ${i + 1}`,
            priority: ['High', 'Medium', 'Low'][i % 3],
            status: ['Open', 'Pending', 'Closed'][i % 3],
            user: `User ${i}`,
            created: '2023-12-10'
        }));
        setTickets(mockData);
    }, []);

    return (
        <div className="min-h-screen p-8 bg-slate-950 text-slate-100">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center space-x-4">
                    <Link href="/tickets" className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent">All Tickets</h1>
                </div>

                <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10">
                    <table className="w-full text-left text-sm">
                        <thead className="text-slate-400 uppercase font-medium text-xs border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {tickets.map(t => (
                                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-slate-400">{t.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-200">{t.subject}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${t.priority === 'High' ? 'bg-red-500/10 text-red-400' :
                                                t.priority === 'Medium' ? 'bg-orange-500/10 text-orange-400' :
                                                    'bg-blue-500/10 text-blue-400'
                                            }`}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">{t.status}</td>
                                    <td className="px-6 py-4 text-slate-400">{t.user}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/tickets/${t.id}`} className="text-rose-400 hover:text-rose-300 font-medium">View</Link>
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
