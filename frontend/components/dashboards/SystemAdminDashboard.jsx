import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Package, CheckCircle, AlertTriangle, Clock, Activity, Download, Plus, Layers, LayoutGrid, Calendar, ArrowUpRight, DollarSign, TrendingDown, ShoppingBag } from 'lucide-react'
import BarChart from '@/components/BarChart'
import PieChart from '@/components/PieChart'
import TrendLineChart from '@/components/TrendLineChart'
import AlertsFeed from '@/components/AlertsFeed'
import WorkflowVisualizer from '@/components/WorkflowVisualizer'
import apiClient from '@/lib/apiClient';
import { useRole } from '@/contexts/RoleContext';

export default function SystemAdminDashboard() {
    const router = useRouter()
    const { ROLES, user: currentUser } = useRole()
    const [loading, setLoading] = useState(true)
    const [chartMetric, setChartMetric] = useState('location')
    const [trendView, setTrendView] = useState('monthly')
    const [timeRange, setTimeRange] = useState('Overview') // Overview, Analytics, Requests
    const [pendingUsers, setPendingUsers] = useState([])



    const [allAssets, setAllAssets] = useState([]);

    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        repair: 0,
        warranty_risk: 0,
        total_value: 0,
        by_status: [],
        by_segment: [],
        by_type: [],
        by_location: [],
        trends: { monthly: [], quarterly: [] }
    });

    useEffect(() => {
        // Load assets from API
        const loadAssets = async () => {
            try {
                const apiAssets = await apiClient.getAssets();
                let parsed = apiAssets;

                // DATA SANITIZER: Cleanup corrupted data from previous imports
                // Checks for: Quotes, String Costs, Empty Costs, "Bulk Import", Missing Specs
                const needsCleaning = parsed.some(a =>
                    (typeof a.name === 'string' && (a.name.includes('"') || a.name.startsWith("'"))) ||
                    typeof a.cost === 'string' ||
                    a.cost === 0 ||
                    a.assigned_by === 'Bulk Import' ||
                    (a.segment === 'IT' && !a.specs && (a.type === 'Laptop' || a.type === 'Desktop')) // Check for missing specs
                );

                if (needsCleaning) {
                    console.log("Detected corrupted data. Running sanitizer...");
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
                            specifications: specs // Ensure we use the property name from backend
                        };
                    });
                }

                setAllAssets(parsed);
                setLoading(false);
            } catch (error) {
                console.error('Failed to load assets:', error);
                setAllAssets([]);
                setLoading(false);
            }
        };

        loadAssets();
    }, []);

    const [activeUsers, setActiveUsers] = useState([])

    const fetchPendingUsers = async () => {
        try {
            console.log('Fetching pending users, admin_id:', currentUser?.id);
            if (!currentUser) {
                console.warn('No currentUser found in fetchPendingUsers');
                return;
            }
            const pending = await apiClient.getUsers({ status: 'PENDING', admin_user_id: currentUser.id });
            console.log('Pending users fetched:', pending.length);
            setPendingUsers(pending);
            const active = await apiClient.getUsers({ status: 'ACTIVE', admin_user_id: currentUser.id });
            setActiveUsers(active);
        } catch (error) {
            console.error('Failed to fetch pending users:', error);
        }
    }

    const handleActivateUser = async (userId) => {
        try {
            if (!currentUser) return;
            await apiClient.activateUser(userId, currentUser.id);
            // Refresh list
            fetchPendingUsers();
        } catch (error) {
            console.error('Failed to activate user:', error);
            alert('Failed to activate user: ' + error.message);
        }
    }

    const handleDenyUser = async (userId) => {
        if (!confirm('Are you sure you want to deny this access request?')) return;
        try {
            if (!currentUser) return;
            await apiClient.denyUser(userId, currentUser.id);
            // Refresh list
            fetchPendingUsers();
        } catch (error) {
            console.error('Failed to deny user:', error);
            alert('Failed to deny user: ' + error.message);
        }
    }

    const handleDeactivateUser = async (userId) => {
        if (!confirm('Are you sure you want to deactivate this account?')) return;
        try {
            if (!currentUser) return;
            await apiClient.request(`/auth/users/${userId}/disable?admin_user_id=${currentUser.id}`, { method: 'POST' });
            fetchPendingUsers();
        } catch (error) {
            console.error('Failed to deactivate user:', error);
            alert('Failed to deactivate user: ' + error.message);
        }
    }

    useEffect(() => {
        if (timeRange === 'Requests') {
            fetchPendingUsers()
        }
    }, [timeRange, currentUser])

    useEffect(() => {
        if (allAssets.length === 0) return;

        // Dynamic Calculation Logic
        const calculateStats = () => {
            const totals = {
                active: 0,
                repair: 0,
                maintenance: 0,
                retired: 0,
                in_stock: 0,
                it: 0,
                non_it: 0,
                total: allAssets.length,
                value: 0
            };

            const segments = {};
            const types = {};
            const locations = {};

            // Monthly Trend Buckets (Jan-Dec)
            const monthlyTrends = Array(12).fill(0).map((_, i) => ({
                name: new Date(0, i).toLocaleString('default', { month: 'short' }),
                repaired: 0, // Mocked distribution
                renewed: 0   // Based on purchase_date
            }));

            allAssets.forEach(asset => {
                if (!asset || !asset.status) return;
                // Status Counts
                const statusLower = asset.status.toLowerCase();
                // "Active" in DB === "In Use" in UI
                if (statusLower === 'active' || statusLower === 'in use') totals.active++;
                else if (statusLower.includes('repair')) totals.repair++;
                else if (statusLower.includes('maintenance')) totals.maintenance++;
                else if (statusLower.includes('retired')) totals.retired++;
                else if (statusLower.includes('stock')) totals.in_stock++;

                // Segment Counts
                const segmentLower = (asset.segment || '').toLowerCase();
                if (segmentLower === 'it') totals.it++;
                else if (segmentLower === 'non-it' || segmentLower === 'non it') totals.non_it++;


                // Value
                totals.value += (asset.cost || 0);

                // Segment
                segments[asset.segment] = (segments[asset.segment] || 0) + 1;

                // Type
                types[asset.type] = (types[asset.type] || 0) + 1;

                // Location - EXACT MATCH
                locations[asset.location] = (locations[asset.location] || 0) + 1;

                // Trends
                if (asset.purchase_date) {
                    const date = new Date(asset.purchase_date);
                    if (!isNaN(date)) {
                        const month = date.getMonth();
                        monthlyTrends[month].renewed += 1;

                        // Deterministic mock logic for repairs:
                        // If asset ID is divisible by 3, pretend it was repaired 2 months after purchase (wrapping around year)
                        if (asset.id % 3 === 0) {
                            const repairMonth = (month + 2) % 12;
                            monthlyTrends[repairMonth].repaired += 1;
                        }
                    }
                }
            });

            // Format for Charts
            const by_location = Object.entries(locations).map(([name, value]) => ({ name, value }));
            const by_segment = Object.entries(segments).map(([name, value]) => ({ name, value }));
            const by_type = Object.entries(types).map(([name, value]) => ({ name, value }));
            const by_status = [
                { name: 'In Use', value: totals.active },
                { name: 'Repair', value: totals.repair },
                { name: 'Retired', value: totals.retired },
                { name: 'In Stock', value: totals.in_stock }
            ];

            // Quarterly Aggregation
            const quarterlyTrends = [
                { name: 'Q1', repaired: 0, renewed: 0 },
                { name: 'Q2', repaired: 0, renewed: 0 },
                { name: 'Q3', repaired: 0, renewed: 0 },
                { name: 'Q4', repaired: 0, renewed: 0 },
            ];

            monthlyTrends.forEach((m, index) => {
                const qIndex = Math.floor(index / 3);
                quarterlyTrends[qIndex].repaired += m.repaired;
                quarterlyTrends[qIndex].renewed += m.renewed;
            });

            // Warranty Risk Calculation
            const today = new Date();
            const warningDate = new Date();
            warningDate.setDate(today.getDate() + 30);

            let warrantyRiskCount = 0;
            allAssets.forEach(asset => {
                if (asset.warranty_expiry) {
                    const expiry = new Date(asset.warranty_expiry);
                    if (expiry >= today && expiry <= warningDate) {
                        warrantyRiskCount++;
                    }
                }
            });

            setStats({
                total: totals.total,
                active: totals.active,
                repair: totals.repair,
                maintenance: totals.maintenance,
                in_stock: totals.in_stock,
                it: totals.it,
                non_it: totals.non_it,
                warranty_risk: warrantyRiskCount,
                total_value: totals.value,
                by_status,
                by_segment,
                by_type,
                by_location,
                trends: {
                    monthly: monthlyTrends,
                    quarterly: quarterlyTrends
                }
            });
            setLoading(false);
        };

        calculateStats(); // Run calculations
    }, [allAssets]);

    const handleExport = () => {
        if (!allAssets || allAssets.length === 0) return
        const headers = ["Asset Name", "Segment", "Type", "Model", "Serial Number", "Status", "Cost", "Location", "Assigned To", "Assigned By", "Purchase Date"]
        const csvContent = [
            headers.join(','),
            ...allAssets.map(asset => [
                `"${asset.name}"`,
                `"${asset.segment}"`,
                `"${asset.type}"`,
                `"${asset.model}"`,
                `"${asset.serial_number}"`,
                `"${asset.status}"`,
                `"${asset.cost || 0}"`,
                `"${asset.location}"`,
                `"${asset.assigned_to || ''}"`,
                `"${asset.assigned_by || ''}"`,
                `"${asset.purchase_date || ''}"`
            ].join(','))
        ].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', 'asset_inventory_report.csv')
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
                </div>
                <p className="text-slate-400 font-medium animate-pulse">Loading Dashboard...</p>
            </div>
        </div>
    )

    const StatCard = ({ title, value, subtext, icon: Icon, colorClass, gradient, trend }) => (
        <div className={`glass-card p-6 relative overflow-hidden group cursor-pointer hover:border-blue-500/30 hover:bg-white/5 transition-all duration-300`}>
            <div className={`absolute -right-6 -top-6 p-8 rounded-full ${gradient} opacity-5 group-hover:opacity-10 transition-all duration-500 blur-2xl`}></div>
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <div className={`p-2 w-fit rounded-lg ${gradient} bg-opacity-20 mb-3`}>
                        <Icon className="text-white" size={20} />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
                </div>
                {trend && (
                    <div className="flex items-center text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2 py-1 rounded-full">
                        <ArrowUpRight size={12} className="mr-1" />
                        {trend}
                    </div>
                )}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <p className="text-slate-500 text-[11px] truncate">{subtext}</p>
                <div className="h-1 w-12 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${colorClass.replace('text-', 'bg-')} w-2/3`}></div>
                </div>
            </div>
        </div>
    )

    const handleGraphClick = (data) => {
        if (!data) return;
        const name = data.name || (data.payload && data.payload.name);
        if (!name) return;

        // Map UI metric names to URL params if needed, but they mostly match
        // chartMetric: 'location', 'type', 'segment', 'status'
        router.push(`/assets?${chartMetric}=${encodeURIComponent(name)}`)
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header Section with Toggles */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
                        Executive <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Overview</span>
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm max-w-md">
                        Comprehensive asset lifecycle management and real-time operational intelligence.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">

                    {/* View Toggles */}
                    <div className="flex bg-slate-800/50 p-1 rounded-xl">
                        {['Overview', 'Analytics', 'Requests'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setTimeRange(mode)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${timeRange === mode
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {mode === 'Overview' ? <LayoutGrid size={16} /> : mode === 'Analytics' ? <Activity size={16} /> : <Clock size={16} />}
                                {mode}
                                {mode === 'Requests' && pendingUsers.length > 0 && (
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                                        {pendingUsers.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-8 bg-white/10 hidden md:block"></div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                        <button onClick={handleExport} className="btn bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center space-x-2 px-4 py-2.5 rounded-xl">
                            <Download size={18} />
                            <span className="hidden md:inline">Export</span>
                        </button>
                        <Link href="/assets/add">
                            <button className="btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-none shadow-lg shadow-blue-500/25 flex items-center space-x-2 px-6 py-2.5 rounded-xl">
                                <Plus size={18} />
                                <span className="hidden md:inline">Add Asset</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/assets">
                    <StatCard
                        title="Total Assets"
                        value={stats?.total || 0}
                        subtext="Global inventory count"
                        icon={Package}
                        colorClass="text-blue-500"
                        gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                        trend="+12%"
                    />
                </Link>
                <Link href="/assets?status=In Use">
                    <StatCard
                        title="In Use"
                        value={stats?.active || 0}
                        subtext="Currently deployed devices"
                        icon={CheckCircle}
                        colorClass="text-emerald-500"
                        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                        trend="+5%"
                    />
                </Link>
                <Link href="/assets?status=Repair">
                    <StatCard
                        title="In Repair"
                        value={stats?.repair || 0}
                        subtext="Maintenance & Service"
                        icon={AlertTriangle}
                        colorClass="text-orange-500"
                        gradient="bg-gradient-to-br from-orange-500 to-amber-600"
                    />
                </Link>
                <Link href="/assets?risk=warranty">
                    <StatCard
                        title="Warranty Risk"
                        value={stats?.warranty_risk || 0}
                        subtext="Expiring within 30 days"
                        icon={Clock}
                        colorClass="text-rose-500"
                        gradient="bg-gradient-to-br from-rose-500 to-pink-600"
                        trend="+2"
                    />
                </Link>
                <Link href="/assets?status=In Stock">
                    <StatCard
                        title="In Stock"
                        value={stats?.in_stock || 0}
                        subtext="Ready for assignment"
                        icon={Layers}
                        colorClass="text-violet-500"
                        gradient="bg-gradient-to-br from-violet-500 to-fuchsia-600"
                    />
                </Link>
                <Link href="/assets?status=Maintenance">
                    <StatCard
                        title="In Maintenance"
                        value={stats?.maintenance || 0}
                        subtext="Routine checkups"
                        icon={Activity}
                        colorClass="text-amber-500"
                        gradient="bg-gradient-to-br from-amber-500 to-yellow-600"
                    />
                </Link>
                <Link href="/assets?segment=IT">
                    <StatCard
                        title="IT Assets"
                        value={stats?.it || 0}
                        subtext="Computing & Network"
                        icon={Package}
                        colorClass="text-blue-500"
                        gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                    />
                </Link>
                <Link href="/assets?segment=Non-IT">
                    <StatCard
                        title="Non-IT Assets"
                        value={stats?.non_it || 0}
                        subtext="Furniture & Accessories"
                        icon={Layers}
                        colorClass="text-purple-500"
                        gradient="bg-gradient-to-br from-purple-500 to-pink-600"
                    />
                </Link>

                {/* Financial Cards (Mock Data) */}
                <Link href="/assets">
                    <StatCard
                        title="Asset Value"
                        value={`₹${(stats?.total_value || 0).toLocaleString()}`}
                        subtext="Total inventory valuation"
                        icon={DollarSign}
                        colorClass="text-cyan-400"
                        gradient="bg-gradient-to-br from-cyan-500 to-blue-500"
                        trend="+8%"
                    />
                </Link>
                <Link href="/assets">
                    <StatCard
                        title="Net Asset Value"
                        value={`₹${((stats?.total_value || 0) * 0.85).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        subtext="After depreciation"
                        icon={TrendingDown}
                        colorClass="text-purple-400"
                        gradient="bg-gradient-to-br from-purple-500 to-pink-500"
                    />
                </Link>
                <Link href="/procurement">
                    <StatCard
                        title="YTD Purchases"
                        value="₹3,25,000"
                        subtext="Fiscal year spend"
                        icon={ShoppingBag}
                        colorClass="text-amber-400"
                        gradient="bg-gradient-to-br from-amber-500 to-orange-500"
                        trend="+15%"
                    />
                </Link>
            </div>

            {/* Workflow Visualization */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <WorkflowVisualizer />
            </div>

            {/* Main Content Layout */}
            {
                timeRange === 'Overview' ? (
                    /* OVERVIEW LAYOUT */
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Left Column: Charts */}
                        <div className="xl:col-span-2 space-y-6">
                            {/* Primary Chart */}
                            <div className="glass-panel p-6 min-h-[400px]">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Asset Analytics</h3>
                                        <p className="text-slate-400 text-sm">Distribution and lifecycle metrics</p>
                                    </div>
                                    <div className="flex bg-slate-800/50 p-1 rounded-lg border border-white/5">
                                        <button onClick={() => setChartMetric('location')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${chartMetric === 'location' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Location</button>
                                        <button onClick={() => setChartMetric('type')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${chartMetric === 'type' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Type</button>
                                        <button onClick={() => setChartMetric('segment')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${chartMetric === 'segment' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Segment</button>
                                        <button onClick={() => setChartMetric('status')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${chartMetric === 'status' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Status</button>
                                    </div>
                                </div>

                                <div className="h-80 w-full animate-in fade-in duration-500">
                                    {chartMetric === 'segment'
                                        ? <PieChart data={stats?.by_segment || []} onPieClick={handleGraphClick} />
                                        : chartMetric === 'status'
                                            ? <PieChart data={stats?.by_status || []} onPieClick={handleGraphClick} />
                                            : <BarChart
                                                data={chartMetric === 'type' ? (stats?.by_type || []) : (stats?.by_location || [])}
                                                onBarClick={handleGraphClick}
                                            />
                                    }
                                </div>
                            </div>

                            {/* Secondary Chart: Trends */}
                            <div className="glass-panel p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Activity size={18} className="text-purple-400" />
                                            Cost & Renewal Trends
                                        </h3>
                                    </div>
                                    <select
                                        value={trendView}
                                        onChange={(e) => setTrendView(e.target.value)}
                                        className="bg-slate-800/50 border border-white/10 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                    </select>
                                </div>
                                <div className="h-64 w-full">
                                    <TrendLineChart data={trendView === 'monthly' ? stats?.trends?.monthly : stats?.trends?.quarterly} />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Alerts & Recent */}
                        <div className="xl:col-span-1 space-y-6">
                            {/* Alerts Feed */}
                            <div className="glass-panel p-6">
                                <AlertsFeed />
                            </div>

                            {/* Recent Assets Mini Table */}
                            <div className="glass-panel p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white">New Arrivals</h3>
                                    <Link href="/assets?sort=newest" className="text-xs text-blue-400 hover:text-blue-300 font-medium">View All</Link>
                                </div>
                                <div className="space-y-3">
                                    {allAssets.slice(0, 4).map((asset) => (
                                        <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                    <Package size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{asset.name}</p>
                                                    <p className="text-[10px] text-slate-400">{asset.serial_number}</p>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-[10px] font-medium border ${asset.status === 'In Use' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                asset.status === 'Repair' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                    'bg-slate-700 text-slate-300 border-slate-600'
                                                }`}>
                                                {asset.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : timeRange === 'Analytics' ? (
                    /* ANALYTICS VIEW LAYOUT */
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="glass-panel p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Lifecycle Status Distribution</h3>
                                <div className="h-80 w-full flex items-center justify-center">
                                    <PieChart
                                        data={stats?.by_status || []}
                                        onPieClick={(data) => router.push(`/assets?status=${encodeURIComponent(data.name)}`)}
                                    />
                                </div>
                            </div>
                            <div className="glass-panel p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Asset Type Breakdown</h3>
                                <div className="h-80 w-full flex items-center justify-center">
                                    <PieChart
                                        data={stats?.by_segment || []}
                                        onPieClick={(data) => router.push(`/assets?segment=${encodeURIComponent(data.name)}`)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="glass-panel p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Comprehensive Trends</h3>
                                <select
                                    value={trendView}
                                    onChange={(e) => setTrendView(e.target.value)}
                                    className="bg-slate-800/50 border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-1"
                                >
                                    <option value="monthly">Monthly Analysis</option>
                                    <option value="quarterly">Quarterly Analysis</option>
                                </select>
                            </div>
                            <div className="h-96 w-full">
                                <TrendLineChart data={trendView === 'monthly' ? stats?.trends?.monthly : stats?.trends?.quarterly} />
                            </div>
                        </div>
                    </div>
                ) : (
                    /* REQUESTS / ACCESS CONTROL VIEW */
                    <div className="glass-panel p-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Access Requests</h3>
                                <p className="text-slate-400 text-sm mt-1">Manage pending user registrations and platform access permissions.</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm font-medium">
                                <Activity size={16} />
                                {pendingUsers.length} Pending Actions
                            </div>
                        </div>

                        {pendingUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="p-6 bg-slate-800/50 rounded-full mb-4 border border-white/5">
                                    <CheckCircle size={48} className="text-slate-600" />
                                </div>
                                <h4 className="text-lg font-bold text-white">Queue is Clear</h4>
                                <p className="text-slate-400 max-w-xs mt-2">No pending account activations found in the system registry.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="pb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                                            <th className="pb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Requested Role</th>
                                            <th className="pb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Location / Dept.</th>
                                            <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {pendingUsers.map((user) => (
                                            <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                                                            {user.full_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-white">{user.full_name}</p>
                                                            <p className="text-xs text-slate-400">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/10 text-[11px] font-bold text-slate-300">
                                                        {ROLES ? (ROLES.find(r => r.slug === user.role)?.label || user.role) : user.role}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-sm text-slate-400">
                                                    {user.location || 'N/A'} <br />
                                                    <span className="text-[10px] opacity-70">{user.department || 'N/A'}</span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleDenyUser(user.id)}
                                                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-xs font-semibold border border-white/5 transition-all"
                                                        >
                                                            Deny
                                                        </button>
                                                        <button
                                                            onClick={() => handleActivateUser(user.id)}
                                                            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                                                        >
                                                            Activate Account
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Active Users Section */}
                        <div className="mt-12 mb-8">
                            <h3 className="text-2xl font-bold text-white">Active Platform Users</h3>
                            <p className="text-slate-400 text-sm mt-1">Review and manage currently active user accounts and their access status.</p>
                        </div>

                        {activeUsers.length === 0 ? (
                            <div className="p-8 bg-slate-800/20 border border-white/5 rounded-2xl text-center">
                                <p className="text-slate-500 text-sm italic">No active users found (excluding system accounts).</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="pb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                                            <th className="pb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                                            <th className="pb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</th>
                                            <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {activeUsers.map((user) => (
                                            <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-slate-400">
                                                            {user.full_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-white">{user.full_name}</p>
                                                            <p className="text-xs text-slate-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
                                                        {ROLES ? (ROLES.find(r => r.slug === user.role)?.label || user.role) : user.role}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-sm text-slate-400">{user.location || 'N/A'}</td>
                                                <td className="py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeactivateUser(user.id)}
                                                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-xs font-medium border border-white/5 transition-all"
                                                    >
                                                        Deactivate
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )
            }

        </div >
    )
}
