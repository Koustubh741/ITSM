import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, LayoutGrid, List, Filter, Search, Tag, Calendar, User } from 'lucide-react';
import SavedViewsDrawer from '@/components/SavedViewsDrawer';

export default function SavedViewsPage() {
    // Reusing the drawer logic essentially, but displayed as a full page grid
    const [savedViews, setSavedViews] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Load from localStorage or Mock
        const stored = localStorage.getItem('asset_saved_views');
        if (stored) {
            setSavedViews(JSON.parse(stored));
        } else {
            // Mock Defaults (Sync with Drawer defaults for consistency)
            setSavedViews([
                { id: 1, name: 'Expiring Warranties (IT)', filters: { department: 'IT', warranty: 'Expiring Soon' }, created: '2023-11-01', shared: true },
                { id: 2, name: 'Unassigned Laptops', filters: { category: 'Laptop', status: 'In Stock' }, created: '2023-11-10', shared: false },
                { id: 3, name: 'Engineering High Value', filters: { department: 'Engineering', category: 'All' }, created: '2023-11-15', shared: false },
                { id: 4, name: 'Retired Servers 2023', filters: { category: 'Server', status: 'Retired' }, created: '2023-10-20', shared: true }
            ]);
        }
    }, []);

    const filteredViews = savedViews.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="min-h-screen p-8 bg-slate-950 text-slate-100">
            <Head>
                <title>Saved Views | Asset Management</title>
            </Head>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/enterprise-features" className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Saved Views Library</h1>
                            <p className="text-slate-400 mt-1">Manage your personal and shared asset filters</p>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-panel p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search saved views..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg border border-white/5 hover:bg-white/10">
                            <LayoutGrid size={20} />
                        </button>
                        <button className="p-2 text-purple-400 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredViews.length > 0 ? filteredViews.map(view => (
                        <div key={view.id} className="group relative bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={{
                                        pathname: '/assets/search',
                                        query: view.filters,
                                    }}
                                    className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-lg text-xs font-semibold flex items-center gap-1"
                                >
                                    Open <ArrowLeft size={12} className="rotate-180" />
                                </Link>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                                    <Filter size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-100">{view.name}</h3>
                                    <span className="text-xs text-slate-500">{view.created}</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(view.filters).map(([key, val]) => (
                                        val !== 'All' && val !== '' && (
                                            <span key={key} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-white/5">
                                                <Tag size={10} className="text-slate-500" />
                                                <span className="opacity-70">{key}:</span> {val}
                                            </span>
                                        )
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    {view.shared && (
                                        <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                            <User size={10} /> Shared
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500">
                                    ID: {view.id}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            No saved views found matching "{search}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
