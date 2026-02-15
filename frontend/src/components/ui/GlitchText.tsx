"use client";

import { useState, useEffect, useRef } from 'react';

const CHARS = '!<>-_\\/[]{}—=+*^?#________';

interface GlitchTextProps {
    text: string;
    as?: React.ElementType;
    className?: string;
    triggerOnHover?: boolean;
}

export default function GlitchText({
    text,
    as: Component = 'span',
    className = '',
    triggerOnHover = true
}: GlitchTextProps) {
    const [displayText, setDisplayText] = useState(text);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const scramble = () => {
        let iteration = 0;

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setDisplayText(prev =>
                text
                    .split('')
                    .map((char, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)];
                    })
                    .join('')
            );

            if (iteration >= text.length) {
                if (intervalRef.current) clearInterval(intervalRef.current);
            }

            iteration += 1 / 3;
        }, 30);
    };

    useEffect(() => {
        scramble();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [text]);

    const Tag = Component as any;

    return (
        <Tag
            className={`${className} inline-block`}
            onMouseEnter={triggerOnHover ? scramble : undefined}
        >
            {displayText}
        </Tag>
    );
}
