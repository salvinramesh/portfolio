'use client';

import { useGame } from '@/context/GameContext';
import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import useSonic from '@/hooks/useSonic';

/**
 * Hidden Easter Eggs scattered around the site.
 * 1. Konami Code (Up Up Down Down Left Right Left Right B A)
 * 2. Click the footer 5 times
 * 3. Type "hack" in the terminal/chat
 * 4. Scroll to the very bottom of the threat map
 * 5. Triple-click the hero title
 */

export default function EasterEggs() {
    const { foundEasterEgg, setHackingMinigameActive } = useGame();
    const { setTheme } = useTheme();
    const { playSuccess } = useSonic();
    const [konamiProgress, setKonamiProgress] = useState(0);
    const [footerClicks, setFooterClicks] = useState(0);

    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    // Konami Code listener
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === konamiCode[konamiProgress]) {
                const next = konamiProgress + 1;
                if (next === konamiCode.length) {
                    // Trigger Minigame instead of instant success
                    setHackingMinigameActive(true);
                    setTheme('god');
                    playSuccess();
                    setKonamiProgress(0);
                } else {
                    setKonamiProgress(next);
                }
            } else {
                setKonamiProgress(0);
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [konamiProgress, foundEasterEgg, konamiCode]);

    // Footer click listener
    useEffect(() => {
        const footer = document.querySelector('footer');
        if (!footer) return;

        const handleClick = () => {
            setFooterClicks(prev => {
                const next = prev + 1;
                if (next >= 5) {
                    foundEasterEgg('footer_click', 'Footer Clicker');
                    return 0;
                }
                return next;
            });
        };

        footer.addEventListener('click', handleClick);
        return () => footer.removeEventListener('click', handleClick);
    }, [foundEasterEgg]);

    // Triple-click on hero title
    useEffect(() => {
        const heroTitle = document.querySelector('[data-hero-title]');
        if (!heroTitle) return;

        const handleTripleClick = (e: Event) => {
            const mouseEvent = e as MouseEvent;
            if (mouseEvent.detail === 3) {
                foundEasterEgg('triple_click_hero', 'Hero Clicker');
            }
        };

        heroTitle.addEventListener('click', handleTripleClick);
        return () => heroTitle.removeEventListener('click', handleTripleClick);
    }, [foundEasterEgg]);

    return null; // This component only adds event listeners
}
