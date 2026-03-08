'use client';

import { useTheme } from '@/context/ThemeContext';
import { Power, AlertTriangle, Monitor } from 'lucide-react';
import { useState } from 'react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    // Filter out 'god' as it's an Easter egg theme, not a selectable switch
    const availableThemes = [
        { id: 'cyber', name: 'CYBER', icon: Monitor, color: 'text-cyan-400' },
        { id: 'matrix', name: 'MATRIX', icon: Power, color: 'text-green-500' },
        { id: 'critical', name: 'OVERRIDE', icon: AlertTriangle, color: 'text-red-500' },
    ] as const;

    const handleThemeChange = (newTheme: typeof availableThemes[number]['id']) => {
        setTheme(newTheme);
        setIsOpen(false);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cyber_log', { 
                detail: `[SYS] ENVIRONMENT OVERRIDE: ${newTheme.toUpperCase()} PROTOCOL ENGAGED.` 
            }));
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
            {/* Expanded Menu */}
            <div className={`flex flex-col gap-2 transition-all duration-300 origin-bottom ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                {availableThemes.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => handleThemeChange(t.id)}
                        className={`flex items-center gap-2 px-3 py-2 bg-black/80 border border-gray-800 backdrop-blur-md rounded-md hover:border-gray-500 transition-colors ${theme === t.id ? 'border-gray-500 bg-gray-900/50' : ''}`}
                    >
                        <span className={`text-[10px] font-mono ${t.color}`}>{t.name}</span>
                        <t.icon className={`w-4 h-4 ${t.color}`} />
                    </button>
                ))}
            </div>

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 bg-black/80 border border-gray-800 backdrop-blur-md rounded-full flex items-center justify-center hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all"
                title="System Override"
            >
                <Power className={`w-5 h-5 ${
                    theme === 'cyber' ? 'text-cyan-400' : 
                    theme === 'matrix' ? 'text-green-500' : 
                    theme === 'critical' ? 'text-red-500' : 
                    'text-gray-400'
                } ${theme === 'critical' ? 'animate-pulse' : ''}`} />
            </button>
        </div>
    );
}
