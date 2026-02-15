'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function AudioVisualizer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<OscillatorNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);
    const animationRef = useRef<number | null>(null);

    const { theme } = useTheme();
    const color = theme === 'matrix' ? '#0aff00' : theme === 'sunset' ? '#ff9d00' : '#00f3ff';

    const toggleAudio = () => {
        if (isPlaying) {
            stopAudio();
        } else {
            startAudio();
        }
    };

    const startAudio = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContext();
            audioContextRef.current = ctx;

            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.5;
            analyserRef.current = analyser;

            // Create a low frequency drone
            const oscillator = ctx.createOscillator();
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = 50;

            const gainNode = ctx.createGain();
            gainNode.gain.value = 0.02; // Very quiet ambient
            gainRef.current = gainNode;

            oscillator.connect(gainNode);
            gainNode.connect(analyser);
            analyser.connect(ctx.destination);

            oscillator.start();
            sourceRef.current = oscillator;
            setIsPlaying(true);
            draw();
        } catch (e) {
            console.error("Audio init failed", e);
        }
    };

    const stopAudio = () => {
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current.disconnect();
        }
        if (gainRef.current) gainRef.current.disconnect();
        if (analyserRef.current) analyserRef.current.disconnect();
        if (audioContextRef.current) audioContextRef.current.close();
        if (animationRef.current) cancelAnimationFrame(animationRef.current);

        setIsPlaying(false);
        // Clear canvas
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const renderFrame = () => {
            animationRef.current = requestAnimationFrame(renderFrame);
            if (!analyserRef.current) return;

            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;

                ctx.fillStyle = color;
                // Draw logic with some opacity
                ctx.globalAlpha = 0.6;
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

                x += barWidth + 1;
            }
        };

        renderFrame();
    };

    // Stop audio on unmount
    useEffect(() => {
        return () => stopAudio();
    }, []);

    return (
        <div className="fixed top-24 right-6 z-40 flex flex-col items-end gap-2 group">
            <canvas
                ref={canvasRef}
                width={120}
                height={40}
                className="pointer-events-none transition-opacity duration-500"
                style={{ opacity: isPlaying ? 0.8 : 0 }}
            />
            <button
                onClick={toggleAudio}
                className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur border rounded-full text-[10px] font-mono hover:bg-white/10 transition-colors"
                style={{ borderColor: `${color}50`, color: color }}
            >
                {isPlaying ? (
                    <span className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }}></span>
                            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }}></span>
                        </span>
                        LINK: ON
                    </span>
                ) : (
                    <span className="flex items-center gap-2 text-gray-400">
                        <span className="w-2 h-2 rounded-full border border-gray-600" />
                        LINK: OFF
                    </span>
                )}
            </button>
        </div>
    );
}
