import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Clock, User, MessageSquare, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TicketDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const [ticket, setTicket] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [note, setNote] = useState('');
    const [newStatus, setNewStatus] = useState('Open');

    // AI/Logic for Resolution Suggestions
    const getResolutionSteps = (t) => {
        const text = (t.subject + t.description).toLowerCase();
        if (text.includes('screen') || text.includes('display') || text.includes('monitor')) {
            return "1. Check for recent OS updates and roll back if necessary.\n2. Inspect HDMI/DisplayPort cables for damage.\n3. Run manufacturer's hardware diagnostic tool.\n4. If hardware failure is confirmed, initiate RMA process.";
        }
        if (text.includes('software') || text.includes('install')) {
            return "1. Verify license availability in Asset Manager.\n2. Check user's department approval status.\n3. Remote into user machine to perform admin installation.\n4. Verify software launch post-installation.";
        }
        if (text.includes('password') || text.includes('login')) {
            return "1. Verify user identity via callback.\n2. Reset password in IDM portal.\n3. Guide user to set up new MFA.";
        }
        if (text.includes('keyboard') || text.includes('mouse')) {
            return "1. Check USB connection ports.\n2. Replace with spare peripheral to test.\n3. Order replacement if confirmed faulty.";
        }
        return "1. Triage the issue priority.\n2. Check Knowledge Base for similar past incidents.\n3. Contact user for more details if needed.";
    };

    const handleAddNote = () => {
        if (!note) return;

        const newHistory = {
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            user: 'You (Technician)',
            action: `Note added: ${note}`
        };

        const updatedHistory = [newHistory, ...ticket.history]; // Add to top

        // If status changed
        if (newStatus !== ticket.status) {
            updatedHistory.unshift({
                date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                user: 'You (Technician)',
                action: `Status updated to ${newStatus}`
            });
        }

        setTicket(prev => ({
            ...prev,
            status: newStatus,
            history: updatedHistory
        }));

        setIsModalOpen(false);
        setNote('');
    };

    useEffect(() => {
        if (!id) return;

        // 1. Load Assets to lookup real tickets
        const savedAssets = localStorage.getItem('assets');
        let assetList = [];
        if (savedAssets) assetList = JSON.parse(savedAssets);
        else {
            const { initialMockAssets } = require('@/data/mockAssets');
            assetList = initialMockAssets;
        }

        // 2. Determine Ticket Type based on ID format
        let foundTicket = null;

        // Type A: Real Asset Tickets (e.g., TCK-202305) derived from 'Repair'/'Maintenance'
        if (id.startsWith('TCK-2023')) {
            const index = parseInt(id.replace('TCK-2023', ''));
            const possibleAssets = assetList.filter(a => a.status === 'Repair' || a.status === 'Maintenance');

            // Map the index back to the filtered list logic in all.jsx
            // The list logic there was: filter(...).map((a, i) => ID = 202300 + i)
            // So index 0 corresponds to the first asset in that filtered list.
            const listIndex = index; // The last two digits
            const asset = possibleAssets[listIndex];

            if (asset) {
                foundTicket = {
                    id: id,
                    subject: `${asset.status} Request: ${asset.name}`,
                    description: `This asset is currently marked as "${asset.status}". Requires immediate attention from the IT team to restore functionality. Please check hardware components and warranty status.`,
                    priority: asset.status === 'Repair' ? 'High' : 'Medium',
                    status: 'Open',
                    user: asset.assigned_to || 'System',
                    created: '2023-12-20',
                    asset: `${asset.id} (${asset.name})`,
                    history: [
                        { date: '2023-12-20 09:00', user: 'System', action: `Auto-generated ticket for ${asset.status}` }
                    ]
                };
            }
        }

        // Type B: Random Generated Tickets (e.g., TCK-GEN-105)
        if (!foundTicket && id.startsWith('TCK-GEN-')) {
            const seed = parseInt(id.replace('TCK-GEN-', ''));
            const assetIndex = seed % assetList.length; // Deterministic asset
            const asset = assetList[assetIndex];

            // Deterministic properties based on the ID number
            // We use the ID to pick from a list of predefined scenarios so they are consistent
            const scenarios = [
                { sub: 'Keyboard Malfunction', desc: 'Several keys (Enter, Space) are sticking or not responding intermittently.' },
                { sub: 'Software Install Request', desc: 'User needs Adobe Creative Cloud suite installed for upcoming project.' },
                { sub: 'VPN Connection Error', desc: 'Unable to connect to corporate VPN. Error 800: Connection failed.' },
                { sub: 'Monitor Display Issues', desc: 'External monitor flickers pink and green lines occasionally.' },
                { sub: 'Password Reset', desc: 'User locked out of account after multiple failed login attempts.' },
                { sub: 'Printer Paper Jam', desc: 'Department printer is jamming repeatedly on Tray 2.' },
                { sub: 'Mouse Tracking Issue', desc: 'Wireless mouse cursor is jumping around the screen unpredictably.' }
            ];

            const scenario = scenarios[seed % scenarios.length];

            foundTicket = {
                id: id,
                subject: `${scenario.sub} - ${asset?.name || 'Device'}`,
                description: `${scenario.desc} This started occurring yesterday. Asset ID: ${asset?.id || 'N/A'}.`,
                priority: ['Low', 'Medium', 'High'][seed % 3], // Deterministic priority
                status: ['Open', 'Pending', 'Closed'][seed % 3], // Deterministic status
                user: asset?.assigned_to || 'User',
                created: '2023-12-15',
                asset: `${asset?.id || 'Unknown'} (${asset?.name || 'Hardware'})`,
                history: [
                    { date: '2023-12-15 09:00', user: asset?.assigned_to || 'User', action: 'Ticket Created' },
                    { date: '2023-12-15 10:00', user: 'Help Desk', action: 'Ticket Acknowledged' }
                ]
            };
        }

        // Fallback if ID doesn't match known patterns or asset not found (e.g. manual URL entry)
        if (!foundTicket) {
            foundTicket = {
                id: id,
                subject: 'General Support Request',
                description: 'Issue description not found or ticket is archived.',
                priority: 'Low',
                status: 'Open',
                user: 'Unknown',
                created: '2023-01-01',
                asset: 'N/A',
                history: []
            };
        }

        setTicket(foundTicket);
        setNewStatus(foundTicket.status); // Sync status
    }, [id]);

    if (!ticket) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;

    return (
        <div className="min-h-screen p-8 bg-slate-950 text-slate-100">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center space-x-4">
                    <Link href="/tickets" className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white">{ticket.subject}</h1>
                            <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-semibold">{ticket.priority}</span>
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-semibold">{ticket.status}</span>
                        </div>
                        <p className="text-slate-400 mt-1 font-mono text-sm">{ticket.id}</p>
                    </div>
                </div>

                {/* AI Resolution Guide */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/20 to-blue-900/20 border border-indigo-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <CheckCircle size={100} />
                    </div>
                    <h3 className="text-lg font-bold text-indigo-300 mb-2 flex items-center gap-2">
                        <CheckCircle size={20} /> Recommended Resolution
                    </h3>
                    <div className="text-indigo-100/80 text-sm leading-relaxed whitespace-pre-line relative z-10">
                        {getResolutionSteps(ticket)}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="font-semibold text-lg mb-4 text-slate-200">Description</h3>
                            <p className="text-slate-300 leading-relaxed">{ticket.description}</p>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="font-semibold text-lg mb-4 text-slate-200 flex items-center gap-2">
                                <MessageSquare size={18} /> Activity Log
                            </h3>
                            <div className="space-y-6 border-l-2 border-white/10 pl-6 ml-2">
                                {ticket.history.map((h, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600" />
                                        <div className="text-sm font-semibold text-slate-200">{h.action}</div>
                                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                            <span>{h.user}</span>
                                            <span>•</span>
                                            <span>{h.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-2xl bg-slate-900 border border-white/10">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-4">Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Requester</div>
                                    <div className="flex items-center gap-2 text-slate-200 font-medium">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-300 border border-indigo-500/30">
                                            <User size={12} />
                                        </div>
                                        {ticket.user}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Created</div>
                                    <div className="flex items-center gap-2 text-slate-200">
                                        <Clock size={14} className="text-slate-500" /> {ticket.created}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <div className="text-xs text-slate-500 mb-1">Impacted Asset</div>
                                    <Link href="/assets/1" className="text-blue-400 hover:text-blue-300 text-sm font-mono block truncate">{ticket.asset}</Link>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-300 font-medium transition-colors hover:text-white"
                        >
                            Add Note / Update Status
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Update Ticket</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">New Status</label>
                                <select
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-white"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    <option value="Open">Open</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Note / Comment</label>
                                <textarea
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-white h-24"
                                    placeholder="Enter details about the action taken..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddNote}
                                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-white font-bold shadow-lg shadow-rose-500/20 transition-colors"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
