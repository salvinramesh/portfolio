'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle, Lock, Shield } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function MissionLog() {
    const { state } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const { theme } = useTheme();
    const color = theme === 'matrix' ? '#0aff00' : theme === 'sunset' ? '#ff9d00' : '#00f3ff';

    return (
        <>
            {/* Trigger Badge */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed top-24 left-6 z-40 bg-black/50 backdrop-blur border rounded-lg px-3 py-2 flex items-center gap-3 group hover:bg-white/5 transition-all"
                style={{ borderColor: `${color}50` }}
                whileHover={{ scale: 1.05 }}
            >
                <div className="relative">
                    <Shield className="w-5 h-5" style={{ color }} />
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full">
                        {state.clearanceLevel}
                    </span>
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-[10px] text-gray-400 font-mono tracking-wider">CLEARANCE</span>
                    <div className="w-20 h-1 bg-gray-800 rounded-full overflow-hidden mt-1">
                        <div
                            className="h-full transition-all duration-500"
                            style={{ width: `${(state.xp % 100)}%`, backgroundColor: color }}
                        />
                    </div>
                </div>
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                            style={{ borderColor: color }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between" style={{ backgroundColor: `${color}10` }}>
                                <div className="flex items-center gap-3">
                                    <Shield className="w-6 h-6" style={{ color }} />
                                    <div>
                                        <h2 className="font-orbitron font-bold text-lg text-white">MISSION LOG</h2>
                                        <p className="text-xs text-gray-400 font-mono">CLEARANCE LEVEL {state.clearanceLevel} // XP: {state.xp}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
                            </div>

                            {/* Missions List */}
                            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                {state.missions.map((mission) => (
                                    <div
                                        key={mission.id}
                                        className={`p-4 rounded-lg border transition-all ${mission.completed
                                                ? 'bg-green-900/10 border-green-500/30'
                                                : 'bg-white/5 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                {mission.completed ? (
                                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                                ) : (
                                                    <Lock className="w-5 h-5 text-gray-600 mt-0.5" />
                                                )}
                                                <div>
                                                    <h3 className={`font-bold text-sm ${mission.completed ? 'text-green-400' : 'text-gray-300'}`}>
                                                        {mission.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1">{mission.description}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono px-2 py-1 rounded bg-black/50 text-gray-400">
                                                +{mission.xp} XP
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-3 bg-black/50 border-t border-white/10 text-center">
                                <p className="text-[10px] text-gray-500 font-mono">COMPLETE MISSIONS TO UNLOCK HIGHER SECURITY CLEARANCE.</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
