import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, DollarSign, Clock, AlertCircle, Eye } from 'lucide-react'
import { initialMockAssets } from '@/data/mockAssets'; // Fallback

export default function Renewals() {
    const [loading, setLoading] = useState(true)
    const [renewals, setRenewals] = useState([])
    const [stats, setStats] = useState({ requested: 0, it_approved: 0, finance_approved: 0 })

    useEffect(() => {
        // 1. Fetch Real Data
        const savedAssets = localStorage.getItem('assets');
        let assets = savedAssets ? JSON.parse(savedAssets) : initialMockAssets;

        // 2. Simulate Renewal Requests from Real Assets
        // We'll deterministically select some assets to be in the renewal queue based on ID
        const generatedRenewals = assets
            .filter(a => a.id % 4 === 0 && a.status !== 'Retired') // Select ~25% of assets for mock renewal workflow
            .map(asset => {
                // Deterministic status based on ID
                let status = 'Requested';
                if (asset.id % 3 === 0) status = 'IT_Approved';
                if (asset.id % 5 === 0) status = 'Finance_Approved';

                return {
                    ...asset,
                    renewal_cost: Math.round(asset.cost * 0.15), // Mock renewal cost (15% of original)
                    renewal_status: status
                };
            });

        setRenewals(generatedRenewals);
        setLoading(false);
    }, [])

    // Update stats whenever renewals change
    useEffect(() => {
        setStats({
            requested: renewals.filter(a => a.renewal_status === 'Requested').length,
            it_approved: renewals.filter(a => a.renewal_status === 'IT_Approved').length,
            finance_approved: renewals.filter(a => a.renewal_status === 'Finance_Approved').length
        });
    }, [renewals]);

    const handleAction = (assetId, action) => {
        const statusMap = {
            'Requested': 'IT_Approved',
            'IT_Approved': 'Finance_Approved',
            'Finance_Approved': 'Commercial_Approved'
        };

        setRenewals(prev => prev.map(a => {
            if (a.id === assetId) {
                if (action === 'reject') return { ...a, renewal_status: 'Rejected' };
                if (action === 'approve') {
                    const nextStatus = statusMap[a.renewal_status];
                    return nextStatus ? { ...a, renewal_status: nextStatus } : a;
                }
            }
            return a;
        }));
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Requested': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            'IT_Approved': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'Finance_Approved': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            'Commercial_Approved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'Rejected': 'bg-red-500/10 text-red-500 border-red-500/20'
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-slate-800 text-slate-400'}`}>
                {status?.replace('_', ' ')}
            </span>
        )
    }

    const getActionButtons = (asset) => {
        const btnClass = "px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center"

        if (asset.renewal_status === 'Rejected') return <span className="text-red-500 text-sm font-medium">Rejected</span>
        if (asset.renewal_status === 'Commercial_Approved') return <span className="text-emerald-500 text-sm flex items-center font-medium"><CheckCircle size={14} className="mr-1" /> Renewed</span>

        return (
            <div className="flex items-center gap-2">
                {/* View Modal/Details */}
                <Link href={`/assets/${asset.id}`}>
                    <button className={`${btnClass} bg-slate-700 hover:bg-slate-600 text-slate-200`}>
                        <Eye size={14} className="mr-1" /> View
                    </button>
                </Link>

                <button
                    onClick={() => handleAction(asset.id, 'approve')}
                    className={`${btnClass} bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400`}
                >
                    <CheckCircle size={14} className="mr-1" />
                    Approve
                </button>
                <button
                    onClick={() => handleAction(asset.id, 'reject')}
                    className={`${btnClass} bg-red-500/20 hover:bg-red-500/30 text-red-400`}
                >
                    <XCircle size={14} className="mr-1" />
                    Reject
                </button>
            </div>
        )
    }

    if (loading) return <div className="p-8 text-white">Loading Renewals Mock Data...</div>

    return (
        <div className="space-y-8 p-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Renewal Management</h2>
                    <p className="text-slate-400 mt-1">Approvals workflow: IT ➝ Finance ➝ Commercial</p>
                </div>
                <Link href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Dashboard
                </Link>
            </div>

            {/* Workflow Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending IT Review</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{stats.requested}</h3>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-xl">
                        <AlertCircle size={24} className="text-yellow-500" />
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Finance</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{stats.it_approved}</h3>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <DollarSign size={24} className="text-blue-500" />
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Commercial</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{stats.finance_approved}</h3>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                        <Clock size={24} className="text-purple-500" />
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Asset</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned To</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Renewal Cost</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Current Stage</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {renewals.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-slate-500">
                                    <CheckCircle size={48} className="mx-auto mb-3 text-slate-700" />
                                    No pending renewals found. All assets are up to date!
                                </td>
                            </tr>
                        ) : renewals.map(asset => (
                            <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="font-medium text-white">{asset.name}</div>
                                    <div className="text-xs text-slate-500">{asset.serial_number}</div>
                                </td>
                                <td className="p-4 text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300">
                                            {asset.assigned_to?.charAt(0) || 'U'}
                                        </div>
                                        {asset.assigned_to || 'Unassigned'}
                                    </div>
                                </td>
                                <td className="p-4 text-slate-300 font-mono">₹{asset.renewal_cost?.toLocaleString()}</td>
                                <td className="p-4">
                                    {getStatusBadge(asset.renewal_status)}
                                </td>
                                <td className="p-4">
                                    {getActionButtons(asset)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
