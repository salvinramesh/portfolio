export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export interface StrapiResponse<T> {
    data: T;
    meta: {
        pagination?: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

// Content Type Interfaces
export interface Profile {
    id: number;
    documentId: string;
    name: string;
    title: string;
    bio: string; // Rich Text usually returns markdown or structured JSON
    resumeLink?: string;
    avatarUrl?: string;
}

export interface Skill {
    id: number;
    documentId: string;
    name: string;
    category: 'Frontend' | 'Backend' | 'DevOps' | 'Tools' | 'Languages';
    proficiency: number;
    icon: string;
}

export interface Project {
    id: number;
    documentId: string;
    title: string;
    description: string;
    techStack: string[]; // JSON field
    liveLink?: string;
    githubLink?: string;
    imageUrl?: string;
}

export interface Article {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    tags: string[];
    publishedAt: string;
}

export async function fetchAPI<T>(
    path: string,
    urlParamsObject: Record<string, unknown> = {},
    options: RequestInit = {}
): Promise<StrapiResponse<T>> {
    try {
        // Merge default and user options
        const mergedOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        };

        // Build request URL
        const queryString = new URLSearchParams(urlParamsObject as Record<string, string>).toString();
        const requestUrl = `${STRAPI_URL}/api${path}${queryString ? `?${queryString}` : ''}`;

        // Trigger API call
        const response = await fetch(requestUrl, { ...mergedOptions, next: { revalidate: 3600 } }); // ISR: revalidate hourly

        // Handle response
        if (!response.ok) {
            console.error(response.statusText);
            // Return empty data structure on error to prevent detailed crashes
            return { data: [] as unknown as T, meta: {} };
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Fetch API Error:', error);
        return { data: [] as unknown as T, meta: {} };
    }
}
