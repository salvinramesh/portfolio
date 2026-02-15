import { NextResponse } from 'next/server';
import si from 'systeminformation';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [cpu, mem, time] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.time(),
        ]);

        return NextResponse.json({
            cpu: Math.round(cpu.currentLoad),
            memory: {
                total: mem.total,
                used: mem.used,
                percent: Math.round((mem.used / mem.total) * 100),
            },
            uptime: time.uptime,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch system metrics' }, { status: 500 });
    }
}
