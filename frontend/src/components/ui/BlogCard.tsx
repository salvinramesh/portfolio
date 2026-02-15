'use client';

import { useState, useEffect, useRef } from 'react';

interface BlogCardProps {
    title: string;
    summary: string;
    content: string;
    tags: string[];
    publishedAt: string;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>{}[]';

function DecryptText({ text, trigger }: { text: string; trigger: boolean }) {
    const [displayed, setDisplayed] = useState('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!trigger) {
            // Show encrypted version
            setDisplayed(text.split('').map(c => c === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]).join(''));
            return;
        }

        let iteration = 0;
        const maxIterations = text.length;

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setDisplayed(
                text.split('').map((char, idx) => {
                    if (idx < iteration) return char;
                    if (char === ' ' || char === '\n') return char;
                    return CHARS[Math.floor(Math.random() * CHARS.length)];
                }).join('')
            );
            iteration += 2;
            if (iteration >= maxIterations + 10) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setDisplayed(text);
            }
        }, 20);

        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [trigger, text]);

    return <span className="font-mono text-sm whitespace-pre-wrap">{displayed}</span>;
}

import HoloCard from './HoloCard';

export default function BlogCard({ title, summary, content, tags, publishedAt }: BlogCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [decrypting, setDecrypting] = useState(false);

    const handleExpand = () => {
        if (!isExpanded) {
            setIsExpanded(true);
            setTimeout(() => setDecrypting(true), 100);
        } else {
            setDecrypting(false);
            setTimeout(() => setIsExpanded(false), 300);
        }
    };

    return (
        <HoloCard className="cyber-box p-6 hover:border-cyan-500/50 transition-all duration-300 group cursor-pointer"
        >
            <div onClick={handleExpand}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">
                            {isExpanded ? '[ DECRYPTED ]' : '[ ENCRYPTED ]'}
                        </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-600">
                        {new Date(publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-orbitron text-lg text-white mb-2 group-hover:text-glow transition-all">
                    {title}
                </h3>

                {/* Summary */}
                <p className="text-gray-400 text-sm mb-3">{summary}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags?.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] font-mono border border-cyan-800/50 text-cyan-400 bg-cyan-900/20 rounded">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Expandable Content */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-cyan-900/30">
                        <div className="text-green-400/80 leading-relaxed">
                            <DecryptText text={content} trigger={decrypting} />
                        </div>
                    </div>
                )}

                {/* Action */}
                <div className="text-right mt-2">
                    <span className="text-[10px] font-mono text-cyan-600 group-hover:text-cyan-400 transition-colors">
                        {isExpanded ? '[ CLOSE FILE ]' : '[ ACCESS FILE → ]'}
                    </span>
                </div>
            </div>
        </HoloCard>
    );
}
