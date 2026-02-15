'use client';

import { useGame } from '@/context/GameContext';
import { Shield, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function ClearanceBadge() {
    const { state } = useGame();
    const [isHovered, setIsHovered] = useState(false);
    const { theme } = useTheme();

    const color = theme === 'matrix' ? '#0aff00' : theme === 'sunset' ? '#ff9d00' : '#00f3ff';

    // Safety check for state
    if (!state) return null;

    const nextLevel = Math.min(state.clearanceLevel + 1, state.maxLevel);
    // Safe access to eggsFound
    const eggsFoundCount = state.eggsFound?.length || 0;
    // We can assume 5 eggs total for now, or use a constant
    const totalEggs = 5;

    return (
        <div className="fixed top-6 right-24 z-50 hidden md:block">
            <motion.div
                className="relative bg-black/80 backdrop-blur-md border rounded-lg px-3 py-1.5 flex items-center gap-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-help select-none group"
                style={{ borderColor: `${color}40` }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.05 }}
            >
                {/* Icon */}
                <div className="relative">
                    <Shield className="w-5 h-5" style={{ color }} />
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-3 h-3 flex items-center justify-center rounded-full">
                        {state.clearanceLevel}
                    </div>
                </div>

                {/* Text Info */}
                <div className="flex flex-col">
                    <span className="text-[10px] font-mono font-bold tracking-wider" style={{ color }}>
                        CLEARANCE LV.{state.clearanceLevel}
                    </span>
                    <span className="text-[8px] text-gray-500 font-mono">
                        [{eggsFoundCount}/{totalEggs}] INTEL FOUND
                    </span>
                </div>

                {/* Hover Details (Tooltip) */}
                <div className={`absolute top-12 right-0 w-48 bg-black/90 border border-gray-800 rounded-lg p-3 backdrop-blur-xl transition-all duration-300 pointer-events-none ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                    <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                        <Lock className="w-3 h-3 text-gray-400" />
                        SECURITY STATUS
                    </h3>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-gray-400">
                            <span>Current Access:</span>
                            <span className="text-white">Confidential</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400">
                            <span>Next Promotion:</span>
                            <span className="text-white">Lv.{nextLevel}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-1">
                            <div
                                className="h-full transition-all duration-500"
                                style={{
                                    width: `${(eggsFoundCount / totalEggs) * 100}%`,
                                    backgroundColor: color
                                }}
                            />
                        </div>
                        <p className="text-[9px] text-gray-500 mt-1 italic">
                            Find hidden easter eggs to increase clearance.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
