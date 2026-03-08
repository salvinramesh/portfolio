'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Minus, Square } from 'lucide-react';
import useSonic from '@/hooks/useSonic';

interface CommandHistory {
    cmd: string;
    output: React.ReactNode;
}

export default function TerminalModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<CommandHistory[]>([
        { cmd: 'init', output: 'Welcome to SALVIN_SYS v2.0. Type "help" for available commands.' }
    ]);
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const { playClick, playSuccess } = useSonic();

    // Toggle with backtick (~)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '`' || e.key === '~') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
                if (!isOpen) playClick();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, playClick]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Scroll to bottom on history change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        playClick();
        const cmd = input.trim().toLowerCase();
        let output: React.ReactNode = '';

        switch (cmd) {
            case 'help':
                output = (
                    <ul className="list-disc list-inside text-cyan-300">
                        <li><strong className="text-white">about</strong> - Display profile summary</li>
                        <li><strong className="text-white">skills</strong> - List technical skills</li>
                        <li><strong className="text-white">projects</strong> - List deployed projects</li>
                        <li><strong className="text-white">contact</strong> - Show contact info</li>
                        <li><strong className="text-white">clear</strong> - Clear terminal history</li>
                        <li><strong className="text-white">exit</strong> - Close terminal</li>
                    </ul>
                );
                break;
            case 'about':
                output = "IT Engineer specializing in Linux Systems, Automation, and Secure Infrastructure.";
                break;
            case 'skills':
                output = (
                    <div className="grid grid-cols-2 gap-2">
                        <span>[+] Linux Administration</span>
                        <span>[+] Bash Scripting</span>
                        <span>[+] Docker / Containers</span>
                        <span>[+] Network Security</span>
                    </div>
                );
                break;
            case 'projects':
                output = "Accessing database... [3] Projects found. Visit the 'Projects' section for details.";
                break;
            case 'contact':
                output = (
                    <div className="space-y-1">
                        <div><strong className="text-cyan-400">Email:</strong> salvinramesh@gmail.com</div>
                        <div><strong className="text-purple-400">Phone:</strong> +91 9895762262</div>
                        <div className="text-gray-500 mt-2">--------------------------------</div>
                        <div className="flex gap-4">
                            <a href="https://github.com/salvinramesh" target="_blank" className="text-white hover:underline">GitHub</a>
                            <a href="https://linkedin.com/in/salvinramesh" target="_blank" className="text-blue-400 hover:underline">LinkedIn</a>
                            <a href="https://x.com/salvinramesh1" target="_blank" className="text-gray-300 hover:underline">X.com</a>
                            <a href="https://instagram.com/salvinramesh" target="_blank" className="text-pink-400 hover:underline">Instagram</a>
                        </div>
                    </div>
                );
                break;
            case 'clear':
                setHistory([]);
                setInput('');
                return;
            case 'exit':
                setIsOpen(false);
                setInput('');
                return;
            default:
                output = <span className="text-red-500">Command not found: {cmd}</span>;
        }

        setHistory([...history, { cmd: input, output }]);
        setInput('');
        playSuccess();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl bg-black border-2 border-cyan-900 shadow-[0_0_30px_rgba(0,243,255,0.2)] rounded-lg overflow-hidden flex flex-col font-mono text-sm md:text-base animate-in fade-in zoom-in duration-200">

                {/* Title Bar */}
                <div className="bg-cyan-950/50 border-b border-cyan-900 p-2 flex items-center justify-between select-none">
                    <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">SALVIN_SYS_TERMINAL</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-cyan-900/50 rounded"><Minus className="w-3 h-3 text-cyan-400" /></button>
                        <button className="p-1 hover:bg-cyan-900/50 rounded"><Square className="w-3 h-3 text-cyan-400" /></button>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-red-900/50 rounded hover:text-red-500"><X className="w-3 h-3 text-cyan-400" /></button>
                    </div>
                </div>

                {/* Terminal Body */}
                <div
                    className="flex-1 p-4 bg-black/95 text-gray-300 h-[60vh] overflow-y-auto font-rajdhani"
                    onClick={() => inputRef.current?.focus()}
                >
                    {history.map((entry, i) => (
                        <div key={i} className="mb-2">
                            <div className="flex items-center gap-2 text-cyan-500">
                                <span>root@salvin-sys:~#</span>
                                <span className="text-white">{entry.cmd}</span>
                            </div>
                            <div className="ml-4 mt-1 text-gray-400">
                                {entry.output}
                            </div>
                        </div>
                    ))}

                    {/* Input Line */}
                    <form onSubmit={handleCommand} className="flex items-center gap-2 mt-2">
                        <span className="text-cyan-500 shrink-0">root@salvin-sys:~#</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="bg-transparent border-none outline-none text-white w-full caret-cyan-500"
                            autoFocus
                            autoComplete="off"
                        />
                    </form>
                    <div ref={bottomRef}></div>
                </div>

                {/* Footer Status */}
                <div className="bg-cyan-950/30 border-t border-cyan-900 p-1 px-4 text-xs text-cyan-600 flex justify-between">
                    <span>STATUS: ONLINE</span>
                    <span>SECURE CONNECTION</span>
                </div>
            </div>
        </div>
    );
}
