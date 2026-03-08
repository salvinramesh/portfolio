'use client';

import { useEffect, useState } from 'react';

export default function GridBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none perspective-[1000px]">
            {/* The Grid Layer itself */}
            <div className="absolute w-[200vw] h-[200vh] left-[-50vw] top-[30vh] transform-gpu translate-z-0 rotate-x-[75deg]">
                
                {/* Vertical Lines */}
                <div 
                    className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(0,243,255,0.15)_1px,transparent_1px)]"
                    style={{ backgroundSize: '4rem 100%' }}
                />

                {/* Horizontal Sliding Lines */}
                <div 
                    className="absolute inset-0 z-10 bg-[linear-gradient(to_bottom,rgba(0,243,255,0.15)_1px,transparent_1px)] animate-grid-scroll"
                    style={{ backgroundSize: '100% 4rem' }}
                />

                {/* Cyber Sunset Glow at the Horizon */}
                <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-purple-900/30 via-cyan-900/10 to-transparent blur-3xl z-20"></div>
            </div>

            {/* Dark horizon fade so the grid fades out at the "horizon" line */}
            <div className="absolute top-[30vh] left-0 right-0 h-48 bg-gradient-to-b from-black via-black/80 to-transparent z-[-1]"></div>
        </div>
    );
}
