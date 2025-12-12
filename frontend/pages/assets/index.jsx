import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Plus, Search, Filter } from 'lucide-react'
import AssetTable from '@/components/AssetTable'

export default function AssetsPage() {
    const [assets, setAssets] = useState([])
    const [filteredAssets, setFilteredAssets] = useState([])
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('All')
    const [filterSegment, setFilterSegment] = useState('All')

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const res = await axios.get('http://localhost:8000/assets/')
                setAssets(res.data)
                setFilteredAssets(res.data)
            } catch (error) {
                console.error("Failed to fetch assets", error)
            }
        }
        fetchAssets()
    }, [])

    const router = useRouter()

    useEffect(() => {
        if (!router.isReady) return
        const { status, risk } = router.query
        if (status) setFilterStatus(status)
        // If query has warranty risk, logic will be handled in filter effect
    }, [router.isReady, router.query])

    useEffect(() => {
        let result = [...assets] // Create copy to avoid mutating state
        const { risk, sort } = router.query || {}

        if (search) {
            result = result.filter(a =>
                a.name.toLowerCase().includes(search.toLowerCase()) ||
                a.serial_number.toLowerCase().includes(search.toLowerCase())
            )
        }
        if (filterStatus !== 'All') {
            result = result.filter(a => a.status === filterStatus)
        }
        if (filterSegment !== 'All') {
            result = result.filter(a => a.segment === filterSegment || (!a.segment && filterSegment === 'IT'))
        }

        // Handle Warranty Risk Filter
        if (risk === 'warranty') {
            const today = new Date()
            const warningDate = new Date()
            warningDate.setDate(today.getDate() + 30)

            result = result.filter(a => {
                if (!a.warranty_expiry) return false
                const expiry = new Date(a.warranty_expiry)
                return expiry >= today && expiry <= warningDate
            })
        }

        // Handle Sorting
        if (sort === 'newest') {
            // Assuming higher ID means newer, or use purchase_date if consistent. 
            // Mock data usually has IDs like "AST-001", so alphanumeric sort might work inverted.
            // Or if we have created_at/purchase_date. Let's try ID desc.
            result.sort((a, b) => {
                if (a.id > b.id) return -1;
                if (a.id < b.id) return 1;
                return 0;
            })
        }

        setFilteredAssets(result)
    }, [search, filterStatus, filterSegment, assets, router.query])

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Asset Inventory</h2>
                    <p className="text-slate-400 mt-1">Manage and track all hardware and software assets</p>
                </div>
                <Link href="/assets/add" className="btn btn-primary flex items-center space-x-2">
                    <Plus size={20} />
                    <span>Add Asset</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="glass-panel p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, serial..."
                        className="input-field pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="flex items-center space-x-2 text-slate-400">
                        <Filter size={20} />
                        <span className="font-medium hidden md:inline">Filter:</span>
                    </div>

                    <select
                        className="input-field w-36 bg-slate-800/50"
                        value={filterSegment}
                        onChange={(e) => setFilterSegment(e.target.value)}
                    >
                        <option value="All" className="bg-slate-900 text-white">All Segments</option>
                        <option value="IT" className="bg-slate-900 text-white">IT</option>
                        <option value="NON-IT" className="bg-slate-900 text-white">NON-IT</option>
                    </select>

                    <select
                        className="input-field w-40 bg-slate-800/50"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All" className="bg-slate-900 text-white">All Status</option>
                        <option value="Active" className="bg-slate-900 text-white">Active</option>
                        <option value="In Stock" className="bg-slate-900 text-white">In Stock</option>
                        <option value="Repair" className="bg-slate-900 text-white">Repair</option>
                        <option value="Retired" className="bg-slate-900 text-white">Retired</option>
                    </select>
                </div>
            </div>

            <AssetTable assets={filteredAssets} />
        </div>
    )
}
