'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';

export default function QuakeTerminal() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<string[]>(['> Welcome to SALVIN_OS v4.0. Type "help" for commands.']);
    const [isMaximized, setIsMaximized] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { checkMission } = useGame();

    // Toggle with backtick
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '`') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Auto-focus and scroll
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleCommand = (cmd: string) => {
        const trimmed = cmd.trim().toLowerCase();
        const args = trimmed.split(' ');
        const outputs = [`$ ${cmd}`];

        switch (args[0]) {
            case 'help':
                outputs.push(
                    'AVAILABLE COMMANDS:',
                    '  help        - Show this message',
                    '  clear       - Clear terminal',
                    '  ls          - List directories',
                    '  cd [dir]    - Navigate to directory',
                    '  cat [file]  - Read file content',
                    '  whoami      - Print current user',
                    '  sudo        - ???',
                    '  exit        - Close terminal'
                );
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'ls':
                outputs.push(
                    'drwxr-xr-x  about/',
                    'drwxr-xr-x  projects/',
                    'drwxr-xr-x  skills/',
                    '-rwxr-xr-x  contact.exe',
                    '-rw-r--r--  resume.pdf'
                );
                break;
            case 'cd':
                if (!args[1]) {
                    outputs.push('usage: cd [directory]');
                } else if (['about', 'projects', 'skills'].includes(args[1])) {
                    outputs.push(`Navigating to ${args[1]}...`);
                    // Smooth scroll to section
                    document.getElementById(args[1])?.scrollIntoView({ behavior: 'smooth' });
                    setIsOpen(false);
                } else {
                    outputs.push(`bash: cd: ${args[1]}: No such file or directory`);
                }
                break;
            case 'cat':
                if (args[1] === 'resume.pdf') {
                    outputs.push('Opening resume...');
                    window.open('/resume.pdf', '_blank');
                } else {
                    outputs.push('cat: read error: Permission denied or file not found');
                }
                break;
            case 'whoami':
                outputs.push('guest@salvin.me');
                break;
            case 'sudo':
                checkMission('terminal_sudo');
                outputs.push('ACCESS GRANTED: Root privileges simulated for guest user.');
                outputs.push('MISSION COMPLETE: "Root Access"');
                break;
            case 'exit':
                setIsOpen(false);
                break;
            default:
                if (trimmed !== '') {
                    outputs.push(`bash: ${args[0]}: command not found`);
                }
        }

        setHistory((prev) => [...prev, ...outputs]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleCommand(input);
        setInput('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '-100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '-100%' }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    className={`fixed top-0 left-0 right-0 z-[100] bg-black/95 border-b-2 border-green-500 shadow-[0_0_30px_rgba(0,255,0,0.2)] text-green-500 font-mono text-sm ${isMaximized ? 'h-screen' : 'h-[50vh]'
                        }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-2 bg-green-900/20 border-b border-green-500/30 select-none">
                        <div className="flex items-center gap-2">
                            <TerminalIcon size={16} />
                            <span className="font-bold">TERMINAL // GUEST_ACCESS</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsMaximized(!isMaximized)} className="hover:text-white">
                                {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                            <button onClick={() => setIsOpen(false)} className="hover:text-red-500">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div
                        ref={scrollRef}
                        className="p-4 h-[calc(100%-40px)] overflow-y-auto scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-transparent"
                        onClick={() => inputRef.current?.focus()}
                    >
                        {history.map((line, i) => (
                            <div key={i} className="mb-1 whitespace-pre-wrap">{line}</div>
                        ))}

                        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
                            <span className="text-green-300">guest@salvin:~#</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 bg-transparent outline-none border-none text-green-400 placeholder-green-800"
                                autoFocus
                            />
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
