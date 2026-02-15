"use client";

import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollY = useRef(0);
    const scrollVelocity = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            scrollVelocity.current = currentScroll - scrollY.current;
            scrollY.current = currentScroll;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;
        let isVisible = true;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // --- Spatial grid for O(n) connection checks ---
        const CELL_SIZE = 100;
        let gridCols = 0;
        let gridRows = 0;
        let grid: number[][] = [];

        function rebuildGrid() {
            gridCols = Math.ceil(canvas!.width / CELL_SIZE);
            gridRows = Math.ceil(canvas!.height / CELL_SIZE);
            grid = new Array(gridCols * gridRows);
        }
        rebuildGrid();
        window.addEventListener('resize', rebuildGrid);

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            baseSpeed: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2;
                this.baseSpeed = Math.random() * 0.5 + 0.1;
            }

            update() {
                if (Math.abs(scrollVelocity.current) > 2) {
                    this.y -= scrollVelocity.current * 0.2 * this.baseSpeed;
                } else {
                    this.x += this.vx;
                    this.y += this.vy;
                }

                if (this.x < 0) this.x = canvas!.width;
                if (this.x > canvas!.width) this.x = 0;
                if (this.y < 0) this.y = canvas!.height;
                if (this.y > canvas!.height) this.y = 0;
            }

            draw() {
                if (!ctx) return;

                ctx.fillStyle = 'rgba(6, 182, 212, 0.5)';
                const stretch = Math.min(Math.abs(scrollVelocity.current) * 2, 50);

                if (stretch > 2) {
                    ctx.beginPath();
                    ctx.lineWidth = this.size;
                    ctx.strokeStyle = `rgba(6, 182, 212, ${0.3 + (stretch / 100)})`;
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(this.x, this.y - (scrollVelocity.current * 2));
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        const init = () => {
            particles = [];
            const numberOfParticles = Math.min(150, (canvas.width * canvas.height) / 10000);
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!isVisible) {
                animationFrameId = requestAnimationFrame(animate);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            scrollVelocity.current *= 0.95;

            // Clear grid
            for (let i = 0; i < grid.length; i++) {
                grid[i] = [];
            }

            // Assign particles to grid cells & update/draw
            particles.forEach((particle, idx) => {
                particle.update();
                particle.draw();

                const col = Math.floor(particle.x / CELL_SIZE);
                const row = Math.floor(particle.y / CELL_SIZE);
                const cellIdx = row * gridCols + col;
                if (cellIdx >= 0 && cellIdx < grid.length) {
                    grid[cellIdx].push(idx);
                }
            });

            // Connect particles — only check same + adjacent cells (O(n) amortized)
            if (Math.abs(scrollVelocity.current) < 5) {
                for (let row = 0; row < gridRows; row++) {
                    for (let col = 0; col < gridCols; col++) {
                        const cellIdx = row * gridCols + col;
                        const cell = grid[cellIdx];
                        if (!cell || cell.length === 0) continue;

                        // Check this cell + right + bottom + bottom-right neighbors
                        const neighbors = [
                            cellIdx,
                            col + 1 < gridCols ? cellIdx + 1 : -1,
                            row + 1 < gridRows ? cellIdx + gridCols : -1,
                            col + 1 < gridCols && row + 1 < gridRows ? cellIdx + gridCols + 1 : -1,
                        ];

                        for (const ni of neighbors) {
                            if (ni < 0 || !grid[ni]) continue;
                            const neighborCell = grid[ni];

                            for (const ai of cell) {
                                const startJ = ni === cellIdx ? cell.indexOf(ai) + 1 : 0;
                                const source = ni === cellIdx ? cell : neighborCell;
                                for (let jj = startJ; jj < source.length; jj++) {
                                    const bi = source[jj];
                                    const dx = particles[ai].x - particles[bi].x;
                                    const dy = particles[ai].y - particles[bi].y;
                                    const distance = Math.sqrt(dx * dx + dy * dy);

                                    if (distance < 100) {
                                        ctx.beginPath();
                                        ctx.strokeStyle = `rgba(6, 182, 212, ${0.1 - distance / 1000})`;
                                        ctx.lineWidth = 1;
                                        ctx.moveTo(particles[ai].x, particles[ai].y);
                                        ctx.lineTo(particles[bi].x, particles[bi].y);
                                        ctx.stroke();
                                    }
                                }
                            }
                        }
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        // Page Visibility API — pause when tab is hidden
        const handleVisibility = () => {
            isVisible = !document.hidden;
        };
        document.addEventListener('visibilitychange', handleVisibility);

        init();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('resize', rebuildGrid);
            document.removeEventListener('visibilitychange', handleVisibility);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none opacity-20 transition-opacity duration-300"
        />
    );
}
