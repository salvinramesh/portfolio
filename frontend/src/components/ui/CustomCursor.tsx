'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import useSonic from '@/hooks/useSonic';

export default function CustomCursor() {
    const { theme } = useTheme();
    const [isPointer, setIsPointer] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    const [isMobile, setIsMobile] = useState(false);
    const { playClick } = useSonic();

    // Raw mouse values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring-lagged values for outer ring
    const ringX = useSpring(mouseX, { stiffness: 150, damping: 15, mass: 0.5 });
    const ringY = useSpring(mouseY, { stiffness: 150, damping: 15, mass: 0.5 });

    // Even slower trail for the orbit
    const orbitX = useSpring(mouseX, { stiffness: 80, damping: 20, mass: 1 });
    const orbitY = useSpring(mouseY, { stiffness: 80, damping: 20, mass: 1 });

    const color = theme === 'matrix' ? '#0aff00' : theme === 'sunset' ? '#ff9d00' : '#00f3ff';
    const colorDim = theme === 'matrix' ? '#0aff0040' : theme === 'sunset' ? '#ff9d0040' : '#00f3ff40';

    useEffect(() => {
        // Detect touch devices
        setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    const handleMove = useCallback((e: MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);

        // Detect if hovering a clickable element
        const target = e.target as HTMLElement;
        const clickable = target.closest('a, button, [role="button"], input, textarea, select, [data-clickable]');
        setIsPointer(!!clickable);
    }, [mouseX, mouseY]);

    const handleDown = useCallback((e: MouseEvent) => {
        setIsClicking(true);
        playClick(); // Sonic UI feedback
        const id = Date.now();
        setRipples(prev => [...prev.slice(-3), { id, x: e.clientX, y: e.clientY }]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
    }, [playClick]);

    const handleUp = useCallback(() => {
        setIsClicking(false);
    }, []);

    useEffect(() => {
        if (isMobile) return;
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mousedown', handleDown);
        window.addEventListener('mouseup', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mousedown', handleDown);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [isMobile, handleMove, handleDown, handleUp]);

    if (isMobile) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            {/* ── Core Dot ── */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: 6,
                    height: 6,
                    backgroundColor: '#fff',
                    left: mouseX,
                    top: mouseY,
                    x: -3,
                    y: -3,
                    boxShadow: `0 0 8px 2px ${color}`,
                }}
                animate={{
                    scale: isClicking ? 0.5 : isPointer ? 1.8 : 1,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            />

            {/* ── Inner Tracking Ring ── */}
            <motion.div
                className="absolute rounded-full border"
                style={{
                    width: isPointer ? 48 : 32,
                    height: isPointer ? 48 : 32,
                    borderColor: color,
                    left: ringX,
                    top: ringY,
                    x: isPointer ? -24 : -16,
                    y: isPointer ? -24 : -16,
                    opacity: 0.6,
                }}
                animate={{
                    scale: isClicking ? 0.7 : 1,
                    borderWidth: isPointer ? 2 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />

            {/* ── Scanning Arcs (two rotating partial circles) ── */}
            <motion.svg
                className="absolute"
                width="52"
                height="52"
                viewBox="0 0 52 52"
                style={{
                    left: orbitX,
                    top: orbitY,
                    x: -26,
                    y: -26,
                }}
                animate={{
                    rotate: 360,
                    scale: isPointer ? 1.4 : 1,
                    opacity: isClicking ? 0.3 : 0.5,
                }}
                transition={{
                    rotate: { repeat: Infinity, duration: 4, ease: 'linear' },
                    scale: { type: 'spring', stiffness: 200, damping: 20 },
                    opacity: { duration: 0.15 },
                }}
            >
                {/* Arc 1 */}
                <path
                    d="M 26 4 A 22 22 0 0 1 48 26"
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.7"
                />
                {/* Arc 2 (opposite) */}
                <path
                    d="M 26 48 A 22 22 0 0 1 4 26"
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.4"
                />
                {/* Tiny tracking dots at arc ends */}
                <circle cx="48" cy="26" r="1.5" fill={color} opacity="0.8" />
                <circle cx="4" cy="26" r="1.5" fill={color} opacity="0.5" />
            </motion.svg>

            {/* ── Click Ripples ── */}
            <AnimatePresence>
                {ripples.map(ripple => (
                    <motion.div
                        key={ripple.id}
                        className="absolute rounded-full"
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                            x: -20,
                            y: -20,
                            width: 40,
                            height: 40,
                            border: `1px solid ${color}`,
                        }}
                        initial={{ scale: 0.3, opacity: 0.8 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                ))}
            </AnimatePresence>

            {/* ── Soft Glow Halo ── */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: 80,
                    height: 80,
                    left: orbitX,
                    top: orbitY,
                    x: -40,
                    y: -40,
                    background: `radial-gradient(circle, ${colorDim} 0%, transparent 70%)`,
                }}
                animate={{
                    scale: isPointer ? 1.3 : 1,
                    opacity: isClicking ? 0.2 : 0.4,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />
        </div>
    );
}
