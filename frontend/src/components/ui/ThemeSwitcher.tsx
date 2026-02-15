'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Palette } from 'lucide-react';
import useSonic from '@/hooks/useSonic';

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const { playClick, playHover } = useSonic();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const themes = [
        { id: 'cyber', name: 'CYBER', hex: '#00f3ff' },
        { id: 'matrix', name: 'MATRIX', hex: '#0aff00' },
        { id: 'sunset', name: 'SUNSET', hex: '#ff9d00' },
    ] as const;

    const currentTheme = themes.find(t => t.id === theme) || themes[0];

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            {/* Trigger button — matches navbar icon style */}
            <button
                onClick={() => { setIsOpen(!isOpen); playClick(); }}
                onMouseEnter={playHover}
                className="p-2 text-cyan-500 hover:text-white transition-colors border border-transparent hover:border-cyan-500/50 rounded-sm flex items-center gap-1.5"
                aria-label="Switch Theme"
            >
                <Palette className="w-5 h-5" style={{ color: currentTheme.hex }} />
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 bg-black/95 border border-cyan-900/50 backdrop-blur-xl rounded-lg shadow-[0_0_30px_rgba(0,243,255,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 min-w-[160px]">
                    <div className="px-3 py-2 border-b border-cyan-900/30">
                        <span className="text-[10px] font-mono text-cyan-500/70 tracking-widest">SYSTEM_THEME</span>
                    </div>
                    <div className="p-1.5">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id);
                                    playClick();
                                    setIsOpen(false);
                                }}
                                onMouseEnter={playHover}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 font-mono text-xs tracking-wider ${theme === t.id
                                        ? 'bg-white/5 text-white'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                                    }`}
                            >
                                <div
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${theme === t.id ? 'scale-110' : ''}`}
                                    style={{
                                        backgroundColor: t.hex,
                                        boxShadow: theme === t.id ? `0 0 8px ${t.hex}` : 'none',
                                    }}
                                />
                                <span>{t.name}</span>
                                {theme === t.id && (
                                    <span className="ml-auto text-[9px] text-cyan-500/50 tracking-widest">ACTIVE</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
