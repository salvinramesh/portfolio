'use client';

import { useEffect } from 'react';
import useSonic from '@/hooks/useSonic';
import { useTheme } from '@/context/ThemeContext';

export default function AmbientSound() {
    const { playAmbient, stopAmbient } = useSonic();
    const { theme } = useTheme();

    useEffect(() => {
        // User interaction is required to start audio context usually
        const startAudio = () => {
            playAmbient(theme);
            window.removeEventListener('click', startAudio);
            window.removeEventListener('keydown', startAudio);
        };

        window.addEventListener('click', startAudio);
        window.addEventListener('keydown', startAudio);

        return () => {
            stopAmbient();
            window.removeEventListener('click', startAudio);
            window.removeEventListener('keydown', startAudio);
        };
    }, [theme, playAmbient, stopAmbient]);

    return null;
}
