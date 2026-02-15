"use client";

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        return scrollYProgress.onChange((latest) => {
            setPercentage(Math.floor(latest * 100));
        });
    }, [scrollYProgress]);

    return (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-2 pointer-events-none mix-blend-screen">
            {/* Top Marker */}
            <div className="w-[1px] h-12 bg-gradient-to-b from-transparent to-cyan-500/50"></div>

            {/* Percentage Display */}
            <div className="font-mono text-xs text-cyan-500 writing-vertical-rl rotate-180 tracking-widest">
                SYSTEM_SCROLL
            </div>

            {/* Progress Bar Container */}
            <div className="w-1 h-64 bg-gray-900/50 rounded-full relative overflow-hidden border border-cyan-900/30 backdrop-blur-sm">
                <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                    style={{ height: useTransform(scrollYProgress, value => `${value * 100}%`) }}
                />
            </div>

            {/* Numeric Value */}
            <div className="font-mono text-xl font-bold text-white/80 tabular-nums">
                {percentage.toString().padStart(3, '0')}%
            </div>

            {/* Bottom Marker */}
            <div className="w-[1px] h-12 bg-gradient-to-t from-transparent to-cyan-500/50"></div>
        </div>
    );
}
