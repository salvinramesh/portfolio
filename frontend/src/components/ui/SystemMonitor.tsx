'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Cpu, Wifi, Lock, ChevronUp, ChevronDown } from 'lucide-react';

export default function SystemMonitor() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [logs, setLogs] = useState<string[]>([
        "[SYS] INITIALIZING KERNEL MODULES...",
        "[SYS] ESTABLISHING SECURE CONNECTION...",
    ]);
    const [metrics, setMetrics] = useState({
        cpu: 0,
        mem: 0,
        net: 0,
        fps: 60
    });

    const monitorRef = useRef<HTMLDivElement>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Listen for custom cyber logs anywhere in the app
    useEffect(() => {
        const handleCyberLog = (e: Event) => {
            const customEvent = e as CustomEvent<string>;
            setLogs(prev => {
                const newLogs = [...prev, customEvent.detail];
                return newLogs.slice(-20); // Keep last 20 logs
            });
        };
        window.addEventListener('cyber_log', handleCyberLog);
        return () => window.removeEventListener('cyber_log', handleCyberLog);
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isExpanded]);

    // Broadcast visible height as CSS variable for other bottom-positioned elements
    useEffect(() => {
        const height = isExpanded && monitorRef.current
            ? monitorRef.current.offsetHeight
            : 32; // collapsed = just the 32px header strip
        document.documentElement.style.setProperty('--monitor-height', `${height}px`);
    }, [isExpanded]);

    useEffect(() => {
        if (!isExpanded) return;

        const interval = setInterval(() => {
            setMetrics({
                cpu: Math.floor(Math.random() * (40 - 10) + 10),
                mem: Math.floor(Math.random() * (60 - 30) + 30),
                net: Math.floor(Math.random() * (900 - 100) + 100),
                fps: Math.floor(Math.random() * (62 - 58) + 58)
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [isExpanded]);

    return (
        <motion.div
            ref={monitorRef}
            className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 border-t border-cyan-900/50 backdrop-blur-md"
            initial={{ y: '100%' }}
            animate={{ y: isExpanded ? 0 : 'calc(100% - 32px)' }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
            {/* Header / Toggle Bar */}
            <div
                className="h-8 flex items-center justify-between px-4 cursor-pointer hover:bg-cyan-900/20 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4 text-xs font-mono text-cyan-500">
                    <span className="flex items-center gap-2"><Activity size={12} /> SYSTEM_MONITOR_V7</span>
                    <span className="opacity-50 hidden md:inline">|</span>
                    <span className="hidden md:inline text-green-500">STATUS: OPTIMAL</span>
                </div>
                <div className="text-cyan-500">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </div>
            </div>

            {/* Expanded Content */}
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                {/* CPU Widget */}
                <div className="bg-black/50 border border-gray-800 p-2 rounded">
                    <div className="flex justify-between text-gray-400 mb-1">
                        <span>CPU_CORE_0</span>
                        <Cpu size={12} />
                    </div>
                    <div className="text-xl font-bold text-cyan-400">{metrics.cpu}%</div>
                    <div className="w-full h-1 bg-gray-800 mt-2 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${metrics.cpu}%` }}></div>
                    </div>
                </div>

                {/* MEM Widget */}
                <div className="bg-black/50 border border-gray-800 p-2 rounded">
                    <div className="flex justify-between text-gray-400 mb-1">
                        <span>MEM_ALLOC</span>
                        <span className="text-[10px]">16GB</span>
                    </div>
                    <div className="text-xl font-bold text-purple-400">{metrics.mem}%</div>
                    <div className="w-full h-1 bg-gray-800 mt-2 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${metrics.mem}%` }}></div>
                    </div>
                </div>

                {/* NET Widget */}
                <div className="bg-black/50 border border-gray-800 p-2 rounded">
                    <div className="flex justify-between text-gray-400 mb-1">
                        <span>NET_TRAFFIC</span>
                        <Wifi size={12} />
                    </div>
                    <div className="text-xl font-bold text-green-400">{metrics.net} Mb/s</div>
                    <div className="flex gap-0.5 mt-2 h-1 items-end">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className={`flex-1 bg-green-500/50 rounded-sm`} style={{ height: `${Math.random() * 100}%` }}></div>
                        ))}
                    </div>
                </div>

                {/* Security Widget */}
                <div className="bg-black/50 border border-gray-800 p-2 rounded">
                    <div className="flex justify-between text-gray-400 mb-1">
                        <span>ENCRYPTION</span>
                        <Lock size={12} />
                    </div>
                    <div className="text-xl font-bold text-yellow-400">AES-256</div>
                    <div className="mt-2 text-[10px] text-gray-500">
                        HANDSHAKE: VALID<br />
                        FPS: {metrics.fps}
                    </div>
                </div>
            </div>

            {/* Activity Log (Visible when expanded) */}
            {isExpanded && (
                <div className="px-4 pb-4">
                    <div className="bg-black/80 border border-cyan-900/40 p-2 rounded h-24 overflow-y-auto font-mono text-[10px] space-y-1">
                        {logs.map((log, index) => (
                            <div key={index} className="text-cyan-500/80">
                                <span className="text-gray-500 mr-2">{new Date().toLocaleTimeString('en-US', { hour12: false, hour: 'numeric', minute: 'numeric', second: 'numeric' })}</span>
                                {log}
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            )}
        </motion.div>
    );
}
