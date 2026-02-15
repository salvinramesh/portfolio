'use client';

import { motion } from 'framer-motion';

export default function GlitchTransition() {
    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-cyan-500 mix-blend-exclusion pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
                opacity: [0, 1, 0, 0.5, 0],
                x: [0, -20, 20, -10, 0],
                skewX: [0, 10, -10, 5, 0]
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
    );
}
