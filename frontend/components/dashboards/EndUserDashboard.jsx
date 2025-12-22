
import { useState } from 'react';
import { Laptop, Ticket, RefreshCw, User, Briefcase, MapPin, Calendar, Building2, Cpu, X, CheckCircle, AlertCircle, Settings, Sparkles, ChevronUp } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';

export default function EndUserDashboard() {
    const { currentRole, setCurrentRole, ROLES, logout } = useRole();
    const [activeModal, setActiveModal] = useState(null); // 'asset' | 'ticket' | 'profile' | null
    const [showSuccess, setShowSuccess] = useState(null); // 'asset-success' | 'ticket-success' | null

    const handleSubmit = (e, type) => {
        e.preventDefault();
        setActiveModal(null);
        setShowSuccess(type === 'asset' ? 'asset-success' : 'ticket-success');
        setTimeout(() => setShowSuccess(null), 3000);
    };

    const userProfile = {
        name: "Alex Johnson",
        role: "Senior Software Engineer",
        empId: "EMP-2024-8821",
        company: "Acme Corp Global",
        doj: "15th Aug, 2022",
        location: "New York HQ, Floor 4",
        email: "alex.j@acmecorp.com"
    };

    const assignedAssets = [
        {
            id: "AST-001",
            name: "MacBook Pro 16",
            type: "Laptop",
            active: true,
            assignedDate: "20th Aug, 2022",
            location: "New York HQ - Desk 4B",
            specs: {
                processor: "M3 Max Chip",
                ram: "36GB Unified Memory",
                storage: "1TB SSD",
                display: "16.2-inch Liquid Retina XDR"
            }
        },
        {
            id: "AST-104",
            name: "Dell UltraSharp 27",
            type: "Monitor",
            active: true,
            assignedDate: "22nd Aug, 2022",
            location: "New York HQ - Desk 4B",
            specs: {
                resolution: "4K UHD (3840 x 2160)",
                panel: "IPS Black Technology",
                ports: "USB-C Hub, HDMI, DP"
            }
        }
    ];

    return (
        <div className="space-y-6 relative">
            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right fade-in duration-300">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md text-emerald-400 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                        <CheckCircle size={24} />
                        <div>
                            <h4 className="font-bold text-sm">Success!</h4>
                            <p className="text-xs opacity-90">
                                {showSuccess === 'asset-success' ? 'Asset request submitted successfully.' : 'Support ticket raised successfully.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* User Profile Section */}
            <div className="glass-panel p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="flex flex-col md:flex-row gap-6 relative z-10">
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-3xl font-bold text-white">AJ</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">{userProfile.name}</h1>
                            <p className="text-blue-400 font-medium flex items-center gap-2">
                                <Briefcase size={16} /> {userProfile.role}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <p className="text-slate-400 text-xs uppercase mb-1 flex items-center gap-1.5"><Building2 size={12} /> Company</p>
                                <p className="text-white font-semibold text-sm">{userProfile.company}</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <p className="text-slate-400 text-xs uppercase mb-1 flex items-center gap-1.5"><Ticket size={12} /> Employee ID</p>
                                <p className="text-white font-semibold text-sm">{userProfile.empId}</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <p className="text-slate-400 text-xs uppercase mb-1 flex items-center gap-1.5"><Calendar size={12} /> Date of Joining</p>
                                <p className="text-white font-semibold text-sm">{userProfile.doj}</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <p className="text-slate-400 text-xs uppercase mb-1 flex items-center gap-1.5"><MapPin size={12} /> Work Location</p>
                                <p className="text-white font-semibold text-sm">{userProfile.location}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 justify-center border-l border-white/10 pl-6 h-full my-auto">
                        <button
                            onClick={() => setActiveModal('profile')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                        >
                            <User size={18} /> My Profile
                        </button>
                        <button
                            onClick={() => setActiveModal('asset')}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                        >
                            <Laptop size={18} /> Request Asset
                        </button>
                        <button
                            onClick={() => setActiveModal('ticket')}
                            className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold border border-white/10 transition-all active:scale-95"
                        >
                            <Ticket size={18} /> Get Support
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assigned Assets Detail */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Laptop className="text-blue-400" size={20} /> My Assigned Assets
                    </h3>

                    {assignedAssets.map((asset) => (
                        <div key={asset.id} className="glass-panel p-0 overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 border border-white/10">
                                            {asset.type === 'Laptop' ? <Laptop size={24} /> : <RefreshCw size={24} />}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white">{asset.name}</h4>
                                            <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                                                <span className="bg-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300">{asset.id}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                                                <span>Assigned: {asset.assignedDate}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
                                        In Use
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-900/40">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-2 font-semibold">Asset Specifications</p>
                                        <ul className="space-y-2">
                                            {Object.entries(asset.specs).map(([key, value]) => (
                                                <li key={key} className="flex items-start gap-2 text-sm text-slate-300">
                                                    <Cpu size={14} className="mt-1 text-slate-500 shrink-0" />
                                                    <span>
                                                        <span className="capitalize text-slate-400">{key}:</span> {value}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-2 font-semibold">Location & Status</p>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded-lg">
                                                <MapPin size={14} className="text-amber-400" />
                                                {asset.location}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded-lg">
                                                <Calendar size={14} className="text-blue-400" />
                                                Next Audit: 15th Sept, 2024
                                            </div>
                                        </div>

                                        <div className="mt-4 flex gap-3">
                                            <button
                                                onClick={() => setActiveModal('ticket')}
                                                className="text-xs text-rose-400 hover:text-rose-300 hover:underline"
                                            >
                                                Report Issue
                                            </button>
                                            <button
                                                onClick={() => setActiveModal('asset')}
                                                className="text-xs text-slate-400 hover:text-white hover:underline"
                                            >
                                                Request Upgrade
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    {/* Support Tickets */}
                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-bold text-white mb-4">My Tickets</h3>
                        <div className="space-y-4">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded font-medium border border-blue-500/20">Open</span>
                                    <span className="text-[10px] text-slate-500">2d ago</span>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1">VPN Connectivity Issue</h4>
                                <p className="text-xs text-slate-400">Ticket #INC-2291</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 opacity-70">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded font-medium border border-emerald-500/20">Resolved</span>
                                    <span className="text-[10px] text-slate-500">1w ago</span>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1">Monitor Request</h4>
                                <p className="text-xs text-slate-400">Ticket #REQ-1120</p>
                            </div>
                        </div>
                        <button className="w-full mt-4 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10">
                            View All History
                        </button>
                    </div>

                    {/* Quick Policies */}
                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-bold text-white mb-4">IT Policies</h3>
                        <ul className="text-sm space-y-3 text-slate-400">
                            <li className="flex items-start gap-2 hover:text-blue-300 cursor-pointer transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></span>
                                Acceptable Use Policy
                            </li>
                            <li className="flex items-start gap-2 hover:text-blue-300 cursor-pointer transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></span>
                                Data Security Guidelines
                            </li>
                            <li className="flex items-start gap-2 hover:text-blue-300 cursor-pointer transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></span>
                                Remote Work Asset Standards
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                {activeModal === 'asset' && <Laptop className="text-blue-400" size={20} />}
                                {activeModal === 'ticket' && <Ticket className="text-blue-400" size={20} />}
                                {activeModal === 'profile' && <User className="text-blue-400" size={20} />}

                                {activeModal === 'asset' && 'Request New Asset'}
                                {activeModal === 'ticket' && 'Raise Support Ticket'}
                                {activeModal === 'profile' && 'My Profile'}
                            </h3>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        {activeModal !== 'profile' ? (
                            <form onSubmit={(e) => handleSubmit(e, activeModal)} className="p-6 space-y-4">
                                {activeModal === 'asset' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Asset Type</label>
                                            <select className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option>Laptop (Standard)</option>
                                                <option>Laptop (High Performance)</option>
                                                <option>Monitor</option>
                                                <option>Peripheral (Keyboard/Mouse)</option>
                                                <option>Software License</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Reason for Request</label>
                                            <textarea
                                                rows="3"
                                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Current laptop is slow, Need monitor for dual-screen setup..."
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Urgency</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                                    <input type="radio" name="urgency" className="text-blue-500" defaultChecked /> Standard
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                                    <input type="radio" name="urgency" className="text-blue-500" /> high
                                                </label>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Issue Category</label>
                                            <select className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option>Hardware Fault</option>
                                                <option>Software / OS Issue</option>
                                                <option>Network / VPN</option>
                                                <option>Access / Permissions</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                                            <textarea
                                                rows="4"
                                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Describe the issue in detail..."
                                            ></textarea>
                                        </div>
                                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex gap-3">
                                            <AlertCircle className="text-amber-400 shrink-0" size={18} />
                                            <p className="text-xs text-amber-200">
                                                For critical outages blocking your work, please call the IT Helpdesk directly at x4499.
                                            </p>
                                        </div>
                                    </>
                                )}

                                {/* Modal Footer */}
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setActiveModal(null)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg font-medium transition-colors border border-white/10"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-colors"
                                    >
                                        {activeModal === 'asset' ? 'Submit Request' : 'Create Ticket'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            // PROFILE MODAL CONTENT
                            <div className="p-8 space-y-8 custom-scrollbar max-h-[80vh] overflow-y-auto">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-16 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/10 shrink-0 shadow-xl">
                                        <span className="text-3xl font-bold text-white">AJ</span>
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-2xl font-bold text-white mb-1">Alex Johnson</h3>
                                        <p className="text-blue-100 mb-0.5">alex.j@acmecorp.com</p>
                                        <p className="text-blue-200 text-sm opacity-80">{currentRole.dept} • {currentRole.label}</p>
                                    </div>
                                    <div className="flex gap-3 relative z-10">
                                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold backdrop-blur-sm border border-white/10 transition-colors">
                                            Change Password
                                        </button>
                                        <button
                                            onClick={() => {
                                                logout();
                                                window.location.href = '/login';
                                            }}
                                            className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 hover:text-white rounded-lg text-sm font-semibold backdrop-blur-sm border border-rose-500/20 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    <div className="glass-panel p-6 space-y-6 bg-slate-800/50">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                                <Settings size={20} />
                                            </div>
                                            <h4 className="text-lg font-bold text-white">Account Information</h4>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-purple-400 mb-1.5 uppercase font-bold">User Role</label>
                                            <div className="relative">
                                                <select
                                                    value={currentRole.label}
                                                    onChange={(e) => {
                                                        const newRole = ROLES.find(r => r.label === e.target.value);
                                                        setCurrentRole(newRole || ROLES[0]);
                                                    }}
                                                    className="w-full bg-slate-800 border border-purple-500/30 rounded-lg pl-4 pr-10 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 duration-200"
                                                >
                                                    {ROLES.map(role => (
                                                        <option key={role.label} value={role.label}>{role.label}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <ChevronUp size={16} className="rotate-180" />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-2">Switch between user roles to access different dashboards and permissions.</p>
                                        </div>
                                    </div>
                                    {/* Security */}
                                    <div className="glass-panel p-6 space-y-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                                                <Sparkles size={20} />
                                            </div>
                                            <h4 className="text-lg font-bold text-white">Security</h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                                <div>
                                                    <h5 className="font-semibold text-white mb-1">Password</h5>
                                                    <p className="text-xs text-slate-400">Last changed 3 months ago</p>
                                                </div>
                                                <button className="text-sm font-semibold text-blue-400 group-hover:text-blue-300">Change</button>
                                            </div>
                                            <div className="border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                                <div>
                                                    <h5 className="font-semibold text-white mb-1">Two-Factor Authentication</h5>
                                                    <p className="text-xs text-slate-400">Add an extra layer of security</p>
                                                </div>
                                                <button className="text-sm font-semibold text-blue-400 group-hover:text-blue-300">Enable</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

