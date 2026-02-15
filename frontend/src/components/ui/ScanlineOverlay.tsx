"use client";

import { useEffect, useState } from 'react';

export default function ScanlineOverlay() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {/* Scanlines */}
            <div className="absolute inset-0 bg-[url('/scanlines.png')] opacity-[0.03] animate-scanlines mix-blend-overlay"></div>

            {/* Vignette - Reduced opacity for clarity */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.3)_100%)]"></div>

            {/* Subtle RGB Split / Chromatic Aberration Simulation (Static) */}
            <div className="hidden md:block absolute inset-0 opacity-[0.01]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, #ff0000 0, #ff0000 1px, transparent 1px, transparent 3px, #00ff00 3px, #00ff00 4px, transparent 4px, transparent 6px, #0000ff 6px, #0000ff 7px, transparent 7px, transparent 9px)'
                }}>
            </div>
        </div>
    );
}
