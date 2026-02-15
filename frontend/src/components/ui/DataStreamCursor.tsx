'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface Particle {
    x: number;
    y: number;
    char: string;
    life: number;
    color: string;
}

export default function DataStreamCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();
    const particles = useRef<Particle[]>([]);
    const mouse = useRef({ x: 0, y: 0 });
    const lastPos = useRef({ x: 0, y: 0 });

    const chars = '0123456789ABCDEF';

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let isVisible = true;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY };

            // Spawn particles based on movement distance
            const dx = mouse.current.x - lastPos.current.x;
            const dy = mouse.current.y - lastPos.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 5) {
                const color = theme === 'matrix' ? '#0aff00' : theme === 'sunset' ? '#ff9d00' : '#00f3ff';
                particles.current.push({
                    x: mouse.current.x,
                    y: mouse.current.y,
                    char: chars[Math.floor(Math.random() * chars.length)],
                    life: 1.0,
                    color: color
                });
                lastPos.current = { x: mouse.current.x, y: mouse.current.y };
            }
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        resize();

        const animate = () => {
            if (!ctx || !canvas) return;
            if (!isVisible) {
                requestAnimationFrame(animate);
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];
                p.y += 2; // Fall down
                p.life -= 0.02;

                if (p.life <= 0) {
                    particles.current.splice(i, 1);
                } else {
                    ctx.font = '12px monospace';
                    ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
                    ctx.fillText(p.char, p.x, p.y);
                }
            }

            requestAnimationFrame(animate);
        };

        const handleVisibility = () => {
            isVisible = !document.hidden;
        };
        document.addEventListener('visibilitychange', handleVisibility);

        const animId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('visibilitychange', handleVisibility);
            cancelAnimationFrame(animId);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[9998] pointer-events-none"
        />
    );
}
