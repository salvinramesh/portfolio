import { ExternalLink, Github, Code2 } from 'lucide-react';
import Image from 'next/image';

interface ProjectCardProps {
    title: string;
    description: string;
    imageUrl?: string;
    techStack: string[];
    link?: string;
    githubLink?: string;
}

import HoloCard from './HoloCard';
import HolographicImage from './HolographicImage';

export default function ProjectCard({ title, description, imageUrl, techStack, link, githubLink }: ProjectCardProps) {
    const handleHover = () => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cyber_log', { detail: `[NET] SCANNING ASSET: ${title.toUpperCase()}...` }));
        }
    };

    return (
        <HoloCard onMouseEnter={handleHover} className="cyber-box group hover:border-purple-500/50 transition-colors duration-500 h-full relative overflow-hidden">
            {/* Cybernetic Scanline */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#00f3ff] z-[100] opacity-0 group-hover:animate-cyber-scan pointer-events-none"></div>

            <div className="relative h-48 w-full overflow-hidden border-b border-cyan-900/30">
                <div className="absolute inset-0 bg-cyan-500/5 z-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-[url('/scanlines.png')] opacity-10 z-20 pointer-events-none"></div>

                {imageUrl ? (
                    <HolographicImage
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:contrast-125"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-gray-700 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:10px_10px]">
                        <Code2 className="w-12 h-12 mb-2 opacity-20" />
                        <span className="font-mono text-xs tracking-widest">IMG_NOT_FOUND</span>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-30"></div>
            </div>

            <div className="p-6 relative flex flex-col h-[calc(100%-12rem)]">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold font-orbitron text-white group-hover:text-glow-purple transition-all">{title}</h3>
                    <div className="flex gap-2">
                        {link && (
                            <a href={link} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-sm transition-colors border border-transparent hover:border-cyan-500/50">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                        {githubLink && (
                            <a href={githubLink} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-purple-500/20 hover:text-purple-400 rounded-sm transition-colors border border-transparent hover:border-purple-500/50">
                                <Github className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>

                <p className="text-gray-400 text-sm mb-4 font-mono leading-relaxed border-l-2 border-gray-800 pl-3 group-hover:border-purple-500/50 transition-colors flex-grow">
                    {description}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                    {techStack.map((tech) => (
                        <span key={tech} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-orbitron text-cyan-300 border border-cyan-900/50 bg-cyan-900/10">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        </HoloCard>
    );
}
