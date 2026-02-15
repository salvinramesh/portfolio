'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/context/ThemeContext';

// Mock connection data
const LOCATIONS = [
    { name: 'New York', lat: 40.7, lon: -74.0 },
    { name: 'London', lat: 51.5, lon: -0.1 },
    { name: 'Tokyo', lat: 35.7, lon: 139.7 },
    { name: 'Sydney', lat: -33.9, lon: 151.2 },
    { name: 'Mumbai', lat: 19.1, lon: 72.9 },
    { name: 'Berlin', lat: 52.5, lon: 13.4 },
    { name: 'São Paulo', lat: -23.6, lon: -46.6 },
    { name: 'Singapore', lat: 1.4, lon: 103.8 },
    { name: 'Dubai', lat: 25.2, lon: 55.3 },
    { name: 'Toronto', lat: 43.7, lon: -79.4 },
];

function latLonToVec3(lat: number, lon: number, radius: number): [number, number, number] {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return [x, y, z];
}

function WireframeGlobe({ color }: { color: string }) {
    return (
        <mesh>
            <sphereGeometry args={[2, 24, 24]} />
            <meshBasicMaterial color={color} wireframe transparent opacity={0.15} />
        </mesh>
    );
}

interface PingData {
    id: number;
    from: typeof LOCATIONS[0];
    to: typeof LOCATIONS[0];
    progress: number;
    active: boolean;
}

function ConnectionPing({ from, to, color, progress }: { from: [number, number, number]; to: [number, number, number]; color: string; progress: number }) {
    const midPoint: [number, number, number] = [
        (from[0] + to[0]) / 2 * 1.5,
        (from[1] + to[1]) / 2 * 1.5,
        (from[2] + to[2]) / 2 * 1.5,
    ];

    const curve = useMemo(() => {
        return new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(...from),
            new THREE.Vector3(...midPoint),
            new THREE.Vector3(...to),
        );
    }, [from, to, midPoint]);

    const points = useMemo(() => {
        return curve.getPoints(30).map(p => [p.x, p.y, p.z] as [number, number, number]);
    }, [curve]);

    const visiblePoints = points.slice(0, Math.floor(progress * points.length));

    if (visiblePoints.length < 2) return null;

    return (
        <Line
            points={visiblePoints}
            color={color}
            lineWidth={2}
            transparent
            opacity={0.7}
        />
    );
}

function LocationDot({ position, name, color }: { position: [number, number, number]; name: string; color: string }) {
    const [hovered, setHovered] = useState(false);

    return (
        <group position={position}>
            <mesh
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial color={color} />
            </mesh>
            {/* Pulse ring */}
            <mesh>
                <ringGeometry args={[0.06, 0.09, 16]} />
                <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
            {hovered && (
                <Html distanceFactor={10}>
                    <div className="bg-black/90 border border-cyan-500/50 px-2 py-1 rounded text-[10px] font-mono text-cyan-400 whitespace-nowrap">
                        {name}
                    </div>
                </Html>
            )}
        </group>
    );
}

function Scene() {
    const groupRef = useRef<THREE.Group>(null);
    const { theme } = useTheme();
    const [pings, setPings] = useState<PingData[]>([]);
    const pingIdRef = useRef(0);

    const color = theme === 'matrix' ? '#0aff00' : theme === 'sunset' ? '#ff9d00' : '#00f3ff';

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.001;
        }
    });

    // Generate random pings
    useEffect(() => {
        const interval = setInterval(() => {
            const from = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
            let to = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
            while (to.name === from.name) {
                to = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
            }

            const id = pingIdRef.current++;
            setPings(prev => [...prev.slice(-5), { id, from, to, progress: 0, active: true }]);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Animate pings
    useEffect(() => {
        const animInterval = setInterval(() => {
            setPings(prev =>
                prev.map(p => ({
                    ...p,
                    progress: Math.min(p.progress + 0.05, 1),
                    active: p.progress < 1,
                })).filter(p => p.progress < 1)
            );
        }, 50);
        return () => clearInterval(animInterval);
    }, []);

    return (
        <group ref={groupRef}>
            <WireframeGlobe color={color} />

            {/* Location dots */}
            {LOCATIONS.map((loc) => (
                <LocationDot
                    key={loc.name}
                    position={latLonToVec3(loc.lat, loc.lon, 2.02)}
                    name={loc.name}
                    color={color}
                />
            ))}

            {/* Connection arcs */}
            {pings.map((ping) => (
                <ConnectionPing
                    key={ping.id}
                    from={latLonToVec3(ping.from.lat, ping.from.lon, 2.02)}
                    to={latLonToVec3(ping.to.lat, ping.to.lon, 2.02)}
                    color={color}
                    progress={ping.progress}
                />
            ))}
        </group>
    );
}

export default function ThreatMap() {
    const [stats, setStats] = useState({ connections: 0, threats: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats({
                connections: Math.floor(Math.random() * 500) + 1200,
                threats: Math.floor(Math.random() * 15),
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="threat-map" className="py-20 px-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-12 text-center">
                <span className="text-xs font-mono text-cyan-600 tracking-[0.3em] uppercase">
                    {'///'} Threat Intelligence
                </span>
                <h2 className="text-4xl font-orbitron text-white mt-2 text-glow">
                    GLOBAL OPERATIONS MAP
                </h2>
                <div className="h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-4" />
            </div>

            <div className="cyber-box p-4 relative overflow-hidden">
                {/* Status Bar */}
                <div className="flex items-center justify-between mb-2 px-2">
                    <div className="flex items-center gap-4 text-[10px] font-mono">
                        <span className="text-green-500">● LIVE</span>
                        <span className="text-gray-500">CONNECTIONS: <span className="text-cyan-400">{stats.connections}</span></span>
                        <span className="text-gray-500">THREATS BLOCKED: <span className="text-red-400">{stats.threats}</span></span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-600">DEFCON 5</span>
                </div>

                {/* Globe */}
                <div className="w-full h-[500px]">
                    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                        <ambientLight intensity={0.3} />
                        <Scene />
                        <OrbitControls enableZoom={false} autoRotate={false} enablePan={false} />
                    </Canvas>
                </div>
            </div>
        </section>
    );
}
