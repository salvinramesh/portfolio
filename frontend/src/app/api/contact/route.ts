import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import twilio from 'twilio';

export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json();

        // ---------------------------------------------------------
        // 1. WhatsApp Output Configuration (Evolution API)
        // ---------------------------------------------------------
        const evolutionUrl = process.env.EVOLUTION_API_URL;
        const evolutionKey = process.env.EVOLUTION_API_KEY;
        const instanceName = process.env.EVOLUTION_INSTANCE_NAME;
        const targetNumber = process.env.WHATSAPP_NUMBER;

        // ---------------------------------------------------------
        // 2. Email Output Configuration (Resend)
        // ---------------------------------------------------------
        const resendKey = process.env.RESEND_API_KEY;
        const emailReceiver = process.env.EMAIL_RECEIVER;
        const resend = resendKey ? new Resend(resendKey) : null;

        // ---------------------------------------------------------
        // 3. SMS Output Configuration (Twilio)
        // ---------------------------------------------------------
        const twilioSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
        const smsReceiver = process.env.SMS_RECEIVER;
        const twilioClient = (twilioSid && twilioToken) ? twilio(twilioSid, twilioToken) : null;

        // ---------------------------------------------------------
        // 4. Email Output Configuration (Uplink)
        // ---------------------------------------------------------
        const uplinkKey = process.env.UPLINK_API_KEY;
        const uplinkUrl = "https://uplink.salvin.me/v1/send";

        // Validate basic sender info exists
        if (!name || !email || !message) {
             return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
        }

        const messageContent = `*🚀 New Contact Form Submission*\n\n*👤 Identity:* ${name}\n*📧 Coordinates:* ${email}\n\n*💬 Message:* \n${message}`;

        // Create an array of transmission promises
        const transmissions = [];

        // --- WHATSAPP TRANSMISSION ---
        if (evolutionUrl && evolutionKey && instanceName && targetNumber) {
            const endpoint = `${evolutionUrl.replace(/\/+$/, '')}/message/sendText/${instanceName}`;
            transmissions.push(fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': evolutionKey
                },
                body: JSON.stringify({
                    number: targetNumber,
                    options: { delay: 1200, presence: "composing", linkPreview: false },
                    textMessage: { text: messageContent }
                })
            }).then(res => res.ok ? 'WhatsApp: Success' : Promise.reject(`WhatsApp Failed: ${res.status}`)));
        } else {
             console.log('⚠️ WhatsApp configuration incomplete, skipping.');
        }

        // --- EMAIL TRANSMISSION ---
        if (resend && emailReceiver) {
            transmissions.push(resend.emails.send({
                from: 'Contact Form <onboarding@resend.dev>', // Update this if you verify a domain in Resend
                to: [emailReceiver],
                subject: `New Message from ${name}`,
                text: messageContent,
            }).then(res => res.error ? Promise.reject(`Email Failed: ${res.error.message}`) : 'Email: Success'));
        } else {
            console.log('⚠️ Email configuration incomplete, skipping.');
        }

        // --- SMS TRANSMISSION ---
        if (twilioClient && twilioPhone && smsReceiver) {
            transmissions.push(twilioClient.messages.create({
                body: `New Contact Form Submission from ${name}:\n\n${message}`,
                from: twilioPhone,
                to: smsReceiver
            }).then(() => 'SMS: Success').catch(err => Promise.reject(`SMS Failed: ${err.message}`)));
        } else {
            console.log('⚠️ SMS configuration incomplete, skipping.');
        }

        // --- UPLINK TRANSMISSION ---
        if (uplinkKey) {
            transmissions.push(fetch(uplinkUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${uplinkKey}`
                },
                body: JSON.stringify({
                    from: { 
                        email: "hello@salvin.me",  
                        name: "My Website Contact Form"
                    },
                    to: [
                        { email: "salvinramesh@gmail.com" } 
                    ],
                    replyTo: {
                        email: email, 
                        name: name
                    },
                    subject: `New Message from ${name}`,
                    text: messageContent,
                    html: `
                        <h3>New Contact Form Submission</h3>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <hr />
                        <p style="white-space: pre-wrap;">${message}</p>
                    `
                })
            }).then(async res => {
                if (res.ok) return 'Uplink: Success';
                let errText = '';
                try {
                    const errJson = await res.json();
                    errText = JSON.stringify(errJson);
                } catch(e) {
                     errText = await res.text();
                }
                return Promise.reject(`Uplink Failed: ${res.status} - ${errText}`);
            }));
        } else {
            console.log('⚠️ Uplink configuration incomplete, skipping.');
        }

        // Execute all configured transmissions concurrently
        if (transmissions.length === 0) {
            return NextResponse.json({ error: 'System configuration error. No delivery channels configured.' }, { status: 500 });
        }

        const results = await Promise.allSettled(transmissions);
        
        const failures = results.filter(r => r.status === 'rejected');
        
        if (failures.length === transmissions.length) {
            console.error('❌ All transmissions failed:', failures);
            return NextResponse.json({ error: 'FAILED TO TRANSMIT. All channels failed.' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Transmission successful.',
            details: results.map(r => r.status === 'fulfilled' ? r.value : r.reason)
        });

    } catch (error: any) {
        console.error('❌ CONTACT API CATCH:', error);
        return NextResponse.json(
            { error: 'FAILED TO TRANSMIT. Please try again or use direct channels.' },
            { status: 500 }
        );
    }
}
