import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import AssetTable from '@/components/AssetTable';
import SmartFiltersBar from '@/components/SmartFiltersBar';
import SavedViewsDrawer from '@/components/SavedViewsDrawer' // Will create next

export default function SmartSearchPage() {
    // Generate Mock Data
    const generateMockAssets = (count) => {
        const types = ['Laptop', 'Desktop', 'Monitor', 'Server', 'Phone'];
        const statuses = ['Active', 'In Stock', 'Repair', 'Retired'];
        const depts = ['IT', 'HR', 'Engineering', 'Sales', 'Finance'];

        return Array.from({ length: count }).map((_, i) => ({
            id: `AST-${1000 + i}`,
            name: `${types[i % types.length]} ${1000 + i}`,
            serial_number: `SN-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            segment: i % 3 === 0 ? 'NON-IT' : 'IT',
            type: types[i % types.length],
            status: statuses[i % statuses.length],
            assigned_to: i % 2 === 0 ? `User ${i}` : null,
            assigned_by: 'Admin',
            location: ['New York', 'London', 'Remote', 'Singapore'][i % 4],
            category: types[i % types.length], // Mapping type to category for filter
            department: depts[i % depts.length],
            warranty_expiry: new Date(new Date().setDate(new Date().getDate() + (i * 10 - 100))).toISOString().split('T')[0]
        }));
    };

    const [assets, setAssets] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [isSavedViewOpen, setIsSavedViewOpen] = useState(false);

    useEffect(() => {
        // Load mock data on mount
        const data = generateMockAssets(50);
        setAssets(data);
        setFilteredAssets(data);
    }, []);

    const handleFilterChange = (filters) => {
        let result = [...assets];

        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(a =>
                a.name.toLowerCase().includes(q) ||
                a.serial_number.toLowerCase().includes(q) ||
                a.id.toLowerCase().includes(q)
            );
        }

        if (filters.status !== 'All') {
            result = result.filter(a => a.status === filters.status);
        }

        if (filters.category !== 'All') {
            result = result.filter(a => a.type === filters.category); // Assuming type maps to category
        }

        if (filters.department !== 'All') {
            result = result.filter(a => a.department === filters.department);
        }

        if (filters.warranty !== 'All') {
            const today = new Date();
            const warningDate = new Date();
            warningDate.setDate(today.getDate() + 30);

            result = result.filter(a => {
                const expiry = new Date(a.warranty_expiry);
                if (filters.warranty === 'Expired') return expiry < today;
                if (filters.warranty === 'Expiring Soon') return expiry >= today && expiry <= warningDate;
                if (filters.warranty === 'Active') return expiry > today;
                return true;
            });
        }

        setFilteredAssets(result);
    };

    const handleSaveView = (currentFilters) => {
        // Just open the drawer for now, passing filters logic would be in the drawer component usually
        setIsSavedViewOpen(true);
    };

    return (
        <div className="min-h-screen p-8 space-y-8">
            <Head>
                <title>Smart Search | Asset Management</title>
            </Head>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/enterprise-features" className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Smart Asset Search</h1>
                        <p className="text-slate-400 mt-1">Advanced filtering and reporting capabilities</p>
                    </div>
                </div>
                <div className="text-sm text-slate-500 font-mono">
                    {filteredAssets.length} Results Found
                </div>
            </div>

            {/* Filters */}
            <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-md">
                <SmartFiltersBar
                    onFilterChange={handleFilterChange}
                    onSaveView={handleSaveView}
                />
            </div>

            {/* Results Table */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <AssetTable assets={filteredAssets} />
            </div>

            {/* Saved Views Drawer */}
            <SavedViewsDrawer
                isOpen={isSavedViewOpen}
                onClose={() => setIsSavedViewOpen(false)}
                currentFilters={{}}
                onLoadView={(filters) => {
                    handleFilterChange(filters);
                }}
            />
        </div>
    );
}
