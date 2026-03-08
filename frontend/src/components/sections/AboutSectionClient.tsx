'use client';

import { Profile } from '@/lib/strapi';
import GlitchText from '@/components/ui/GlitchText';

export default function AboutSectionClient({ profile }: { profile: Profile }) {
    return (
        <div className="relative inline-block mb-8 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-black border border-cyan-900/50 p-8 rounded-lg">
                <h2 className="text-4xl md:text-5xl font-black text-white font-orbitron mb-2 flex justify-center gap-3">
                    <span className="text-glow"><GlitchText text="Identity" /></span> <GlitchText text="Verified" delay={200} />
                </h2>
                <h3 className="text-xl md:text-2xl text-cyan-400 font-mono tracking-widest uppercase mb-6 flex justify-center gap-2">
                    <GlitchText text={profile.name} delay={400} /> <span className="text-purple-500">{'//'}</span> <GlitchText text={profile.title} delay={600} />
                </h3>

                <div className="prose prose-invert prose-lg max-w-3xl mx-auto text-gray-300 font-rajdhani leading-relaxed">
                    <div className="whitespace-pre-wrap"><GlitchText text={profile.bio} delay={800} duration={1500} as="p" /></div>
                </div>
            </div>
        </div>
    );
}
