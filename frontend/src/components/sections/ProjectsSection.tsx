import ProjectCard from '../ui/ProjectCard';
import { fetchAPI, Project } from '@/lib/strapi';

async function getProjects() {
    const res = await fetchAPI<Project[]>('/projects');
    return res.data;
}

import GlitchText from '../ui/GlitchText';
import ParallaxText from '../ui/ParallaxText';

// ... (existing imports)

export default async function ProjectsSection() {
    const projects = await getProjects();

    if (!projects || projects.length === 0) {
        return (
            <section id="projects" className="py-20 px-8 max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold mb-12 text-center text-white"><span className="text-glow">Deployed</span> Operations</h2>
                <div className="text-center text-gray-500 font-mono p-10 border border-gray-800 border-dashed rounded-xl">
                    {'// NO PROJECT DATA DETECTED //'}
                </div>
            </section>
        );
    }

    return (
        <section id="projects" className="py-20 px-4 bg-black/50">
            <ParallaxText speed={-30} className="mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-center text-white font-orbitron">
                    <span className="text-glow"><GlitchText text="DEPLOYED" /></span> <GlitchText text="OPERATIONS" />
                </h2>
            </ParallaxText>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.map((project) => {
                    // Only prefix Strapi URL for actual /uploads/ paths
                    // For /project-images/, use .svg (we have SVGs, Strapi stores .png)
                    let imageUrl = project.imageUrl || undefined;
                    if (imageUrl) {
                        if (imageUrl.startsWith('/uploads/')) {
                            imageUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${imageUrl}`;
                        } else if (imageUrl.startsWith('/project-images/')) {
                            imageUrl = imageUrl.replace(/\.png$/, '.svg');
                        }
                    }

                    return (
                        <ProjectCard
                            key={project.id}
                            title={project.title}
                            description={project.description}
                            techStack={project.techStack}
                            link={project.liveLink}
                            githubLink={project.githubLink}
                            imageUrl={imageUrl} // Use the processed URL
                        />
                    );
                })}
            </div>
        </section>
    );
}
