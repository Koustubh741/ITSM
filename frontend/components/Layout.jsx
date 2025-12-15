import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { LayoutDashboard, Server, Settings, User, RotateCcw, ShoppingBag, Trash2, Sparkles, ChevronUp, Check } from 'lucide-react'
import { useRole } from '@/contexts/RoleContext'

const ROLES = [
    { label: 'System Admin', dept: 'IT Dept' },
    { label: 'Asset Owner', dept: 'Operations' },
    { label: 'Asset Manager', dept: 'IT Asset' },
    { label: 'Custodian', dept: 'Logistics' },
    { label: 'Inventory Manager', dept: 'Warehouse' },
    { label: 'Procurement Manager', dept: 'Procurement' },
    { label: 'IT Support', dept: 'Helpdesk' },
    { label: 'Audit Officer', dept: 'Compliance' },
    { label: 'Finance', dept: 'Accounts' },
    { label: 'End User', dept: 'Employee' },
];

export default function Layout({ children }) {
    const router = useRouter()
    const { currentRole, setCurrentRole, ROLES, logout } = useRole();
    const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

    const allNavItems = [
        { label: 'Dashboard', href: '/', icon: LayoutDashboard },
        { label: 'Enterprise', href: '/enterprise-features', icon: Sparkles },
        { label: 'Assets', href: '/assets', icon: Server },
        { label: 'Renewals', href: '/renewals', icon: RotateCcw },
        { label: 'Procurement', href: '/procurement', icon: ShoppingBag },
        { label: 'Disposal', href: '/disposal', icon: Trash2 },
        { label: 'Settings', href: '/settings', icon: Settings },
    ]

    const fullAccessRoles = ['System Admin', 'Asset Manager'];
    const navItems = fullAccessRoles.includes(currentRole.label)
        ? allNavItems
        : allNavItems.filter(item => item.label === 'Dashboard');

    return (
        <div className="min-h-screen flex text-slate-100 font-sans">
            {/* Sidebar - Glassmorphism */}
            <aside className="fixed h-full z-20 hidden md:block group w-24 hover:w-72 transition-all duration-300 ease-in-out">
                <div className="h-full m-4 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 flex flex-col shadow-2xl relative overflow-hidden transition-all duration-300 group-hover:bg-slate-900/60">

                    {/* Collapsed State Logo (Visible only when NOT hovered) */}
                    <div className="absolute inset-0 flex flex-col items-center pt-8 opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                        <div className="w-14 h-14 flex items-center justify-center mb-4">
                            <img src="/assets/itsm-logo.png" alt="ITSM Logo" className="w-full h-full object-contain drop-shadow-lg" />
                        </div>
                        <div className="flex flex-col gap-4 mt-4">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href))
                                return (
                                    <div key={item.href} className={`p-2 rounded-lg ${isActive ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500'}`}>
                                        <Icon size={20} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Expanded Content (Visible only on hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 flex flex-col h-full min-w-[16rem]">
                        <div className="p-8 border-b border-white/5 whitespace-nowrap">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                ITSM Asset Mgr
                            </h1>
                        </div>

                        <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href))
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 whitespace-nowrap ${isActive
                                            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:pl-5'
                                            }`}
                                    >
                                        <Icon size={20} className={isActive ? 'text-blue-400' : 'text-slate-500 transition-colors'} />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>

                        <div className="relative whitespace-nowrap">
                            {isRoleMenuOpen && (
                                <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 rounded-xl border border-white/10 shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
                                    <div className="max-h-64 overflow-y-auto p-1 text-left">
                                        {ROLES.map((role) => (
                                            <button
                                                key={role.label}
                                                onClick={() => {
                                                    setCurrentRole(role);
                                                    setIsRoleMenuOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between group transition-colors ${currentRole.label === role.label ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                                    }`}
                                            >
                                                <div>
                                                    <div className="font-medium">{role.label}</div>
                                                    <div className="text-[10px] opacity-60">{role.dept}</div>
                                                </div>
                                                {currentRole.label === role.label && <Check size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}    <div
                                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                                className="p-4 m-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 cursor-pointer hover:bg-white/5 transition-colors group/user"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shrink-0">
                                            <User size={20} className="text-indigo-300" />
                                        </div>
                                        <div className="text-sm overflow-hidden">
                                            <p className="text-white font-semibold truncate">{currentRole.label}</p>
                                            <p className="text-indigo-300/60 text-xs truncate">{currentRole.dept}</p>
                                        </div>
                                    </div>
                                    <ChevronUp size={16} className={`text-slate-500 transition-transform duration-300 ${isRoleMenuOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {/* Logout Button (Small, under profile) */}
                            <div className="mx-4 mb-4">
                                <button
                                    onClick={() => {
                                        logout();
                                        window.location.href = '/login';
                                    }}
                                    className="w-full py-2 rounded-lg border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/10 hover:text-rose-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-28 p-6 md:p-8 animate-in fade-in duration-700">
                {children}
            </main>
        </div>
    )
}

