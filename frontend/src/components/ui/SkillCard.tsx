"use client";

import { LucideIcon } from 'lucide-react';

interface SkillCardProps {
    name: string;
    icon: LucideIcon;
    category: string;
    proficiency?: number;
}

export default function SkillCard({ name, icon: Icon, category, proficiency }: SkillCardProps) {
    const handleHover = () => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cyber_log', { detail: `[SYS] LOADING MODULE: ${name.toUpperCase()}...` }));
        }
    };

    return (
        <div onMouseEnter={handleHover} className="cyber-box group p-6 hover:shadow-[0_0_30px_rgba(0,243,255,0.2)] transition-all duration-300 relative overflow-hidden">
            {/* Cybernetic Scanline */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-purple-500 shadow-[0_0_15px_#bd00ff] z-[100] opacity-0 group-hover:animate-cyber-scan pointer-events-none"></div>

            <div className="absolute top-0 right-0 p-2 opacity-50 font-mono text-[10px] text-cyan-800">SYS_ID_{name.length.toString().padStart(3, '0')}</div>

            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="p-3 bg-cyan-900/20 rounded-sm border border-cyan-500/30 group-hover:border-cyan-400 transition-colors duration-300">
                    <Icon className="w-8 h-8 text-cyan-400 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(0,243,255,0.8)] transition-all" />
                </div>

                <div className="text-center w-full">
                    <h3 className="text-lg font-bold font-orbitron text-white tracking-wider group-hover:text-cyan-300 transition-all">{name}</h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="h-[1px] w-4 bg-cyan-800"></span>
                        <p className="text-xs font-mono text-gray-400 uppercase">{category}</p>
                        <span className="h-[1px] w-4 bg-cyan-800"></span>
                    </div>
                </div>

                {proficiency && (
                    <div className="w-full mt-2">
                        <div className="flex justify-between text-xs font-mono text-cyan-600 mb-1">
                            <span>LOAD</span>
                            <span>{proficiency}%</span>
                        </div>
                        <div className="w-full h-1 bg-gray-800/50">
                            <div
                                className="h-full bg-cyan-500 shadow-[0_0_10px_#00f3ff] relative"
                                style={{ width: `${proficiency}%` }}
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
