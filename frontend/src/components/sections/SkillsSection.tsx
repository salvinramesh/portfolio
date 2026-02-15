import { fetchAPI } from '@/lib/strapi';
import SkillsSectionClient from './SkillsSectionClient';

interface Skill {
    id: number;
    documentId: string;
    name: string;
    category: string;
    proficiency: number;
    icon?: string;
}

async function getSkills() {
    const res = await fetchAPI<Skill[]>('/skills', { sort: ['proficiency:desc'] });
    return res.data;
}

export default async function SkillsSection() {
    const skills = await getSkills();

    // If no data, still pass empty array or handle inside Client Component
    return <SkillsSectionClient skills={skills || []} />;
}
