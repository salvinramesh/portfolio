'use client';

import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Terminal, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HackingMinigame() {
    const { state, setHackingMinigameActive, checkMission } = useGame();
    const [input, setInput] = useState('');
    const [logs, setLogs] = useState<string[]>(['INITIALIZING OVERRIDE PROTOCOL...', 'AWAITING COMMAND (hint: decrypt_profile):']);
    const [isSuccess, setIsSuccess] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input
    useEffect(() => {
        if (state.isHackingMinigameActive) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setLogs(['INITIALIZING OVERRIDE PROTOCOL...', 'AWAITING COMMAND (hint: decrypt_profile):']);
            setIsSuccess(false);
        }
    }, [state.isHackingMinigameActive]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = input.trim().toLowerCase();
        setInput('');

        if (!cmd) return;

        setLogs(prev => [...prev, `> ${cmd}`]);

        if (cmd === 'decrypt_profile') {
            setLogs(prev => [...prev, '[SYS] BYPASSING MAINFRAME...', '[SYS] ACCESS GRANTED.']);
            setIsSuccess(true);
            checkMission('konami_code');
            setTimeout(() => {
                setHackingMinigameActive(false);
            }, 3000);
        } else if (cmd === 'exit' || cmd === 'quit' || cmd === 'abort') {
            setLogs(prev => [...prev, '[SYS] ABORTING SEQUENCE...']);
            setTimeout(() => setHackingMinigameActive(false), 1000);
        } else if (cmd === 'help') {
            setLogs(prev => [...prev, 'AVAILABLE COMMANDS:', '  decrypt_profile - OVERRIDE MAINFRAME', '  abort - CANCEL SEQUENCE']);
        } else {
            setLogs(prev => [...prev, `[ERR] COMMAND NOT RECOGNIZED: ${cmd}`]);
        }
    };

    if (!state.isHackingMinigameActive) return null;

    return (
        <AnimatePresence>
            <motion.div 
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl font-mono"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
            >
                {/* Scanline overlay */}
                <div className="absolute inset-0 bg-cyan-900/10 opacity-20 pointer-events-none mix-blend-overlay"></div>
                
                <div className="relative w-full max-w-2xl bg-black border border-red-500/50 rounded-lg p-6 shadow-[0_0_50px_rgba(255,0,0,0.2)] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6 border-b border-red-500/30 pb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
                        <div>
                            <h2 className="text-xl font-bold text-red-500 tracking-widest font-orbitron">UNAUTHORIZED ACCESS DETECTED</h2>
                            <p className="text-xs text-red-500/70">MAINFRAME LOCKDOWN INITIATED</p>
                        </div>
                    </div>

                    {/* Terminal Display */}
                    <div className="h-64 overflow-y-auto mb-4 space-y-2 text-sm">
                        {logs.map((log, i) => (
                            <div key={i} className={`${log.startsWith('[ERR]') ? 'text-red-400' : log.startsWith('[SYS] ACCESS GRANTED') ? 'text-green-400 font-bold' : 'text-cyan-400'}`}>
                                {log}
                            </div>
                        ))}
                        {isSuccess && (
                            <motion.div 
                                className="flex items-center gap-2 text-green-400 mt-4 p-2 border border-green-500/30 bg-green-500/10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Unlock className="w-5 h-5" />
                                <span>SYSTEM OVERRIDE SUCCESSFUL. CLASSIFIED DATA UNLOCKED.</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Input Area */}
                    {!isSuccess && (
                        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-red-500/30 pt-4">
                            <span className="text-red-500 font-bold">root@sys:~#</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-cyan-400 w-full"
                                spellCheck={false}
                                autoComplete="off"
                            />
                        </form>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
