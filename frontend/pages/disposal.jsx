import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { ArrowLeft, Trash2, ShieldAlert, HardDrive, CheckCircle } from 'lucide-react'

export default function Disposal() {
    const [assets, setAssets] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchDisposal = async () => {
        try {
            const res = await axios.get('http://localhost:8000/assets/')
            setAssets(res.data.filter(a => a.disposal_status))
        } catch (error) {
            console.error("Failed to fetch disposal list", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDisposal()
    }, [])

    const handleAction = async (assetId, action) => {
        try {
            await axios.post(`http://localhost:8000/workflows/disposal/${assetId}?action=${action}`)
            fetchDisposal()
        } catch (error) {
            alert("Failed to update status")
        }
    }

    if (loading) return <div className="p-8 text-white">Loading...</div>

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Disposal & Retirement</h2>
                    <p className="text-slate-400 mt-1">End-of-life management: Validation ➝ Wipe ➝ Dispose</p>
                </div>
                <Link href="/" className="btn btn-secondary flex items-center">
                    <ArrowLeft size={16} className="mr-2" /> Dashboard
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map(asset => (
                    <div key={asset.id} className="glass-card p-6 border-l-4 border-l-red-500/50">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-white text-lg">{asset.name}</h3>
                                <p className="text-slate-400 text-sm font-mono">{asset.serial_number}</p>
                            </div>
                            <Trash2 className="text-red-500/50" />
                        </div>

                        <div className="mb-6 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Currently:</span>
                                <span className="text-red-300 font-medium">{asset.disposal_status.replace(/_/g, ' ')}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {asset.disposal_status === 'Pending_Validation' && (
                                <button
                                    onClick={() => handleAction(asset.id, 'validate')}
                                    className="btn w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20"
                                >
                                    Validate for Disposal
                                </button>
                            )}

                            {asset.disposal_status === 'Ready_For_Wipe' && (
                                <button
                                    onClick={() => handleAction(asset.id, 'wipe')}
                                    className="btn w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 flex justify-center items-center"
                                >
                                    <HardDrive size={16} className="mr-2" /> Confirm Data Wipe
                                </button>
                            )}

                            {asset.disposal_status === 'Wiped' && (
                                <button
                                    onClick={() => handleAction(asset.id, 'dispose')}
                                    className="btn w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex justify-center items-center"
                                >
                                    <Trash2 size={16} className="mr-2" /> Finalize Disposal
                                </button>
                            )}

                            {asset.disposal_status === 'Disposed' && (
                                <div className="text-center py-2 text-slate-500 bg-white/5 rounded-lg text-sm flex items-center justify-center">
                                    <CheckCircle size={14} className="mr-2" /> Archived
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {assets.length === 0 && <p className="text-slate-500 col-span-3 text-center py-12">No assets pending disposal.</p>}
            </div>
        </div>
    )
}
