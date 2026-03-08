'use client';

import { useCallback } from 'react';
import { SoundManager } from '@/lib/audio';

export default function useSonic() {
    const playHover = useCallback(() => {
        SoundManager.playHover();
    }, []);

    const playClick = useCallback(() => {
        SoundManager.playClick();
    }, []);

    const playSuccess = useCallback(() => {
        SoundManager.playSuccess();
    }, []);

    const playAmbient = useCallback((theme: string = 'cyber') => {
        SoundManager.playAmbient(theme);
    }, []);

    const stopAmbient = useCallback(() => {
        SoundManager.stopAmbient();
    }, []);

    const setAmbientFrequency = useCallback((freq: number) => {
        SoundManager.setAmbientFrequency(freq);
    }, []);

    return {
        playHover,
        playClick,
        playSuccess,
        playAmbient,
        stopAmbient,
        setAmbientFrequency
    };
}
