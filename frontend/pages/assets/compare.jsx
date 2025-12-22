import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Split, Plus, X } from 'lucide-react';

export default function AssetComparisonPage() {
    const [selectedAsset1, setSelectedAsset1] = useState(null);
    const [selectedAsset2, setSelectedAsset2] = useState(null);
    const [comparisonData, setComparisonData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Mock List for Selection
    const [assets, setAssets] = useState([]);

    useEffect(() => {
        // Load real assets
        const savedAssets = localStorage.getItem('assets');
        if (savedAssets) {
            setAssets(JSON.parse(savedAssets));
        } else {
            const { initialMockAssets } = require('@/data/mockAssets');
            setAssets(initialMockAssets);
        }
    }, []);

    const handleCompare = () => {
        if (!selectedAsset1 || !selectedAsset2) return;
        setLoading(true);

        // Simulate "Processing" for 500ms
        setTimeout(() => {
            // loose comparison or string conversion for IDs
            const a1 = assets.find(a => String(a.id) === String(selectedAsset1));
            const a2 = assets.find(a => String(a.id) === String(selectedAsset2));

            if (a1 && a2) {
                // Normalize specs for comparison
                const normalizeSpecs = (asset) => {
                    const s = asset.specs || {};
                    return {
                        model: asset.model || 'N/A',
                        processor: s.processor || 'N/A',
                        ram: s.ram || 'N/A',
                        storage: s.storage || 'N/A',
                        graphics: s.graphics || 'Integrated',
                        purchase_date: asset.purchase_date || 'N/A',
                        warranty: asset.warranty_expiry || 'N/A',
                        cost: asset.cost ? `₹${asset.cost.toLocaleString()}` : 'N/A'
                    };
                };

                setComparisonData({
                    asset1: { name: a1.name, specs: normalizeSpecs(a1), condition: a1.status || 'Unknown' },
                    asset2: { name: a2.name, specs: normalizeSpecs(a2), condition: a2.status || 'Unknown' }
                });
            }
            setLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen p-8 bg-slate-950 text-slate-100">
            <Head>
                <title>Compare Assets | Asset Management</title>
            </Head>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href="/enterprise-features" className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Asset Comparison Tool</h1>
                        <p className="text-slate-400 mt-1">Side-by-side specification analysis</p>
                    </div>
                </div>

                {/* Selection Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end p-6 glass-panel rounded-2xl bg-white/5 border border-white/10">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Asset A</label>
                        <select
                            className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200"
                            value={selectedAsset1 || ''}
                            onChange={(e) => setSelectedAsset1(e.target.value)}
                        >
                            <option value="">Select Asset...</option>
                            {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}
                        </select>
                    </div>

                    <div className="hidden md:flex justify-center pb-3">
                        <div className="p-2 bg-slate-800 rounded-full border border-white/10 text-slate-500">
                            <Split size={24} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Asset B</label>
                        <select
                            className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200"
                            value={selectedAsset2 || ''}
                            onChange={(e) => setSelectedAsset2(e.target.value)}
                        >
                            <option value="">Select Asset...</option>
                            {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-2 flex justify-center mt-4">
                        <button
                            onClick={handleCompare}
                            disabled={!selectedAsset1 || !selectedAsset2 || loading}
                            className="btn btn-primary px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? 'Analyzing...' : 'Compare Specifications'}
                        </button>
                    </div>
                </div>

                {/* Comparison Result */}
                {comparisonData && (
                    <div className="grid grid-cols-3 gap-0 border border-white/10 rounded-2xl bg-slate-900/50 overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Headers */}
                        <div className="p-4 bg-slate-950/50 border-b border-r border-white/10 text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-center">
                            Specification
                        </div>
                        <div className="p-4 bg-slate-900/50 border-b border-r border-white/10 text-center font-bold text-lg text-emerald-400">
                            {comparisonData.asset1.name}
                        </div>
                        <div className="p-4 bg-slate-900/50 border-b border-white/10 text-center font-bold text-lg text-cyan-400">
                            {comparisonData.asset2.name}
                        </div>

                        {/* Rows */}
                        {['Model', 'Processor', 'RAM', 'Storage', 'Graphics', 'Purchase Date', 'Warranty', 'Cost'].map(spec => (
                            <>
                                <div className="p-4 bg-slate-950/30 border-b border-r border-white/5 text-sm font-medium text-slate-400 flex items-center justify-center">
                                    {spec}
                                </div>
                                <div className="p-4 border-b border-r border-white/5 text-center text-slate-200">
                                    {comparisonData.asset1.specs[spec.toLowerCase().replace(' ', '_')]}
                                </div>
                                <div className="p-4 border-b border-white/5 text-center text-slate-200">
                                    {comparisonData.asset2.specs[spec.toLowerCase().replace(' ', '_')]}
                                </div>
                            </>
                        ))}

                        {/* Summary / Score */}
                        <div className="p-4 bg-slate-950/30 border-r border-white/5 text-sm font-bold text-white flex items-center justify-center">
                            Overall Condition
                        </div>
                        <div className="p-4 border-r border-white/5 text-center">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm">
                                {comparisonData.asset1.condition}
                            </span>
                        </div>
                        <div className="p-4 text-center">
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm">
                                {comparisonData.asset2.condition}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
