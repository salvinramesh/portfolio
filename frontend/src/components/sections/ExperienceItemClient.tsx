'use client';

import ReactMarkdown from 'react-markdown';
import GlitchText from '@/components/ui/GlitchText';

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

export default function ExperienceItemClient({ exp }: { exp: Experience }) {
    return (
        <div className="relative pl-8 md:pl-12 group">
            {/* Timeline Node */}
            <div className="absolute left-[-9px] top-0 w-4 h-4 bg-black border-2 border-cyan-500 rotate-45 z-10 group-hover:bg-cyan-500 group-hover:scale-125 transition-all duration-300 shadow-[0_0_10px_rgba(0,243,255,0.5)]"></div>

            {/* Content Container */}
            <div className="cyber-box p-6 md:p-8 rounded-none border border-cyan-900/50 hover:border-cyan-500/50 transition-colors duration-300 bg-black/80">

                {/* Header Grid */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 border-b border-gray-800 pb-4">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white font-orbitron tracking-wide mb-1 group-hover:text-glow transition-all flex gap-3">
                           <GlitchText text={exp.role} duration={800} />
                        </h3>
                        <h4 className="text-purple-400 font-mono text-lg tracking-widest uppercase flex items-center gap-2">
                            <span className="text-cyan-600">@</span> <GlitchText text={exp.company} delay={300} duration={800} />
                        </h4>
                    </div>

                    {/* Date & Status Tag */}
                    <div className="flex items-center gap-3 shrink-0">
                        {exp.current && (
                            <span className="px-2 py-1 text-[10px] font-bold border border-green-500/50 text-green-400 bg-green-900/20 rounded animate-pulse">
                                ACTIVE SEQUENCE
                            </span>
                        )}
                        <span className={`font-mono text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${exp.current ? 'from-green-400 to-emerald-600' : 'from-gray-500 to-gray-700'}`}>
                            {new Date(exp.startDate).getFullYear()}
                        </span>
                    </div>
                </div>

                {/* Description - Markdown Rendered */}
                <div className="text-gray-300 font-rajdhani leading-relaxed text-lg">
                    <ReactMarkdown
                        components={{
                            strong: ({ ...props }) => <span className="text-cyan-400 font-bold block mt-6 mb-2 font-mono text-sm uppercase tracking-wider border-l-2 border-cyan-500 pl-2" {...props} />,
                            ul: ({ ...props }) => <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-4" {...props} />,
                            li: ({ ...props }) => (
                                <div className="flex items-start gap-2 text-base">
                                    <span className="text-purple-500 mt-1.5 text-[10px] shrink-0">❯</span>
                                    <span {...props} />
                                </div>
                            ),
                            p: ({ ...props }) => <p className="mb-4 last:mb-0" {...props} />
                        }}
                    >
                        {exp.description}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
