import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Check, Truck, Package } from 'lucide-react'

export default function Procurement() {
    const [loading, setLoading] = useState(true)

    // Mock procurement data
    const [assets, setAssets] = useState([
        { id: 1, name: 'Dell Workstation', type: 'Desktop', vendor: 'Dell', procurement_status: 'Requested', assigned_to: 'John Doe' },
        { id: 2, name: 'MacBook Pro M3', type: 'Laptop', vendor: 'Apple', procurement_status: 'Approved', assigned_to: 'Sarah Lee' },
        { id: 3, name: 'HP Printer XL', type: 'Printer', vendor: 'HP', procurement_status: 'Ordered', assigned_to: 'Logistics' },
    ])

    useEffect(() => {
        setTimeout(() => setLoading(false), 500)
    }, [])

    const handleAction = async (assetId, action) => {
        // Mock action handler
        const statusMap = {
            'Requested': 'Approved',
            'Approved': 'Ordered',
            'Ordered': 'Received'
        }
        setAssets(prev => prev.map(a =>
            a.id === assetId ? { ...a, procurement_status: statusMap[a.procurement_status] || a.procurement_status } : a
        ))
        alert(`Procurement action "${action}" completed successfully! (Mock Mode)`)
    }

    const getStatusStep = (status) => {
        const steps = ['Requested', 'Approved', 'Ordered', 'Received']
        const currentIdx = steps.indexOf(status)
        return (
            <div className="flex items-center space-x-2">
                {steps.slice(0, 3).map((step, idx) => (
                    <div key={step} className={`h-2 w-8 rounded-full ${idx <= currentIdx ? 'bg-blue-500' : 'bg-slate-700'}`} />
                ))}
                <span className="text-xs text-slate-400 ml-2">{status}</span>
            </div>
        )
    }

    if (loading) return <div className="p-8 text-white">Loading Orders...</div>

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Procurement & Onboarding</h2>
                    <p className="text-slate-400 mt-1">Manage new asset requests and orders</p>
                </div>
                <Link href="/" className="btn btn-secondary flex items-center">
                    <ArrowLeft size={16} className="mr-2" /> Dashboard
                </Link>
            </div>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Asset Details</th>
                            <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Requester</th>
                            <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Status Tracker</th>
                            <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Next Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {assets.length === 0 ? <tr><td colSpan="4" className="p-8 text-center text-slate-500">No active procurement orders.</td></tr> :
                            assets.map(asset => (
                                <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-white">{asset.name}</div>
                                        <div className="text-xs text-slate-500">{asset.type} • {asset.vendor}</div>
                                    </td>
                                    <td className="p-4 text-slate-300">{asset.assigned_to || '-'}</td>
                                    <td className="p-4">
                                        {getStatusStep(asset.procurement_status)}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleAction(asset.id, 'approve')}
                                            className="btn btn-primary text-xs py-1 px-3 flex items-center"
                                        >
                                            {asset.procurement_status === 'Requested' && <>Approve Request</>}
                                            {asset.procurement_status === 'Approved' && <><ShoppingCart size={14} className="mr-2" />Place Order</>}
                                            {asset.procurement_status === 'Ordered' && <><Package size={14} className="mr-2" />Receive & Stock</>}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
