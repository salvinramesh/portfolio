'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

interface HolographicImageProps {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
}

export default function HolographicImage({ src, alt, className = '', fill = false }: HolographicImageProps) {
    const [isHovered, setIsHovered] = useState(false);

    const isSvg = src.endsWith('.svg');
    const imageProps = fill ? { fill: true } : { width: 800, height: 600 };
    if (isSvg) Object.assign(imageProps, { unoptimized: true });

    return (
        <div
            className={`${fill ? 'absolute inset-0' : 'relative'} overflow-hidden group ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Base Image */}
            <div className={`relative z-10 transition-opacity duration-300 w-full h-full ${isHovered ? 'opacity-80' : 'opacity-100'}`}>
                <Image
                    src={src}
                    alt={alt}
                    {...imageProps}
                    className="object-cover"
                />
            </div>

            {/* Red Channel (Shifted Right) */}
            <div
                className={`absolute inset-0 z-0 mix-blend-screen opacity-0 transition-opacity duration-100 ${isHovered ? 'opacity-70 animate-pulse' : ''}`}
                style={{ transform: 'translateX(4px)', filter: 'hue-rotate(-90deg)' }}
            >
                <Image
                    src={src}
                    alt=""
                    {...imageProps}
                    className="object-cover"
                />
            </div>

            {/* Blue Channel (Shifted Left) */}
            <div
                className={`absolute inset-0 z-0 mix-blend-screen opacity-0 transition-opacity duration-100 ${isHovered ? 'opacity-70 animate-pulse' : ''}`}
                style={{ transform: 'translateX(-4px)', filter: 'hue-rotate(90deg)' }}
            >
                <Image
                    src={src}
                    alt=""
                    {...imageProps}
                    className="object-cover"
                />
            </div>

            {/* Scanline Overlay */}
            {isHovered && (
                <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
            )}

            {/* Holographic Glitch Block */}
            {isHovered && (
                <motion.div
                    className="absolute inset-0 z-30 pointer-events-none bg-cyan-500/20 mix-blend-overlay"
                    initial={{ clipPath: 'inset(0 0 0 0)' }}
                    animate={{
                        clipPath: [
                            'inset(20% 0 80% 0)',
                            'inset(60% 0 10% 0)',
                            'inset(40% 0 50% 0)',
                            'inset(0 0 0 0)'
                        ]
                    }}
                    transition={{
                        duration: 0.2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        times: [0, 0.4, 0.8, 1]
                    }}
                />
            )}
        </div>
    );
}
