import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Package, CheckCircle, AlertTriangle, Clock, Activity, Download, Plus, Layers, LayoutGrid, Calendar, ArrowUpRight, DollarSign, TrendingDown, ShoppingBag } from 'lucide-react'
import AssetTable from '@/components/AssetTable'
import BarChart from '@/components/BarChart'
import PieChart from '@/components/PieChart'
import TrendLineChart from '@/components/TrendLineChart'
import AlertsFeed from '@/components/AlertsFeed'
import WorkflowVisualizer from '@/components/WorkflowVisualizer'

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [recentAssets, setRecentAssets] = useState([])
    const [allAssets, setAllAssets] = useState([])
    const [loading, setLoading] = useState(true)
    const [chartMetric, setChartMetric] = useState('location')
    const [trendView, setTrendView] = useState('monthly')

    // Toggle States
    const [timeRange, setTimeRange] = useState('Overview') // Overview, Analytics
    const [viewMode, setViewMode] = useState('Grid') // Grid, List (Visual toggle mostly)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, assetsRes] = await Promise.all([
                    axios.get('http://localhost:8000/assets/stats'),
                    axios.get('http://localhost:8000/assets/')
                ])
                setStats(statsRes.data)
                setAllAssets(assetsRes.data)
                setRecentAssets(assetsRes.data.slice(0, 5))
            } catch (error) {
                console.error("Failed to fetch dashboard data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleExport = () => {
        if (!allAssets || allAssets.length === 0) return
        const headers = ["Asset Name", "Segment", "Type", "Model", "Serial Number", "Status", "Location", "Assigned To", "Assigned By", "Purchase Date"]
        const csvContent = [
            headers.join(','),
            ...allAssets.map(asset => [
                `"${asset.name}"`,
                `"${asset.segment}"`,
                `"${asset.type}"`,
                `"${asset.model}"`,
                `"${asset.serial_number}"`,
                `"${asset.status}"`,
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
                        {['Overview', 'Analytics'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setTimeRange(mode)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${timeRange === mode
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {mode === 'Overview' ? <LayoutGrid size={16} /> : <Activity size={16} />}
                                {mode}
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
                                <span>Add Asset</span>
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
                <Link href="/assets?status=Active">
                    <StatCard
                        title="Active Usage"
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

                {/* Financial Cards (Mock Data) */}
                <Link href="/assets">
                    <StatCard
                        title="Asset Value"
                        value="$1,245,000"
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
                        value="$850,400"
                        subtext="After depreciation"
                        icon={TrendingDown}
                        colorClass="text-purple-400"
                        gradient="bg-gradient-to-br from-purple-500 to-pink-500"
                    />
                </Link>
                <Link href="/procurement">
                    <StatCard
                        title="YTD Purchases"
                        value="$125,000"
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
                                        ? <PieChart data={stats?.by_segment || []} />
                                        : chartMetric === 'status'
                                            ? <PieChart data={stats?.by_status || []} />
                                            : <BarChart data={chartMetric === 'type' ? (stats?.by_type || []) : (stats?.by_location || [])} />
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
                                    {recentAssets.slice(0, 4).map((asset) => (
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
                                            <div className={`px-2 py-1 rounded text-[10px] font-medium border ${asset.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
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
                ) : (
                    /* ANALYTICS VIEW LAYOUT */
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="glass-panel p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Lifecycle Status Distribution</h3>
                                <div className="h-80 w-full flex items-center justify-center">
                                    <PieChart data={stats?.by_status || []} />
                                </div>
                            </div>
                            <div className="glass-panel p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Asset Type Breakdown</h3>
                                <div className="h-80 w-full flex items-center justify-center">
                                    <PieChart data={stats?.by_segment || []} />
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
                )
            }

        </div >
    )
}
