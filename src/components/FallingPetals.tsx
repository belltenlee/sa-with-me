'use client';

import { useEffect, useRef } from 'react';

interface Petal {
    x: number;
    y: number;
    size: number;
    speed: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    color: string;
}

export default function FallingPetals() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let petals: Petal[] = [];

        // Resize handler
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        // Initialize petals
        const createPetal = (): Petal => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height, // Start above viewport
            size: Math.random() * 5 + 5, // Size 5-10
            speed: Math.random() * 1 + 0.5, // Slow fall
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2,
            opacity: Math.random() * 0.5 + 0.3,
            color: Math.random() > 0.5 ? '#FFE4E1' : '#FFF0F5', // MistyRose or LavenderBlush
        });

        // Create initial set (fewer for subtlety)
        for (let i = 0; i < 30; i++) {
            petals.push({
                ...createPetal(),
                y: Math.random() * canvas.height // Distribute initially across screen
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            petals.forEach((petal) => {
                // Update position
                petal.y += petal.speed;
                petal.rotation += petal.rotationSpeed;
                petal.x += Math.sin(petal.y * 0.01) * 0.5; // Gentle sway

                // Reset if out of bounds
                if (petal.y > canvas.height) {
                    petal.y = -20;
                    petal.x = Math.random() * canvas.width;
                }

                // Draw petal (simple oval shape)
                ctx.save();
                ctx.translate(petal.x, petal.y);
                ctx.rotate((petal.rotation * Math.PI) / 180);
                ctx.globalAlpha = petal.opacity;
                ctx.fillStyle = petal.color;

                ctx.beginPath();
                // Draw an oval petal shape
                ctx.ellipse(0, 0, petal.size / 2, petal.size, 0, 0, 2 * Math.PI);
                ctx.fill();

                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
            style={{ width: '100%', height: '100%' }}
        />
    );
}
