import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json();

        // 1. Validate environment variables
        const evolutionUrl = process.env.EVOLUTION_API_URL;
        const evolutionKey = process.env.EVOLUTION_API_KEY;
        const instanceName = process.env.EVOLUTION_INSTANCE_NAME;
        const targetNumber = process.env.WHATSAPP_NUMBER;

        if (!evolutionUrl || !evolutionKey || !instanceName || !targetNumber) {
            console.error('❌ CONTACT API ERROR: Missing environment variables');
            return NextResponse.json(
                { error: 'System configuration error. Please contact Salvin directly.' },
                { status: 500 }
            );
        }

        // 2. Prepare WhatsApp message content
        const whatsappMessage = `*🚀 New Contact Form Submission*\n\n*👤 Identity:* ${name}\n*📧 Coordinates:* ${email}\n\n*💬 Message:* \n${message}`;

        // 3. Send via Evolution API
        const endpoint = `${evolutionUrl.replace(/\/+$/, '')}/message/sendText/${instanceName}`;
        
        console.log(`📡 Transmitting message to: ${endpoint}`);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': evolutionKey
            },
            body: JSON.stringify({
                number: targetNumber,
                options: {
                    delay: 1200,
                    presence: "composing",
                    linkPreview: false
                },
                textMessage: {
                    text: whatsappMessage
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Evolution API Error (${response.status}):`, errorText);
            throw new Error(`Evolution API responded with ${response.status}`);
        }

        return NextResponse.json({ success: true, message: 'Transmission successful.' });

    } catch (error: any) {
        console.error('❌ CONTACT API CATCH:', error);
        return NextResponse.json(
            { error: 'FAILED TO TRANSMIT. Please try again or use direct channels.' },
            { status: 500 }
        );
    }
}
