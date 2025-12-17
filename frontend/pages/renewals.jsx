import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, DollarSign, Clock, AlertCircle } from 'lucide-react'

export default function Renewals() {
    const [loading, setLoading] = useState(true)

    // Mock renewals data
    const [assets, setAssets] = useState([
        { id: 1, name: 'Dell XPS 15', serial_number: 'DXP-992', assigned_to: 'Tech Team', renewal_cost: 1500, renewal_status: 'Requested' },
        { id: 2, name: 'HP Printer Pro', serial_number: 'HPP-445', assigned_to: 'Marketing', renewal_cost: 800, renewal_status: 'IT_Approved' },
        { id: 3, name: 'MacBook Air', serial_number: 'MBA-223', assigned_to: 'Design', renewal_cost: 2200, renewal_status: 'Finance_Approved' },
    ])

    const [stats, setStats] = useState({
        requested: assets.filter(a => a.renewal_status === 'Requested').length,
        it_approved: assets.filter(a => a.renewal_status === 'IT_Approved').length,
        finance_approved: assets.filter(a => a.renewal_status === 'Finance_Approved').length
    })

    useEffect(() => {
        setTimeout(() => setLoading(false), 500)
    }, [])

    const handleAction = async (assetId, action) => {
        // Mock action handler
        const statusMap = {
            'Requested': 'IT_Approved',
            'IT_Approved': 'Finance_Approved',
            'Finance_Approved': 'Commercial_Approved'
        }
        setAssets(prev => prev.map(a => {
            if (a.id === assetId) {
                if (action === 'reject') return { ...a, renewal_status: 'Rejected' }
                return { ...a, renewal_status: statusMap[a.renewal_status] || a.renewal_status }
            }
            return a
        }))
        alert(`Renewal action "${action}" completed successfully! (Mock Mode)`)
    }

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
        if (asset.renewal_status === 'Rejected') return <span className="text-red-500 text-sm">Rejected</span>
        if (asset.renewal_status === 'Commercial_Approved') return <span className="text-emerald-500 text-sm flex items-center"><CheckCircle size={14} className="mr-1" /> Renewed & PO Generated</span>

        return (
            <div className="flex space-x-2">
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

    if (loading) return <div className="p-8 text-white">Loading Renewals...</div>

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Renewal Management</h2>
                    <p className="text-slate-400 mt-1">Approvals workflow: IT ➝ Finance ➝ Commercial</p>
                </div>
                <Link href="/" className="btn btn-secondary flex items-center">
                    <ArrowLeft size={16} className="mr-2" /> Dashboard
                </Link>
            </div>

            {/* Workflow Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex items-center justify-between bg-yellow-500/5 border-yellow-500/20">
                    <div>
                        <p className="text-slate-400 text-sm font-medium uppercase">Pending IT Review</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{stats.requested}</h3>
                    </div>
                    <AlertCircle size={40} className="text-yellow-500/50" />
                </div>
                <div className="glass-card p-6 flex items-center justify-between bg-blue-500/5 border-blue-500/20">
                    <div>
                        <p className="text-slate-400 text-sm font-medium uppercase">Pending Finance</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{stats.it_approved}</h3>
                    </div>
                    <DollarSign size={40} className="text-blue-500/50" />
                </div>
                <div className="glass-card p-6 flex items-center justify-between bg-purple-500/5 border-purple-500/20">
                    <div>
                        <p className="text-slate-400 text-sm font-medium uppercase">Pending Commercial</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{stats.finance_approved}</h3>
                    </div>
                    <Clock size={40} className="text-purple-500/50" />
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Asset</th>
                            <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Assigned To</th>
                            <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Renewal Cost</th>
                            <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Current Stage</th>
                            <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {assets.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-500">No pending renewals found.</td>
                            </tr>
                        ) : assets.map(asset => (
                            <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="font-medium text-white">{asset.name}</div>
                                    <div className="text-xs text-slate-500">{asset.serial_number}</div>
                                </td>
                                <td className="p-4 text-slate-300">{asset.assigned_to || '-'}</td>
                                <td className="p-4 text-slate-300 font-mono">${asset.renewal_cost?.toLocaleString()}</td>
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
