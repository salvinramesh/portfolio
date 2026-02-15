'use client';

import { useState } from 'react';
import { Grid, Box, Code, Server, Database, Terminal, Cpu, Cloud, Globe, Lock, LucideIcon } from 'lucide-react';
import SkillsGraph from '@/components/3d/SkillsGraph';
import SkillCard from '../ui/SkillCard';
import ParallaxText from '../ui/ParallaxText';

interface Skill {
    id: number;
    documentId: string;
    name: string;
    category: string;
    proficiency: number;
    icon?: string;
}

const iconMap: Record<string, LucideIcon> = {
    Code, Server, Database, Terminal, Cpu, Cloud, Globe, Lock
};

export default function SkillsSectionClient({ skills }: { skills: Skill[] }) {
    const [viewMode, setViewMode] = useState<'grid' | 'graph'>('grid');

    // Group skills by category
    const skillsByCategory = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(skill);
        return acc;
    }, {} as Record<string, Skill[]>);

    return (
        <section id="skills" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-16">
                <ParallaxText speed={-20}>
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black text-white font-orbitron mb-2">
                            <span className="text-glow-purple">SYSTEM</span> MODULES
                        </h2>
                        <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
                    </div>
                </ParallaxText>

                {/* View Toggle */}
                <div className="flex gap-2 mt-6 md:mt-0 bg-black/50 p-1 rounded border border-cyan-900/50">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded flex items-center gap-2 text-sm font-mono transition-all ${viewMode === 'grid' ? 'bg-cyan-900/50 text-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Grid size={16} /> GRID
                    </button>
                    <button
                        onClick={() => setViewMode('graph')}
                        className={`p-2 rounded flex items-center gap-2 text-sm font-mono transition-all ${viewMode === 'graph' ? 'bg-purple-900/50 text-purple-400 shadow-[0_0_10px_rgba(189,0,255,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Box size={16} /> 3D GRAPH
                    </button>
                </div>
            </div>

            {viewMode === 'graph' ? (
                <div className="animate-in fade-in zoom-in duration-500">
                    <SkillsGraph skills={skills} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-5 duration-500">
                    {Object.entries(skillsByCategory).map(([category, items]) => (
                        <div key={category} className="contents">
                            {/* We can't use 'contents' nicely with the masonry layout idea, but let's stick to the card grid. 
                                Actually, the previous layout was category sections. Let's restore that structure or simplify.
                                The previous structure had category headers. Let's keep that.
                             */}
                            <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-8 mb-4 border-b border-gray-800 pb-2">
                                <h3 className="text-xl font-bold font-orbitron text-cyan-400 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                    {category.toUpperCase()}
                                </h3>
                            </div>

                            {items.map((skill) => {
                                const iconName = skill.icon || 'Code';
                                const IconComponent = iconMap[iconName] || Code;

                                return (
                                    <SkillCard
                                        key={skill.id}
                                        name={skill.name}
                                        icon={IconComponent}
                                        category={skill.category}
                                        proficiency={skill.proficiency}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
