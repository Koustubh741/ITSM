import Link from 'next/link';
import { ArrowLeft, User, Monitor, Disc, Ticket, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Mock API Call
        const fetchUsers = async () => {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data);
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
                                <button className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">View Details &rarr;</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
