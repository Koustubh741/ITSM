import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function AddAsset() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        segment: 'IT',
        type: 'Laptop',
        model: '',
        vendor: '',
        serial_number: '',
        status: 'In Stock',
        location: '',
        purchase_date: '',
        warranty_expiry: '',
        specifications: { cpu: '', ram: '', storage: '' }
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name.startsWith('spec_')) {
            const specField = name.replace('spec_', '')
            setFormData(prev => ({
                ...prev,
                specifications: { ...prev.specifications, [specField]: value }
            }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            // Format dates to YYYY-MM-DD or null if empty
            const payload = {
                ...formData,
                purchase_date: formData.purchase_date || null,
                warranty_expiry: formData.warranty_expiry || null
            }
            await axios.post('http://localhost:8000/assets/', payload)
            router.push('/assets')
        } catch (error) {
            console.error("Failed to create asset", error)
            alert("Failed to create asset. Check console.")
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <Link href="/assets" className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h2 className="text-3xl font-bold text-white tracking-tight">Add New Asset</h2>
            </div>

            {/* Smart Import Section */}
            <div className="glass-panel p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 bg-blue-500/10 rounded-bl-full blur-xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                                    <Save size={18} className="text-white" />
                                </span>
                                Smart Import
                            </h3>
                            <p className="text-slate-400 text-sm mt-1 max-w-xl">
                                Upload a CSV or Excel file. The system will automatically detect if it's an
                                <span className="text-emerald-400 font-medium mx-1">Existing Asset</span> or a
                                <span className="text-orange-400 font-medium mx-1">Procurement Request</span> and route the data accordingly.
                            </p>
                        </div>
                        <label className="btn bg-white/10 hover:bg-white/20 text-white border border-white/10 flex items-center gap-2 cursor-pointer transition-all">
                            <input
                                type="file"
                                accept=".csv, .xlsx, .xls"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    const formData = new FormData();
                                    formData.append('file', file);

                                    try {
                                        const res = await axios.post('http://localhost:8000/upload/smart', formData, {
                                            headers: { 'Content-Type': 'multipart/form-data' }
                                        });
                                        alert(`Processed Successfully!\nAssets Created: ${res.data.assets_created}\nRequests Created: ${res.data.procurement_requests_created}\nErrors: ${res.data.errors.length}`);
                                        if (res.data.assets_created > 0 || res.data.procurement_requests_created > 0) {
                                            router.push('/assets');
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert("Upload Failed: " + (err.response?.data?.detail || err.message));
                                    }
                                }}
                            />
                            <span>Select File</span>
                        </label>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 flex items-center">
                            <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                            Basic Information
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Asset Name</label>
                            <input required name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="e.g. MacBook Pro 16" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Segment</label>
                            <select name="segment" value={formData.segment} onChange={handleChange} className="input-field bg-slate-900/50">
                                <option className="bg-slate-900">IT</option>
                                <option className="bg-slate-900">NON-IT</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Type</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="input-field bg-slate-900/50">
                                    <option className="bg-slate-900">Laptop</option>
                                    <option className="bg-slate-900">Desktop</option>
                                    <option className="bg-slate-900">Server</option>
                                    <option className="bg-slate-900">Monitor</option>
                                    <option className="bg-slate-900">Mobile</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="input-field bg-slate-900/50">
                                    <option className="bg-slate-900">Active</option>
                                    <option className="bg-slate-900">In Stock</option>
                                    <option className="bg-slate-900">Repair</option>
                                    <option className="bg-slate-900">Retired</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Vendor</label>
                            <input required name="vendor" value={formData.vendor} onChange={handleChange} className="input-field" placeholder="e.g. Apple, Dell" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Model</label>
                            <input required name="model" value={formData.model} onChange={handleChange} className="input-field" placeholder="e.g. M3 Max" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Serial Number</label>
                            <input required name="serial_number" value={formData.serial_number} onChange={handleChange} className="input-field" />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 flex items-center">
                            <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
                            Details & Specs
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
                            <input name="location" value={formData.location} onChange={handleChange} className="input-field" placeholder="e.g. New York HQ" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Purchase Date</label>
                                <input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Warranty Expiry</label>
                                <input type="date" name="warranty_expiry" value={formData.warranty_expiry} onChange={handleChange} className="input-field" />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-medium text-slate-400 mb-3">Specifications</label>
                            <div className="grid grid-cols-3 gap-3">
                                <input name="spec_cpu" value={formData.specifications.cpu} onChange={handleChange} className="input-field text-sm" placeholder="CPU" />
                                <input name="spec_ram" value={formData.specifications.ram} onChange={handleChange} className="input-field text-sm" placeholder="RAM" />
                                <input name="spec_storage" value={formData.specifications.storage} onChange={handleChange} className="input-field text-sm" placeholder="Storage" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-white/10">
                    <button type="submit" className="btn btn-primary flex items-center space-x-2 px-8">
                        <Save size={20} />
                        <span>Save Asset</span>
                    </button>
                </div>
            </form>
        </div>
    )
}
