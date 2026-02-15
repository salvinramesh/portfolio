"use client";

import { useRef } from "react";
import {
    motion,
    useScroll,
    useTransform,
    useMotionTemplate,
} from "framer-motion";

interface ParallaxTextProps {
    children: React.ReactNode;
    speed?: number; // Negative for reverse direction
    className?: string;
}

export default function ParallaxText({ children, speed = 50, className = "" }: ParallaxTextProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [-speed, speed]);

    // Add a slight skew based on scroll velocity simulation (simplified)
    const skew = useTransform(scrollYProgress, [0, 0.5, 1], [0, speed * 0.05, 0]);

    return (
        <div ref={ref} className={`relative overflow-hidden ${className}`}>
            <motion.div style={{ y, skewX: skew }}>
                {children}
            </motion.div>
        </div>
    );
}
