import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Plus, Search, Filter } from 'lucide-react'
import AssetTable from '@/components/AssetTable'
import { initialMockAssets } from '@/data/mockAssets'

export default function AssetsPage() {
    const [assets, setAssets] = useState([])
    const [filteredAssets, setFilteredAssets] = useState([])
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('All')
    const [filterSegment, setFilterSegment] = useState('All')



    useEffect(() => {
        const fetchAssets = async () => {
            // Mock Data Priority: localStorage -> initialMockAssets
            const savedAssets = localStorage.getItem('assets');
            if (savedAssets) {
                let parsed = JSON.parse(savedAssets);
                let dataChanged = false;

                // 1. DATA FORMATTING FIX (Quotes, String Costs, Zeros, Bulk Import, Specs)
                // We run this map always to be safe, or check first.
                const needsFormatting = parsed.some(a =>
                    (typeof a.name === 'string' && (a.name.includes('"') || a.name.startsWith("'"))) ||
                    typeof a.cost === 'string' ||
                    a.cost === 0 ||
                    a.assigned_by === 'Bulk Import' ||
                    (a.segment === 'IT' && !a.specs && (a.type === 'Laptop' || a.type === 'Desktop'))
                );

                if (needsFormatting) {
                    parsed = parsed.map(a => {
                        const cleanStr = (s) => s ? String(s).replace(/^["']|["']$/g, '').trim() : s;
                        const parseVal = (v) => {
                            if (!v) return 0;
                            if (typeof v === 'number') return v;
                            const n = parseFloat(String(v).replace(/[₹$,\s]/g, ''));
                            return isNaN(n) ? 0 : n;
                        };

                        // Clean status string first
                        let st = cleanStr(a.status);
                        if (st && (st.match(/active/i) || st.match(/in use/i))) st = 'In Use';

                        // COST PATCHING: If cost is 0, assign realistic mock value based on type
                        let finalCost = parseVal(a.cost);
                        if (finalCost === 0) {
                            const t = (a.type || '').toLowerCase();
                            if (t.includes('laptop')) finalCost = Math.floor(Math.random() * (85000 - 45000) + 45000);
                            else if (t.includes('desktop') || t.includes('mac')) finalCost = Math.floor(Math.random() * (70000 - 35000) + 35000);
                            else if (t.includes('monitor')) finalCost = Math.floor(Math.random() * (25000 - 8000) + 8000);
                            else if (t.includes('access') || t.includes('keybw') || t.includes('mouse')) finalCost = Math.floor(Math.random() * (5000 - 500) + 500);
                            else finalCost = Math.floor(Math.random() * (15000 - 5000) + 5000); // Default
                        }

                        // ASSIGNED BY PATCHING
                        let assignedBy = cleanStr(a.assigned_by);
                        if (assignedBy === 'Bulk Import') assignedBy = 'Admin';

                        // SPECS PATCHING: Generate specs for IT assets if missing
                        let specs = a.specs || {};
                        const typeLower = (a.type || '').toLowerCase();
                        if (!a.specs && a.segment === 'IT') {
                            const processors = ['Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M1', 'Apple M2'];
                            const rams = ['8GB', '16GB', '32GB', '64GB'];
                            const storages = ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'];
                            const os = ['Windows 10 Pro', 'Windows 11 Pro', 'macOS Ventura', 'macOS Sonoma', 'Ubuntu Linux'];

                            if (typeLower.includes('laptop') || typeLower.includes('desktop') || typeLower.includes('mac')) {
                                specs = {
                                    processor: processors[Math.floor(Math.random() * processors.length)],
                                    ram: rams[Math.floor(Math.random() * rams.length)],
                                    storage: storages[Math.floor(Math.random() * storages.length)],
                                    os: os[Math.floor(Math.random() * os.length)]
                                };
                            } else if (typeLower.includes('monitor')) {
                                specs = { resolution: '4K UHD', refresh_rate: '60Hz', panel: 'IPS' };
                            }
                        }

                        return {
                            ...a,
                            name: cleanStr(a.name),
                            segment: cleanStr(a.segment),
                            type: cleanStr(a.type),
                            model: cleanStr(a.model),
                            serial_number: cleanStr(a.serial_number),
                            status: st,
                            location: cleanStr(a.location),
                            assigned_to: cleanStr(a.assigned_to) === 'Unassigned' ? null : cleanStr(a.assigned_to),
                            assigned_by: assignedBy,
                            cost: finalCost,
                            specs: specs
                        };
                    });
                    dataChanged = true;
                }

                // 2. SEMANTIC VALIDATION (Purge Bad Imports)
                // Check if any status is NOT in the allowed list.
                const validStatuses = ['active', 'in use', 'in stock', 'repair', 'maintenance', 'retired'];
                const hasInvalidStatus = parsed.some(a => !a.status || !validStatuses.includes(a.status.toLowerCase()));

                if (hasInvalidStatus) {
                    const initialCount = parsed.length;
                    parsed = parsed.filter(a => {
                        if (!a.status) return false;
                        const s = a.status.toLowerCase();
                        return validStatuses.includes(s);
                    });
                    if (parsed.length < initialCount) {
                        console.log(`Removed ${initialCount - parsed.length} corrupted assets.`);
                        dataChanged = true;
                    }
                }

                if (dataChanged) {
                    localStorage.setItem('assets', JSON.stringify(parsed));
                }

                setAssets(parsed);
                setFilteredAssets(parsed);
            } else {
                setAssets(initialMockAssets);
                setFilteredAssets(initialMockAssets);
                localStorage.setItem('assets', JSON.stringify(initialMockAssets));
            }
        }
        fetchAssets()
    }, [])

    const router = useRouter()

    useEffect(() => {
        if (!router.isReady) return
        const { status, risk, segment } = router.query
        if (status) setFilterStatus(status)
        if (segment) {
            // Normalize Non-IT casing to match Select Option
            if (segment.toLowerCase() === 'non-it') setFilterSegment('NON-IT')
            else setFilterSegment(segment)
        }
    }, [router.isReady, router.query])

    useEffect(() => {
        let result = [...assets] // Create copy to avoid mutating state
        const { risk, sort } = router.query || {}

        if (search) {
            const lowerSearch = search.toLowerCase();
            const deepSearch = (obj) => {
                if (!obj) return false;
                if (typeof obj === 'string' || typeof obj === 'number') {
                    return String(obj).toLowerCase().includes(lowerSearch);
                }
                if (typeof obj === 'object') {
                    return Object.values(obj).some(val => deepSearch(val));
                }
                return false;
            };

            result = result.filter(a => deepSearch(a));
        }
        if (filterStatus !== 'All') {
            if (filterStatus === 'In Use') {
                // Determine "In Use" by matching "Active"
                result = result.filter(a => a.status === 'Active' || a.status === 'In Use')
            } else {
                result = result.filter(a => (a.status || '').toLowerCase() === filterStatus.toLowerCase())
            }
        }
        if (filterSegment !== 'All') {
            result = result.filter(a => (a.segment || '').toLowerCase() === filterSegment.toLowerCase())
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
            result.sort((a, b) => {
                const dateA = new Date(a.purchase_date || 0);
                const dateB = new Date(b.purchase_date || 0);
                return dateB - dateA; // Descending order
            });
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
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by anything (Name, Spec, Location, Cost...)"
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-500"
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
                        <option value="In Use" className="bg-slate-900 text-white">In Use</option>
                        <option value="In Stock" className="bg-slate-900 text-white">In Stock</option>
                        <option value="Repair" className="bg-slate-900 text-white">Repair</option>
                        <option value="Maintenance" className="bg-slate-900 text-white">Maintenance</option>
                        <option value="Retired" className="bg-slate-900 text-white">Retired</option>
                    </select>

                    {/* Results Count */}
                    <div className="bg-slate-800/50 px-3 py-2 rounded-lg border border-white/5 text-xs text-slate-400 font-medium">
                        Showing <span className="text-white">{filteredAssets.length}</span> assets
                    </div>
                </div>
            </div>

            <AssetTable assets={filteredAssets} />
        </div>
    )
}
