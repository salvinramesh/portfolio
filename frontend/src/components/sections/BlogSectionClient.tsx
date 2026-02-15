'use client';

import BlogCard from '@/components/ui/BlogCard';
import { Article } from '@/lib/strapi';

export default function BlogSectionClient({ articles }: { articles: Article[] }) {
    return (
        <section id="blog" className="py-20 px-4 max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="mb-12 text-center">
                <div className="inline-block">
                    <span className="text-xs font-mono text-cyan-600 tracking-[0.3em] uppercase">
                        {'///'} Neural Logs
                    </span>
                    <h2 className="text-4xl font-orbitron text-white mt-2 text-glow">
                        CLASSIFIED DATA STREAMS
                    </h2>
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-4" />
                </div>
                <p className="text-gray-500 text-sm font-mono mt-4 max-w-lg mx-auto">
                    Security clearance required. Click a file to decrypt its contents.
                </p>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                    <BlogCard
                        key={article.id}
                        title={article.title}
                        summary={article.summary}
                        content={article.content}
                        tags={article.tags || []}
                        publishedAt={article.publishedAt}
                    />
                ))}
            </div>
        </section>
    );
}
