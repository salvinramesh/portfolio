'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Binary } from 'lucide-react';

export default function MatrixRain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        if (!isEnabled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const columns = Math.floor(width / 20);
        const drops: number[] = new Array(columns).fill(1);

        const chars = '0123456789ABCDEFﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';

        const draw = () => {
            // Semi-transparent black to create trail effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = theme === 'matrix' ? '#0aff00' : theme === 'sunset' ? '#ff9d00' : '#00f3ff';
            ctx.font = '15px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * 20, drops[i] * 20);

                if (drops[i] * 20 > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33);

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, [isEnabled, theme]);

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsEnabled(!isEnabled)}
                className={`fixed top-24 right-4 z-50 p-2 rounded-lg border transition-all duration-300 ${isEnabled ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.3)]' : 'bg-black/50 border-gray-800 text-gray-500 hover:text-cyan-400'}`}
                title="Toggle Matrix Rain"
            >
                <Binary size={20} />
            </button>

            {/* Canvas Layer */}
            <AnimatePresence>
                {isEnabled && (
                    <motion.canvas
                        ref={canvasRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }} // Subtle overlay
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="fixed inset-0 z-0 pointer-events-none mix-blend-screen"
                    />
                )}
            </AnimatePresence>
        </>
    );
}
