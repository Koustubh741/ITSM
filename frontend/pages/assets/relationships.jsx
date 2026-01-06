import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Link from 'next/link'
import { ArrowLeft, Network } from 'lucide-react'

export default function AssetRelationships() {
    const router = useRouter()
    const { id } = router.query
    const [relationships, setRelationships] = useState(null)

    useEffect(() => {
        if (!id) return
        const fetchRelationships = async () => {
            try {
                const res = await axios.get(`http://127.0.0.1:8000/assets/${id}/relationships`)
                setRelationships(res.data)
            } catch (error) {
                console.error("Failed to fetch relationships", error)
            }
        }
        fetchRelationships()
    }, [id])

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href={`/assets/${id}`} className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h2 className="text-3xl font-bold text-white tracking-tight">Asset Relationships (CMDB)</h2>
            </div>

            <div className="glass-panel min-h-[400px] flex flex-col items-center justify-center text-center p-12">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                    <Network size={48} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Dependency Map Visualization</h3>
                <p className="text-slate-400 max-w-md mb-8">
                    This view will display the upstream and downstream dependencies for this asset using a force-directed graph.
                </p>

                {relationships && (
                    <div className="grid grid-cols-2 gap-8 w-full max-w-2xl text-left">
                        <div className="bg-slate-900/50 p-6 rounded-xl border border-white/10">
                            <h4 className="font-bold text-slate-200 mb-4 border-b border-white/5 pb-2">Upstream (Depends On)</h4>
                            <ul className="space-y-3">
                                {relationships.upstream.map(r => (
                                    <li key={r.id} className="flex items-center space-x-3 text-slate-300">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                        <span>{r.name} <span className="text-xs text-slate-500 ml-1">({r.type})</span></span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-slate-900/50 p-6 rounded-xl border border-white/10">
                            <h4 className="font-bold text-slate-200 mb-4 border-b border-white/5 pb-2">Downstream (Impacts)</h4>
                            <ul className="space-y-3">
                                {relationships.downstream.map(r => (
                                    <li key={r.id} className="flex items-center space-x-3 text-slate-300">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                        <span>{r.name} <span className="text-xs text-slate-500 ml-1">({r.type})</span></span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
