import Link from 'next/link';
import { ArrowLeft, User, Monitor, Disc, Ticket, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        // Load Data from LocalStorage
        const fetchUsers = () => {
            const savedAssets = localStorage.getItem('assets');
            let assetList = [];
            if (savedAssets) assetList = JSON.parse(savedAssets);
            else {
                const { initialMockAssets } = require('@/data/mockAssets');
                assetList = initialMockAssets;
            }

            // Group by Assigned User
            const userMap = {};
            assetList.forEach(a => {
                const user = a.assigned_to;
                if (user && user !== 'Unassigned') {
                    if (!userMap[user]) {
                        // Deterministic seed based on name
                        const seed = user.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

                        userMap[user] = {
                            id: Math.random().toString(36).substr(2, 9),
                            name: user,
                            role: 'Employee', // specific roles not in asset data
                            status: 'Active',
                            assets_count: 0,
                            assigned_assets: [], // Store real assets
                            software_count: (seed % 5) + 1, // Deterministic mock (1-5)
                            tickets_count: (seed % 3) // Deterministic mock (0-2)
                        };
                    }
                    userMap[user].assets_count += 1;
                    userMap[user].assigned_assets.push(a);
                }
            });

            setUsers(Object.values(userMap));
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase()));

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
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">User Inventory</h1>
                            <p className="text-slate-400 mt-1">Track assets and licenses by employee</p>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="glass-panel p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center">
                    <Search className="text-slate-500 ml-2" size={20} />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="bg-transparent border-none outline-none text-white ml-4 flex-1"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="glass-panel p-6 rounded-2xl bg-slate-900 border border-white/10 hover:border-cyan-500/30 transition-all group">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-100">{user.name}</h3>
                                        <p className="text-sm text-slate-400">{user.role}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full border ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400'}`}>
                                    {user.status}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <Monitor size={18} className="text-blue-400" />
                                        <span className="text-sm font-medium">Assets</span>
                                    </div>
                                    <span className="font-mono text-white font-bold">{user.assets_count}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <Disc size={18} className="text-purple-400" />
                                        <span className="text-sm font-medium">Software</span>
                                    </div>
                                    <span className="font-mono text-white font-bold">{user.software_count}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <Ticket size={18} className="text-rose-400" />
                                        <span className="text-sm font-medium">Tickets</span>
                                    </div>
                                    <span className="font-mono text-white font-bold">{user.tickets_count}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                                <button
                                    onClick={() => setSelectedUser(user)}
                                    className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
                                >
                                    View Details &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">

                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-slate-100">{selectedUser.name}</h3>
                                    <p className="text-sm text-slate-400">{selectedUser.role} • {selectedUser.status}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                <ArrowLeft size={24} className="rotate-180" />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="p-6 overflow-y-auto space-y-8">

                            {/* 1. Assigned Assets (Real Data) */}
                            <div>
                                <h4 className="flex items-center gap-2 text-blue-400 font-bold mb-4">
                                    <Monitor size={18} /> Assigned Assets ({selectedUser.assets_count})
                                </h4>
                                <div className="space-y-3">
                                    {selectedUser.assigned_assets.map(asset => (
                                        <Link href={`/assets/${asset.id}`} key={asset.id} className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all group">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium text-slate-200 group-hover:text-blue-300">{asset.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono mt-1">{asset.id}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-slate-300">{asset.category}</div>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{asset.status}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {selectedUser.assets_count === 0 && <div className="text-slate-500 italic">No assets assigned.</div>}
                                </div>
                            </div>

                            {/* 2. Software Licenses (Mock) */}
                            <div>
                                <h4 className="flex items-center gap-2 text-purple-400 font-bold mb-4">
                                    <Disc size={18} /> Software Licenses ({selectedUser.software_count})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Array.from({ length: selectedUser.software_count }).map((_, i) => (
                                        <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">L</div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-200">
                                                    {['Adobe Creative Cloud', 'Microsoft 365 E5', 'Zoom Pro', 'Slack Enterprise', 'Jira Cloud'][i % 5]}
                                                </div>
                                                <div className="text-xs text-slate-500">License Active</div>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedUser.software_count === 0 && <div className="text-slate-500 italic">No software licenses assigned.</div>}
                                </div>
                            </div>

                            {/* 3. Recent Tickets (Mock) */}
                            <div>
                                <h4 className="flex items-center gap-2 text-rose-400 font-bold mb-4">
                                    <Ticket size={18} /> Recent Tickets ({selectedUser.tickets_count})
                                </h4>
                                <div className="space-y-3">
                                    {Array.from({ length: selectedUser.tickets_count }).map((_, i) => {
                                        const ticketId = `TCK-GEN-${100 + i}`;
                                        return (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                <div>
                                                    <div className="text-sm font-medium text-slate-200">
                                                        {['VPN Access Issue', 'Monitor Flickering', 'Software Install Request'][i % 3]}
                                                    </div>
                                                    <div className="text-xs text-slate-500">{ticketId} • {['Open', 'Resolved', 'Pending'][i % 3]}</div>
                                                </div>
                                                <Link href={`/tickets/${ticketId}`} className="text-xs text-rose-400 hover:text-white">
                                                    View
                                                </Link>
                                            </div>
                                        );
                                    })}
                                    {selectedUser.tickets_count === 0 && <div className="text-slate-500 italic">No recent tickets.</div>}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
