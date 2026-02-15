'use client';

import dynamic from 'next/dynamic';

// Lazily loaded — interactive features & overlays (ssr: false, client-only)
const CyberChat = dynamic(() => import("@/components/ui/CyberChat"), { ssr: false });
const QuakeTerminal = dynamic(() => import("@/components/ui/QuakeTerminal"), { ssr: false });
const EasterEggs = dynamic(() => import("@/components/ui/EasterEggs"), { ssr: false });
const MissionLog = dynamic(() => import("@/components/ui/MissionLog"), { ssr: false });
const DataStreamCursor = dynamic(() => import("@/components/ui/DataStreamCursor"), { ssr: false });
const MatrixRain = dynamic(() => import("@/components/ui/MatrixRain"), { ssr: false });
const SystemMonitor = dynamic(() => import("@/components/ui/SystemMonitor"), { ssr: false });
const StatusWidget = dynamic(() => import("@/components/ui/StatusWidget"), { ssr: false });

export default function DynamicOverlays() {
    return (
        <>
            <DataStreamCursor />
            <MatrixRain />
            <CyberChat />
            <StatusWidget />
            <SystemMonitor />
            <EasterEggs />
            <QuakeTerminal />
            <MissionLog />
        </>
    );
}
