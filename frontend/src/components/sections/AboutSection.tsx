import { fetchAPI, Profile } from '@/lib/strapi';

async function getProfile() {
    const res = await fetchAPI<Profile>('/profile');
    return res.data;
}

export default async function AboutSection() {
    const profile = await getProfile();

    // Fallback content if no data (user hasn't added data yet)
    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <h2 className="text-4xl font-bold font-orbitron mb-4 text-gray-500">About Me</h2>
                <p className="text-gray-600">No bio available.</p>
            </div>
        );
    }

    return (
        <section id="about" className="py-20 px-8 max-w-5xl mx-auto text-center">
            <div className="relative inline-block mb-8 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-black border border-cyan-900/50 p-8 rounded-lg">
                    <h2 className="text-4xl md:text-5xl font-black text-white font-orbitron mb-2">
                        <span className="text-glow">Identity</span> Verified
                    </h2>
                    <h3 className="text-xl md:text-2xl text-cyan-400 font-mono tracking-widest uppercase mb-6">
                        {profile.name} <span className="text-purple-500">{'//'}</span> {profile.title}
                    </h3>

                    <div className="prose prose-invert prose-lg max-w-3xl mx-auto text-gray-300 font-rajdhani leading-relaxed">
                        {/* Since it is a rich text or simple text depending on strapi setup, for now assumed simple string or markdown */}
                        <div className="whitespace-pre-wrap">{profile.bio}</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
