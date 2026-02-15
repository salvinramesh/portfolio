"use client";

import { motion } from 'framer-motion';

export default function SystemCore() {
    return (
        <div className="relative w-64 h-64 md:w-96 md:h-96 pointer-events-none select-none flex items-center justify-center">
            {/* Outer Rotating Ring */}
            <motion.div
                className="absolute inset-0 rounded-full border border-cyan-500/30 border-dashed"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            {/* Counter-Rotating Ring */}
            <motion.div
                className="absolute inset-4 rounded-full border border-purple-500/30 border-dotted"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />

            {/* Pulse Core */}
            <motion.div
                className="absolute w-32 h-32 bg-cyan-500/10 rounded-full blur-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Inner Hexagon (SVG) */}
            <svg viewBox="0 0 100 100" className="w-24 h-24 absolute text-cyan-400 opacity-80">
                <motion.path
                    d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
            </svg>

            {/* Center Dot */}
            <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#fff]"></div>
        </div>
    );
}
