import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import Barcode from 'react-barcode'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ArrowLeft, User, MapPin, Calendar, Activity, Server, Shield, QrCode, ScanBarcode, AlertCircle, Download } from 'lucide-react'

import { initialMockAssets } from '@/data/mockAssets';

export default function AssetDetail() {
    const router = useRouter()
    const { id } = router.query
    const [asset, setAsset] = useState(null)
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [showQR, setShowQR] = useState(false)
    const [showBarcode, setShowBarcode] = useState(false)



    useEffect(() => {
        if (!id) return
        const fetchAsset = async () => {
            try {
                // Try API first (mock call) - removed for frontend-only requirement
                // const [assetRes, eventsRes] = await Promise.all([ ... ])
                throw new Error("Use local data")
            } catch (error) {
                // Load from localStorage + Initial
                const savedAssets = JSON.parse(localStorage.getItem('assets') || '[]');

                // Merge initial if local is empty or incomplete (simple check)
                let allAssets = savedAssets.length > 0 ? savedAssets : initialMockAssets;

                // Lookup by ID
                const foundAsset = allAssets.find(a => a.id == id); // Loose equality for string/number match

                if (foundAsset) {
                    setAsset(foundAsset);

                    // Mock events based on found asset
                    const mockEvents = [
                        { event: "Asset Deployed", description: "Asset assigned and deployed to end user", date: "2024-12-10", user: "System Admin", status: "completed" },
                        { event: "Warranty Registered", description: "3-year warranty registered with vendor", date: foundAsset.purchase_date || "2023-05-16", user: "Procurement Team", status: "completed" },
                        { event: "Initial Setup", description: "Device configured with security policies", date: foundAsset.purchase_date || "2023-05-15", user: "IT Support", status: "completed" },
                        { event: "Procurement Approved", description: "Purchase order approved", date: foundAsset.purchase_date || "2023-04-20", user: "Finance Manager", status: "completed" },
                    ]
                    setEvents(mockEvents)
                } else {
                    setAsset(null); // Asset not found
                }
            } finally {
                setLoading(false)
            }
        }
        fetchAsset()
    }, [id])

    if (loading) return <div className="p-8">Loading...</div>
    if (!asset) return <div className="p-8">Asset not found</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/assets" className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{asset.name}</h2>
                    <p className="text-slate-400 font-mono text-sm">{asset.serial_number}</p>
                </div>
                <div className="ml-auto">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ring-1 ring-inset ${asset.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' :
                        asset.status === 'In Stock' ? 'bg-blue-500/10 text-blue-400 ring-blue-500/20' :
                            'bg-slate-500/10 text-slate-400 ring-slate-500/20'
                        }`}>
                        {asset.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <Server className="mr-3 text-blue-400" size={20} />
                            Specifications
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Model</p>
                                <p className="font-medium text-slate-100">{asset.model}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Vendor</p>
                                <p className="font-medium text-slate-100 uppercase">{asset.name.split(' ')[0]}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Asset ID</p>
                                <p className="font-medium text-slate-100">{asset.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Type</p>
                                <p className="font-medium text-slate-100">{asset.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Processor</p>
                                <p className="font-medium text-slate-100">{asset.specifications?.Processor || (asset.segment === 'IT' ? 'Intel Core i7 vPro' : 'N/A')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">RAM</p>
                                <p className="font-medium text-slate-100">{asset.specifications?.RAM || (asset.segment === 'IT' ? '32GB DDR4' : 'N/A')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Storage</p>
                                <p className="font-medium text-slate-100">{asset.specifications?.Storage || (asset.segment === 'IT' ? '1TB NVMe SSD' : 'N/A')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">OS</p>
                                <p className="font-medium text-slate-100">{asset.specifications?.OS || (asset.segment === 'IT' ? 'Windows 11 Ent' : 'N/A')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Condition</p>
                                <p className="font-medium text-emerald-400">Excellent</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 relative overflow-hidden">
                        {/* Background Animation for entire card */}
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>

                        <h3 className="text-xl font-bold text-white mb-8 flex items-center relative z-10">
                            <Activity className="mr-3 text-emerald-400" size={20} />
                            Asset Lifecycle Timeline
                        </h3>

                        {/* Dynamic Timeline Container */}
                        <div className="relative pl-8 pb-4 z-10">

                            {/* Animated Flow Line (Reversed: Bottom to Top) */}
                            <div className="absolute left-[9px] top-2 bottom-6 w-0.5 bg-slate-800 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-t from-emerald-500 via-blue-500 to-transparent animate-flow-up opacity-100"></div>
                            </div>

                            <style jsx>{`
                                @keyframes flow-up {
                                    0% { transform: translateY(200%); opacity: 0; }
                                    50% { opacity: 1; }
                                    100% { transform: translateY(-100%); opacity: 0; }
                                }
                                .animate-flow-up {
                                    animation: flow-up 3s linear infinite;
                                }
                            `}</style>

                            {events.map((event, index) => (
                                <div key={index} className="relative mb-10 last:mb-0 group">
                                    {/* Glowing Timeline Dot */}
                                    <div className={`absolute -left-[33px] top-1.5 w-5 h-5 rounded-full border-4 border-slate-950 transition-all duration-500 z-10 ${event.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110' :
                                        event.status === 'active' ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse' :
                                            'bg-slate-700'
                                        }`}></div>

                                    {/* Content Card with Glassmorphism */}
                                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors duration-300">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                            <h4 className="font-bold text-white text-base tracking-wide">{event.event}</h4>
                                            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 whitespace-nowrap shadow-sm">
                                                {event.date}
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-300 mb-3 leading-relaxed">{event.description}</p>

                                        {event.user && (
                                            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold shadow-md">
                                                    {event.user.charAt(0)}
                                                </div>
                                                <span className="text-xs text-indigo-300 font-medium tracking-wide">Action by {event.user}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {events.length === 0 && (
                                <p className="text-slate-500 italic">No history available for this asset.</p>
                            )}
                        </div>
                    </div>

                    {/* Renewal & Service Request Section - Conditions: Retired, Repair, Maintenance OR Warranty Expired */}
                    {['Retired', 'Repair', 'Maintenance'].includes(asset.status) || (asset.warranty_expiry && new Date(asset.warranty_expiry) <= new Date()) ? (
                        <div className="glass-panel p-6 border-l-4 border-l-orange-500">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                                <AlertCircle className="mr-3 text-orange-400" size={24} />
                                Renewal & Service Request
                            </h3>
                            <p className="text-slate-400 text-sm mb-6">
                                This asset is flagged for attention ({asset.status === 'Active' ? 'Warranty Expired' : asset.status}).
                                Submit a request to the relevant department.
                            </p>

                            {asset.renewal_status ? (
                                <div className="p-4 bg-slate-800/50 rounded-lg border border-white/10">
                                    <p className="text-sm text-slate-400">Current Status</p>
                                    <p className="text-lg font-bold text-blue-400 mt-1">{asset.renewal_status.replace(/_/g, ' ')}</p>
                                    {asset.renewal_reason && (
                                        <div className="mt-3 pt-3 border-t border-white/5">
                                            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Reason</p>
                                            <p className="text-slate-300 italic">"{asset.renewal_reason}"</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <form className="space-y-4" onSubmit={async (e) => {
                                    e.preventDefault()
                                    const formData = new FormData(e.target)
                                    const reason = formData.get('reason')
                                    const urgency = formData.get('urgency')
                                    const cost = formData.get('cost')

                                    try {
                                        await axios.put(`http://localhost:8000/assets/${asset.id}`, {
                                            // Initialize workflow
                                            renewal_status: 'Requested',
                                            renewal_reason: reason,
                                            renewal_urgency: urgency,
                                            renewal_cost: cost ? parseFloat(cost) : 0
                                        })
                                        alert('Request submitted successfully!')
                                        router.reload()
                                    } catch (err) {
                                        alert('Failed to submit request')
                                    }
                                }}>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Reason for Request</label>
                                        <textarea
                                            name="reason"
                                            required
                                            className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-slate-200 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                            rows="3"
                                            placeholder="e.g., Device failing in field, license expired..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Urgency</label>
                                            <select name="urgency" className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-2.5 text-slate-200 text-sm outline-none">
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Est. Cost ($)</label>
                                            <input
                                                type="number"
                                                name="cost"
                                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-2.5 text-slate-200 text-sm outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full btn btn-primary py-2.5 mt-2">
                                        Send Request to Department
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="glass-panel p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <User className="mr-3 text-purple-400" size={20} />
                            Ownership
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Assigned To</p>
                                <p className="font-medium text-slate-100">{asset.assigned_to || "Unassigned"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Location</p>
                                <div className="flex items-center text-slate-100">
                                    <MapPin size={16} className="mr-2 text-purple-400" />
                                    <p className="font-medium">{asset.location || "Unknown"}</p>
                                </div>
                            </div>
                            <Link href={`/assets/assign?id=${asset.id}`} className="block w-full text-center py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all backdrop-blur-sm">
                                Change Assignment
                            </Link>
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <Shield className="mr-3 text-orange-400" size={20} />
                            Warranty
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Purchase Date</p>
                                <div className="flex items-center text-slate-100">
                                    <Calendar size={16} className="mr-2 text-orange-400" />
                                    <p className="font-medium">{asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Expires</p>
                                <div className="flex items-center text-slate-100">
                                    <Calendar size={16} className="mr-2 text-orange-400" />
                                    <p className="font-medium">{asset.warranty_expiry ? new Date(asset.warranty_expiry).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <QrCode className="mr-3 text-pink-400" size={20} />
                            Digital Identity
                        </h3>
                        <div className="space-y-4">
                            {/* PDF Export Button */}
                            <button
                                onClick={async () => {
                                    const element = document.getElementById('digital-identity-card');
                                    if (!element) return;

                                    // Temporarily show both codes for capture
                                    const originalShowQR = showQR;
                                    const originalShowBarcode = showBarcode;
                                    setShowQR(true);
                                    setShowBarcode(true);

                                    // Wait for render
                                    setTimeout(async () => {
                                        try {
                                            const canvas = await html2canvas(element, { scale: 2 });
                                            const imgData = canvas.toDataURL('image/png');
                                            const pdf = new jsPDF();
                                            const imgProps = pdf.getImageProperties(imgData);
                                            const pdfWidth = pdf.internal.pageSize.getWidth();
                                            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                                            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                                            pdf.save(`Asset-${asset.serial_number}.pdf`);
                                        } catch (err) {
                                            console.error("Export failed", err);
                                            alert("Failed to export PDF");
                                        } finally {
                                            setShowQR(originalShowQR);
                                            setShowBarcode(originalShowBarcode);
                                        }
                                    }, 500);
                                }}
                                className="w-full py-2 px-4 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all flex items-center justify-center font-medium mb-4"
                            >
                                <Download size={18} className="mr-2" />
                                Export to PDF
                            </button>

                            <div id="digital-identity-card" className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/5">
                                <h4 className="text-sm font-semibold text-slate-400 text-center mb-2">Digital Asset Card</h4>
                                <div className="text-center mb-4">
                                    <p className="text-lg font-bold text-white">{asset.name}</p>
                                    <p className="font-mono text-sm text-slate-400">{asset.serial_number}</p>
                                </div>

                                {showQR && (
                                    <div className="bg-white p-4 rounded-lg flex justify-center animate-in fade-in zoom-in duration-300">
                                        <QRCode
                                            value={`ASSET IDENTITY CARD
-------------------
Name: ${asset.name}
Model: ${asset.model}
S/N: ${asset.serial_number}
ID: ${asset.id}
Type: ${asset.type}
Status: ${asset.status}
Loc: ${asset.location}
User: ${asset.assigned_to || 'Unassigned'}
Dept: ${asset.department || 'IT Operations'}
Purchased: ${asset.purchase_date}
Warranty: ${asset.warranty_expiry || 'N/A'}
Specs: ${asset.specifications?.Processor || 'Standard'} / ${asset.specifications?.RAM || 'Standard'}
-------------------
Property of AssetMgr`}
                                            size={180}
                                        />
                                    </div>
                                )}

                                {showBarcode && (
                                    <div className="bg-white p-4 rounded-lg flex justify-center overflow-hidden animate-in fade-in zoom-in duration-300">
                                        <Barcode
                                            value={asset.serial_number}
                                            width={1.5}
                                            height={50}
                                            fontSize={14}
                                            background="#ffffff"
                                            lineColor="#000000"
                                        />
                                    </div>
                                )}

                                {/* Controls for toggling view (hidden during export if we want, but keeping buttons separate) */}
                            </div>

                            <button
                                onClick={() => setShowQR(!showQR)}
                                className="w-full py-2 px-4 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 transition-all flex items-center justify-center font-medium"
                            >
                                <QrCode size={18} className="mr-2" />
                                {showQR ? 'Hide QR Code' : 'Show Asset QR'}
                            </button>

                            <button
                                onClick={() => setShowBarcode(!showBarcode)}
                                className="w-full py-2 px-4 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 transition-all flex items-center justify-center font-medium"
                            >
                                <ScanBarcode size={18} className="mr-2" />
                                {showBarcode ? 'Hide Barcode' : 'Show Barcode'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
