'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export default function CyberChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "SYSTEM ONLINE. I am SALVIN's AI assistant. Ask me anything about his skills, projects, or background." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    const color = theme === 'matrix' ? '#0aff00' : theme === 'sunset' ? '#ff9d00' : '#00f3ff';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/v4/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg].filter(m => m.role !== 'system') // Filter out initial greeting if needed, or keep it
                }),
            });

            if (!res.ok) throw new Error('Network response was not ok');

            const data = await res.json();
            const botMsg: Message = { role: 'assistant', content: data.content };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ CONNECTION ERROR: Unable to reach neural core. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed right-6 z-[200] w-14 h-14 rounded-full border-2 flex items-center justify-center font-mono text-sm backdrop-blur-md transition-all"
                style={{ borderColor: color, color: color, backgroundColor: 'rgba(0,0,0,0.8)', bottom: 'calc(var(--monitor-height, 32px) + 8px)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? '✕' : '⟩_'}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 z-[200] w-96 h-[450px] flex flex-col border rounded-lg overflow-hidden backdrop-blur-xl shadow-2xl"
                        style={{ borderColor: color, backgroundColor: 'rgba(0,0,0,0.95)' }}
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: `${color}40` }}>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                                <span className="font-mono text-xs tracking-widest" style={{ color }}>CYBER-COMPANION v4.0 (AI)</span>
                            </div>
                            <span className="text-[10px] font-mono text-gray-600">ENCRYPTED</span>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-3 py-2 rounded text-xs font-mono whitespace-pre-wrap ${msg.role === 'user'
                                        ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-800/50'
                                        : 'bg-gray-900/50 text-green-400 border border-green-900/30'
                                        }`}
                                        style={msg.role === 'user' ? { borderColor: `${color}50`, color: theme === 'sunset' ? '#ffcaa0' : undefined } : {}}
                                    >
                                        {msg.role === 'assistant' && (
                                            <span className="text-gray-500 text-[10px] block mb-1 opacity-50">[SYSTEM_RESPONSE]</span>
                                        )}
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-900/50 px-3 py-2 rounded border border-green-900/30 flex gap-1 items-center">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t" style={{ borderColor: `${color}40` }}>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono" style={{ color }}>{'>'}</span>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask anything..."
                                    disabled={isLoading}
                                    className="flex-1 bg-transparent text-xs font-mono text-white outline-none placeholder-gray-600 disabled:opacity-50"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading}
                                    className="text-xs font-mono px-2 py-1 border rounded hover:bg-white/5 transition-colors disabled:opacity-50"
                                    style={{ borderColor: `${color}40`, color }}
                                >
                                    SEND
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
