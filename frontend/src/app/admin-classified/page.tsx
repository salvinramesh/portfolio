'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Terminal, ShieldAlert, Cpu } from 'lucide-react';
import GlitchText from '@/components/ui/GlitchText';

export default function AdminClassifiedPage() {
    const [lines, setLines] = useState<string[]>([]);

    useEffect(() => {
        const dummyData = [
            "INITIALIZING NEURO-LINK...",
            "BYPASSING SECURITY PROTOCOLS [OK]",
            "ACCESSING ROOT MAINFRAME [OK]",
            "DECRYPTING DOSSIER: SALVIN_RAMESH.DAT",
            "----------------------------------------",
            "TARGET ALIAS: 'THE ARCHITECT'",
            "THREAT LEVEL: OMEGA (HIGHLY SKILLED)",
            "KNOWN AFFILIATIONS: NEXT.JS, REACT, NODE.JS",
            "LAST KNOWN LOCATION: CYBERSPACE SECTION 4",
            "----------------------------------------",
            "WARNING: UNAUTHORIZED VIEWING OF THIS DATA",
            "WILL RESULT IN IMMEDIATE TRACE-ROUTE AND SEC-OP DEPLOYMENT.",
            "END OF FILE."
        ];

        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < dummyData.length) {
                setLines(prev => [...prev, dummyData[currentIndex]]);
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono p-8 relative overflow-hidden flex flex-col items-center justify-center">
            {/* CRT Overlay */}
            <div className="absolute inset-0 bg-[url('/scanlines.png')] opacity-20 pointer-events-none z-50 mix-blend-overlay border-[10px] border-gray-900 rounded-[2rem]"></div>
            
            <div className="absolute top-8 right-8 flex items-center gap-2 animate-pulse text-red-500">
                <ShieldAlert className="w-6 h-6" />
                <span className="font-bold tracking-widest">SEC_LEVEL: BLACK</span>
            </div>

            <div className="w-full max-w-3xl border border-green-500/30 p-8 relative z-10 bg-black/80 shadow-[0_0_30px_rgba(0,255,0,0.1)]">
                <div className="flex items-center gap-4 mb-8 border-b border-green-500/30 pb-4">
                    <Cpu className="w-10 h-10 text-green-400" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-widest text-white">
                            <GlitchText text="[CLASSIFIED OVERRIDE]" duration={1500} />
                        </h1>
                        <p className="text-sm text-green-400/60 mt-1">RESTRICTED ACCESS GRANTED</p>
                    </div>
                </div>

                <div className="space-y-4 mb-12 min-h-[300px]">
                    {lines.map((line, i) => (
                        <div key={i} className="flex gap-4">
                            <span className="text-gray-600 select-none">{String(i + 1).padStart(2, '0')}</span>
                            <span className={line.includes('WARNING') ? 'text-red-500 font-bold' : ''}>
                                {line}
                            </span>
                        </div>
                    ))}
                    <div className="w-3 h-5 bg-green-500 animate-pulse mt-4"></div>
                </div>

                <div className="border-t border-green-500/30 pt-6 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 hover:scale-105 transition-all border border-transparent hover:border-cyan-500/50 px-4 py-2 bg-gray-900/50 rounded-md">
                        <Terminal className="w-4 h-4" />
                        <span>CLOSE_CONNECTION()</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
