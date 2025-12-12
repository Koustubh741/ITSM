import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';

export default function AIAssistantSidebar({ isOpen, onClose }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hello! I am your AI Asset Assistant. I can help you find assets, check warranties, or analyze spending. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsTyping(true);

        // Mock AI Delay and Response
        setTimeout(() => {
            let response = "I'm not sure about that, but I can check the database.";
            if (userMsg.toLowerCase().includes('warranty')) {
                response = "I found 5 assets with warranties expiring this month. Would you like me to create renewal tickets for them?";
            } else if (userMsg.toLowerCase().includes('spend') || userMsg.toLowerCase().includes('cost')) {
                response = "Current YTD spend is $450,000. This is 12% higher than last year. The main cost driver is Hardware procurement.";
            } else if (userMsg.toLowerCase().includes('audit')) {
                response = "The last audit for 'New York Office' was completed on Nov 20th with 98% compliance.";
            } else if (userMsg.toLowerCase().includes('ticket')) {
                response = "You have 14 open tickets. The highest priority is 'Laptop Screen Flicker' assigned to Sarah Connor.";
            }

            setMessages(prev => [...prev, { role: 'assistant', text: response }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div className={`fixed inset-y-0 right-0 w-96 bg-slate-900 border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-purple-900/20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">AI Assistant</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs text-slate-400">Online</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 ${m.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-none'
                                }`}>
                                <p className="text-sm leading-relaxed">{m.text}</p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-none p-4 flex gap-1">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 bg-slate-900/50">
                    <form onSubmit={handleSend} className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about assets, warranties..."
                            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-white shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                    <div className="mt-2 text-center">
                        <span className="text-[10px] text-slate-600 flex items-center justify-center gap-1">
                            <Sparkles size={8} /> Powered by Enterprise AI
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
