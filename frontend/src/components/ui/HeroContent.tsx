'use client';

import { motion } from 'framer-motion';

import GlitchText from './GlitchText';

import SystemCore from './SystemCore';

export default function HeroContent() {
    return (
        <div className="z-10 text-center px-4 pointer-events-none select-none flex flex-col items-center">
            {/* System Core Animation */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="mb-8"
            >
                <SystemCore />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
            >
                <h1 data-hero-title className="text-6xl md:text-8xl font-black font-orbitron text-white tracking-tighter mb-2 relative inline-block pointer-events-auto text-glow">
                    <GlitchText text="SALVIN" />
                </h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
            >
                <div className="text-xl md:text-2xl text-cyan-400 font-mono tracking-widest bg-black/50 px-4 py-1 inline-block border border-cyan-900/50 backdrop-blur-sm pointer-events-auto">
                    <GlitchText text="SYSTEM ARCHITECT" /> <span className="text-purple-500 mx-2">{'//'}</span> <GlitchText text="IT ENGINEER" />
                </div>
            </motion.div>

            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
            >
                <span className="text-[10px] font-mono tracking-[0.2em] text-cyan-500 uppercase">Scroll to Initialize</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-cyan-500 to-transparent"></div>
            </motion.div>
        </div>
    );
}
