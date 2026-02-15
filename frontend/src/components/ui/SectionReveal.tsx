'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function SectionReveal({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 15 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ perspective: 1000 }}
            className="transform-gpu"
        >
            {children}
        </motion.div>
    );
}
