import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Server, Monitor, Globe, Shield, Wifi, Database } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CMDBMapPage() {
    const router = useRouter();
    const { id } = router.query;

    // Mock Nodes
    const [nodes, setNodes] = useState([]);

    useEffect(() => {
        if (!id) return;
        // Mock Relationship Data
        setNodes([
            { id: 'root', type: 'Server', name: `Primary Asset (${id})`, status: 'Active', x: 400, y: 300, icon: Server, main: true },
            { id: 'c1', type: 'Database', name: 'PostgreSQL DB', status: 'Active', x: 400, y: 150, icon: Database },
            { id: 'c2', type: 'Network', name: 'Core Switch', status: 'Active', x: 200, y: 300, icon: Wifi },
            { id: 'c3', type: 'Service', name: 'Auth Service', status: 'Warning', x: 600, y: 300, icon: Shield },
            { id: 'c4', type: 'App', name: 'Web Frontend', status: 'Active', x: 400, y: 450, icon: Globe },
            { id: 'c5', type: 'Users', name: 'End Users', status: 'Active', x: 600, y: 450, icon: Monitor },
        ]);
    }, [id]);

    const getStatusColor = (s) => s === 'Active' ? 'text-emerald-400 border-emerald-500/50 shadow-emerald-500/20' : 'text-orange-400 border-orange-500/50 shadow-orange-500/20';

    return (
        <div className="min-h-screen p-8 bg-slate-950 text-slate-100 overflow-hidden">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
                <div className="flex items-center space-x-4 mb-8">
                    <Link href="/enterprise-features" className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">CMDB Relationship Visualizer</h1>
                        <p className="text-slate-400 mt-1">Dependency Mapping & Impact Analysis</p>
                    </div>
                </div>

                <div className="flex-1 glass-panel rounded-2xl bg-slate-900 border border-white/10 relative min-h-[600px] overflow-hidden">
                    {/* Background Grid */}
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }} />

                    {/* Nodes - Simplified layout without heavy graph lib */}
                    {nodes.map(node => (
                        <div
                            key={node.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-all duration-300 hover:scale-110 z-10`}
                            style={{ left: node.x, top: node.y }}
                        >
                            <div className={`p-4 rounded-2xl bg-slate-950 border-2 shadow-lg hover:shadow-2xl transition-all ${getStatusColor(node.status)} ${node.main ? 'scale-125 ring-2 ring-white/20' : ''}`}>
                                <node.icon size={node.main ? 32 : 24} />
                            </div>
                            <div className="mt-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/10 text-xs font-medium whitespace-nowrap">
                                {node.name}
                            </div>
                            {/* Connections (Manual SVG lines would be better but keeping simple for React DOM) */}
                        </div>
                    ))}

                    {/* SVG Layer for Lines */}
                    <svg className="absolute inset-0 pointer-events-none w-full h-full opacity-30">
                        {nodes.slice(1).map((node, i) => (
                            <line
                                key={i}
                                x1={nodes[0].x} // Connecting all to root for demo
                                y1={nodes[0].y}
                                x2={node.x}
                                y2={node.y}
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-slate-500"
                                strokeDasharray="5,5"
                            />
                        ))}
                    </svg>

                    {/* Legend / Controls */}
                    <div className="absolute top-6 right-6 bg-slate-950/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl">
                        <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase">Legend</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-emerald-400" /> Operational
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-orange-400" /> Warning / Issue
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-red-400" /> Critical Failure
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
