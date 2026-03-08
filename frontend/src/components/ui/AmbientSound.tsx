'use client';

import { useEffect, useState } from 'react';
import useSonic from '@/hooks/useSonic';
import { useTheme } from '@/context/ThemeContext';
import { Volume2, VolumeX } from 'lucide-react';

export default function AmbientSound() {
    const { playAmbient, stopAmbient, setAmbientFrequency } = useSonic();
    const { theme } = useTheme();
    const [isMuted, setIsMuted] = useState(true);

    // Handle Play/Stop based on user toggle
    useEffect(() => {
        if (!isMuted) {
            playAmbient(theme);
        } else {
            stopAmbient();
        }
        return () => stopAmbient();
    }, [theme, isMuted, playAmbient, stopAmbient]);

    // Handle Scroll -> Frequency modulation
    useEffect(() => {
        if (isMuted) return;

        const handleScroll = () => {
            const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
            // Default base is 40Hz. Let's modulate it up to 120Hz based on scroll depth.
            const newFreq = 40 + (scrollPercent * 80); 
            setAmbientFrequency(newFreq);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMuted, setAmbientFrequency]);

    return (
        <button
            onClick={() => setIsMuted(!isMuted)}
            className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-black/80 border border-gray-800 backdrop-blur-md rounded-full flex items-center justify-center hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all group"
            title={isMuted ? "Initialize Audio Subsystem" : "Mute Audio Subsystem"}
        >
            {isMuted ? (
                <VolumeX className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors" />
            ) : (
                <div className="relative flex items-center justify-center w-full h-full">
                    {/* Pulsing ring when active */}
                    <div className="absolute inset-0 rounded-full border border-cyan-500 animate-ping opacity-20"></div>
                    <Volume2 className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                </div>
            )}
        </button>
    );
}
