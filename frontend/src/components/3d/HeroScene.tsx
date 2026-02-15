'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PointMaterial, Points } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function ParticleNetwork() {
    const pointsRef = useRef<THREE.Points>(null);
    const [sphere] = useState(() => {
        // Generate random points in a sphere
        const count = 5000;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 2 * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }
        return positions;
    });

    useFrame((state, delta) => {
        if (pointsRef.current) {
            // Rotate the entire cloud
            pointsRef.current.rotation.x -= delta / 10;
            pointsRef.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={pointsRef} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#00f3ff"
                    size={0.02}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    );
}

function ConnectionLines() {
    // A secondary visual layer for "data streams" or connections
    // Simplified for performance: A rotating wireframe sphere
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.2;
            meshRef.current.rotation.y += delta * 0.2;
        }
    })

    return (
        <mesh ref={meshRef} scale={[2.2, 2.2, 2.2]}>
            <icosahedronGeometry args={[1, 2]} />
            <meshBasicMaterial wireframe color="#bd00ff" transparent opacity={0.1} />
        </mesh>
    )
}

export default function HeroScene() {
    return (
        <div className="h-[60vh] md:h-[80vh] w-full absolute top-0 left-0 -z-10 opacity-60">
            <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: true, alpha: true }}>
                <fog attach="fog" args={['#050505', 5, 15]} />
                <ParticleNetwork />
                <ConnectionLines />
                <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
}
