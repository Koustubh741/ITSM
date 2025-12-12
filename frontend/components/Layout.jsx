import Link from 'next/link'
import { useRouter } from 'next/router'
import { LayoutDashboard, Server, Settings, User, RotateCcw, ShoppingBag, Trash2, Sparkles } from 'lucide-react'

export default function Layout({ children }) {
    const router = useRouter()

    const navItems = [
        { label: 'Dashboard', href: '/', icon: LayoutDashboard },
        { label: 'Enterprise', href: '/enterprise-features', icon: Sparkles },
        { label: 'Assets', href: '/assets', icon: Server },
        { label: 'Renewals', href: '/renewals', icon: RotateCcw },
        { label: 'Procurement', href: '/procurement', icon: ShoppingBag },
        { label: 'Disposal', href: '/disposal', icon: Trash2 },
        { label: 'Settings', href: '/settings', icon: Settings },
    ]

    return (
        <div className="min-h-screen flex text-slate-100 font-sans">
            {/* Sidebar - Glassmorphism */}
            <aside className="w-72 fixed h-full z-10 hidden md:block">
                <div className="h-full m-4 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 flex flex-col shadow-2xl">
                    <div className="p-8 border-b border-white/5">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            ITSM Asset Mgr
                        </h1>
                    </div>

                    <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href))
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive
                                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:pl-5'
                                        }`}
                                >
                                    <Icon size={20} className={isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300 transition-colors'} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                <User size={20} className="text-indigo-300" />
                            </div>
                            <div className="text-sm">
                                <p className="text-white font-semibold">Admin User</p>
                                <p className="text-indigo-300/60 text-xs">IT Department</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-80 p-6 md:p-8 animate-in fade-in duration-700">
                {children}
            </main>
        </div>
    )
}

