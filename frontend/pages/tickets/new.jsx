import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';

export default function NewTicketPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen p-8 bg-slate-950 text-slate-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-emerald-400">Ticket Created!</h1>
                    <p className="text-slate-400">Reference: #TCK-2023-NEW</p>
                    <Link href="/tickets" className="inline-block px-6 py-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition">Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-slate-950 text-slate-100">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex items-center space-x-4">
                    <Link href="/tickets" className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent">New Ticket</h1>
                </div>

                <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl bg-slate-900 border border-white/10 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
                        <input type="text" required className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500/50 outline-none text-white" placeholder="Brief summary of the issue" />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Priority</label>
                            <select className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500/50 outline-none text-white">
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Related Asset</label>
                            <select className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500/50 outline-none text-white">
                                <option value="">Select Asset (Optional)</option>
                                <option>MacBook Pro (AST-1001)</option>
                                <option>Dell Monitor (AST-2020)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                        <textarea rows={5} required className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500/50 outline-none text-white" placeholder="Detailed description..." />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="btn btn-primary bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-rose-500/20 flex items-center gap-2">
                            <Save size={20} /> Submit Ticket
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
