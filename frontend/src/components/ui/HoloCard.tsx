"use client";

import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

interface HoloCardProps {
    children: React.ReactNode;
    className?: string;
    onMouseEnter?: () => void;
}

export default function HoloCard({ children, className = '', onMouseEnter }: HoloCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [hover, setHover] = useState(false);

    const x = useSpring(0, { stiffness: 150, damping: 20 });
    const y = useSpring(0, { stiffness: 150, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct * 20); // Rotation X (up/down)
        y.set(yPct * -20); // Rotation Y (left/right) - inverted
    };

    const handleMouseLeave = () => {
        setHover(false);
        x.set(0);
        y.set(0);
    };

    const handleMouseEnter = () => {
        setHover(true);
        if (onMouseEnter) {
            onMouseEnter();
        }
    };

    return (
        <motion.div
            ref={ref}
            className={`relative transform-gpu preserve-3d ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            style={{
                perspective: 1000,
                rotateX: y, // Swapped intentionally for feel
                rotateY: x,
            }}
        >
            <div
                className="w-full h-full transform-gpu transition-all duration-200"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {children}

                {/* Holographic Shine Overlay */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 z-50 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                    style={{ opacity: hover ? 0.3 : 0 }}
                />

                {/* Border Glow */}
                <div
                    className="absolute -inset-[1px] rounded-xl opacity-0 transition-opacity duration-300 z-[-1] bg-gradient-to-r from-cyan-500/50 to-purple-500/50 blur-sm"
                    style={{ opacity: hover ? 1 : 0 }}
                />
            </div>
        </motion.div>
    );
}
