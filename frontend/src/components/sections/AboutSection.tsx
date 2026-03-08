import { fetchAPI, Profile } from '@/lib/strapi';
import AboutSectionClient from './AboutSectionClient';

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
            <AboutSectionClient profile={profile} />
        </section>
    );
}
