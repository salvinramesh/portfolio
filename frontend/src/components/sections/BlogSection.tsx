import { fetchAPI, Article } from '@/lib/strapi';
import BlogSectionClient from './BlogSectionClient';

export default async function BlogSection() {
    const { data: articles } = await fetchAPI<Article[]>('/articles', { sort: 'publishedAt:desc' });

    if (!articles || articles.length === 0) {
        return null;
    }

    return <BlogSectionClient articles={articles} />;
}
