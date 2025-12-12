import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, DollarSign, Clock, AlertCircle } from 'lucide-react'

export default function Renewals() {
    const [assets, setAssets] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ requested: 0, it_approved: 0, finance_approved: 0 })

    const fetchRenewals = async () => {
        try {
            const res = await axios.get('http://localhost:8000/assets/')
            const renewalAssets = res.data.filter(a => a.renewal_status)
            setAssets(renewalAssets)

            setStats({
                requested: renewalAssets.filter(a => a.renewal_status === 'Requested').length,
                it_approved: renewalAssets.filter(a => a.renewal_status === 'IT_Approved').length,
                finance_approved: renewalAssets.filter(a => a.renewal_status === 'Finance_Approved').length
            })
        } catch (error) {
            console.error("Failed to fetch renewals", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRenewals()
    }, [])

    const handleAction = async (assetId, action) => {
        try {
            await axios.post(`http://localhost:8000/workflows/review/${assetId}?action=${action}`)
            fetchRenewals() // Refresh data
        } catch (error) {
            console.error("Failed to process action", error)
            alert("Failed to process action")
        }
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
