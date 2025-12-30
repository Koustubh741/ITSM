import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trash2, ShieldAlert, HardDrive, CheckCircle, AlertTriangle, FileText, X, ShieldCheck, User } from 'lucide-react'

// --- Helper: Action Modal ---
const ActionModal = ({ isOpen, onClose, title, data, onConfirm, actionLabel, stepType }) => {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className={`relative rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border ${stepType === 'dispose' ? 'bg-[#1a0505] border-red-900/50' : 'bg-[#0f172a] border-white/10'}`}>

                {/* Header */}
                <div className={`px-6 py-4 border-b flex justify-between items-center ${stepType === 'dispose' ? 'bg-red-900/20 border-red-900/30' : 'bg-slate-900/50 border-white/10'}`}>
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${stepType === 'dispose' ? 'text-red-400' : 'text-white'}`}>
                        {stepType === 'dispose' && <AlertTriangle size={20} />}
                        {title}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Asset Confirmation */}
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Asset Target</p>
                        <h4 className="text-white font-medium text-lg">{data.name}</h4>
                        <p className="text-slate-400 text-sm font-mono">{data.serial_number}</p>
                    </div>

                    {/* Step Specific Details */}
                    {stepType === 'validate' && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Validation Summary</h4>
                            <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                <span className="text-slate-400">Last Assigned User</span>
                                <span className="text-slate-200">{data.last_user || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                <span className="text-slate-400">Last Activity Date</span>
                                <span className="text-slate-200">{data.last_active || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                <span className="text-slate-400">Open Tickets</span>
                                <span className="text-emerald-400 font-medium">None (Cleared)</span>
                            </div>
                        </div>
                    )}

                    {stepType === 'wipe' && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-yellow-500 uppercase tracking-wider">Wipe Protocol</h4>
                            <div className="bg-yellow-500/10 rounded-lg p-3 text-sm text-yellow-200 border border-yellow-500/20">
                                This action creates a permanent data destruction record. Ensure the device is connected.
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                <span className="text-slate-400">Wipe Method</span>
                                <span className="text-slate-200 font-mono">DoD 5220.22-M (3 Pass)</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                <span className="text-slate-400">Executor</span>
                                <span className="text-slate-200">System Admin</span>
                            </div>
                        </div>
                    )}

                    {stepType === 'dispose' && (
                        <div className="space-y-4">
                            <div className="bg-red-500/10 rounded-lg p-4 text-sm text-red-200 border border-red-500/20 flex items-start gap-3">
                                <ShieldAlert size={20} className="shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold mb-1">Irreversible Action</p>
                                    This asset will be permanently marked as <strong>Retired</strong>. It will be removed from active inventory counts.
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-400 justify-center">
                                <input type="checkbox" id="confirm" className="rounded border-slate-600 bg-slate-800" />
                                <label htmlFor="confirm">I confirm physical disposal is complete</label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-900/50 border-t border-white/10 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
                    <button
                        onClick={() => onConfirm(data.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg transition-all flex items-center gap-2
                            ${stepType === 'validate' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' :
                                stepType === 'wipe' ? 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-500/20 text-black' :
                                    stepType === 'dispose' ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' : 'bg-slate-700'}
                        `}
                    >
                        {stepType === 'validate' && <CheckCircle size={16} />}
                        {stepType === 'wipe' && <HardDrive size={16} />}
                        {stepType === 'dispose' && <Trash2 size={16} />}
                        {actionLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Disposal() {
    const [loading, setLoading] = useState(true)

    // Strict Mock Data for Disposal Queue
    const [assets, setAssets] = useState([
        { id: 91, name: 'Old Server XYZ', serial_number: 'SRV-OLD-001', disposal_status: 'Pending_Validation', type: 'Server', last_user: 'IT Ops', last_active: '2023-11-15' },
        { id: 92, name: 'Retired Laptop', serial_number: 'LAP-RET-442', disposal_status: 'Ready_For_Wipe', type: 'Laptop', last_user: 'Sales Intern', last_active: '2024-01-10' },
        { id: 93, name: 'Legacy Desktop', serial_number: 'DSK-LEG-789', disposal_status: 'Wiped', type: 'Desktop', last_user: 'Reception', last_active: '2023-12-20' },
    ])

    const [modalConfig, setModalConfig] = useState(null)

    useEffect(() => {
        setTimeout(() => setLoading(false), 500)
    }, [])

    const openActionModal = (asset, action) => {
        let config = { isOpen: true, data: asset };

        if (action === 'validate') {
            config.title = "Validate Asset for Disposal";
            config.actionLabel = "Confirm Validation";
            config.stepType = 'validate';
            config.onConfirm = handleValidate;
        } else if (action === 'wipe') {
            config.title = "Confirm Secure Data Wipe";
            config.actionLabel = "Execute Wipe";
            config.stepType = 'wipe';
            config.onConfirm = handleWipe;
        } else if (action === 'dispose') {
            config.title = "Finalize Asset Disposal";
            config.actionLabel = "Retire Asset";
            config.stepType = 'dispose';
            config.onConfirm = handleDispose;
        }

        setModalConfig(config);
    }

    const updateStatus = (id, newStatus) => {
        setAssets(prev => prev.map(a => a.id === id ? { ...a, disposal_status: newStatus } : a));
        setModalConfig(null);
    }

    const handleValidate = (id) => updateStatus(id, 'Ready_For_Wipe');

    const handleWipe = (id) => updateStatus(id, 'Wiped');

    const handleDispose = (id) => {
        const asset = assets.find(a => a.id === id);
        if (!asset) return;

        // 1. Update Mock State
        updateStatus(id, 'Disposed');

        // 2. Persist 'Retired' status to LocalStorage (Global Impact)
        const savedAssets = localStorage.getItem('assets');
        const currentAssets = savedAssets ? JSON.parse(savedAssets) : [];

        // Remove old instance if exists, add new Retired record
        const filteredAssets = currentAssets.filter(a => a.id !== id);

        const retiredAsset = {
            id: id,
            name: asset.name,
            type: asset.type,
            status: 'Retired', // CRITICAL: This hides it from active views
            assigned_to: null,
            serial_number: asset.serial_number,
            location: 'Disposal Archive',
            cost: 0,
            purchase_date: asset.last_active
        };

        const updatedAssets = [...filteredAssets, retiredAsset];
        localStorage.setItem('assets', JSON.stringify(updatedAssets));
    };


    if (loading) return <div className="p-8 text-white">Loading Disposal Queue...</div>

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Disposal & Retirement</h2>
                    <p className="text-slate-400 mt-1">End-of-life Governance: Validation ➝ Wipe ➝ Dispose</p>
                </div>
                <Link href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center transition-colors border border-white/5">
                    <ArrowLeft size={16} className="mr-2" /> Dashboard
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map(asset => (
                    <div key={asset.id} className={`glass-card p-6 border-l-4 transition-all duration-300 ${asset.disposal_status === 'Disposed' ? 'border-l-slate-600 opacity-60' :
                            asset.disposal_status === 'Wiped' ? 'border-l-red-500' :
                                asset.disposal_status === 'Ready_For_Wipe' ? 'border-l-yellow-500' : 'border-l-blue-500'
                        }`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-white text-lg">{asset.name}</h3>
                                <p className="text-slate-400 text-sm font-mono">{asset.serial_number}</p>
                            </div>
                            <div className={`p-2 rounded-lg ${asset.disposal_status === 'Disposed' ? 'bg-slate-800 text-slate-500' : 'bg-white/5 text-white'
                                }`}>
                                {asset.disposal_status === 'Disposed' ? <CheckCircle size={20} /> : <Trash2 size={20} />}
                            </div>
                        </div>

                        <div className="mb-6 bg-black/20 rounded-lg p-3">
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-slate-500 text-xs uppercase font-bold">Status</span>
                                <span className={`font-mono font-medium text-xs px-2 py-0.5 rounded ${asset.disposal_status === 'Disposed' ? 'bg-slate-700 text-slate-400' : 'bg-white/10 text-white'
                                    }`}>
                                    {asset.disposal_status.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {asset.disposal_status === 'Pending_Validation' && (
                                <button
                                    onClick={() => openActionModal(asset, 'validate')}
                                    className="btn w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Validate & Lock
                                </button>
                            )}

                            {asset.disposal_status === 'Ready_For_Wipe' && (
                                <button
                                    onClick={() => openActionModal(asset, 'wipe')}
                                    className="btn w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 flex justify-center items-center py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <HardDrive size={16} className="mr-2" /> Execute Data Wipe
                                </button>
                            )}

                            {asset.disposal_status === 'Wiped' && (
                                <button
                                    onClick={() => openActionModal(asset, 'dispose')}
                                    className="btn w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex justify-center items-center py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Trash2 size={16} className="mr-2" /> Finalize Disposal
                                </button>
                            )}

                            {asset.disposal_status === 'Disposed' && (
                                <div className="text-center py-2 text-slate-500 bg-white/5 rounded-lg text-sm flex items-center justify-center border border-white/5 cursor-not-allowed">
                                    <CheckCircle size={14} className="mr-2" /> Archived & Locked
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <ActionModal
                isOpen={modalConfig?.isOpen}
                onClose={() => setModalConfig(null)}
                {...modalConfig}
            />
        </div>
    )
}
