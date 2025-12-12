import { useState } from 'react'
import { User, Bell, Shield, Database, RefreshCw, Save, Moon, Sun, Monitor } from 'lucide-react'

export default function Settings() {
    const [loading, setLoading] = useState(false)
    const [theme, setTheme] = useState('dark')

    const handleSave = () => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            alert('Settings saved successfully!')
        }, 1000)
    }

    return (
        <div className="space-y-8 pb-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">Settings</h2>
                    <p className="text-slate-400 mt-2 text-lg">Manage your account and application preferences.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn btn-primary flex items-center space-x-2"
                >
                    {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Profile */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1 mb-4 shadow-lg shadow-blue-500/20">
                                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-4 border-transparent">
                                    <User size={40} className="text-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white">Admin User</h3>
                            <p className="text-blue-400 font-medium">IT Administrator</p>
                            <p className="text-slate-500 text-sm mt-1">admin@company.com</p>

                            <div className="mt-6 w-full space-y-3">
                                <button className="w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors text-sm font-medium border border-white/5">
                                    Edit Profile
                                </button>
                                <button className="w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors text-sm font-medium border border-white/5">
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                            <Shield className="mr-3 text-emerald-400" size={20} />
                            Security Status
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">2FA Enabled</span>
                                <span className="text-emerald-400 text-xs font-bold px-2 py-1 bg-emerald-500/10 rounded-full">ACTIVE</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Last Login</span>
                                <span className="text-slate-200 text-sm">Just now</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Password Strength</span>
                                <span className="text-emerald-400 text-sm">Strong</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Appearance */}
                    <div className="glass-panel p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <Monitor className="mr-3 text-blue-400" size={24} />
                            Appearance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => setTheme('dark')}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center space-y-3 ${theme === 'dark' ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="w-full h-24 bg-slate-900 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950"></div>
                                    <Moon size={24} className="relative z-10 text-blue-400" />
                                </div>
                                <span className="text-slate-300 font-medium">Dark Mode</span>
                            </button>

                            <button
                                onClick={() => setTheme('light')}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center space-y-3 ${theme === 'light' ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                                    <Sun size={24} className="relative z-10 text-orange-500" />
                                </div>
                                <span className="text-slate-300 font-medium">Light Mode</span>
                            </button>

                            <button
                                onClick={() => setTheme('system')}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center space-y-3 ${theme === 'system' ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="w-full h-24 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden relative border border-white/10">
                                    <div className="absolute inset-0 flex">
                                        <div className="w-1/2 h-full bg-slate-900"></div>
                                        <div className="w-1/2 h-full bg-slate-100"></div>
                                    </div>
                                    <Monitor size={24} className="relative z-10 text-slate-400 mix-blend-difference" />
                                </div>
                                <span className="text-slate-300 font-medium">System</span>
                            </button>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="glass-panel p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <Bell className="mr-3 text-yellow-400" size={24} />
                            Notifications
                        </h3>
                        <div className="space-y-4">
                            {[
                                { title: 'Asset Expiry Alerts', desc: 'Get notified when assets are expiring soon' },
                                { title: 'Approval Requests', desc: 'Receive emails for new approval workflows' },
                                { title: 'System Updates', desc: 'Notifications about system maintenance' },
                                { title: 'Weekly Reports', desc: 'Receive weekly asset summary reports' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                                    <div>
                                        <p className="text-slate-200 font-medium">{item.title}</p>
                                        <p className="text-slate-500 text-sm">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="glass-panel p-6 border-l-4 border-l-rose-500">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <Database className="mr-3 text-rose-400" size={24} />
                            Data Management
                        </h3>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-slate-200 font-medium">Reset Mock Data</p>
                                <p className="text-slate-500 text-sm">Clear all assigned assets and regenerate sample data.</p>
                            </div>
                            <button className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-colors text-sm font-medium">
                                Reset Database
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
