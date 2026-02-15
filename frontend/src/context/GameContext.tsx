'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

interface Mission {
    id: string;
    title: string;
    description: string;
    xp: number;
    completed: boolean;
}

interface GameState {
    clearanceLevel: number;
    eggsFound: string[];
    maxLevel: number;
    missions: Mission[];
    xp: number;
}

interface GameContextType {
    state: GameState;
    foundEasterEgg: (id: string, name: string) => void;
    checkMission: (actionId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const INITIAL_MISSIONS: Mission[] = [
    { id: 'terminal_sudo', title: 'Root Access', description: "Attempt to gain superuser privileges in the terminal.", xp: 50, completed: false },
    { id: 'audio_link', title: 'Signal Intercept', description: "Activate the quantum audio visualizer link.", xp: 30, completed: false },
    { id: 'konami_code', title: 'Legacy Protocol', description: "Input the ancient Konami code sequence.", xp: 100, completed: false },
    { id: 'theme_hacker', title: 'Neon Runner', description: "Switch to the 'Cyber' system theme.", xp: 20, completed: false },
];

export function GameProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<GameState>({
        clearanceLevel: 1,
        eggsFound: [],
        maxLevel: 5,
        missions: INITIAL_MISSIONS,
        xp: 0,
    });

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('salvin_game_v4');
        if (saved) {
            setState(JSON.parse(saved));
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('salvin_game_v4', JSON.stringify(state));
    }, [state]);

    const foundEasterEgg = useCallback((id: string, name: string) => {
        setState(prev => {
            if (prev.eggsFound.includes(id)) return prev;

            // toast.success(`EASTER EGG FOUND: ${name}`);
            const newCount = prev.eggsFound.length + 1;

            return {
                ...prev,
                eggsFound: [...prev.eggsFound, id],
            };
        });

        // Check if this egg completes a mission
        if (id === 'konami') checkMission('konami_code');
    }, []);

    const checkMission = useCallback((actionId: string) => {
        setState(prev => {
            const missionIndex = prev.missions.findIndex(m => m.id === actionId);
            if (missionIndex === -1 || prev.missions[missionIndex].completed) return prev;

            const newMissions = [...prev.missions];
            newMissions[missionIndex] = { ...newMissions[missionIndex], completed: true };

            const xpGained = newMissions[missionIndex].xp;
            const newXp = prev.xp + xpGained;

            // Calculate Level: 1 + floor(xp / 100)
            const newLevel = Math.min(prev.maxLevel, 1 + Math.floor(newXp / 100));

            // Notify
            // toast.success(`MISSION COMPLETE: ${newMissions[missionIndex].title} (+${xpGained} XP)`);
            if (newLevel > prev.clearanceLevel) {
                // toast.success(`PROMOTION: SECURITY CLEARANCE LEVEL ${newLevel}`);
            }

            return {
                ...prev,
                missions: newMissions,
                xp: newXp,
                clearanceLevel: newLevel,
            };
        });
    }, []);

    return (
        <GameContext.Provider value={{ state, foundEasterEgg, checkMission }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
