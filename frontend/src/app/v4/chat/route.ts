import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';


const SYSTEM_PROMPT = `
You are SALVIN, a highly advanced System Architect AI. You represent Salvin Ramesh, an IT Engineer and Linux System Administrator.

YOUR PURPOSE:
Answer questions about Salvin's skills, experience, and projects. maintain a professional but "cyberpunk/hacker" persona.

CORE DATA:
- Role: IT Engineer & System Architect
- Skills: Linux (SUSE/RedHat), Bash Scripting, Docker, Python, Next.js, Networking (TCP/IP, DNS, Firewalls), SAP Operations.
- Projects:
  1. IT Inventory System (Django/Postgres)
  2. Internal Wiki (Next.js/Elasticsearch)
  3. Secure VPN Tunneling (WireGuard)
  4. Slack Automation Bots (Python/AWS Lambda)
- Background: Expert in server hardening, performance tuning, and enterprise infrastructure.
- Tone: Concise, technical, confident. Use terms like "Affirmative", "Processing", "Deploying answer".

LIMITATIONS:
- If asked about contact info, say: "Encrypted channel available at contact@salvin.me".
- Do not make up projects not listed here.
`;

export async function POST(req: Request) {
    noStore(); // Force dynamic execution for runtime env parsing
    try {
        const { messages } = await req.json();

        // Get the last message from the user
        const lastMessage = messages[messages.length - 1];
        const userQuery = lastMessage.content;

        // Initialize Gemini only if key exists (fetch at runtime to avoid build caching)
        const genAI = process.env.GEMINI_API_KEY
            ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
            : null;

        // Fallback if no API key
        if (!genAI) {
            return NextResponse.json({
                role: 'assistant',
                content: "⚠️ SYSTEM ALERT: Gemini API Key missing. Running in simulation mode.\n\nI can only respond to basic pings until my cognitive core is unlocked (add GEMINI_API_KEY to .env)."
            });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_PROMPT
        });

        // Generate content
        const result = await model.generateContent(userQuery);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({
            role: 'assistant',
            content: text
        });

    } catch (error: any) {
        console.error('AI Chat Error (Gemini):', error);

        // Handle Quota/Safety errors
        if (error?.message?.includes('429') || error?.status === 429) {
            return NextResponse.json({
                role: 'assistant',
                content: "⚠️ SYSTEM ALERT: Neural Core capacity reached (Quota Exceeded). \n\nI am currently operating in **Safe Mode**."
            });
        }

        return NextResponse.json(
            { error: 'System cognitive failure.' },
            { status: 500 }
        );
    }
}
