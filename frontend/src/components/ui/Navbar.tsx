'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Terminal, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import useSonic from '@/hooks/useSonic';
import ThemeSwitcher from './ThemeSwitcher';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const { playHover, playClick, playAmbient, stopAmbient } = useSonic();

    const handleToggleAudio = () => {
        const newState = !isAudioEnabled;
        setIsAudioEnabled(newState);

        if (newState) {
            playClick();
            playAmbient();
        } else {
            stopAmbient();
        }
    };

    return (
        <nav className="fixed w-full z-50 top-0 start-0 border-b border-cyan-900/50 bg-black/80 backdrop-blur-md">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link
                    href="/"
                    className="flex items-center space-x-3 rtl:space-x-reverse group"
                    onMouseEnter={playHover}
                    onClick={playClick}
                >
                    <div className="p-1 border border-cyan-500 rounded-sm group-hover:bg-cyan-500/10 transition-colors">
                        <Terminal className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className="self-center text-2xl font-bold whitespace-nowrap text-glow tracking-widest font-orbitron text-white">
                        SALVIN<span className="text-cyan-500 text-sm align-top opacity-50">_SYS</span>
                    </span>
                </Link>
                <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse items-center gap-4">
                    <button
                        onClick={handleToggleAudio}
                        className="p-2 text-cyan-500 hover:text-white transition-colors border border-transparent hover:border-cyan-500/50 rounded-sm"
                        aria-label="Toggle Audio"
                        onMouseEnter={playHover}
                    >
                        {isAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                    <ThemeSwitcher />

                    <button
                        onClick={() => {
                            setIsOpen(!isOpen);
                            playClick();
                        }}
                        type="button"
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-cyan-500 rounded-sm md:hidden hover:bg-cyan-900/20 focus:outline-none border border-transparent focus:border-cyan-500"
                        aria-controls="navbar-sticky"
                        aria-expanded={isOpen}
                        onMouseEnter={playHover}
                    >
                        <span className="sr-only">Open main menu</span>
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
                <div className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${isOpen ? 'block' : 'hidden'}`} id="navbar-sticky">
                    <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-cyan-900/30 rounded-lg bg-black/40 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
                        {['Home', 'About', 'Skills', 'Projects', 'Contact'].map((item) => (
                            <li key={item}>
                                <Link
                                    href={`#${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                                    className="block py-2 px-3 text-gray-400 font-rajdhani uppercase tracking-wider hover:text-cyan-400 hover:text-glow transition-all md:p-0 relative group"
                                    onMouseEnter={playHover}
                                    onClick={playClick}
                                >
                                    <span className="opacity-0 group-hover:opacity-100 absolute -left-3 text-cyan-500 text-xs animate-pulse text-glow">{'>'}</span>
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
