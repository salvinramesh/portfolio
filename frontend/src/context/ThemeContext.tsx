'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'cyber' | 'matrix' | 'sunset' | 'god';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('cyber');

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);

        // Play sound on theme change? Maybe in the switcher component.
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
