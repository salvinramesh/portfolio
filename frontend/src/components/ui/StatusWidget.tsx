'use client';

import { useState, useEffect } from 'react';
import { Activity, Github, Cpu, Database } from 'lucide-react';

interface SystemData {
    cpu: number;
    memory: {
        percent: number;
        used: number;
        total: number;
    };
    uptime: number;
}

export default function StatusWidget() {
    const [data, setData] = useState<SystemData | null>(null);
    const [latency, setLatency] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const start = Date.now();
            try {
                const res = await fetch('/v4/system');
                const json = await res.json();
                const end = Date.now();
                setLatency(end - start);
                if (res.ok) {
                    setData(json);
                }
            } catch (e) {
                console.error('Failed to fetch system stats');
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Format uptime
    const formatUptime = (seconds: number) => {
        if (!seconds) return '0h 0m';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <div
            className="fixed left-4 z-50 flex items-end gap-2 animate-in slide-in-from-bottom-5 duration-700 font-mono transition-all"
            style={{ bottom: 'calc(var(--monitor-height, 32px) + 8px)' }}
        >

            {/* Main Stats Pill */}
            <div
                className="bg-black/90 border border-cyan-900/50 backdrop-blur-md px-3 py-2 rounded-lg flex flex-col gap-1 shadow-[0_0_15px_rgba(0,243,255,0.1)] hover:border-cyan-500/50 transition-all min-w-[140px] group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Header / Status */}
                <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                    <span className="text-[10px] text-cyan-400 font-bold tracking-wider">SYSTEM_OP</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-500">{latency}ms</span>
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </div>
                    </div>
                </div>

                {/* Real Data Metrics */}
                <div className="flex flex-col gap-1">
                    {/* CPU */}
                    <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1 text-gray-400">
                            <Cpu size={10} />
                            <span>CPU</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-cyan-500 transition-all duration-500"
                                    style={{ width: `${data?.cpu || 0}%` }}
                                />
                            </div>
                            <span className="text-white w-6 text-right">{data?.cpu || 0}%</span>
                        </div>
                    </div>

                    {/* RAM */}
                    <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1 text-gray-400">
                            <Database size={10} />
                            <span>MEM</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 transition-all duration-500"
                                    style={{ width: `${data?.memory.percent || 0}%` }}
                                />
                            </div>
                            <span className="text-white w-6 text-right">{data?.memory.percent || 0}%</span>
                        </div>
                    </div>

                    {/* Uptime (Reveal on hover) */}
                    <div className={`overflow-hidden transition-all duration-300 ${isHovered ? 'max-h-5 opacity-100 mt-1 pt-1 border-t border-white/10' : 'max-h-0 opacity-0'}`}>
                        <div className="flex justify-between text-[9px] text-gray-500">
                            <span>UPTIME</span>
                            <span className="text-gray-300">{data ? formatUptime(data.uptime) : '--'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* GitHub Link */}
            <a
                href="https://github.com/salvinramesh"
                target="_blank"
                rel="noreferrer"
                className="bg-black/80 border border-purple-900/50 backdrop-blur-md p-2 rounded-lg hover:bg-purple-900/20 hover:border-purple-500 transition-all group mb-1"
            >
                <Github className="w-4 h-4 text-purple-400 group-hover:text-purple-200" />
            </a>
        </div>
    );
}
