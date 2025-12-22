import Link from 'next/link';
import { ArrowLeft, Filter, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AllTicketsPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        if (router.isReady && router.query.status) {
            setFilterStatus(router.query.status);
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        // Mock fetch
        // Load Data from LocalStorage
        const savedAssets = localStorage.getItem('assets');
        let assetList = [];
        if (savedAssets) assetList = JSON.parse(savedAssets);
        else {
            const { initialMockAssets } = require('@/data/mockAssets');
            assetList = initialMockAssets;
        }

        // Generate Tickets from "Repair" or "Maintenance" assets
        const realTickets = assetList
            .filter(a => a.status === 'Repair' || a.status === 'Maintenance')
            .map((a, i) => ({
                id: `TCK-${202300 + i}`,
                subject: `${a.status} Request: ${a.name}`,
                priority: a.status === 'Repair' ? 'High' : 'Medium',
                status: 'Open',
                user: a.assigned_to || 'System',
                created: '2023-12-20'
            }));

        // Fill remaining with mock tickets linked to random assets
        const randomTickets = Array.from({ length: 15 }).map((_, i) => {
            const randomAsset = assetList[Math.floor(Math.random() * assetList.length)];
            const statuses = ['Open', 'Pending', 'Closed'];
            return {
                id: `TCK-GEN-${100 + i}`,
                subject: `Issue with ${randomAsset?.name || 'Hardware'}`,
                priority: ['Low', 'Medium', 'High'][i % 3],
                status: statuses[i % 3], // Rotates: Open, Pending, Closed
                user: randomAsset?.assigned_to || 'User',
                created: '2023-12-15'
            };
        });

        setTickets([...realTickets, ...randomTickets]);
    }, []);

    return (
        <div className="min-h-screen p-8 bg-slate-950 text-slate-100">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center space-x-4">
                    <Link href="/tickets" className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>

                    <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent">
                        {filterStatus === 'All' ? 'All Tickets' : `${filterStatus} Tickets`}
                    </h1>
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
                            {tickets
                                .filter(t => filterStatus === 'All' || t.status === filterStatus)
                                .map(t => (
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
        </div >
    );
}
