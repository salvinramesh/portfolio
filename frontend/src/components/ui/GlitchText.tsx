'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface GlitchTextProps {
    text: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
    className?: string;
    delay?: number; // Delay in ms before decrypting starts
    duration?: number; // Duration of decrypting phase in ms
}

const CHARS = '!<>-_\\/[]{}—=+*^?#________';

export default function GlitchText({ text, as: Tag = 'span', className = '', delay = 0, duration = 1000 }: GlitchTextProps) {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const [displayText, setDisplayText] = useState(text.replace(/./g, ' ')); // Start blank
    
    useEffect(() => {
        if (!isInView) return;

        let frameId: number;
        let startTime: number;

        // Scramble function
        const scramble = (progress: number) => {
            let result = '';
            for (let i = 0; i < text.length; i++) {
                if (text[i] === ' ') {
                    result += ' ';
                    continue;
                }

                // Calculate when this specific character should resolve
                const resolvePoint = (i / text.length) * 0.8; 

                if (progress > resolvePoint) {
                    result += text[i]; // Correct char
                } else {
                    result += CHARS[Math.floor(Math.random() * CHARS.length)]; // Random char
                }
            }
            setDisplayText(result);
        };

        const startDecryption = () => {
            startTime = performance.now();
            
            const animate = (time: number) => {
                const elapsed = time - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                scramble(progress);

                if (progress < 1) {
                    frameId = requestAnimationFrame(animate);
                } else {
                    setDisplayText(text); // Ensure perfection at the end
                }
            };
            
            frameId = requestAnimationFrame(animate);
        };

        const timeoutId = setTimeout(startDecryption, delay);

        return () => {
            clearTimeout(timeoutId);
            cancelAnimationFrame(frameId);
        };
    }, [isInView, text, delay, duration]);

    return (
        <Tag ref={ref as React.RefObject<any>} className={className}>
            {displayText}
        </Tag>
    );
}
