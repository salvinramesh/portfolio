import { fetchAPI } from '@/lib/strapi';
import ReactMarkdown from 'react-markdown';

interface Experience {
    id: number;
    documentId: string;
    role: string;
    company: string;
    description: string;
    startDate: string;
    endDate?: string;
    current: boolean;
}

async function getExperiences() {
    const res = await fetchAPI<Experience[]>('/experiences', { sort: ['current:desc', 'startDate:desc'] });
    return res.data;
}

import GlitchText from '../ui/GlitchText';
import ParallaxText from '../ui/ParallaxText';
import ExperienceItemClient from './ExperienceItemClient';

// ... (existing imports)

export default async function ExperienceSection() {
    const experiences = await getExperiences();

    if (!experiences || experiences.length === 0) {
        return null;
    }

    return (
        <section id="experience" className="py-24 px-4 md:px-8 max-w-6xl mx-auto relative">
            {/* Section Header */}
            <ParallaxText speed={-30} className="mb-20">
                <div className="flex flex-col items-center">
                    <h2 className="text-5xl md:text-6xl font-black text-white font-orbitron mb-4 tracking-tighter">
                        <span className="text-glow"><GlitchText text="MISSION" /></span> <GlitchText text="LOGS" />
                    </h2>
                    <div className="flex items-center gap-2 text-cyan-500/50 font-mono text-xs tracking-[0.5em]">
                        <span>SYSTEM_HISTORY</span>
                        <div className="h-px w-12 bg-cyan-500/50"></div>
                        <span>v2.0.45</span>
                    </div>
                </div>
            </ParallaxText>

            <div className="relative border-l-2 border-cyan-900/30 ml-4 md:ml-10 space-y-12">
                {/* Main Vertical Line is the border of the container */}

                {experiences.map((exp) => (
                    <ExperienceItemClient key={exp.id} exp={exp} />
                ))}
            </div>
        </section>
    );
}
