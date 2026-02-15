'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/context/ThemeContext';

interface Skill {
    id: number;
    documentId: string;
    name: string;
    category: string;
    proficiency: number;
}

interface SkillsGraphProps {
    skills: Skill[];
}

function SkillNode({ position, name, color, proficiency }: { position: [number, number, number], name: string, color: string, proficiency: number }) {
    const [hovered, setHovered] = useState(false);
    const scale = hovered ? 1.5 : 1;

    return (
        <group position={position}>
            <mesh
                scale={scale}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <octahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} wireframe />
            </mesh>

            {/* Glow */}
            <mesh scale={scale * 1.2}>
                <sphereGeometry args={[0.5, 8, 8]} />
                <meshBasicMaterial color={color} transparent opacity={0.1} />
            </mesh>

            <Html distanceFactor={15}>
                <div className={`pointer-events-none select-none px-2 py-1 rounded bg-black/80 border border-[${color}]/50 backdrop-blur-sm transition-all duration-300 ${hovered ? 'scale-110 z-50' : 'opacity-70'}`}>
                    <div className="text-xs font-bold font-orbitron text-white whitespace-nowrap">{name}</div>
                    <div className="h-0.5 bg-gray-700 mt-1 w-full">
                        <div className="h-full bg-white" style={{ width: `${proficiency}%` }}></div>
                    </div>
                </div>
            </Html>
        </group>
    );
}

function Connections({ points, color }: { points: [number, number, number][], color: string }) {
    // Draw lines between sequential points in the same category (simple chain for now)
    // A better approach would be a central hub or random connections
    return (
        <Line
            points={points}
            color={color}
            transparent
            opacity={0.3}
            lineWidth={1}
        />
    );
}

function Scene({ skills }: { skills: Skill[] }) {
    const groupRef = useRef<THREE.Group>(null);
    const { theme } = useTheme();

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.001;
            groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
        }
    });

    // Color mapping based on category
    const getCategoryColor = (cat: string) => {
        if (theme === 'matrix') return '#0aff00';
        if (theme === 'sunset') return cat.length > 5 ? '#ff9d00' : '#ff0055';

        // Cyber theme defaults
        switch (cat.toLowerCase()) {
            case 'frontend': return '#00f3ff'; // Cyan
            case 'backend': return '#bd00ff';  // Purple
            case 'devops': return '#ff0055';   // Red/Pink
            case 'cloud': return '#ffd700';    // Gold
            default: return '#ffffff';
        }
    };

    // Calculate positions on a sphere
    const graphData = useMemo(() => {
        const phiSpan = Math.PI * (3 - Math.sqrt(5)); // Golden angle

        return skills.map((skill, i) => {
            const y = 1 - (i / (skills.length - 1)) * 2; // y goes from 1 to -1
            const radius = Math.sqrt(1 - y * y);
            const theta = phiSpan * i;

            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;

            const r = 5; // Sphere radius
            return {
                ...skill,
                position: [x * r, y * r, z * r] as [number, number, number],
                color: getCategoryColor(skill.category)
            };
        });
    }, [skills, theme]);

    // Group by category for connections
    const categoryGroups = useMemo(() => {
        const groups: Record<string, [number, number, number][]> = {};
        graphData.forEach(node => {
            if (!groups[node.category]) groups[node.category] = [];
            groups[node.category].push(node.position);
            // Connect back to center? Or just chain.
        });
        return groups;
    }, [graphData]);

    return (
        <group ref={groupRef}>
            {graphData.map((node) => (
                <SkillNode
                    key={node.id}
                    position={node.position}
                    name={node.name}
                    color={node.color}
                    proficiency={node.proficiency}
                />
            ))}

            {/* Draw lines for each category group */}
            {Object.entries(categoryGroups).map(([cat, points], i) => (
                <Connections key={cat} points={points} color={getCategoryColor(cat)} />
            ))}
        </group>
    );
}

export default function SkillsGraph({ skills }: SkillsGraphProps) {
    return (
        <div className="w-full h-[600px] border border-cyan-900/30 bg-black/50 rounded-lg overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 text-xs font-mono text-cyan-500 bg-black/80 p-2 border border-cyan-500/30">
                <div>MODE: 3D Visualization</div>
                <div>ROTATION: Auto</div>
                <div>INTERACTION: Mouse Drag/Zoom</div>
            </div>
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Scene skills={skills} />
                <OrbitControls enableZoom={true} autoRotate={false} />
            </Canvas>
        </div>
    );
}
