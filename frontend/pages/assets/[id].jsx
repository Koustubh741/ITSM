import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import Barcode from 'react-barcode'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ArrowLeft, User, MapPin, Calendar, Activity, Server, Shield, QrCode, ScanBarcode, AlertCircle, Download } from 'lucide-react'

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
                const [assetRes, eventsRes] = await Promise.all([
                    axios.get(`http://localhost:8000/assets/${id}`),
                    axios.get(`http://localhost:8000/assets/${id}/events`)
                ])
                setAsset(assetRes.data)
                setEvents(eventsRes.data)
            } catch (error) {
                console.error("Failed to fetch asset", error)
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
                                <p className="font-medium text-slate-100">{asset.vendor}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Type</p>
                                <p className="font-medium text-slate-100">{asset.type}</p>
                            </div>
                            {asset.specifications && Object.entries(asset.specifications).map(([key, value]) => (
                                <div key={key}>
                                    <p className="text-sm text-slate-400 mb-1 capitalize">{key}</p>
                                    <p className="font-medium text-slate-100">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <Activity className="mr-3 text-emerald-400" size={20} />
                            Asset Lifecycle Timeline
                        </h3>
                        <div className="space-y-0 relative border-l-2 border-slate-700/50 ml-3 my-2 pl-8 pb-2">
                            {events.map((event, index) => (
                                <div key={index} className="relative mb-8 last:mb-0 group">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[41px] top-1.5 w-5 h-5 rounded-full border-4 border-slate-900 transition-all duration-300 ${event.status === 'completed' ? 'bg-emerald-500 ring-4 ring-emerald-500/20 group-hover:ring-emerald-500/40' :
                                        event.status === 'active' ? 'bg-blue-500 ring-4 ring-blue-500/20 group-hover:ring-blue-500/40' :
                                            'bg-slate-600'
                                        }`}></div>

                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                                        <h4 className="font-bold text-slate-100 text-base">{event.event}</h4>
                                        <span className="text-xs font-mono text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-white/5 whitespace-nowrap">
                                            {event.date}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-400 mb-2">{event.description}</p>

                                    {event.user && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-300 font-bold">
                                                {event.user.charAt(0)}
                                            </div>
                                            <span className="text-xs text-slate-500 font-medium">By {event.user}</span>
                                        </div>
                                    )}
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
                                            value={`
Asset: ${asset.name}
S/N: ${asset.serial_number}
Model: ${asset.model}
Assigned: ${asset.assigned_to || 'N/A'}
                                            `.trim()}
                                            size={150}
                                        />
                                    </div>
                                )}

                                {showBarcode && (
                                    <div className="bg-white p-4 rounded-lg flex justify-center overflow-hidden animate-in fade-in zoom-in duration-300">
                                        <Barcode
                                            value={asset.serial_number}
                                            width={1.5}
                                            height={40}
                                            fontSize={12}
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
                                {showQR ? 'Hide QR Code' : 'Show QR Code'}
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
