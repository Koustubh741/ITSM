import { useState } from 'react'
import { useRouter } from 'next/router'
import { ArrowLeft, Save, Download } from 'lucide-react'
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
        // Mock submission - no API call
        alert(`Asset "${formData.name}" created successfully! (Mock Mode - No Database)`)
        router.push('/assets')
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <Link href="/assets" className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h2 className="text-3xl font-bold text-white tracking-tight">Add New Asset</h2>
            </div>

            {/* Smart Import Section - Enabled */}
            <div className="glass-panel p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 bg-blue-500/10 rounded-bl-full blur-xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                                    <Save size={18} className="text-white" />
                                </span>
                                Smart Import (CSV / Excel)
                            </h3>
                            <p className="text-slate-400 text-sm mt-1 max-w-xl">
                                Upload a CSV or Excel file to bulk import assets. New assets will be added to your inventory instantly.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <a
                                href="/sample_assets.csv"
                                download="sample_assets.csv"
                                className="btn bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white flex items-center gap-2 text-xs"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const csvContent = "Asset Name,Segment,Type,Location,Status,Cost\nDell XPS 13,IT,Laptop,Mumbai Office,Active,85000\nErgo Chair,NON-IT,Chair,Delhi Office,Active,12000";
                                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                    const link = document.createElement("a");
                                    const url = URL.createObjectURL(blob);
                                    link.setAttribute("href", url);
                                    link.setAttribute("download", "sample_template.csv");
                                    link.style.visibility = 'hidden';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                            >
                                <Download size={14} /> Download Template
                            </a>
                            <label className="btn btn-primary flex items-center gap-2 cursor-pointer">
                                <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        const text = event.target.result;
                                        // Simple CSV Parse
                                        const rows = text.split('\n').filter(r => r.trim() !== '');
                                        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());

                                        const newAssets = rows.slice(1).map((row, index) => {
                                            const cols = row.split(',').map(c => c.trim());
                                            const asset = {
                                                id: Date.now() + index, // Generate unique ID
                                                name: cols[0] || 'Unknown Asset',
                                                segment: cols[1] || 'IT',
                                                type: cols[2] || 'Unspecified',
                                                location: cols[3] || 'Warehouse',
                                                status: cols[4] || 'In Stock',
                                                cost: parseFloat(cols[5]) || 0,
                                                purchase_date: new Date().toISOString().split('T')[0],
                                                assigned_to: 'Unassigned',
                                                assigned_by: 'Import'
                                            };
                                            return asset;
                                        });

                                        // Merge with existing
                                        const existing = JSON.parse(localStorage.getItem('assets') || '[]');
                                        const merged = [...existing, ...newAssets];
                                        localStorage.setItem('assets', JSON.stringify(merged));

                                        alert(`Successfully imported ${newAssets.length} assets!`);
                                        router.push('/assets');
                                    };
                                    reader.readAsText(file);
                                }} />
                                <span>Select File</span>
                            </label>
                        </div>
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
